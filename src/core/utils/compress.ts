import * as zlib from 'zlib'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

// 将 zlib 的回调函数转换为 Promise
const gzipPromise = promisify(zlib.gzip)
const gunzipPromise = promisify(zlib.gunzip)
const deflatePromise = promisify(zlib.deflate)
const inflatePromise = promisify(zlib.inflate)
const brotliCompressPromise = promisify(zlib.brotliCompress)
const brotliDecompressPromise = promisify(zlib.brotliDecompress)

/**
 * 压缩工具类
 */
export class CompressUtils {
  /**
   * 使用 gzip 压缩数据
   * @param input 输入数据
   * @returns 压缩后的数据
   */
  static async gzip(input: string | Buffer): Promise<Buffer> {
    const buffer = typeof input === 'string' ? Buffer.from(input) : input
    return gzipPromise(buffer)
  }

  /**
   * 解压 gzip 数据
   * @param input 压缩的数据
   * @returns 解压后的数据
   */
  static async gunzip(input: Buffer): Promise<Buffer> {
    return gunzipPromise(input)
  }

  /**
   * 使用 deflate 压缩数据
   * @param input 输入数据
   * @returns 压缩后的数据
   */
  static async deflate(input: string | Buffer): Promise<Buffer> {
    const buffer = typeof input === 'string' ? Buffer.from(input) : input
    return deflatePromise(buffer)
  }

  /**
   * 解压 deflate 数据
   * @param input 压缩的数据
   * @returns 解压后的数据
   */
  static async inflate(input: Buffer): Promise<Buffer> {
    return inflatePromise(input)
  }

  /**
   * 使用 Brotli 算法压缩数据
   * @param input 输入数据
   * @returns 压缩后的数据
   */
  static async brotliCompress(input: string | Buffer): Promise<Buffer> {
    const buffer = typeof input === 'string' ? Buffer.from(input) : input
    return brotliCompressPromise(buffer)
  }

  /**
   * 解压 Brotli 压缩的数据
   * @param input 压缩的数据
   * @returns 解压后的数据
   */
  static async brotliDecompress(input: Buffer): Promise<Buffer> {
    return brotliDecompressPromise(input)
  }

  /**
   * 将文件压缩为 gzip 格式
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径，如果未提供则在输入文件路径后添加 .gz 后缀
   * @returns 是否成功
   */
  static async gzipFile(inputPath: string, outputPath?: string): Promise<boolean> {
    try {
      const finalOutputPath = outputPath || `${inputPath}.gz`
      
      // 确保输出目录存在
      const outputDir = path.dirname(finalOutputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const readStream = fs.createReadStream(inputPath)
      const writeStream = fs.createWriteStream(finalOutputPath)
      const gzipStream = zlib.createGzip()
      
      return new Promise<boolean>((resolve, reject) => {
        readStream
          .pipe(gzipStream)
          .pipe(writeStream)
          .on('finish', () => resolve(true))
          .on('error', (err) => {
            console.error(`Gzip压缩文件失败: ${inputPath}`, err)
            reject(err)
          })
      })
    } catch (error) {
      console.error(`Gzip压缩文件失败: ${inputPath}`, error)
      return false
    }
  }

  /**
   * 解压 gzip 文件
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径，如果未提供则移除输入文件路径的 .gz 后缀
   * @returns 是否成功
   */
  static async gunzipFile(inputPath: string, outputPath?: string): Promise<boolean> {
    try {
      const finalOutputPath = outputPath || inputPath.replace(/\.gz$/, '')
      
      // 确保输出目录存在
      const outputDir = path.dirname(finalOutputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const readStream = fs.createReadStream(inputPath)
      const writeStream = fs.createWriteStream(finalOutputPath)
      const gunzipStream = zlib.createGunzip()
      
      return new Promise<boolean>((resolve, reject) => {
        readStream
          .pipe(gunzipStream)
          .pipe(writeStream)
          .on('finish', () => resolve(true))
          .on('error', (err) => {
            console.error(`Gzip解压文件失败: ${inputPath}`, err)
            reject(err)
          })
      })
    } catch (error) {
      console.error(`Gzip解压文件失败: ${inputPath}`, error)
      return false
    }
  }

  /**
   * 将文件压缩为 brotli 格式
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径，如果未提供则在输入文件路径后添加 .br 后缀
   * @returns 是否成功
   */
  static async brotliCompressFile(inputPath: string, outputPath?: string): Promise<boolean> {
    try {
      const finalOutputPath = outputPath || `${inputPath}.br`
      
      // 确保输出目录存在
      const outputDir = path.dirname(finalOutputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const readStream = fs.createReadStream(inputPath)
      const writeStream = fs.createWriteStream(finalOutputPath)
      const brotliStream = zlib.createBrotliCompress()
      
      return new Promise<boolean>((resolve, reject) => {
        readStream
          .pipe(brotliStream)
          .pipe(writeStream)
          .on('finish', () => resolve(true))
          .on('error', (err) => {
            console.error(`Brotli压缩文件失败: ${inputPath}`, err)
            reject(err)
          })
      })
    } catch (error) {
      console.error(`Brotli压缩文件失败: ${inputPath}`, error)
      return false
    }
  }

  /**
   * 解压 brotli 文件
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径，如果未提供则移除输入文件路径的 .br 后缀
   * @returns 是否成功
   */
  static async brotliDecompressFile(inputPath: string, outputPath?: string): Promise<boolean> {
    try {
      const finalOutputPath = outputPath || inputPath.replace(/\.br$/, '')
      
      // 确保输出目录存在
      const outputDir = path.dirname(finalOutputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const readStream = fs.createReadStream(inputPath)
      const writeStream = fs.createWriteStream(finalOutputPath)
      const brotliStream = zlib.createBrotliDecompress()
      
      return new Promise<boolean>((resolve, reject) => {
        readStream
          .pipe(brotliStream)
          .pipe(writeStream)
          .on('finish', () => resolve(true))
          .on('error', (err) => {
            console.error(`Brotli解压文件失败: ${inputPath}`, err)
            reject(err)
          })
      })
    } catch (error) {
      console.error(`Brotli解压文件失败: ${inputPath}`, error)
      return false
    }
  }
} 