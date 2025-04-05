import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { staticPlugin } from '@elysiajs/static'
import { readFileSync } from 'fs'
import { join } from 'path'
import { authService } from '../auth/init'
import { prisma } from '../../lib/prisma'
import { template } from '../../lib/template'

/**
 * 从文件加载HTML模板
 */
const loadTemplate = (path: string): string => {
  try {
    return readFileSync(join(process.cwd(), path), 'utf-8')
  } catch (error) {
    console.error(`模板加载失败: ${path}`, error)
    return '<div>加载视图失败</div>'
  }
}

/**
 * 渲染HTML模板，使用{{.key}}来获取数据
 */
const renderTemplate = (template: string, data: Record<string, any> = {}): string => {
  return template.replace(/\{\{\.{(\w+)}\}\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : ''
  })
}

/**
 * 渲染带布局的HTML页面
 */
const renderPage = (body: string, title: string = 'page'): string => {
  const layout = loadTemplate('templates/layouts/main.html')
  return renderTemplate(layout, { body, title })
}

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
    render: (template: string, data: Record<string, any> = {}, title: string = 'page') => {
      const content = loadTemplate(template)
      const renderedContent = renderTemplate(content, data)
      return renderPage(renderedContent, title)
    }
  })

/**
 * 页面路由
 */
export const view = new Elysia()
  .use(viewService)
  .use(authService)
  .get('/', ({ view }) => {
    return template('home', {
      title: '首页',
    })
  })
  .get('/login', () => {
    return template('login', {
      title: '登录',
      scripts: ['/static/js/login.js'],
    })
  })
  .get('/register', ({ view }) => {
    return template('register', {
      title: '注册',
      scripts: ['/static/js/register.js'],
    })
  })
  .get('/profile', async ({ cookie: { jwt }, view, error }) => {
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
        title: '个人资料',
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