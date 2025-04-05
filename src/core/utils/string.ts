/**
 * 字符串操作工具类
 */
export class StringUtils {
  /**
   * 检查字符串是否为空或仅包含空白字符
   * @param str 输入字符串
   * @returns 是否为空
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim() === ''
  }

  /**
   * 去除字符串首尾的空白字符
   * @param str 输入字符串
   * @returns 处理后的字符串
   */
  static trim(str: string | null | undefined): string {
    return str ? str.trim() : ''
  }

  /**
   * 将字符串截断为指定长度，超出部分用省略号替代
   * @param str 输入字符串
   * @param maxLength 最大长度
   * @param suffix 省略号字符，默认为"..."
   * @returns 截断后的字符串
   */
  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (!str || str.length <= maxLength) return str
    return str.substring(0, maxLength - suffix.length) + suffix
  }

  /**
   * 将字符串转换为驼峰命名法 (camelCase)
   * @param str 输入字符串
   * @returns 驼峰命名法字符串
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, firstChar => firstChar.toLowerCase())
  }

  /**
   * 将字符串转换为帕斯卡命名法 (PascalCase)
   * @param str 输入字符串
   * @returns 帕斯卡命名法字符串
   */
  static toPascalCase(str: string): string {
    const camelCase = this.toCamelCase(str)
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
  }

  /**
   * 将字符串转换为短横线命名法 (kebab-case)
   * @param str 输入字符串
   * @returns 短横线命名法字符串
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }

  /**
   * 将字符串转换为下划线命名法 (snake_case)
   * @param str 输入字符串
   * @returns 下划线命名法字符串
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
  }

  /**
   * 格式化字符串，使用{}作为占位符
   * @param template 模板字符串，使用{}作为占位符，如 "Hello, {0}!"
   * @param args 参数列表
   * @returns 格式化后的字符串
   */
  static format(template: string, ...args: any[]): string {
    return template.replace(/{(\d+)}/g, (match, index) => {
      return typeof args[index] !== 'undefined' ? String(args[index]) : match
    })
  }

  /**
   * 检查字符串是否以指定前缀开始
   * @param str 输入字符串
   * @param prefix 前缀
   * @returns 是否以指定前缀开始
   */
  static startsWith(str: string, prefix: string): boolean {
    if (!str) return false
    return str.startsWith(prefix)
  }

  /**
   * 检查字符串是否以指定后缀结束
   * @param str 输入字符串
   * @param suffix 后缀
   * @returns 是否以指定后缀结束
   */
  static endsWith(str: string, suffix: string): boolean {
    if (!str) return false
    return str.endsWith(suffix)
  }

  /**
   * 将HTML特殊字符转义
   * @param str 输入字符串
   * @returns 转义后的字符串
   */
  static escapeHtml(str: string): string {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  /**
   * 将字符串中的换行符转换为HTML的<br>标签
   * @param str 输入字符串
   * @returns 转换后的字符串
   */
  static nl2br(str: string): string {
    if (!str) return ''
    return str.replace(/\n/g, '<br>')
  }

  /**
   * 生成指定长度的随机字符串
   * @param length 字符串长度
   * @param chars 可选字符集，默认为字母和数字
   * @returns 随机字符串
   */
  static random(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = ''
    const charsLength = chars.length
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * charsLength))
    }
    
    return result
  }
} 