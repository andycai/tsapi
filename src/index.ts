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

// 获取服务器配置
const serverConfig = configLoader.getServerConfig()

const app = new Elysia()
  .use(swagger())
  .use(cookie())
  .onError(({ error, code, set }) => {
    // 设置响应内容类型为 HTML
    set.headers['Content-Type'] = 'text/html; charset=utf-8';
    
    if (code === 'NOT_FOUND')
      return template('errors/404', {})
    
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
      
      return template('errors/400', {})
    }

    if (code === 403) {
      return template('errors/403', {})
    }
    
    // 处理未授权错误 (401)
    if (code === 401) {
      return template('errors/401', {})
    }

    console.error('服务器错误:', error)
    return template('errors/500', {})
  })
  .use(user)
  .use(note)
  .use(auth)
  .use(view)
  .use(permissions)
  .use(roles)
  .use(menus)
  .use(publicMenus)
  .listen({
    port: serverConfig.port,
    hostname: serverConfig.host
  })

console.log(`Tsapi is running at ${app.server?.hostname}:${app.server?.port}`)