import { PrismaClient } from '@prisma/client'

// 创建一个单例 Prisma 客户端实例
export const prisma = new PrismaClient()

// 优雅地关闭数据库连接
process.on('beforeExit', async () => {
  await prisma.$disconnect()
}) 