import * as path from 'path'
import * as fs from 'fs'

/**
 * 路径操作工具类
 */
export class PathUtils {
  /**
   * 获取应用根目录
   * @returns 应用根目录的绝对路径
   */
  static getAppRoot(): string {
    return process.cwd()
  }

  /**
   * 将相对路径转换为绝对路径
   * @param relativePath 相对路径
   * @returns 绝对路径
   */
  static resolve(relativePath: string): string {
    if (path.isAbsolute(relativePath)) {
      return relativePath
    }
    return path.resolve(this.getAppRoot(), relativePath)
  }

  /**
   * 获取相对于应用根目录的路径
   * @param absolutePath 绝对路径
   * @returns 相对路径
   */
  static relative(absolutePath: string): string {
    return path.relative(this.getAppRoot(), absolutePath)
  }

  /**
   * 创建目录（如果不存在）
   * @param dirPath 目录路径
   * @returns 是否成功
   */
  static mkdir(dirPath: string): boolean {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      return true
    } catch (error) {
      console.error(`创建目录失败: ${dirPath}`, error)
      return false
    }
  }

  /**
   * 列出目录中的所有文件和子目录
   * @param dirPath 目录路径
   * @returns 文件和目录的数组
   */
  static listDir(dirPath: string): string[] {
    try {
      if (fs.existsSync(dirPath)) {
        return fs.readdirSync(dirPath)
      }
      return []
    } catch (error) {
      console.error(`列出目录内容失败: ${dirPath}`, error)
      return []
    }
  }

  /**
   * 列出目录中的所有文件
   * @param dirPath 目录路径
   * @param recursive 是否递归遍历子目录
   * @returns 文件路径数组
   */
  static listFiles(dirPath: string, recursive: boolean = false): string[] {
    try {
      const result: string[] = []
      const items = this.listDir(dirPath)

      for (const item of items) {
        const itemPath = path.join(dirPath, item)
        const stat = fs.statSync(itemPath)

        if (stat.isFile()) {
          result.push(itemPath)
        } else if (recursive && stat.isDirectory()) {
          result.push(...this.listFiles(itemPath, true))
        }
      }

      return result
    } catch (error) {
      console.error(`列出文件失败: ${dirPath}`, error)
      return []
    }
  }

  /**
   * 获取文件名（不含路径和扩展名）
   * @param filePath 文件路径
   * @returns 文件名
   */
  static getBaseName(filePath: string): string {
    const baseName = path.basename(filePath)
    const extName = path.extname(filePath)
    return extName ? baseName.slice(0, -extName.length) : baseName
  }

  /**
   * 获取文件或目录的信息
   * @param itemPath 文件或目录路径
   * @returns 文件信息对象，如果获取失败则返回null
   */
  static getStats(itemPath: string): fs.Stats | null {
    try {
      return fs.statSync(itemPath)
    } catch (error) {
      console.error(`获取文件信息失败: ${itemPath}`, error)
      return null
    }
  }

  /**
   * 检查路径是否是目录
   * @param dirPath 目录路径
   * @returns 是否是目录
   */
  static isDirectory(dirPath: string): boolean {
    const stats = this.getStats(dirPath)
    return stats ? stats.isDirectory() : false
  }

  /**
   * 检查路径是否是文件
   * @param filePath 文件路径
   * @returns 是否是文件
   */
  static isFile(filePath: string): boolean {
    const stats = this.getStats(filePath)
    return stats ? stats.isFile() : false
  }
} 