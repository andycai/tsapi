import { Role, Permission } from '@prisma/client'

// 创建角色请求DTO
export interface CreateRoleDto {
  name: string
  description?: string
  permissions: number[] // 权限ID数组
}

// 更新角色请求DTO
export interface UpdateRoleDto {
  name?: string
  description?: string
  permissions?: number[] // 权限ID数组
}

// 角色响应DTO
export interface RoleResponseDto {
  id: number
  name: string
  description?: string | null
  permissions: PermissionDto[]
  createdAt?: Date
  updatedAt?: Date
}

// 简化的权限DTO，用于角色响应
export interface PermissionDto {
  id: number
  name: string
  code: string
}

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
} 