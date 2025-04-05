#!/bin/bash

# 迁移数据库
bun prisma migrate dev --name add_user_role_permission_menu

# 生成 Prisma 客户端
bun prisma generate
