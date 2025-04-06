import { prisma } from '../../lib/prisma'
import { User } from '@prisma/client'
import { RegisterDto } from './entity'

export class AuthDao {
  /**
   * 根据用户名查找用户
   */
  async findUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    })
  }

  /**
   * 根据邮箱查找用户
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  /**
   * 检查用户名或邮箱是否已存在
   */
  async findExistingUser(username: string, email?: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : [])
        ]
      }
    })
  }

  /**
   * 创建新用户
   */
  async createUser(userData: {
    username: string
    password: string
    email: string | null
  }): Promise<User> {
    return prisma.user.create({
      data: userData
    })
  }
}
