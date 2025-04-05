import { Elysia, t } from 'elysia'
import { MenuHandler } from './handler'
import { authService } from '../auth/init'

// 创建处理器实例
const menuHandler = new MenuHandler()

// 菜单模块路由
export const menus = new Elysia({ prefix: '/api/menus' })
  .use(authService)
  .get(
    '/',
    () => menuHandler.getAllMenus(),
    {
      detail: {
        tags: ['菜单管理'],
        summary: '获取所有菜单',
      },
      // 需要管理员身份才能访问
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .get(
    '/tree',
    () => menuHandler.getMenuTree(),
    {
      detail: {
        tags: ['菜单管理'],
        summary: '获取菜单树结构',
      },
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .get(
    '/:id',
    ({ params, error }) => menuHandler.getMenuById({ params, error } as any),
    {
      detail: {
        tags: ['菜单管理'],
        summary: '根据ID获取菜单',
      },
      params: t.Object({
        id: t.String()
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .post(
    '/',
    ({ body, error }) => menuHandler.createMenu({ body, error } as any),
    {
      detail: {
        tags: ['菜单管理'],
        summary: '创建新菜单',
      },
      body: t.Object({
        parentId: t.Optional(t.Number()),
        name: t.String(),
        path: t.Optional(t.String()),
        icon: t.Optional(t.String()),
        permission: t.Optional(t.String()),
        sort: t.Optional(t.Number()),
        isShow: t.Optional(t.Boolean())
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .put(
    '/:id',
    ({ params, body, error }) => menuHandler.updateMenu({ params, body, error } as any),
    {
      detail: {
        tags: ['菜单管理'],
        summary: '更新菜单',
      },
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        parentId: t.Optional(t.Number()),
        name: t.Optional(t.String()),
        path: t.Optional(t.String()),
        icon: t.Optional(t.String()),
        permission: t.Optional(t.String()),
        sort: t.Optional(t.Number()),
        isShow: t.Optional(t.Boolean())
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  )
  .delete(
    '/:id',
    ({ params, error }) => menuHandler.deleteMenu({ params, error } as any),
    {
      detail: {
        tags: ['菜单管理'],
        summary: '删除菜单',
      },
      params: t.Object({
        id: t.String()
      }),
      beforeHandle: ({ auth }: any) => auth(true)
    }
  ) 