class GameEngine extends Component {
    private static instance: GameEngine;
    private stage: egret.Stage;
    private lastFrameTime: number = 0;
    private deltaTime: number = 0;
    private isRunning: boolean = false;
    private rootGameObject: GameObject;

    private constructor() {
        super();
        this.rootGameObject = new GameObject("Root");
    }

    public static getInstance(): GameEngine {
        if (!GameEngine.instance) {
            GameEngine.instance = new GameEngine();
        }
        return GameEngine.instance;
    }

    public onInit(): void {
        this.lastFrameTime = egret.getTimer();
        this.rootGameObject.init();
    }

    public start(stage: egret.Stage): void {
        this.stage = stage;
        this.init();
        this.isRunning = true;
        this.rootGameObject.init();
        this.startGameLoop();
    }

    private startGameLoop(): void {
        egret.startTick((timestamp: number) => {
            this.update(timestamp);
            return true;
        }, this);
    }

    public update(timestamp: number): void {
        const currentTime = egret.getTimer();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        this.rootGameObject.update(this.deltaTime);
        if (GameManager.getInstance().isStarted()) {
            GameManager.getInstance().onUpdate(this.deltaTime);
        }
    }

    public getDeltaTime(): number {
        return this.deltaTime;
    }

    public getStage(): egret.Stage {
        return this.stage;
    }

    public getRootGameObject(): GameObject {
        return this.rootGameObject;
    }

    public stop(): void {
        this.isRunning = false;
        this.rootGameObject.destroy();
    }

    public isGameRunning(): boolean {
        return this.isRunning;
    }
}
