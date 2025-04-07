import { prisma } from '../../lib/prisma'
import { CreateUserDto, UpdateUserDto } from './entity'

export class UserDao {
  /**
   * 获取所有用户及其关联的角色
   */
  async findAll() {
    return prisma.user.findMany({
      include: {
        role: true
      },
      orderBy: { id: 'asc' }
    })
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true
      }
    })
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username }
    })
  }

  /**
   * 创建新用户
   */
  async create(data: CreateUserDto & { email?: string | null }) {
    return prisma.user.create({
      data,
      include: {
        role: true
      }
    })
  }

  /**
   * 更新用户
   */
  async update(id: number, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        role: true
      }
    })
  }

  /**
   * 删除用户
   */
  async delete(id: number) {
    return prisma.user.delete({
      where: { id }
    })
  }

  /**
   * 检查模块是否已初始化
   */
  async isModuleInitialized(module: string): Promise<boolean> {
    const init = await prisma.moduleInit.findUnique({
      where: { module }
    })
    return init?.initialized || false
  }

  /**
   * 标记模块已初始化
   */
  async markModuleInitialized(module: string): Promise<void> {
    await prisma.moduleInit.upsert({
      where: { module },
      update: { initialized: true, updatedAt: new Date() },
      create: {
        module,
        initialized: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  /**
   * 初始化管理员账号
   */
  async initAdminUser(): Promise<void> {
    // 检查是否已初始化
    if (await this.isModuleInitialized('user:init')) {
      console.log('用户模块已初始化，跳过')
      return
    }

    // 创建管理员角色
    const adminRole = await prisma.role.create({
      data: {
        name: '超级管理员',
        description: '系统超级管理员',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // 创建管理员用户
    await prisma.user.create({
      data: {
        username: 'admin',
        password: 'admin123', // 注意：实际应用中应该使用加密后的密码
        nickname: '系统管理员',
        roleId: adminRole.id,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // 标记模块已初始化
    await this.markModuleInitialized('user:init')
  }
} 