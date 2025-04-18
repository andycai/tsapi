import { randomBytes } from 'crypto'
import { AuthUtils } from './utils'
import { AuthDao } from './dao'
import { RegisterDto, LoginDto, UserResponseDto, ApiResponse, AuthResponseDto } from './entity'
import { ApiCode } from '../../core/constants/code'

export class AuthService {
  private authDao: AuthDao

  constructor() {
    this.authDao = new AuthDao()
  }

  /**
   * 生成随机令牌
   */
  generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * 注册新用户
   */
  async register(registerDto: RegisterDto): Promise<ApiResponse<UserResponseDto>> {
    // 检查用户是否已存在
    const existingUser = await this.authDao.findExistingUser(
      registerDto.username,
      registerDto.email
    )

    if (existingUser) {
      return {
        code: ApiCode.AUTH_USERNAME_EXISTS,
        message: '用户名或邮箱已被使用'
      }
    }

    // 哈希密码
    const hashedPassword = await Bun.password.hash(registerDto.password, {
      algorithm: 'bcrypt',
      cost: 10
    })

    // 创建新用户
    const user = await this.authDao.createUser({
      username: registerDto.username,
      password: hashedPassword,
      email: registerDto.email || null
    })

    return {
      code: ApiCode.SUCCESS,
      message: '注册成功',
      data: AuthUtils.mapUserToDto(user)
    }
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<ApiResponse<AuthResponseDto>> {
    // 查找用户
    const user = await this.authDao.findUserByUsername(loginDto.username)

    if (!user) {
      return {
        code: ApiCode.AUTH_USERNAME_PASSWORD_ERROR,
        message: '用户名或密码错误'
      }
    }

    const isValidPassword = await Bun.password.verify(loginDto.password, user.password)

    if (!isValidPassword) {
      return {
        code: ApiCode.AUTH_USERNAME_PASSWORD_ERROR,
        message: '用户名或密码错误'
      }
    }

    // 生成JWT令牌
    const token = AuthUtils.generateToken(user.id, loginDto.remember)

    // 获取令牌过期时间
    const tokenExpiry = AuthUtils.getTokenExpiry(loginDto.remember)

    return {
      code: ApiCode.SUCCESS,
      message: '登录成功',
      data: {
        token,
        user: AuthUtils.mapUserToDto(user)
      }
    }
  }
}
