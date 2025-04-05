import { utils } from './init'

interface Module {
    Awake(app: App): void;
    Start(): void;
    Dispose(): void;
    AddPublicRouters(): void;
    AddAuthRouters(): void;
}

/**
 * 应用程序主类
 */
class App {
    private modules: Module[] = []
    private utils = utils

    /**
     * 构造函数
     */
    constructor() {
        console.log('App 初始化')
    }

    /**
     * 注册模块
     * @param module 模块实例
     */
    registerModule(module: Module): App {
        this.modules.push(module)
        return this
    }

    /**
     * 启动应用
     */
    async start(): Promise<void> {
        console.log('启动应用')
        
        // 初始化所有模块
        for (const module of this.modules) {
            await module.Awake(this)
        }
        
        // 启动所有模块
        for (const module of this.modules) {
            await module.Start()
        }
        
        // 注册路由
        this.setupRouters()
    }

    /**
     * 设置路由
     */
    private setupRouters(): void {
        // 先添加公共路由
        for (const module of this.modules) {
            module.AddPublicRouters()
        }
        
        // 再添加需要认证的路由
        for (const module of this.modules) {
            module.AddAuthRouters()
        }
    }

    /**
     * 停止应用
     */
    async stop(): Promise<void> {
        console.log('停止应用')
        
        // 清理所有模块资源
        for (const module of this.modules) {
            await module.Dispose()
        }
    }
}

// 导出 App 类
export default App
export { Module, App }