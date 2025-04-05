import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { staticPlugin } from '@elysiajs/static'
import { authService } from '../auth/init'
import { prisma } from '../../lib/prisma'
import { template } from '../../lib/template'
import { AuthUtils } from '../auth/utils'
import { redirect } from '../../lib/http'

/**
 * 视图服务
 */
export const viewService = new Elysia({ name: 'view/service' })
  .use(html())
  .use(staticPlugin({
    assets: 'public',
    prefix: '/static'
  }))
  .decorate('view', {
    render: (page: string, data: Record<string, any> = {}, layout: string = 'layouts/layout') => {
      return template(page, data, layout)
    }
  })

/**
 * 页面路由
 */
export const view = new Elysia()
  .use(viewService)
  .use(authService)
  .get('/admin', () => {
    return template('admin/index', {
      Title: '首页',
    }, 'admin/layouts/layout')
  })
  .get('/', () => {
    return template('home', {
      Title: '首页',
    })
  })
  .get('/login', () => {
    return template('login', {
      Title: '登录',
      Scripts: ['/static/js/login.js'],
    })
  })
  .get('/register', () => {
    return template('register', {
      Title: '注册',
      Scripts: ['/static/js/register.js'],
    })
  })
  .get('/profile', async ({ cookie: { jwt }, error, set }) => {
    if (!jwt.value) {
      redirect(set, '/login')
      return 'Redirecting to login page...'
    }
    
    try {
      // 使用AuthUtils验证用户身份
      const username = jwt.value
      const user = await AuthUtils.verifyTokenAndGetUser(username)
      
      if (!user) {
        jwt.remove()
        redirect(set, '/login')
        return 'Redirecting to login page...'
      }

      return template('profile', {
        Title: '个人资料',
        user: {
          ...AuthUtils.mapUserToDto(user),
          createdAt: user.createdAt
        }
      }) 
    } catch (err) {
      console.error('获取用户资料失败', err)
      return error(500, {
        success: false,
        message: '服务器错误'
      })
    }
  })
  .get('/logout', ({ set, cookie: { jwt } }) => {
    jwt.remove()
    
    // 使用重定向工具函数
    redirect(set, '/')
    
    return 'Redirecting to home page...'
  }) 