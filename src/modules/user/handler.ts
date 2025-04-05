import { UserService } from './service'
import { CreateUserDto, UpdateUserDto } from './entity'
import type { Context } from 'elysia'

export class UserHandler {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  /**
   * 获取所有用户
   */
  async getAllUsers() {
    return await this.userService.getAllUsers()
  }

  /**
   * 获取单个用户
   */
  async getUserById({ params, error }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.userService.getUserById(id)
    
    if (!result.success) {
      throw error(404, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 创建用户
   */
  async createUser({ body, error }: Context<{ body: CreateUserDto }>) {
    const result = await this.userService.createUser(body)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 更新用户
   */
  async updateUser({ 
    params, 
    body, 
    error 
  }: Context<{ params: { id: string }, body: UpdateUserDto }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.userService.updateUser(id, body)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }

  /**
   * 删除用户
   */
  async deleteUser({ params, error }: Context<{ params: { id: string } }>) {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      throw error(400, {
        success: false,
        message: 'ID格式不正确'
      })
    }
    
    const result = await this.userService.deleteUser(id)
    
    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }
    
    return result
  }
} 