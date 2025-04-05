import { MenuDao } from './dao'
import { 
  ApiResponse, 
  CreateMenuDto, 
  UpdateMenuDto, 
  MenuResponseDto,
  MenuTreeNode
} from './entity'

export class MenuService {
  private menuDao: MenuDao

  constructor() {
    this.menuDao = new MenuDao()
  }

  /**
   * 获取所有菜单
   */
  async getAllMenus(): Promise<MenuResponseDto[]> {
    const menus = await this.menuDao.findAll()
    return menus.map(this.mapToMenuDto)
  }

  /**
   * 获取菜单树
   */
  async getMenuTree(): Promise<MenuTreeNode[]> {
    const allMenus = await this.getAllMenus()
    
    // 获取顶级菜单
    const rootMenus = allMenus.filter(menu => menu.parentId === 0)
    
    // 构建树结构
    return rootMenus.map(menu => this.buildMenuTree(menu, allMenus))
  }

  /**
   * 递归构建菜单树
   */
  private buildMenuTree(menu: MenuResponseDto, allMenus: MenuResponseDto[]): MenuTreeNode {
    const children = allMenus
      .filter(m => m.parentId === menu.id)
      .map(childMenu => this.buildMenuTree(childMenu, allMenus))
      .sort((a, b) => a.menu.sort - b.menu.sort)
    
    return {
      menu,
      children: children.length > 0 ? children : undefined
    }
  }

  /**
   * 根据ID获取菜单
   */
  async getMenuById(id: number): Promise<ApiResponse<MenuResponseDto>> {
    const menu = await this.menuDao.findById(id)
    
    if (!menu) {
      return {
        success: false,
        message: '菜单不存在'
      }
    }

    return {
      success: true,
      message: '获取菜单成功',
      data: this.mapToMenuDto(menu)
    }
  }

  /**
   * 创建新菜单
   */
  async createMenu(data: CreateMenuDto): Promise<ApiResponse<MenuResponseDto>> {
    try {
      // 如果设置了父级菜单，检查父级菜单是否存在
      if (data.parentId && data.parentId > 0) {
        const parentMenu = await this.menuDao.findById(data.parentId)
        if (!parentMenu) {
          return {
            success: false,
            message: '父级菜单不存在'
          }
        }
      }
      
      const menu = await this.menuDao.create(data)
      return {
        success: true,
        message: '创建菜单成功',
        data: this.mapToMenuDto(menu)
      }
    } catch (error) {
      console.error('创建菜单错误:', error)
      return {
        success: false,
        message: '创建菜单失败'
      }
    }
  }

  /**
   * 更新菜单
   */
  async updateMenu(id: number, data: UpdateMenuDto): Promise<ApiResponse<MenuResponseDto>> {
    // 检查菜单是否存在
    const existingMenu = await this.menuDao.findById(id)
    if (!existingMenu) {
      return {
        success: false,
        message: '菜单不存在'
      }
    }

    // 如果要更新父级菜单，检查父级菜单是否存在
    if (data.parentId !== undefined && data.parentId > 0) {
      const parentMenu = await this.menuDao.findById(data.parentId)
      if (!parentMenu) {
        return {
          success: false,
          message: '父级菜单不存在'
        }
      }
      
      // 防止循环引用：不能将自己或自己的子菜单设为父级
      if (data.parentId === id) {
        return {
          success: false,
          message: '不能将自己设为父级菜单'
        }
      }
    }

    try {
      const menu = await this.menuDao.update(id, data)
      return {
        success: true,
        message: '更新菜单成功',
        data: this.mapToMenuDto(menu)
      }
    } catch (error) {
      console.error('更新菜单错误:', error)
      return {
        success: false,
        message: '更新菜单失败'
      }
    }
  }

  /**
   * 删除菜单
   */
  async deleteMenu(id: number): Promise<ApiResponse<void>> {
    // 检查菜单是否存在
    const existingMenu = await this.menuDao.findById(id)
    if (!existingMenu) {
      return {
        success: false,
        message: '菜单不存在'
      }
    }

    try {
      await this.menuDao.delete(id)
      return {
        success: true,
        message: '删除菜单成功'
      }
    } catch (error) {
      console.error('删除菜单错误:', error)
      return {
        success: false,
        message: '删除菜单失败'
      }
    }
  }

  /**
   * 将菜单实体映射为DTO
   */
  private mapToMenuDto(menu: any): MenuResponseDto {
    return {
      id: menu.id,
      parentId: menu.parentId,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      permission: menu.permission,
      sort: menu.sort,
      isShow: menu.isShow,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt
    }
  }
} 