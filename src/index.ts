import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cookie } from '@elysiajs/cookie'

import { user } from './modules/user/init'
import { note } from './modules/note/init'
import { auth } from './modules/auth/init'
import { view } from './modules/view/init'
import { permissions } from './modules/permission/init'
import { roles } from './modules/role/init'
import { menus } from './modules/menu/init'
import { configLoader } from './lib/config'

// 获取服务器配置
const serverConfig = configLoader.getServerConfig()

const app = new Elysia()
  .use(swagger())
  .use(cookie())
  .onError(({ error, code, set }) => {
    if (code === 'NOT_FOUND') return { success: false, message: 'Not Found :(' }
    
    // 处理验证错误
    if (code === 'VALIDATION') {
      console.error('验证错误详情:', JSON.stringify(error, null, 2));
      
      // 尝试提取更有用的错误信息
      let details = 'Invalid data format';
      
      if (error.all) {
        details = error.all.map((err: any) => `${err.path}: ${err.message}`).join('; ');
      } else if (error.message) {
        details = error.message;
      }
      
      // 设置合适的状态码
      set.status = 400;
      
      return { 
        success: false, 
        message: 'Validation Error', 
        details: details,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      }
    }
    
    // 处理未授权错误 (401)
    if (code === 401) {
      return { success: false, message: 'Unauthorized - Please login' }
    }

    console.error('服务器错误:', error)
    return { success: false, message: 'Server Error' }
  })
  .use(user)
  .use(note)
  .use(auth)
  .use(view)
  .use(permissions)
  .use(roles)
  .use(menus)
  .listen({
    port: serverConfig.port,
    hostname: serverConfig.host
  })

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)