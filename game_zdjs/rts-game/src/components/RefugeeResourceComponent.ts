class RefugeeResourceComponent extends Component {
    private x: number;
    private y: number;
    private radius: number = 30;
    private sprite: egret.Sprite;
    private stage: egret.Stage;
    private isCollected: boolean = false;

    constructor(x: number, y: number, stage: egret.Stage) {
        super();
        this.x = x;
        this.y = y;
        this.stage = stage;
    }

    public onInit(): void {
        this.createSprite();
    }

    private createSprite(): void {
        this.sprite = new egret.Sprite();
        this.sprite.graphics.beginFill(0xFFFF00);
        this.sprite.graphics.drawCircle(0, 0, this.radius);
        this.sprite.graphics.endFill();
        this.sprite.x = this.x * 40 + 20;
        this.sprite.y = this.y * 40 + 20;
        this.stage.addChild(this.sprite);
    }

    public checkCollision(playerX: number, playerY: number): boolean {
        if (this.isCollected) return false;

        const dx = (this.x * 40 + 20) - (playerX * 40 + 20);
        const dy = (this.y * 40 + 20) - (playerY * 40 + 20);
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (this.radius + 15);
    }

    public collect(): void {
        this.isCollected = true;
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public isAlreadyCollected(): boolean {
        return this.isCollected;
    }

    public onDestroy(): void {
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    }
}
