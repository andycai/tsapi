import { RoleDao } from './dao'
import { 
  ApiResponse, 
  CreateRoleDto, 
  UpdateRoleDto, 
  RoleResponseDto,
  PermissionDto
} from './entity'

export class RoleService {
  private roleDao: RoleDao

  constructor() {
    this.roleDao = new RoleDao()
  }

  /**
   * 获取所有角色
   */
  async getAllRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.roleDao.findAll()
    return roles.map(this.mapToRoleDto)
  }

  /**
   * 根据ID获取角色
   */
  async getRoleById(id: number): Promise<ApiResponse<RoleResponseDto>> {
    const role = await this.roleDao.findById(id)
    
    if (!role) {
      return {
        success: false,
        message: '角色不存在'
      }
    }

    return {
      success: true,
      message: '获取角色成功',
      data: this.mapToRoleDto(role)
    }
  }

  /**
   * 创建新角色
   */
  async createRole(data: CreateRoleDto): Promise<ApiResponse<RoleResponseDto>> {
    // 检查角色名称是否已存在
    const existing = await this.roleDao.findByName(data.name)
    if (existing) {
      return {
        success: false,
        message: '角色名称已存在'
      }
    }

    try {
      const role = await this.roleDao.create(data)
      return {
        success: true,
        message: '创建角色成功',
        data: this.mapToRoleDto(role)
      }
    } catch (error) {
      console.error('创建角色错误:', error)
      return {
        success: false,
        message: '创建角色失败'
      }
    }
  }

  /**
   * 更新角色
   */
  async updateRole(id: number, data: UpdateRoleDto): Promise<ApiResponse<RoleResponseDto>> {
    // 检查角色是否存在
    const existingRole = await this.roleDao.findById(id)
    if (!existingRole) {
      return {
        success: false,
        message: '角色不存在'
      }
    }

    // 如果要更新名称，检查名称是否与其他角色冲突
    if (data.name && data.name !== existingRole.name) {
      const nameExists = await this.roleDao.findByName(data.name)
      if (nameExists) {
        return {
          success: false,
          message: '角色名称已被使用'
        }
      }
    }

    try {
      const role = await this.roleDao.update(id, data)
      return {
        success: true,
        message: '更新角色成功',
        data: this.mapToRoleDto(role)
      }
    } catch (error) {
      console.error('更新角色错误:', error)
      return {
        success: false,
        message: '更新角色失败'
      }
    }
  }

  /**
   * 删除角色
   */
  async deleteRole(id: number): Promise<ApiResponse<void>> {
    // 检查角色是否存在
    const existingRole = await this.roleDao.findById(id)
    if (!existingRole) {
      return {
        success: false,
        message: '角色不存在'
      }
    }

    try {
      await this.roleDao.delete(id)
      return {
        success: true,
        message: '删除角色成功'
      }
    } catch (error) {
      console.error('删除角色错误:', error)
      return {
        success: false,
        message: '删除角色失败，该角色可能正在被用户使用'
      }
    }
  }

  /**
   * 将角色实体映射为DTO
   */
  private mapToRoleDto(role: any): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p: any) => this.mapToPermissionDto(p)),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }
  }

  /**
   * 将权限实体映射为DTO
   */
  private mapToPermissionDto(permission: any): PermissionDto {
    return {
      id: permission.id,
      name: permission.name,
      code: permission.code
    }
  }
} 