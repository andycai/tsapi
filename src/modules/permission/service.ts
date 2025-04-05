import { PermissionDao } from './dao'
import { 
  ApiResponse, 
  CreatePermissionDto, 
  UpdatePermissionDto, 
  PermissionResponseDto 
} from './entity'

export class PermissionService {
  private permissionDao: PermissionDao

  constructor() {
    this.permissionDao = new PermissionDao()
  }

  /**
   * 获取所有权限
   */
  async getAllPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionDao.findAll()
    return permissions.map(this.mapToPermissionDto)
  }

  /**
   * 根据ID获取权限
   */
  async getPermissionById(id: number): Promise<ApiResponse<PermissionResponseDto>> {
    const permission = await this.permissionDao.findById(id)
    
    if (!permission) {
      return {
        success: false,
        message: '权限不存在'
      }
    }

    return {
      success: true,
      message: '获取权限成功',
      data: this.mapToPermissionDto(permission)
    }
  }

  /**
   * 创建新权限
   */
  async createPermission(data: CreatePermissionDto): Promise<ApiResponse<PermissionResponseDto>> {
    // 检查权限代码是否已存在
    const existing = await this.permissionDao.findByCode(data.code)
    if (existing) {
      return {
        success: false,
        message: '权限代码已存在'
      }
    }

    try {
      const permission = await this.permissionDao.create(data)
      return {
        success: true,
        message: '创建权限成功',
        data: this.mapToPermissionDto(permission)
      }
    } catch (error) {
      console.error('创建权限错误:', error)
      return {
        success: false,
        message: '创建权限失败'
      }
    }
  }

  /**
   * 更新权限
   */
  async updatePermission(id: number, data: UpdatePermissionDto): Promise<ApiResponse<PermissionResponseDto>> {
    // 检查权限是否存在
    const existingPermission = await this.permissionDao.findById(id)
    if (!existingPermission) {
      return {
        success: false,
        message: '权限不存在'
      }
    }

    // 如果要更新code，检查新code是否与其他权限冲突
    if (data.code && data.code !== existingPermission.code) {
      const codeExists = await this.permissionDao.findByCode(data.code)
      if (codeExists) {
        return {
          success: false,
          message: '权限代码已被使用'
        }
      }
    }

    try {
      const permission = await this.permissionDao.update(id, data)
      return {
        success: true,
        message: '更新权限成功',
        data: this.mapToPermissionDto(permission)
      }
    } catch (error) {
      console.error('更新权限错误:', error)
      return {
        success: false,
        message: '更新权限失败'
      }
    }
  }

  /**
   * 删除权限
   */
  async deletePermission(id: number): Promise<ApiResponse<void>> {
    // 检查权限是否存在
    const existingPermission = await this.permissionDao.findById(id)
    if (!existingPermission) {
      return {
        success: false,
        message: '权限不存在'
      }
    }

    try {
      await this.permissionDao.delete(id)
      return {
        success: true,
        message: '删除权限成功'
      }
    } catch (error) {
      console.error('删除权限错误:', error)
      return {
        success: false,
        message: '删除权限失败，该权限可能正在被角色使用'
      }
    }
  }

  /**
   * 将权限实体映射为DTO
   */
  private mapToPermissionDto(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      code: permission.code,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    }
  }
} 