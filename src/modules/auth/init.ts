import { Elysia, t } from 'elysia'
import { AuthHandler } from './handler'
import { User } from '@prisma/client'
import { prisma } from '../../lib/prisma'

// 验证JWT的cookie模型
const jwtCookie = t.Cookie(
  {
    jwt: t.String()
  },
  {
    secrets: process.env.JWT_SECRET || '!@#$bUn1234Elysia',
    // cookie配置
    cookie: {
      maxAge: 7 * 86400, // 7天过期
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
      password: t.String()
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
          const user = await prisma.user.findUnique({ where: { username } })

          if (!user) {
            jwt.remove()
            throw error(401, {
              success: false,
              message: '无效的会话'
            })
          }

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
    ({ body, set }) => authHandler.handleLogin({ body, set } as any)
  )
  .get(
    '/logout',
    ({ cookie }) => authHandler.handleLogout({ cookie } as any),
    {
      cookie: 'jwtCookie'
    }
  ) 