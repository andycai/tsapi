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

  /**
   * 初始化基础权限
   */
  async initBasePermissions(): Promise<void> {
    // 检查是否已初始化
    if (await this.isModuleInitialized('permission:init')) {
      console.log('权限模块已初始化，跳过')
      return
    }

    // 创建基础权限
    const permissions = [
      // 用户相关权限
      { code: 'user:view', name: '查看用户', description: '查看用户列表和详情' },
      { code: 'user:create', name: '创建用户', description: '创建新用户' },
      { code: 'user:update', name: '更新用户', description: '更新用户信息' },
      { code: 'user:delete', name: '删除用户', description: '删除用户' },
      
      // 角色相关权限
      { code: 'role:view', name: '查看角色', description: '查看角色列表和详情' },
      { code: 'role:create', name: '创建角色', description: '创建新角色' },
      { code: 'role:update', name: '更新角色', description: '更新角色信息' },
      { code: 'role:delete', name: '删除角色', description: '删除角色' },
      
      // 权限相关权限
      { code: 'permission:view', name: '查看权限', description: '查看权限列表和详情' },
      { code: 'permission:create', name: '创建权限', description: '创建新权限' },
      { code: 'permission:update', name: '更新权限', description: '更新权限信息' },
      { code: 'permission:delete', name: '删除权限', description: '删除权限' },
      
      // 菜单相关权限
      { code: 'menu:view', name: '查看菜单', description: '查看菜单列表和详情' },
      { code: 'menu:create', name: '创建菜单', description: '创建新菜单' },
      { code: 'menu:update', name: '更新菜单', description: '更新菜单信息' },
      { code: 'menu:delete', name: '删除菜单', description: '删除菜单' },
      
      // 笔记相关权限
      { code: 'note:view', name: '查看笔记', description: '查看笔记列表和详情' },
      { code: 'note:create', name: '创建笔记', description: '创建新笔记' },
      { code: 'note:update', name: '更新笔记', description: '更新笔记信息' },
      { code: 'note:delete', name: '删除笔记', description: '删除笔记' }
    ]

    for (const permission of permissions) {
      await prisma.permission.create({
        data: {
          ...permission,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // 标记模块已初始化
    await this.markModuleInitialized('permission:init')
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