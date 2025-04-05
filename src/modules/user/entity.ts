import { User, Role } from '@prisma/client'

// 创建用户请求DTO
export interface CreateUserDto {
  username: string
  password: string
  nickname?: string
  roleId?: number
  status?: number
}

// 更新用户请求DTO
export interface UpdateUserDto {
  nickname?: string
  password?: string
  roleId?: number
  status?: number
}

// 用户响应DTO（不包含密码等敏感信息）
export interface UserResponseDto {
  id: number
  username: string
  nickname: string | null
  email: string | null
  status: number
  roleId: number | null
  role?: RoleInfoDto | null
  createdAt?: Date
  updatedAt?: Date
}

// 简化的角色DTO，用于用户响应
export interface RoleInfoDto {
  id: number
  name: string
  description?: string | null
}

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
} 