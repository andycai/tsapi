import { Elysia, t } from 'elysia'
import { UserHandler } from './handler'
import { authService } from '../auth/init'

// 创建处理器实例
const userHandler = new UserHandler()

// 用户模块路由
export const users = new Elysia({ prefix: '/api/users' })
  .use(authService)
  .get(
    '/',
    () => userHandler.getAllUsers(),
    {
      detail: {
        tags: ['用户管理'],
        summary: '获取所有用户',
      },
      // 需要管理员身份才能访问
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .get(
    '/:id',
    ({ params, error }) => userHandler.getUserById({ params, error } as any),
    {
      detail: {
        tags: ['用户管理'],
        summary: '根据ID获取用户',
      },
      params: t.Object({
        id: t.String()
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .post(
    '/',
    ({ body, error }) => userHandler.createUser({ body, error } as any),
    {
      detail: {
        tags: ['用户管理'],
        summary: '创建新用户',
      },
      body: t.Object({
        username: t.String({ minLength: 3 }),
        password: t.String({ minLength: 6 }),
        nickname: t.Optional(t.String()),
        roleId: t.Optional(t.Number()),
        status: t.Optional(t.Number())
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .put(
    '/:id',
    ({ params, body, error }) => userHandler.updateUser({ params, body, error } as any),
    {
      detail: {
        tags: ['用户管理'],
        summary: '更新用户',
      },
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        nickname: t.Optional(t.String()),
        password: t.Optional(t.String({ minLength: 6 })),
        roleId: t.Optional(t.Number()),
        status: t.Optional(t.Number())
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .delete(
    '/:id',
    ({ params, error }) => userHandler.deleteUser({ params, error } as any),
    {
      detail: {
        tags: ['用户管理'],
        summary: '删除用户',
      },
      params: t.Object({
        id: t.String()
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )

export const userService = new Elysia({ name: 'user/service' })
    .state({
        user: {} as Record<string, string>,
        session: {} as Record<number, string>
    })
    .model({
        signIn: t.Object({
            username: t.String({ minLength: 1 }),
            password: t.String({ minLength: 8 })
        }),
        session: t.Cookie(
            {
                token: t.Number()
            },
            {
                secrets: 'seia'
            }
        ),
        optionalSession: t.Optional(t.Ref('session'))
    }) 
    .macro({
        isSignIn(enabled: boolean) {
            if (!enabled) return

            return {
                beforeHandle({ error, cookie: { token }, store: { session } }) {
                    if (!token.value)
                        return error(401, {
                            success: false,
                            message: 'Unauthorized'
                        })

                    const username = session[token.value as unknown as number]

                    if (!username)
                        return error(401, {
                            success: false,
                            message: 'Unauthorized'
                        })
                }
            }
        }
    }) 

export const getUserId = new Elysia()
    .use(userService)
    .guard({
        isSignIn: true,
        cookie: 'session'
    })
    .resolve(
        ({ store: { session }, cookie: { token } }) => ({
        username: session[token.value]
    }))
    .as('plugin')

export const user = new Elysia({ prefix: '/user' })
    .use(userService)
    .put(
        '/sign-up',
        async ({ body: { username, password }, store, error }) => {
            if (store.user[username])
                return error(400, {
                    success: false,
                    message: 'User already exists'
                })

            store.user[username] = await Bun.password.hash(password)

            return {
                success: true,
                message: 'User created'
            }
        },
        {
            body: 'signIn'
        }
    )
    .post(
        '/sign-in',
        async ({
            store: { user, session },
            error,
            body: { username, password },
            cookie: { token }
        }) => {
            if (
                !user[username] ||
                !(await Bun.password.verify(password, user[username]))
            )
                return error(400, {
                    success: false,
                    message: 'Invalid username or password'
                })

            const key = crypto.getRandomValues(new Uint32Array(1))[0]
            session[key] = username
            token.value = key

            return {
                success: true,
                message: `Signed in as ${username}`
            }
        },
        {
            body: 'signIn',
            cookie: 'optionalSession'
        }
    )
    .get(
        '/sign-out',
        ({ cookie: { token } }) => {
            token.remove()

            return {
                success: true,
                message: 'Signed out'
            }
        },
        {
            cookie: 'optionalSession'
        }
    )
    .get(
        '/profile',
        ({ cookie: { token }, store: { session }, error }) => {
            const username = session[token.value]

            return {
                success: true,
                username
            }
        },
        {
            isSignIn: true,
            cookie: 'session'
        }
    ) 