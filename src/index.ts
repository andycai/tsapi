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

// 获取服务器配置
const serverConfig = configLoader.getServerConfig()

// 创建API路由组
const apiApp = new Elysia({ prefix: '/api' })
  .onError(handleApiError)
  .use(user)
  .use(note)
  .use(auth)
  .use(permissions)
  .use(roles)
  .use(menus)

// 创建Admin路由组
const adminApp = new Elysia({ prefix: '/admin' })
  .onError(handleAdminError)
  .use(view)

// 主应用
const app = new Elysia()
  .use(swagger())
  .use(cookie())
  .use(apiApp)   // 挂载API路由组
  .use(adminApp) // 挂载Admin路由组
  .use(publicMenus) // 公共菜单不在API或Admin前缀下
  .onError(handleError) // 处理其它路由的错误
  .listen({
    port: serverConfig.port,
    hostname: serverConfig.host
  })

console.log(`Tsapi is running at ${app.server?.hostname}:${app.server?.port}`)