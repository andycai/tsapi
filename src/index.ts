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
import { template } from './lib/template'
import { ApiCode } from './core/constants/code'

// 获取服务器配置
const serverConfig = configLoader.getServerConfig()

// 创建API路由组
const apiApp = new Elysia({ prefix: '/api' })
  .onError(({ error, code, set }) => {
    // API路由返回JSON错误响应
    if (code === 'NOT_FOUND') {
      set.status = 404
      return { code: ApiCode.NOT_FOUND, message: 'API endpoint not found' }
    }
    
    if (code === 'VALIDATION') {
      console.error('验证错误详情:', JSON.stringify(error, null, 2))
      
      let details = 'Invalid data format'
      
      if (error.all) {
        details = error.all.map((err: any) => `${err.path}: ${err.message}`).join('; ')
      } else if (error.message) {
        details = error.message
      }
      
      set.status = 400
      
      return { 
        code: ApiCode.DATA_VALIDATION_FAILED, 
        message: 'Validation Error: ' + details,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      }
    }

    if (code === 403) {
      set.status = 403
      return { code: ApiCode.FORBIDDEN, message: 'Forbidden - Insufficient permissions' }
    }
    
    if (code === 401) {
      set.status = 401
      return { code: ApiCode.UNAUTHORIZED, message: 'Unauthorized - Please login' }
    }

    console.error('API服务器错误:', error)
    set.status = 500
    return { code: ApiCode.SERVER_ERROR, message: 'Server Error' }
  })
  .use(user)
  .use(note)
  .use(auth)
  .use(permissions)
  .use(roles)
  .use(menus)

// 创建Admin路由组
const adminApp = new Elysia({ prefix: '/admin' })
  .onError(({ error, code, set }) => {
    // Admin路由返回HTML错误页面
    set.headers['Content-Type'] = 'text/html; charset=utf-8'
    
    if (code === 'NOT_FOUND') {
      set.status = 404
      return template('errors/404', {})
    }
    
    if (code === 'VALIDATION') {
      console.error('验证错误详情:', JSON.stringify(error, null, 2))
      
      set.status = 400
      return template('errors/400', {})
    }

    if (code === 403) {
      set.status = 403
      return template('errors/403', {})
    }
    
    if (code === 401) {
      set.status = 401
      return template('errors/401', {})
    }

    console.error('Admin服务器错误:', error)
    set.status = 500
    return template('errors/500', {})
  })
  .use(view)

// 主应用
const app = new Elysia()
  .use(swagger())
  .use(cookie())
  .onError(({ error, code, set, request }) => {
    // 默认错误处理 - 对于非API和非Admin路由
    // 检查路径决定返回HTML还是JSON
    const isApiRequest = request.url.includes('/api/')
    
    if (isApiRequest) {
      // API风格的错误响应
      if (code === 'NOT_FOUND') {
        set.status = 404
        return { code: ApiCode.NOT_FOUND, message: 'Not Found' }
      }
      
      if (code === 'VALIDATION') {
        console.error('验证错误详情:', JSON.stringify(error, null, 2))
        
        let details = 'Invalid data format'
        
        if (error.all) {
          details = error.all.map((err: any) => `${err.path}: ${err.message}`).join('; ')
        } else if (error.message) {
          details = error.message
        }
        
        set.status = 400
        
        return { 
          code: ApiCode.DATA_VALIDATION_FAILED, 
          message: 'Validation Error: ' + details,
          error: process.env.NODE_ENV === 'development' ? error : undefined
        }
      }

      if (code === 403) {
        set.status = 403
        return { code: ApiCode.FORBIDDEN, message: 'Forbidden' }
      }
      
      if (code === 401) {
        set.status = 401
        return { code: ApiCode.UNAUTHORIZED, message: 'Unauthorized' }
      }

      console.error('服务器错误:', error)
      set.status = 500
      return { code: ApiCode.SERVER_ERROR, message: 'Server Error' }
    } else {
      // HTML页面错误响应
      set.headers['Content-Type'] = 'text/html; charset=utf-8'
      
      if (code === 'NOT_FOUND') {
        set.status = 404
        return template('errors/404', {})
      }
      
      if (code === 'VALIDATION') {
        console.error('验证错误详情:', JSON.stringify(error, null, 2))
        
        set.status = 400
        return template('errors/400', {})
      }

      if (code === 403) {
        set.status = 403
        return template('errors/403', {})
      }
      
      if (code === 401) {
        set.status = 401
        return template('errors/401', {})
      }

      console.error('服务器错误:', error)
      set.status = 500
      return template('errors/500', {})
    }
  })
  .use(apiApp)   // 挂载API路由组
  .use(adminApp) // 挂载Admin路由组
  .use(publicMenus) // 公共菜单不在API或Admin前缀下
  .listen({
    port: serverConfig.port,
    hostname: serverConfig.host
  })

console.log(`Tsapi is running at ${app.server?.hostname}:${app.server?.port}`)