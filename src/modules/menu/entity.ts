import { Menu } from '@prisma/client'

// 创建菜单请求DTO
export interface CreateMenuDto {
  parentId?: number
  name: string
  path?: string
  icon?: string
  permission?: string
  sort?: number
  isShow?: boolean
}

// 更新菜单请求DTO
export interface UpdateMenuDto {
  parentId?: number
  name?: string
  path?: string
  icon?: string
  permission?: string
  sort?: number
  isShow?: boolean
}

// 菜单响应DTO
export interface MenuResponseDto {
  id: number
  parentId: number
  name: string
  path: string | null
  icon: string | null
  permission: string | null
  sort: number
  isShow: boolean
  createdAt?: Date
  updatedAt?: Date
}

// 菜单树节点
export interface MenuTreeNode {
  menu: MenuResponseDto
  children?: MenuTreeNode[]
}

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
} 