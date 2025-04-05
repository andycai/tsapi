import { Permission } from '@prisma/client'

// 创建权限请求DTO
export interface CreatePermissionDto {
  name: string
  code: string
  description?: string
}

// 更新权限请求DTO
export interface UpdatePermissionDto {
  name?: string
  code?: string
  description?: string
}

// 权限响应DTO
export interface PermissionResponseDto {
  id: number
  name: string
  code: string
  description?: string | null
  createdAt?: Date
  updatedAt?: Date
}

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
} 