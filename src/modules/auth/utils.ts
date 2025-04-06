import type { User } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { configLoader } from '../../lib/config'
import type { UserResponseDto } from './entity'
import { serialize } from 'cookie'

// 获取认证配置
const authConfig = configLoader.getAuthConfig()

/**
 * 认证工具类，提供与认证相关的通用功能
 */
export class AuthUtils {
  /**
   * 获取 Token 过期时间（秒）
   * @param remember 是否记住登录
   * @returns 过期时间（秒）
   */
  static getTokenExpiry(remember: boolean = false): number {
    return remember 
      ? authConfig.remember_token_expire 
      : authConfig.token_expire
  }

  /**
   * 创建认证 Cookie 值
   * @param username 用户名
   * @param remember 是否记住登录
   * @returns Cookie 字符串
   */
  static createAuthCookie(username: string, remember: boolean = false): string {
    const maxAge = this.getTokenExpiry(remember) * 1000;
    
    return serialize('jwt', username, {
      httpOnly: true,
      path: '/',
      maxAge,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })
  }

  /**
   * 将用户实体映射为DTO（移除敏感信息）
   */
  static mapUserToDto(user: User): UserResponseDto {
    // 处理扩展的User类型（包含role关系）
    const userWithRole = user as any;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      role_id: user.roleId,
      role: userWithRole.role ? {
        id: userWithRole.role.id,
        name: userWithRole.role.name,
        description: userWithRole.role.description,
        permissions: userWithRole.role.permissions || []
      } : null,
      status: user.status,
      last_login: null, // 需要在数据库中添加该字段
      has_changed_pwd: false, // 需要在数据库中添加该字段
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }
  }

  /**
   * 验证令牌并获取用户
   * @param token 令牌内容
   * @returns 用户对象或null（如果令牌无效）
   */
  static async verifyTokenAndGetUser(token: string): Promise<User | null> {
    if (!token) return null
    
    try {
      // 在这个实现中，token 就是用户名
      return await prisma.user.findUnique({ 
        where: { username: token } 
      })
    } catch (error) {
      console.error('验证令牌时出错:', error)
      return null
    }
  }

  /**
   * 生成JWT令牌
   * @param userId 用户ID
   * @param remember 是否记住登录
   */
  static generateToken(userId: number, remember: boolean = false): string {
    const expiry = this.getTokenExpiry(remember);
    
    // 简单实现，实际应使用JWT库
    const payload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiry
    }
    
    return Buffer.from(JSON.stringify(payload)).toString('base64')
  }
} 