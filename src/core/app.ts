
interface Module {
    Awake(app: App): void;
    Start(): void;
    Dispose(): void;
    AddPublicRouters(): void;
    AddAuthRouters(): void;
}

class App {
    private modules: Module[] = []
}