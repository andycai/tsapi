import { prisma } from '../../lib/prisma'
import { User } from '@prisma/client'
import { CreateUserDto, UpdateUserDto } from './entity'

export class UserDao {
  /**
   * 获取所有用户及其关联的角色
   */
  async findAll() {
    return prisma.user.findMany({
      include: {
        role: true
      },
      orderBy: { id: 'asc' }
    })
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true
      }
    })
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username }
    })
  }

  /**
   * 创建新用户
   */
  async create(data: CreateUserDto & { email?: string | null }) {
    return prisma.user.create({
      data,
      include: {
        role: true
      }
    })
  }

  /**
   * 更新用户
   */
  async update(id: number, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        role: true
      }
    })
  }

  /**
   * 删除用户
   */
  async delete(id: number) {
    return prisma.user.delete({
      where: { id }
    })
  }
} 