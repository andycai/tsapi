import { User } from '@prisma/client'

// 注册请求DTO
export interface RegisterDto {
  username: string
  password: string
  email?: string
}

// 登录请求DTO
export interface LoginDto {
  username: string
  password: string
  remember?: boolean
}

// 用户响应DTO（不包含密码等敏感信息）
export interface UserResponseDto {
  id: number
  username: string
  email: string | null
}

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// 用户认证状态
export interface AuthState {
  tokens: Record<string, string>
  user: User | null
}
