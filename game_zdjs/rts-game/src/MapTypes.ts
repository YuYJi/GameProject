enum ResourceType {
    WOOD = "wood",
    FOOD = "food",
    GOLD = "gold"
}

enum BuildingType {
    BASE = "base",
    BARRACKS = "barracks"
}

class GridNode {
    public x: number;
    public y: number;
    public size: number;
    public resource: ResourceNode = null;
    public building: BuildingNode = null;

    constructor(x: number, y: number, size: number) {
        this.x = x;
        this.y = y;
        this.size = size;
    }
}

class ResourceNode {
    public x: number;
    public y: number;
    public type: ResourceType;
    public amount: number;
    public sprite: egret.Sprite;

    constructor(x: number, y: number, type: ResourceType, amount: number) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.amount = amount;
    }

    public draw(stage: egret.Stage): void {
        this.sprite = new egret.Sprite();
        let color: number;

        switch (this.type) {
            case ResourceType.WOOD:
                color = 0x8B4513;
                break;
            case ResourceType.FOOD:
                color = 0x00FF00;
                break;
            case ResourceType.GOLD:
                color = 0xFFD700;
                break;
        }

        this.sprite.graphics.beginFill(color);
        this.sprite.graphics.drawCircle(20, 20, 15);
        this.sprite.graphics.endFill();
        this.sprite.x = this.x * 40;
        this.sprite.y = this.y * 40;
        stage.addChild(this.sprite);
    }
}

class BuildingNode {
    public x: number;
    public y: number;
    public type: BuildingType;
    public playerId: number;
    public sprite: egret.Sprite;

    constructor(x: number, y: number, type: BuildingType, playerId: number) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.playerId = playerId;
    }

    public draw(stage: egret.Stage): void {
        this.sprite = new egret.Sprite();
        let color = this.playerId === 0 ? 0x0000FF : 0xFF0000;

        this.sprite.graphics.beginFill(color);
        this.sprite.graphics.drawRect(0, 0, 40, 40);
        this.sprite.graphics.endFill();
        this.sprite.x = this.x * 40;
        this.sprite.y = this.y * 40;
        stage.addChild(this.sprite);
    }
}
