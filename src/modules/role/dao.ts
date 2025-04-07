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

  /**
   * 初始化基础角色
   */
  async initBaseRoles(): Promise<void> {
    // 检查是否已初始化
    if (await this.isModuleInitialized('role:init')) {
      console.log('角色模块已初始化，跳过')
      return
    }

    // 获取所有已创建的权限
    const permissionList = await prisma.permission.findMany();
    
    // 创建基础角色
    const roles = [
      {
        name: '超级管理员',
        description: '系统超级管理员',
        // 连接所有权限
        permissions: { connect: permissionList.map(p => ({ id: p.id })) }
      },
      {
        name: '管理员',
        description: '系统管理员',
        // 连接特定权限（通过code查找）
        permissions: { 
          connect: permissionList
            .filter(p => ['user:view', 'user:create', 'user:update', 'role:view'].includes(p.code))
            .map(p => ({ id: p.id }))
        }
      },
      {
        name: '普通用户',
        description: '普通用户',
        // 仅连接查看权限
        permissions: {
          connect: permissionList
            .filter(p => ['user:view'].includes(p.code))
            .map(p => ({ id: p.id }))
        }
      }
    ]

    for (const roleData of roles) {
      await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // 标记模块已初始化
    await this.markModuleInitialized('role:init')
  }

  /**
   * 检查模块是否已初始化
   */
  private async isModuleInitialized(module: string): Promise<boolean> {
    const init = await prisma.moduleInit.findUnique({
      where: { module }
    })
    return init?.initialized || false
  }

  /**
   * 标记模块已初始化
   */
  private async markModuleInitialized(module: string): Promise<void> {
    await prisma.moduleInit.upsert({
      where: { module },
      update: { initialized: true, updatedAt: new Date() },
      create: {
        module,
        initialized: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }
} 