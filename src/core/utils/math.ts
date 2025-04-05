/**
 * 数学操作工具类
 */
export class MathUtils {
  /**
   * 生成指定范围内的随机整数
   * @param min 最小值（包含）
   * @param max 最大值（包含）
   * @returns 随机整数
   */
  static randomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成指定范围内的随机浮点数
   * @param min 最小值（包含）
   * @param max 最大值（包含）
   * @param precision 小数精度
   * @returns 随机浮点数
   */
  static randomFloat(min: number, max: number, precision: number = 2): number {
    const random = Math.random() * (max - min) + min
    const factor = Math.pow(10, precision)
    return Math.round(random * factor) / factor
  }

  /**
   * 将数字限制在指定范围内
   * @param value 数字
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的数字
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  }

  /**
   * 计算数组中的总和
   * @param numbers 数字数组
   * @returns 总和
   */
  static sum(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0)
  }

  /**
   * 计算数组中的平均值
   * @param numbers 数字数组
   * @returns 平均值，如果数组为空则返回0
   */
  static average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return this.sum(numbers) / numbers.length
  }

  /**
   * 计算数组中的最大值
   * @param numbers 数字数组
   * @returns 最大值，如果数组为空则返回NaN
   */
  static max(numbers: number[]): number {
    return Math.max(...numbers)
  }

  /**
   * 计算数组中的最小值
   * @param numbers 数字数组
   * @returns 最小值，如果数组为空则返回NaN
   */
  static min(numbers: number[]): number {
    return Math.min(...numbers)
  }

  /**
   * 计算数组中的标准差
   * @param numbers 数字数组
   * @returns 标准差，如果数组为空则返回0
   */
  static standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0
    
    const avg = this.average(numbers)
    const squareDiffSum = numbers.reduce((sum, num) => sum + Math.pow(num - avg, 2), 0)
    return Math.sqrt(squareDiffSum / numbers.length)
  }

  /**
   * 四舍五入到指定小数位
   * @param value 数字
   * @param precision 小数精度
   * @returns 四舍五入后的数字
   */
  static round(value: number, precision: number = 0): number {
    const factor = Math.pow(10, precision)
    return Math.round(value * factor) / factor
  }

  /**
   * 向下取整到指定小数位
   * @param value 数字
   * @param precision 小数精度
   * @returns 向下取整后的数字
   */
  static floor(value: number, precision: number = 0): number {
    const factor = Math.pow(10, precision)
    return Math.floor(value * factor) / factor
  }

  /**
   * 向上取整到指定小数位
   * @param value 数字
   * @param precision 小数精度
   * @returns 向上取整后的数字
   */
  static ceil(value: number, precision: number = 0): number {
    const factor = Math.pow(10, precision)
    return Math.ceil(value * factor) / factor
  }

  /**
   * 格式化数字为千分位分隔的字符串
   * @param value 数字
   * @param locale 区域设置
   * @returns 格式化后的字符串
   */
  static formatNumber(value: number, locale: string = 'zh-CN'): string {
    return value.toLocaleString(locale)
  }

  /**
   * 格式化数字为货币字符串
   * @param value 数字
   * @param currencyCode 货币代码
   * @param locale 区域设置
   * @returns 货币字符串
   */
  static formatCurrency(value: number, currencyCode: string = 'CNY', locale: string = 'zh-CN'): string {
    return value.toLocaleString(locale, {
      style: 'currency',
      currency: currencyCode
    })
  }

  /**
   * 计算两个坐标点之间的距离
   * @param x1 点1的x坐标
   * @param y1 点1的y坐标
   * @param x2 点2的x坐标
   * @param y2 点2的y坐标
   * @returns 距离
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }
} 