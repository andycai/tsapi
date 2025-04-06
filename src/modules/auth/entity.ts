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
  nickname: string | null
  role_id: number | null
  role: any | null
  status: number
  last_login?: Date | null
  has_changed_pwd?: boolean
  created_at?: Date
  updated_at?: Date
}

// API响应格式
export interface ApiResponse<T = any> {
  code: number // 0表示成功，非0表示错误
  message: string
  data?: T
}

// 认证响应格式
export interface AuthResponseDto {
  token: string
  user: UserResponseDto
}

// 用户认证状态
export interface AuthState {
  tokens: Record<string, string>
  user: User | null
}
