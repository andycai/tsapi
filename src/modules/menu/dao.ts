import { prisma } from '../../lib/prisma'
import { CreateMenuDto, UpdateMenuDto } from './entity'

export class MenuDao {
  /**
   * 获取所有菜单
   */
  async findAll() {
    return prisma.menu.findMany({
      orderBy: [
        { parentId: 'asc' },
        { sort: 'asc' }
      ]
    })
  }

  /**
   * 获取顶级菜单（没有父级的菜单）
   */
  async findRootMenus() {
    return prisma.menu.findMany({
      where: { parentId: 0 },
      orderBy: { sort: 'asc' }
    })
  }

  /**
   * 获取指定父级的子菜单
   */
  async findChildMenus(parentId: number) {
    return prisma.menu.findMany({
      where: { parentId },
      orderBy: { sort: 'asc' }
    })
  }

  /**
   * 根据ID查找菜单
   */
  async findById(id: number) {
    return prisma.menu.findUnique({
      where: { id }
    })
  }

  /**
   * 创建新菜单
   */
  async create(data: CreateMenuDto) {
    // 确保默认值设置正确
    const menuData = {
      parentId: data.parentId ?? 0,
      name: data.name,
      path: data.path ?? null,
      icon: data.icon ?? null,
      permission: data.permission ?? null,
      sort: data.sort ?? 0,
      isShow: data.isShow ?? true
    }

    return prisma.menu.create({
      data: menuData
    })
  }

  /**
   * 更新菜单
   */
  async update(id: number, data: UpdateMenuDto) {
    return prisma.menu.update({
      where: { id },
      data
    })
  }

  /**
   * 删除菜单及其子菜单
   * @param id 菜单ID
   * @param deleteChildren 是否删除子菜单，默认true
   */
  async delete(id: number, deleteChildren: boolean = true) {
    if (deleteChildren) {
      // 先删除所有子菜单
      await prisma.menu.deleteMany({
        where: { parentId: id }
      })
    }
    
    // 再删除当前菜单
    return prisma.menu.delete({
      where: { id }
    })
  }

  /**
   * 初始化菜单
   */
  async initMenus(): Promise<void> {
    // 检查是否已初始化
    if (await this.isModuleInitialized('menu:init')) {
      console.log('菜单模块已初始化，跳过')
      return
    }

    // 创建基础菜单
    const menus = [
      {
        name: '系统管理',
        path: '/system',
        icon: 'setting',
        sort: 1,
        children: [
          {
            name: '用户管理',
            path: '/system/user',
            icon: 'user',
            sort: 1,
            permission: 'user:view'
          },
          {
            name: '角色管理',
            path: '/system/role',
            icon: 'team',
            sort: 2,
            permission: 'role:view'
          },
          {
            name: '权限管理',
            path: '/system/permission',
            icon: 'safety',
            sort: 3,
            permission: 'permission:view'
          },
          {
            name: '菜单管理',
            path: '/system/menu',
            icon: 'menu',
            sort: 4,
            permission: 'menu:view'
          }
        ]
      },
      {
        name: '内容管理',
        path: '/content',
        icon: 'file',
        sort: 2,
        children: [
          {
            name: '笔记管理',
            path: '/content/note',
            icon: 'book',
            sort: 1,
            permission: 'note:view'
          }
        ]
      }
    ]

    for (const menu of menus) {
      await this.createMenuWithChildren(menu)
    }

    // 标记模块已初始化
    await this.markModuleInitialized('menu:init')
  }

  /**
   * 递归创建菜单及其子菜单
   */
  private async createMenuWithChildren(menu: any, parentId?: number): Promise<void> {
    const { children, ...menuData } = menu
    
    // 将 order 属性重命名为 sort
    const createdMenu = await prisma.menu.create({
      data: {
        ...menuData,
        parentId: parentId ?? 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    if (children && children.length > 0) {
      for (const child of children) {
        await this.createMenuWithChildren(child, createdMenu.id)
      }
    }
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