import * as fs from 'fs'
import * as path from 'path'
import * as TOML from '@iarna/toml'

// 定义配置接口
export interface Config {
  app: {
    is_dev: boolean
    is_secure: boolean
  }
  server: {
    host: string
    port: number
    output: string
    script_path: string
    user_data_path: string
    static_paths: Array<{ route: string, path: string }>
  }
  cors: {
    enabled: boolean
    allowed_origins: string[]
    allowed_methods: string[]
    allowed_headers: string[]
    allow_credentials: boolean
    max_age: number
  }
  database: {
    driver: string
    dsn: string
    max_open_conns: number
    max_idle_conns: number
    conn_max_lifetime: number
  }
  json_paths: {
    server_list: string
    last_server: string
    server_info: string
    notice_list: string
    notice_num: string
  }
  ftp: {
    host: string
    port: string
    user: string
    password: string
    apk_path: string
    zip_path: string
    log_dir: string
    max_log_size: number
  }
  auth: {
    jwt_secret: string
    token_expire: number
    remember_token_expire: number
  }
}

// 默认配置
const defaultConfig: Config = {
  app: {
    is_dev: true,
    is_secure: false
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    output: '../publish/output',
    script_path: 'sh',
    user_data_path: './user_data.bin',
    static_paths: [
      { route: '/static', path: './public' },
      { route: '/uploads', path: './uploads' },
      { route: '/cdn', path: './cdn' }
    ]
  },
  cors: {
    enabled: true,
    allowed_origins: ['*'],
    allowed_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowed_headers: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    allow_credentials: false,
    max_age: 24
  },
  database: {
    driver: 'sqlite',
    dsn: 'data/tsapi.db',
    max_open_conns: 100,
    max_idle_conns: 10,
    conn_max_lifetime: 3600
  },
  json_paths: {
    server_list: 'data/serverlist.json',
    last_server: 'data/lastserver.json',
    server_info: 'data/serverinfo.json',
    notice_list: 'data/noticelist.json',
    notice_num: 'data/noticenum.json'
  },
  ftp: {
    host: '',
    port: '',
    user: '',
    password: '',
    apk_path: '',
    zip_path: '',
    log_dir: 'output/logs/ftp',
    max_log_size: 20971520
  },
  auth: {
    jwt_secret: '!@#$bUn1234Elysia',
    token_expire: 604800,
    remember_token_expire: 2592000
  }
}

// 配置加载器类
class ConfigLoader {
  private config: Config
  
  constructor() {
    this.config = this.loadConfig()
  }

  // 加载配置文件
  private loadConfig(): Config {
    try {
      // 读取配置文件
      const configPath = path.resolve(process.cwd(), 'conf.toml')
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      // 解析TOML文件
      const parsedConfig = TOML.parse(configContent) as unknown as Partial<Config>
      
      // 合并默认配置和解析的配置
      return this.mergeConfigs(defaultConfig, parsedConfig)
    } catch (error) {
      console.error('加载配置文件失败:', error)
      // 如果加载失败，返回默认配置
      return defaultConfig
    }
  }

  // 递归合并配置
  private mergeConfigs(defaultConfig: any, userConfig: any): any {
    const result = { ...defaultConfig }
    
    for (const key in userConfig) {
      if (userConfig.hasOwnProperty(key)) {
        if (
          typeof userConfig[key] === 'object' && 
          userConfig[key] !== null && 
          !Array.isArray(userConfig[key]) &&
          typeof defaultConfig[key] === 'object'
        ) {
          // 递归合并嵌套对象
          result[key] = this.mergeConfigs(defaultConfig[key], userConfig[key])
        } else {
          // 直接替换值
          result[key] = userConfig[key]
        }
      }
    }
    
    return result
  }

  // 获取完整配置
  getConfig(): Config {
    return this.config
  }

  // 获取特定配置节
  getServerConfig() {
    return this.config.server
  }

  getAppConfig() {
    return this.config.app
  }

  getDatabaseConfig() {
    return this.config.database
  }

  getAuthConfig() {
    return this.config.auth
  }
}

// 创建单例配置加载器
export const configLoader = new ConfigLoader() 