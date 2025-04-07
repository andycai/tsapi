import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cookie } from '@elysiajs/cookie'
import { cors } from '@elysiajs/cors'

import { user as adminApiUser } from './modules/user/route'
import { note as adminApiNote } from './modules/note/route'
import { auth as apiAuth } from './modules/auth/route'
import { view } from './modules/view/route'
import { permissions as adminApiPermission } from './modules/permission/route'
import { roles as adminApiRole } from './modules/role/route'
import { adminApiMenus, apiMenu } from './modules/menu/route'
import { configLoader } from './lib/config'
import { handleApiError, handleAdminError, handleError } from './lib/error'
import { authMiddleware } from './middlewares/auth'

// 获取服务器配置
const serverConfig = configLoader.getServerConfig()

// 创建需要认证的后台管理API路由组 (v0)
const adminApiApp = new Elysia({ prefix: '/api/v0' })
  .use(authMiddleware) // 添加认证中间件
  .onError(handleApiError)
  .use(adminApiUser)      // 用户管理
  .use(adminApiRole)     // 角色管理
  .use(adminApiPermission) // 权限管理
  .use(adminApiMenus)     // 菜单管理
  .use(adminApiNote)      // 笔记管理

// 创建公开API路由组 (v1)
const apiApp = new Elysia({ prefix: '/api/v1' })
  .onError(handleApiError)
  .use(apiMenu) // 公共菜单的API接口

// 创建认证API路由组（不需要v0或v1前缀，用于登录/注册等）
const authApp = new Elysia({ prefix: '/api' })
  .onError(handleApiError)
  .use(apiAuth)      // 认证相关

// 创建Admin路由组（管理后台页面）
const adminApp = new Elysia({ prefix: '/admin' })
  .use(authMiddleware) // 添加认证中间件
  .onError(handleAdminError)
  .use(view)      // 管理后台视图

// 创建公开页面路由组（根路径）
const publicApp = new Elysia()
  .onError(handleAdminError) // 使用HTML错误响应
  // 添加公开页面路由，例如首页、关于我们、联系我们等
  // 例如: .use(home), .use(about), .use(contact)

// 主应用
const elysiaApp = new Elysia()
  .use(swagger())
  .use(cookie())
  .use(cors({
    origin: '*', // 允许所有来源，生产环境中应该设置为特定域名
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 预检请求结果缓存时间，单位为秒
  }))
  .use(adminApiApp)  // 需要认证的后台API
  .use(apiApp)  // 公开API
  .use(authApp)   // 认证API
  .use(adminApp)  // 管理后台页面
  .use(publicApp) // 公开页面（根路径）
  .onError(handleError) // 处理其它路由的错误
  .listen({
    port: serverConfig.port,
    hostname: serverConfig.host
  })

console.log(`Tsapi is running at ${elysiaApp.server?.hostname}:${elysiaApp.server?.port}`)