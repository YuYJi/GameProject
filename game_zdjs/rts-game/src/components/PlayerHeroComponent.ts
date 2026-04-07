enum HeroType {
    WARRIOR = "warrior",
    MAGE = "mage",
    RANGER = "ranger"
}

class PlayerHeroComponent extends Component {
    private type: HeroType;
    private playerId: number;
    private x: number;
    private y: number;
    private health: number;
    private maxHealth: number;
    private attack: number;
    private defense: number;
    private speed: number;
    private visionRange: number;
    private sprite: egret.Sprite;
    private target: any = null;
    private stage: egret.Stage;
    private map: MapNode[][];
    private level: number = 1;
    private experience: number = 0;
    private isMoving: boolean = false;
    private isInCombat: boolean = false;
    private flashTimer: number = 0;
    private flashState: boolean = false;

    constructor(type: HeroType, playerId: number, x: number, y: number, stage: egret.Stage, map: MapNode[][]) {
        super();
        this.type = type;
        this.playerId = playerId;
        this.x = x;
        this.y = y;
        this.stage = stage;
        this.map = map;
        this.initStats();
    }

    private initStats(): void {
        switch (this.type) {
            case HeroType.WARRIOR:
                this.maxHealth = 150;
                this.attack = 35;
                this.defense = 20;
                this.speed = 5.0;
                this.visionRange = 6;
                break;
            case HeroType.MAGE:
                this.maxHealth = 100;
                this.attack = 45;
                this.defense = 10;
                this.speed = 4.0;
                this.visionRange = 5;
                break;
            case HeroType.RANGER:
                this.maxHealth = 120;
                this.attack = 40;
                this.defense = 15;
                this.speed = 4.5;
                this.visionRange = 7;
                break;
        }
        this.health = this.maxHealth;
    }

    public onInit(): void {
        this.createSprite();
    }

    private createSprite(): void {
        this.sprite = new egret.Sprite();
        let color = 0xFFFFFF; // 玩家英雄用白色
        
        switch (this.type) {
            case HeroType.WARRIOR:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                this.sprite.graphics.endFill();
                this.sprite.graphics.lineStyle(2, 0x000000);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                break;
            case HeroType.MAGE:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                this.sprite.graphics.endFill();
                this.sprite.graphics.lineStyle(2, 0x000000);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                break;
            case HeroType.RANGER:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                this.sprite.graphics.endFill();
                this.sprite.graphics.lineStyle(2, 0x000000);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                break;
        }
        
        this.sprite.x = this.x * 20 + 17.5;
        this.sprite.y = this.y * 20 + 17.5;
        this.sprite.anchorOffsetX = 17.5;
        this.sprite.anchorOffsetY = 17.5;
        this.stage.addChild(this.sprite);
    }

    public onUpdate(deltaTime: number): void {
        if (this.target) {
            this.moveToTarget(deltaTime);
        }
        
        // 战斗闪烁效果
        if (this.isInCombat) {
            this.updateFlashEffect(deltaTime);
        }
    }
    
    private updateFlashEffect(deltaTime: number): void {
        this.flashTimer += deltaTime * 1000;
        if (this.flashTimer >= 100) { // 100ms闪烁一次
            this.flashTimer = 0;
            this.flashState = !this.flashState;
            this.updateSpriteColor();
        }
    }
    
    private updateSpriteColor(): void {
        if (!this.sprite) return;
        
        this.sprite.graphics.clear();
        let color = this.isInCombat && this.flashState ? 0xFF0000 : 0xFFFFFF;
        
        switch (this.type) {
            case HeroType.WARRIOR:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                this.sprite.graphics.endFill();
                this.sprite.graphics.lineStyle(2, 0x000000);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                break;
            case HeroType.MAGE:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                this.sprite.graphics.endFill();
                this.sprite.graphics.lineStyle(2, 0x000000);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                break;
            case HeroType.RANGER:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                this.sprite.graphics.endFill();
                this.sprite.graphics.lineStyle(2, 0x000000);
                this.sprite.graphics.drawCircle(17.5, 17.5, 17.5);
                break;
        }
    }
    
    public setInCombat(inCombat: boolean): void {
        this.isInCombat = inCombat;
    }
    
    public getIsInCombat(): boolean {
        return this.isInCombat;
    }

    private moveToTarget(deltaTime: number): void {
        if (!this.target) return;

        let targetX: number;
        let targetY: number;

        if (this.target instanceof PlayerHeroComponent) {
            targetX = this.target.x;
            targetY = this.target.y;
        } else if (this.target.x !== undefined) {
            targetX = this.target.x;
            targetY = this.target.y;
        } else {
            return;
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.05) {
            this.isMoving = true;
            this.updateSpeed();
            
            const moveDistance = this.speed * deltaTime;
            const actualMove = Math.min(moveDistance, distance);
            
            this.x += (dx / distance) * actualMove;
            this.y += (dy / distance) * actualMove;
            this.updatePosition();
        } else {
            this.isMoving = false;
            this.target = null;
            this.x = targetX;
            this.y = targetY;
            this.updatePosition();
        }
    }

    private updateSpeed(): void {
        const gridX = Math.floor(this.x);
        const gridY = Math.floor(this.y);
        
        if (gridX >= 0 && gridX < this.map.length && gridY >= 0 && gridY < this.map[0].length) {
            const node = this.map[gridX][gridY];
            this.speed = 2.5 * node.getMovementModifier();
            
            if (node.terrain === TerrainType.MUD) {
                this.speed *= 0.7; // 泥泞地形移速降低30%
            }
        }
    }

    private updatePosition(): void {
        if (this.sprite) {
            this.sprite.x = this.x * 20 + 17.5;
            this.sprite.y = this.y * 20 + 17.5;
        }
    }

    public moveTo(x: number, y: number): void {
        this.target = { x: x, y: y };
        this.isMoving = true;
    }

    public gainExperience(amount: number): void {
        this.experience += amount;
        if (this.experience >= this.level * 100) {
            this.levelUp();
        }
    }

    private levelUp(): void {
        this.level++;
        this.experience = 0;
        this.maxHealth += 10;
        this.health = this.maxHealth;
        this.attack += 5;
        this.defense += 2;
    }

    public getType(): HeroType {
        return this.type;
    }

    public getPlayerId(): number {
        return this.playerId;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public getHealth(): number {
        return this.health;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public getAttack(): number {
        return this.attack;
    }

    public getDefense(): number {
        return this.defense;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public getVisionRange(): number {
        return this.visionRange;
    }

    public getLevel(): number {
        return this.level;
    }

    public getExperience(): number {
        return this.experience;
    }

    public takeDamage(amount: number): void {
        this.health -= Math.max(1, amount - this.defense);
        if (this.health <= 0) {
            this.die();
        }
    }

    private die(): void {
        this.setEnabled(false);
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    }

    public onDestroy(): void {
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    }
}
