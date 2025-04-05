import { UserDao } from './dao'
import {
  ApiResponse,
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  RoleInfoDto
} from './entity'

export class UserService {
  private userDao: UserDao

  constructor() {
    this.userDao = new UserDao()
  }

  /**
   * 获取所有用户
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userDao.findAll()
    return users.map(this.mapToUserDto)
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: number): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.userDao.findById(id)

    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    return {
      success: true,
      message: '获取用户成功',
      data: this.mapToUserDto(user)
    }
  }

  /**
   * 创建新用户
   */
  async createUser(data: CreateUserDto): Promise<ApiResponse<UserResponseDto>> {
    // 检查用户名是否已存在
    const existing = await this.userDao.findByUsername(data.username)
    if (existing) {
      return {
        success: false,
        message: '用户名已存在'
      }
    }

    try {
      // 哈希密码
      const hashedPassword = await Bun.password.hash(data.password, {
        algorithm: 'bcrypt',
        cost: 10
      })

      const userData = {
        ...data,
        password: hashedPassword,
        status: data.status || 1, // 默认状态为1（正常）
        email: null // 这里可以根据需要修改，前端暂不传email
      }

      const user = await this.userDao.create(userData)
      return {
        success: true,
        message: '创建用户成功',
        data: this.mapToUserDto(user)
      }
    } catch (error) {
      console.error('创建用户错误:', error)
      return {
        success: false,
        message: '创建用户失败'
      }
    }
  }

  /**
   * 更新用户
   */
  async updateUser(id: number, data: UpdateUserDto): Promise<ApiResponse<UserResponseDto>> {
    // 检查用户是否存在
    const existingUser = await this.userDao.findById(id)
    if (!existingUser) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    try {
      // 如果有密码更新，需要哈希处理
      let updatedData = { ...data }
      if (data.password) {
        updatedData.password = await Bun.password.hash(data.password, {
          algorithm: 'bcrypt',
          cost: 10
        })
      }

      const user = await this.userDao.update(id, updatedData)
      return {
        success: true,
        message: '更新用户成功',
        data: this.mapToUserDto(user)
      }
    } catch (error) {
      console.error('更新用户错误:', error)
      return {
        success: false,
        message: '更新用户失败'
      }
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    // 检查用户是否存在
    const existingUser = await this.userDao.findById(id)
    if (!existingUser) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    try {
      await this.userDao.delete(id)
      return {
        success: true,
        message: '删除用户成功'
      }
    } catch (error) {
      console.error('删除用户错误:', error)
      return {
        success: false,
        message: '删除用户失败'
      }
    }
  }

  /**
   * 将用户实体映射为DTO（移除敏感信息）
   */
  private mapToUserDto(user: any): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      status: user.status,
      roleId: user.roleId,
      role: user.role ? this.mapToRoleInfoDto(user.role) : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  /**
   * 将角色实体映射为简化的DTO
   */
  private mapToRoleInfoDto(role: any): RoleInfoDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description
    }
  }
} 