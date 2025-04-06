import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cookie } from '@elysiajs/cookie'

import { user } from './modules/user/init'
import { note } from './modules/note/init'
import { auth } from './modules/auth/init'
import { view } from './modules/view/init'
import { permissions } from './modules/permission/init'
import { roles } from './modules/role/init'
import { menus, publicMenus } from './modules/menu/init'
import { configLoader } from './lib/config'
import { handleApiError, handleAdminError, handleError } from './lib/error'
import { authMiddleware } from './middlewares/auth'

// 获取服务器配置
const serverConfig = configLoader.getServerConfig()

// 创建需要认证的后台管理API路由组 (v0)
const apiV0App = new Elysia({ prefix: '/api/v0' })
  .use(authMiddleware) // 添加认证中间件
  .onError(handleApiError)
  .use(user)      // 用户管理
  .use(roles)     // 角色管理
  .use(permissions) // 权限管理
  .use(menus)     // 菜单管理
  .use(note)      // 笔记管理

// 创建公开API路由组 (v1)
const apiV1App = new Elysia({ prefix: '/api/v1' })
  .onError(handleApiError)
  // 此处可添加公开的API，不需要认证
  // 例如：.use(publicApi)
  .use(publicMenus) // 公共菜单不在API或Admin前缀下

// 创建认证API路由组（不需要v0或v1前缀，用于登录/注册等）
const authApp = new Elysia({ prefix: '/api' })
  .onError(handleApiError)
  .use(auth)      // 认证相关

// 创建Admin路由组（管理后台页面）
const adminApp = new Elysia({ prefix: '/admin' })
  .use(authMiddleware) // 添加认证中间件
  .onError(handleAdminError)
  .use(view)      // 管理后台视图

// 主应用
const app = new Elysia()
  .use(swagger())
  .use(cookie())
  .use(apiV0App)  // 需要认证的后台API
  .use(apiV1App)  // 公开API
  .use(authApp)   // 认证API
  .use(adminApp)  // 管理后台页面
  .onError(handleError) // 处理其它路由的错误
  .listen({
    port: serverConfig.port,
    hostname: serverConfig.host
  })

console.log(`Tsapi is running at ${app.server?.hostname}:${app.server?.port}`)