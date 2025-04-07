import { Elysia, t } from 'elysia'
import { RoleHandler } from './handler'
import { authService } from '../auth/route'

// 创建处理器实例
const roleHandler = new RoleHandler()

// 角色模块路由
export const roles = new Elysia({ prefix: '/api/roles' })
  .use(authService)
  .get(
    '/',
    () => roleHandler.getAllRoles(),
    {
      detail: {
        tags: ['角色管理'],
        summary: '获取所有角色',
      },
      // 需要管理员身份才能访问
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .get(
    '/:id',
    ({ params, error }) => roleHandler.getRoleById({ params, error } as any),
    {
      detail: {
        tags: ['角色管理'],
        summary: '根据ID获取角色',
      },
      params: t.Object({
        id: t.String()
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .post(
    '/',
    ({ body, error }) => roleHandler.createRole({ body, error } as any),
    {
      detail: {
        tags: ['角色管理'],
        summary: '创建新角色',
      },
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        permissions: t.Array(t.Number())
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .put(
    '/:id',
    ({ params, body, error }) => roleHandler.updateRole({ params, body, error } as any),
    {
      detail: {
        tags: ['角色管理'],
        summary: '更新角色',
      },
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        permissions: t.Optional(t.Array(t.Number()))
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .delete(
    '/:id',
    ({ params, error }) => roleHandler.deleteRole({ params, error } as any),
    {
      detail: {
        tags: ['角色管理'],
        summary: '删除角色',
      },
      params: t.Object({
        id: t.String()
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  ) 