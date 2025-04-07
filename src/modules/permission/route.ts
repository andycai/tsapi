import { Elysia, t } from 'elysia'
import { PermissionHandler } from './handler'
import { authService } from '../auth/route'

// 创建处理器实例
const permissionHandler = new PermissionHandler()

// 权限模块路由
export const permissions = new Elysia({ prefix: '/api/permissions' })
  .use(authService)
  .get(
    '/',
    () => permissionHandler.getAllPermissions(),
    {
      detail: {
        tags: ['权限管理'],
        summary: '获取所有权限',
      },
      // 需要管理员身份才能访问
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .get(
    '/:id',
    ({ params, error }) => permissionHandler.getPermissionById({ params, error } as any),
    {
      detail: {
        tags: ['权限管理'],
        summary: '根据ID获取权限',
      },
      params: t.Object({
        id: t.String()
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .post(
    '/',
    ({ body, error }) => permissionHandler.createPermission({ body, error } as any),
    {
      detail: {
        tags: ['权限管理'],
        summary: '创建新权限',
      },
      body: t.Object({
        name: t.String(),
        code: t.String(),
        description: t.Optional(t.String())
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .put(
    '/:id',
    ({ params, body, error }) => permissionHandler.updatePermission({ params, body, error } as any),
    {
      detail: {
        tags: ['权限管理'],
        summary: '更新权限',
      },
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        code: t.Optional(t.String()),
        description: t.Optional(t.String())
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .delete(
    '/:id',
    ({ params, error }) => permissionHandler.deletePermission({ params, error } as any),
    {
      detail: {
        tags: ['权限管理'],
        summary: '删除权限',
      },
      params: t.Object({
        id: t.String()
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  ) 