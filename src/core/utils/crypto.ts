import * as crypto from 'crypto'

/**
 * 加密解密工具类
 */
export class CryptoUtils {
  /**
   * 使用MD5算法生成哈希
   * @param data 输入数据
   * @returns MD5哈希字符串
   */
  static md5(data: string | Buffer): string {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    return crypto.createHash('md5').update(buffer).digest('hex')
  }

  /**
   * 使用SHA1算法生成哈希
   * @param data 输入数据
   * @returns SHA1哈希字符串
   */
  static sha1(data: string | Buffer): string {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    return crypto.createHash('sha1').update(buffer).digest('hex')
  }

  /**
   * 使用SHA256算法生成哈希
   * @param data 输入数据
   * @returns SHA256哈希字符串
   */
  static sha256(data: string | Buffer): string {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    return crypto.createHash('sha256').update(buffer).digest('hex')
  }

  /**
   * 使用HMAC-SHA256算法生成消息认证码
   * @param data 输入数据
   * @param secret 密钥
   * @returns HMAC-SHA256字符串
   */
  static hmacSha256(data: string | Buffer, secret: string): string {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    return crypto.createHmac('sha256', secret).update(buffer).digest('hex')
  }

  /**
   * 生成随机字节
   * @param size 字节数
   * @returns 随机字节Buffer
   */
  static randomBytes(size: number): Buffer {
    return crypto.randomBytes(size)
  }

  /**
   * 生成随机十六进制字符串
   * @param length 字符串长度（字节数的两倍）
   * @returns 随机十六进制字符串
   */
  static randomHex(length: number): string {
    const bytes = Math.ceil(length / 2)
    return crypto.randomBytes(bytes).toString('hex').slice(0, length)
  }

  /**
   * AES-256-CBC加密
   * @param data 明文
   * @param key 密钥（32字节/256位）
   * @param iv 初始向量（16字节/128位），如果未提供则随机生成
   * @returns 格式为 "iv:密文" 的字符串，iv和密文都是base64编码
   */
  static aesEncrypt(data: string, key: string | Buffer, iv?: Buffer): string {
    // 确保密钥是32字节（256位）
    const keyBuffer = typeof key === 'string' 
      ? crypto.createHash('sha256').update(key).digest() 
      : key

    // 如果未提供IV，则随机生成16字节IV
    const ivBuffer = iv || crypto.randomBytes(16)
    
    // 创建加密器
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, ivBuffer)
    
    // 加密数据
    let encrypted = cipher.update(data, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    
    // 返回 "iv:密文" 格式的字符串
    return `${ivBuffer.toString('base64')}:${encrypted}`
  }

  /**
   * AES-256-CBC解密
   * @param encryptedData 格式为 "iv:密文" 的字符串，iv和密文都是base64编码
   * @param key 密钥（32字节/256位）
   * @returns 解密后的明文，如果解密失败则返回null
   */
  static aesDecrypt(encryptedData: string, key: string | Buffer): string | null {
    try {
      // 解析加密数据
      const parts = encryptedData.split(':')
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format')
      }
      
      const ivBuffer = Buffer.from(parts[0], 'base64')
      const encryptedText = parts[1]
      
      // 确保密钥是32字节（256位）
      const keyBuffer = typeof key === 'string' 
        ? crypto.createHash('sha256').update(key).digest() 
        : key
      
      // 创建解密器
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer)
      
      // 解密数据
      let decrypted = decipher.update(encryptedText, 'base64', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('AES解密失败:', error)
      return null
    }
  }

  /**
   * 生成安全的随机密码
   * @param length 密码长度
   * @param includeSymbols 是否包含特殊字符
   * @returns 随机密码
   */
  static generatePassword(length: number = 12, includeSymbols: boolean = true): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?'
    
    let chars = lowercase + uppercase + numbers
    if (includeSymbols) chars += symbols
    
    // 确保包含至少一个小写字母、一个大写字母和一个数字
    let password = ''
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    
    // 如果包含特殊字符，确保也有一个特殊字符
    if (includeSymbols) {
      password += symbols.charAt(Math.floor(Math.random() * symbols.length))
    }
    
    // 生成剩余字符
    const remainingLength = length - password.length
    for (let i = 0; i < remainingLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // 随机排序密码字符
    return password.split('').sort(() => 0.5 - Math.random()).join('')
  }

  /**
   * Base64编码
   * @param data 输入数据
   * @returns Base64字符串
   */
  static base64Encode(data: string | Buffer): string {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    return buffer.toString('base64')
  }

  /**
   * Base64解码
   * @param data Base64字符串
   * @returns 解码后的字符串
   */
  static base64Decode(data: string): string {
    return Buffer.from(data, 'base64').toString('utf8')
  }
} 