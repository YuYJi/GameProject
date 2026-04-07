class ResourceComponent extends Component {
    private food: number = 500;
    private gold: number = 300;
    private foodCapacity: number = 1000;
    private goldCapacity: number = 800;
    private townCount: number = 0;
    private lastResourceTime: number = 0;
    private lastTownTime: number = 0;
    private exchangeCount: number = 0;
    private exchangeLimit: number = 3;
    private exchangeCooldown: number = 24 * 60 * 60; // 24小时
    private lastExchangeTime: number = 0;
    private stage: egret.Stage;
    private resourceText: egret.TextField;

    constructor(stage: egret.Stage) {
        super();
        this.stage = stage;
    }

    public onInit(): void {
        this.createResourceUI();
        this.lastResourceTime = egret.getTimer();
        this.lastTownTime = egret.getTimer();
    }

    private createResourceUI(): void {
        this.resourceText = new egret.TextField();
        this.resourceText.text = this.getResourceText();
        this.resourceText.size = 16;
        this.resourceText.textColor = 0xFFFFFF;
        this.resourceText.x = 10;
        this.resourceText.y = 10;
        this.stage.addChild(this.resourceText);
    }

    private getResourceText(): string {
        return `粮食: ${this.food}/${this.getFoodCapacity()} | 金币: ${this.gold}/${this.getGoldCapacity()}`;
    }

    public onUpdate(deltaTime: number): void {
        this.updateResources(deltaTime);
        this.updateTownProduction(deltaTime);
        this.updateResourceUI();
    }

    private updateResources(deltaTime: number): void {
        const currentTime = egret.getTimer();
        if (currentTime - this.lastResourceTime >= 10000) { // 10秒
            this.addFood(10);
            this.addGold(5);
            this.lastResourceTime = currentTime;
        }
    }

    private updateTownProduction(deltaTime: number): void {
        if (this.townCount > 0) {
            const currentTime = egret.getTimer();
            if (currentTime - this.lastTownTime >= 12000) { // 12秒
                this.addGold(15 * this.townCount);
                this.lastTownTime = currentTime;
            }
        }
    }

    private updateResourceUI(): void {
        if (this.resourceText) {
            this.resourceText.text = this.getResourceText();
        }
    }

    public addFood(amount: number): void {
        this.food = Math.min(this.food + amount, this.getFoodCapacity());
    }

    public addGold(amount: number): void {
        this.gold = Math.min(this.gold + amount, this.getGoldCapacity());
    }

    public removeFood(amount: number): boolean {
        if (this.food >= amount) {
            this.food -= amount;
            return true;
        }
        return false;
    }

    public removeGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    public exchangeFoodToGold(amount: number): boolean {
        const currentTime = egret.getTimer();
        if (currentTime - this.lastExchangeTime >= this.exchangeCooldown) {
            this.exchangeCount = 0;
            this.lastExchangeTime = currentTime;
        }

        if (this.exchangeCount >= this.exchangeLimit) {
            return false;
        }

        if (this.food >= amount * 2) {
            this.removeFood(amount * 2);
            this.addGold(amount);
            this.exchangeCount++;
            return true;
        }
        return false;
    }

    public exchangeGoldToFood(amount: number): boolean {
        const currentTime = egret.getTimer();
        if (currentTime - this.lastExchangeTime >= this.exchangeCooldown) {
            this.exchangeCount = 0;
            this.lastExchangeTime = currentTime;
        }

        if (this.exchangeCount >= this.exchangeLimit) {
            return false;
        }

        if (this.gold >= amount) {
            this.removeGold(amount);
            this.addFood(amount * 2);
            this.exchangeCount++;
            return true;
        }
        return false;
    }

    public setTownCount(count: number): void {
        this.townCount = count;
    }

    public getFood(): number {
        return this.food;
    }

    public getGold(): number {
        return this.gold;
    }

    public getFoodCapacity(): number {
        return this.foodCapacity + (this.townCount * 200);
    }

    public getGoldCapacity(): number {
        return this.goldCapacity + (this.townCount * 150);
    }

    public getExchangeCount(): number {
        return this.exchangeCount;
    }

    public getExchangeLimit(): number {
        return this.exchangeLimit;
    }

    public onDestroy(): void {
        if (this.resourceText && this.resourceText.parent) {
            this.resourceText.parent.removeChild(this.resourceText);
        }
    }
}
