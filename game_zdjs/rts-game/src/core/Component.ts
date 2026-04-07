abstract class Component {
    protected enabled: boolean = true;
    protected initialized: boolean = false;

    public init(): void {
        this.initialized = true;
        this.onInit();
    }

    public update(deltaTime: number): void {
        if (!this.enabled || !this.initialized) return;
        this.onUpdate(deltaTime);
    }

    public destroy(): void {
        this.onDestroy();
        this.initialized = false;
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    protected onInit(): void {}
    protected onUpdate(deltaTime: number): void {}
    protected onDestroy(): void {}
}
