import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { staticPlugin } from '@elysiajs/static'
import { readFileSync } from 'fs'
import { join } from 'path'
import { authService } from '../auth/init'
import { prisma } from '../../lib/prisma'
import { template } from '../../lib/template'

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
  .get('/profile', async ({ cookie: { jwt }, error }) => {
    if (!jwt.value) {
      return `<script>window.location.href = '/login';</script>`
    }
    
    try {
      // 直接从数据库获取用户信息
      const username = jwt.value
      const user = await prisma.user.findUnique({ 
        where: { username } 
      })
      
      if (!user) {
        jwt.remove()
        return `<script>window.location.href = '/login';</script>`
      }

      return template('profile', {
        Title: '个人资料',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
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
  .get('/logout', ({ cookie: { jwt }, set }) => {
    jwt.remove()
    set.redirect = '/'
    return 'Redirecting to home page...'
  }) 