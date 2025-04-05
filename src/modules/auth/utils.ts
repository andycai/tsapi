import { configLoader } from '../../lib/config'
import type { User } from '@prisma/client'
import type { UserResponseDto } from './entity'
import { prisma } from '../../lib/prisma'

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
    const maxAge = this.getTokenExpiry(remember)
    return `jwt=${username}; HttpOnly; Path=/; Max-Age=${maxAge}`
  }

  /**
   * 将用户实体映射为DTO（移除敏感信息）
   */
  static mapUserToDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email
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
} 