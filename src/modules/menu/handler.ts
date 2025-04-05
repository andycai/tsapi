import { MenuService } from './service'
import { CreateMenuDto, UpdateMenuDto } from './entity'
import type { Context } from 'elysia'

export class MenuHandler {
  private menuService: MenuService

  constructor() {
    this.menuService = new MenuService()
  }

  /**
   * 获取所有菜单
   */
  async getAllMenus() {
    return await this.menuService.getAllMenus()
  }

  /**
   * 获取菜单树结构
   */
  async getMenuTree() {
    return await this.menuService.getMenuTree()
  }

  /**
   * 获取单个菜单
   */
  async getMenuById({ params, error }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.menuService.getMenuById(id)
    
    if (!result.success) {
      throw error(404, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 创建菜单
   */
  async createMenu({ body, error }: Context<{ body: CreateMenuDto }>) {
    const result = await this.menuService.createMenu(body)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 更新菜单
   */
  async updateMenu({ 
    params, 
    body, 
    error 
  }: Context<{ params: { id: string }, body: UpdateMenuDto }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.menuService.updateMenu(id, body)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 删除菜单
   */
  async deleteMenu({ params, error }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.menuService.deleteMenu(id)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }
} 