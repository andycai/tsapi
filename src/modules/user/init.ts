import { App, IModule } from '../../core/app'

export class UserModule implements IModule {
    Awake(app: App): void {
        throw new Error('Method not implemented.')
    }
    Start(app: App): void {
        throw new Error('Method not implemented.')
    }
    Dispose(app: App): void {
        throw new Error('Method not implemented.')
    }
    AddPublicRouters(app: App): void {
        throw new Error('Method not implemented.')
    }
    AddAuthRouters(app: App): void {
        throw new Error('Method not implemented.')
    }
}