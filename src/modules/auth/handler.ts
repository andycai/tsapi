import { AuthService } from './service'
import { LoginDto, RegisterDto } from './entity'
import type { Context } from 'elysia'
import { configLoader } from '../../lib/config'

export class AuthHandler {
  private authService: AuthService
  private authConfig = configLoader.getAuthConfig()

  constructor() {
    this.authService = new AuthService()
  }

  /**
   * 处理注册请求
   */
  async handleRegister({ body, error }: Context<{ body: RegisterDto }>) {
    const result = await this.authService.register(body)

    if (!result.success) {
      throw error(400, {
        success: false,
        message: result.message
      })
    }

    return result
  }

  /**
   * 处理登录请求
   */
  async handleLogin({ body, set }: Context<{ body: LoginDto }>) {
    try {
      if (!body || typeof body !== 'object') {
        set.status = 400
        return {
          success: false,
          message: '请求格式错误'
        }
      }

      const { username, password, remember = false } = body

      if (!username || !password) {
        set.status = 400
        return {
          success: false,
          message: '用户名和密码不能为空'
        }
      }

      const result = await this.authService.login({ username, password, remember })

      if (!result.success) {
        set.status = 401
        return result
      }

      // 使用从 service 返回的过期时间，如果没有则使用默认值
      const maxAge = result.tokenExpiry || this.authConfig.token_expire

      // 设置一个普通的 Cookie
      const cookieValue = `jwt=${username}; HttpOnly; Path=/; Max-Age=${maxAge}`
      set.headers = {
        ...(set.headers || {}),
        'Set-Cookie': cookieValue as any
      } as any

      // 移除 tokenExpiry 字段，不需要返回给客户端
      const { tokenExpiry, ...responseData } = result

      return responseData
    } catch (err) {
      console.error('登录处理错误:', err)
      set.status = 500
      return {
        success: false,
        message: '服务器处理登录请求时出错'
      }
    }
  }

  /**
   * 用户登出
   */
  handleLogout({ cookie }: Context<{ cookie: { jwt: { remove: () => void } } }>) {
    cookie.jwt.remove()
    
    return {
      success: true,
      message: '已成功登出'
    }
  }
}
