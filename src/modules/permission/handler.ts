import { PermissionService } from './service'
import { CreatePermissionDto, UpdatePermissionDto } from './entity'
import type { Context } from 'elysia'

export class PermissionHandler {
  private permissionService: PermissionService

  constructor() {
    this.permissionService = new PermissionService()
  }

  /**
   * 获取所有权限
   */
  async getAllPermissions() {
    return await this.permissionService.getAllPermissions()
  }

  /**
   * 获取单个权限
   */
  async getPermissionById({ params, error }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.permissionService.getPermissionById(id)
    
    if (!result.success) {
      throw error(404, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 创建权限
   */
  async createPermission({ body, error }: Context<{ body: CreatePermissionDto }>) {
    const result = await this.permissionService.createPermission(body)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 更新权限
   */
  async updatePermission({ 
    params, 
    body, 
    error 
  }: Context<{ params: { id: string }, body: UpdatePermissionDto }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.permissionService.updatePermission(id, body)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 删除权限
   */
  async deletePermission({ params, error }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.permissionService.deletePermission(id)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }
} 