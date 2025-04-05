/**
 * 时间操作工具类
 */
export class TimeUtils {
  /**
   * 获取当前时间戳（毫秒）
   * @returns 当前时间戳
   */
  static now(): number {
    return Date.now()
  }

  /**
   * 获取当前时间戳（秒）
   * @returns 当前时间戳（秒）
   */
  static timestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  /**
   * 格式化日期时间
   * @param date 日期对象或时间戳
   * @param format 格式字符串，支持的占位符：
   *               - YYYY: 四位年份
   *               - MM: 两位月份
   *               - DD: 两位日期
   *               - HH: 两位小时（24小时制）
   *               - mm: 两位分钟
   *               - ss: 两位秒
   *               - SSS: 三位毫秒
   * @returns 格式化后的字符串
   */
  static format(date: Date | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    const d = typeof date === 'number' ? new Date(date) : date
    
    const pad = (n: number, width: number = 2): string => {
      const nStr = String(n)
      return nStr.length >= width 
        ? nStr 
        : new Array(width - nStr.length + 1).join('0') + nStr
    }
    
    const replacements: Record<string, string> = {
      'YYYY': String(d.getFullYear()),
      'MM': pad(d.getMonth() + 1),
      'DD': pad(d.getDate()),
      'HH': pad(d.getHours()),
      'mm': pad(d.getMinutes()),
      'ss': pad(d.getSeconds()),
      'SSS': pad(d.getMilliseconds(), 3)
    }
    
    return format.replace(/YYYY|MM|DD|HH|mm|ss|SSS/g, match => replacements[match])
  }

  /**
   * 获取相对时间描述（如"刚刚"、"5分钟前"、"2小时前"等）
   * @param date 日期对象或时间戳
   * @param now 当前时间，默认为现在
   * @returns 相对时间描述
   */
  static relativeTime(date: Date | number, now: Date | number = Date.now()): string {
    const d1 = typeof date === 'number' ? date : date.getTime()
    const d2 = typeof now === 'number' ? now : now.getTime()
    
    const diff = Math.abs(d2 - d1)
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return '刚刚'
    
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}分钟前`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`
    
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}天前`
    
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}个月前`
    
    const years = Math.floor(days / 365)
    return `${years}年前`
  }

  /**
   * 将日期添加指定时间单位
   * @param date 日期对象
   * @param amount 添加的数量
   * @param unit 时间单位（years, months, days, hours, minutes, seconds, milliseconds）
   * @returns 新的日期对象
   */
  static add(date: Date, amount: number, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'): Date {
    const result = new Date(date.getTime())
    
    switch (unit) {
      case 'years':
        result.setFullYear(result.getFullYear() + amount)
        break
      case 'months':
        result.setMonth(result.getMonth() + amount)
        break
      case 'days':
        result.setDate(result.getDate() + amount)
        break
      case 'hours':
        result.setHours(result.getHours() + amount)
        break
      case 'minutes':
        result.setMinutes(result.getMinutes() + amount)
        break
      case 'seconds':
        result.setSeconds(result.getSeconds() + amount)
        break
      case 'milliseconds':
        result.setMilliseconds(result.getMilliseconds() + amount)
        break
    }
    
    return result
  }

  /**
   * 计算两个日期之间的差异
   * @param date1 第一个日期
   * @param date2 第二个日期
   * @param unit 时间单位
   * @returns 差异值
   */
  static diff(date1: Date, date2: Date, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'): number {
    const diffMs = date2.getTime() - date1.getTime()
    
    switch (unit) {
      case 'years':
        return date2.getFullYear() - date1.getFullYear()
      case 'months':
        return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth())
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24))
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60))
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60))
      case 'seconds':
        return Math.floor(diffMs / 1000)
      case 'milliseconds':
        return diffMs
      default:
        return diffMs
    }
  }

  /**
   * 判断是否为闰年
   * @param year 年份
   * @returns 是否为闰年
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  /**
   * 获取指定月份的天数
   * @param year 年份
   * @param month 月份（1-12）
   * @returns 天数
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate()
  }

  /**
   * 获取日期是一周中的第几天
   * @param date 日期对象
   * @param startOnMonday 是否从周一开始，默认从周日开始
   * @returns 一周中的第几天（0-6）
   */
  static getDayOfWeek(date: Date, startOnMonday: boolean = false): number {
    let day = date.getDay()
    if (startOnMonday) {
      day = day === 0 ? 6 : day - 1
    }
    return day
  }

  /**
   * 格式化持续时间
   * @param milliseconds 毫秒数
   * @param format 格式字符串，支持: HH, mm, ss
   * @returns 格式化后的字符串
   */
  static formatDuration(milliseconds: number, format: string = 'HH:mm:ss'): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    const pad = (n: number): string => n < 10 ? `0${n}` : `${n}`
    
    const values: Record<string, string> = {
      'HH': pad(hours),
      'mm': pad(minutes % 60),
      'ss': pad(seconds % 60)
    }
    
    return format.replace(/HH|mm|ss/g, match => values[match])
  }

  /**
   * 解析日期字符串
   * @param dateString 日期字符串
   * @returns 日期对象，如果解析失败则返回null
   */
  static parseDate(dateString: string): Date | null {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  }
} 