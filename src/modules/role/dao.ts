import { prisma } from '../../lib/prisma'
import { CreateRoleDto, UpdateRoleDto } from './entity'

export class RoleDao {
  /**
   * 获取所有角色及其关联的权限
   */
  async findAll() {
    return prisma.role.findMany({
      include: {
        permissions: true
      },
      orderBy: { id: 'asc' }
    })
  }

  /**
   * 根据ID查找角色
   */
  async findById(id: number) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true
      }
    })
  }

  /**
   * 根据名称查找角色
   */
  async findByName(name: string) {
    return prisma.role.findUnique({
      where: { name }
    })
  }

  /**
   * 创建新角色
   */
  async create(data: CreateRoleDto) {
    const { permissions, ...roleData } = data
    return prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          connect: permissions.map(id => ({ id }))
        }
      },
      include: {
        permissions: true
      }
    })
  }

  /**
   * 更新角色
   */
  async update(id: number, data: UpdateRoleDto) {
    const { permissions, ...roleData } = data
    
    // 如果有权限更新
    if (permissions !== undefined) {
      // 先断开所有现有权限连接
      await prisma.role.update({
        where: { id },
        data: {
          permissions: {
            set: [] // 清空现有权限
          }
        }
      })
      
      // 再连接新的权限
      return prisma.role.update({
        where: { id },
        data: {
          ...roleData,
          permissions: {
            connect: permissions.map(id => ({ id }))
          }
        },
        include: {
          permissions: true
        }
      })
    } else {
      // 仅更新角色数据，不更新权限
      return prisma.role.update({
        where: { id },
        data: roleData,
        include: {
          permissions: true
        }
      })
    }
  }

  /**
   * 删除角色
   */
  async delete(id: number) {
    // 首先断开与权限的所有连接
    await prisma.role.update({
      where: { id },
      data: {
        permissions: {
          set: [] // 清空权限关联
        }
      }
    })
    
    // 然后删除角色
    return prisma.role.delete({
      where: { id }
    })
  }
} 