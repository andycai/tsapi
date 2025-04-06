import { Elysia, t } from 'elysia'
import { AuthUtils } from '../modules/auth/utils'
import { ApiCode } from '../core/constants/code'

/**
 * 认证中间件 - 验证用户是否已登录
 */
export const authMiddleware = new Elysia()
  .derive(async ({ cookie, set }) => {
    // 从Cookie中获取JWT
    const token = cookie.jwt ? String(cookie.jwt) : undefined
    
    if (!token) {
      set.status = 401
      return {
        code: ApiCode.UNAUTHORIZED,
        message: '请先登录'
      }
    }
    
    // 验证令牌并获取用户信息
    const user = await AuthUtils.verifyTokenAndGetUser(token)
    
    if (!user) {
      set.status = 401
      return {
        code: ApiCode.UNAUTHORIZED,
        message: '登录已过期，请重新登录'
      }
    }
    
    // 将用户信息添加到上下文
    return { user }
  })

/**
 * 权限中间件 - 验证用户是否有指定权限
 * @param permissionCode 权限编码
 */
export function requirePermission(permissionCode: string) {
  return new Elysia()
    .derive(({ set, user }: { set: any, user?: any }) => {
      // 若用户未通过认证中间件，这里的user为undefined
      if (!user) {
        set.status = 401
        return {
          code: ApiCode.UNAUTHORIZED,
          message: '请先登录'
        }
      }
      
      // 检查用户是否有特定权限
      const hasPermission = user.role?.permissions?.some(
        (perm: any) => perm.code === permissionCode
      )
      
      if (!hasPermission) {
        set.status = 403
        return {
          code: ApiCode.PERMISSION_DENIED,
          message: '没有操作权限'
        }
      }
      
      return { permission: permissionCode }
    })
} 