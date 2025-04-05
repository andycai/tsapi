import { AuthService } from './service'
import { LoginDto, RegisterDto } from './entity'
import type { Context } from 'elysia'

export class AuthHandler {
  private authService: AuthService

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

      const { username, password } = body

      if (!username || !password) {
        set.status = 400
        return {
          success: false,
          message: '用户名和密码不能为空'
        }
      }

      const result = await this.authService.login({ username, password })

      if (!result.success) {
        set.status = 401
        return result
      }

      // 设置一个普通的 Cookie
      const cookieValue = `jwt=${username}; HttpOnly; Path=/; Max-Age=${7 * 86400}`
      set.headers = {
        ...(set.headers || {}),
        'Set-Cookie': cookieValue as any
      } as any

      return result
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
