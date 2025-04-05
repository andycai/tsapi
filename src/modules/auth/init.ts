import { Elysia, t } from 'elysia'
import { AuthHandler } from './handler'
import { User } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { configLoader } from '../../lib/config'
import { AuthUtils } from './utils'

// 获取认证配置
const authConfig = configLoader.getAuthConfig()

// 验证JWT的cookie模型
const jwtCookie = t.Cookie(
  {
    jwt: t.String()
  },
  {
    secrets: authConfig.jwt_secret,
    // cookie配置
    cookie: {
      maxAge: authConfig.token_expire, // 默认过期时间
    }
  }
)

// 认证服务
export const authService = new Elysia({ name: 'auth/service' })
  .model({
    register: t.Object({
      username: t.String({ minLength: 3 }),
      password: t.String({ minLength: 8 }),
      email: t.Optional(t.String({ format: 'email' }))
    }),
    login: t.Object({
      username: t.String(),
      password: t.String(),
      remember: t.Optional(t.Boolean())
    }),
    jwtCookie,
    optionalJwtCookie: t.Optional(t.Ref('jwtCookie'))
  })
  .state({
    tokens: {} as Record<string, string>,
    user: null as User | null
  })
  .macro({
    auth(enabled: boolean) {
      if (!enabled) return

      return {
        beforeHandle: async ({ error, cookie: { jwt }, set, store }) => {
          if (!jwt.value) {
            throw error(401, {
              success: false,
              message: '需要登录'
            })
          }

          const username = jwt.value
          const user = await AuthUtils.verifyTokenAndGetUser(username)

          if (!user) {
            jwt.remove()
            throw error(401, {
              success: false,
              message: '无效的会话'
            })
          }

          // 保存用户信息到 store 中，供后续中间件和请求处理函数使用
          store.user = user
        }
      }
    }
  })

// 创建处理器实例
const authHandler = new AuthHandler()

// 认证模块路由
export const auth = new Elysia({ prefix: '/auth' })
  .use(authService)
  .put(
    '/register',
    ({ body, error }) => authHandler.handleRegister({ body, error } as any),
    {
      body: 'register'
    }
  )
  .post(
    '/login',
    ({ body, set }) => authHandler.handleLogin({ body, set } as any),
    {
      body: 'login'
    }
  )
  .get(
    '/logout',
    ({ cookie, set }) => authHandler.handleLogout({ cookie, set } as any),
    {
      cookie: 'jwtCookie'
    }
  ) 