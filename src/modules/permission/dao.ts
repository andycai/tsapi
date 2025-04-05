import { prisma } from '../../lib/prisma'
import { Permission } from '@prisma/client'
import { CreatePermissionDto, UpdatePermissionDto } from './entity'

export class PermissionDao {
  /**
   * 获取所有权限
   */
  async findAll(): Promise<Permission[]> {
    return prisma.permission.findMany({
      orderBy: { id: 'asc' }
    })
  }

  /**
   * 根据ID查找权限
   */
  async findById(id: number): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { id }
    })
  }

  /**
   * 根据代码查找权限
   */
  async findByCode(code: string): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { code }
    })
  }

  /**
   * 创建新权限
   */
  async create(data: CreatePermissionDto): Promise<Permission> {
    return prisma.permission.create({
      data
    })
  }

  /**
   * 更新权限
   */
  async update(id: number, data: UpdatePermissionDto): Promise<Permission> {
    return prisma.permission.update({
      where: { id },
      data
    })
  }

  /**
   * 删除权限
   */
  async delete(id: number): Promise<Permission> {
    return prisma.permission.delete({
      where: { id }
    })
  }
} 