import { prisma } from '../lib/prisma'
import { PermissionDao } from '../modules/permission/dao'
import { RoleDao } from '../modules/role/dao'
import { MenuDao } from '../modules/menu/dao'
import { UserDao } from '../modules/user/dao'

/**
 * 数据库初始化脚本
 * 按顺序初始化：权限 -> 角色 -> 菜单 -> 用户
 */
async function initDatabase() {
  console.log('开始初始化数据库...')

  // 创建DAO实例
  const permissionDao = new PermissionDao()
  const roleDao = new RoleDao()
  const menuDao = new MenuDao()
  const userDao = new UserDao()

  try {
    // 1. 初始化权限（其他模块可能依赖权限）
    console.log('初始化权限...')
    await permissionDao.initBasePermissions()

    // 2. 初始化角色（用户模块依赖角色）
    console.log('初始化角色...')
    await roleDao.initBaseRoles()

    // 3. 初始化菜单
    console.log('初始化菜单...')
    await menuDao.initMenus()

    // 4. 初始化用户
    console.log('初始化用户...')
    await userDao.initAdminUser()

    console.log('数据库初始化完成！')
  } catch (error) {
    console.error('数据库初始化失败:', error)
  } finally {
    // 关闭数据库连接
    await prisma.$disconnect()
  }
}

// 执行初始化
initDatabase() 