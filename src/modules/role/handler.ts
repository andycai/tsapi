import { RoleService } from './service'
import { CreateRoleDto, UpdateRoleDto } from './entity'
import type { Context } from 'elysia'

export class RoleHandler {
  private roleService: RoleService

  constructor() {
    this.roleService = new RoleService()
  }

  /**
   * 获取所有角色
   */
  async getAllRoles() {
    return await this.roleService.getAllRoles()
  }

  /**
   * 获取单个角色
   */
  async getRoleById({ params, error }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.roleService.getRoleById(id)
    
    if (!result.success) {
      throw error(404, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 创建角色
   */
  async createRole({ body, error }: Context<{ body: CreateRoleDto }>) {
    const result = await this.roleService.createRole(body)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 更新角色
   */
  async updateRole({ 
    params, 
    body, 
    error 
  }: Context<{ params: { id: string }, body: UpdateRoleDto }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.roleService.updateRole(id, body)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 删除角色
   */
  async deleteRole({ params, error }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.roleService.deleteRole(id)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }
} 