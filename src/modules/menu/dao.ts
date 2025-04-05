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
} 