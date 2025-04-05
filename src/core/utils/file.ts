import * as fs from 'fs'
import * as path from 'path'

/**
 * 文件操作工具类
 */
export class FileUtils {
  /**
   * 检查文件是否存在
   * @param filePath 文件路径
   * @returns 是否存在
   */
  static exists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath)
    } catch (error) {
      console.error(`检查文件存在失败: ${filePath}`, error)
      return false
    }
  }

  /**
   * 读取文件内容
   * @param filePath 文件路径
   * @param encoding 编码，默认为utf-8
   * @returns 文件内容，如果读取失败则返回null
   */
  static readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): string | null {
    try {
      return fs.readFileSync(filePath, encoding)
    } catch (error) {
      console.error(`读取文件失败: ${filePath}`, error)
      return null
    }
  }

  /**
   * 以JSON格式读取文件
   * @param filePath 文件路径
   * @returns 解析后的JSON对象，如果读取或解析失败则返回null
   */
  static readJSON<T = any>(filePath: string): T | null {
    try {
      const content = this.readFile(filePath)
      if (!content) return null
      return JSON.parse(content) as T
    } catch (error) {
      console.error(`解析JSON文件失败: ${filePath}`, error)
      return null
    }
  }

  /**
   * 写入文件
   * @param filePath 文件路径
   * @param data 写入的内容
   * @param encoding 编码，默认为utf-8
   * @returns 是否写入成功
   */
  static writeFile(filePath: string, data: string, encoding: BufferEncoding = 'utf-8'): boolean {
    try {
      // 确保目录存在
      const dir = path.dirname(filePath)
      if (!this.exists(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(filePath, data, encoding)
      return true
    } catch (error) {
      console.error(`写入文件失败: ${filePath}`, error)
      return false
    }
  }

  /**
   * 写入JSON文件
   * @param filePath 文件路径
   * @param data 要写入的JSON数据
   * @param pretty 是否美化输出，默认为true
   * @returns 是否写入成功
   */
  static writeJSON(filePath: string, data: any, pretty: boolean = true): boolean {
    try {
      const json = pretty 
        ? JSON.stringify(data, null, 2) 
        : JSON.stringify(data)
      return this.writeFile(filePath, json)
    } catch (error) {
      console.error(`写入JSON文件失败: ${filePath}`, error)
      return false
    }
  }

  /**
   * 删除文件
   * @param filePath 文件路径
   * @returns 是否删除成功
   */
  static deleteFile(filePath: string): boolean {
    try {
      if (this.exists(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error(`删除文件失败: ${filePath}`, error)
      return false
    }
  }

  /**
   * 复制文件
   * @param source 源文件路径
   * @param destination 目标文件路径
   * @returns 是否复制成功
   */
  static copyFile(source: string, destination: string): boolean {
    try {
      // 确保目标目录存在
      const dir = path.dirname(destination)
      if (!this.exists(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.copyFileSync(source, destination)
      return true
    } catch (error) {
      console.error(`复制文件失败: ${source} -> ${destination}`, error)
      return false
    }
  }

  /**
   * 获取文件扩展名
   * @param filePath 文件路径
   * @returns 文件扩展名（不包含点）
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath).slice(1).toLowerCase()
  }
} 