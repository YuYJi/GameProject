enum UnitType {
    INFANTRY = "infantry",
    ARCHER = "archer",
    CAVALRY = "cavalry"
}

class UnitComponent extends Component {
    private type: UnitType;
    private playerId: number;
    private x: number;
    private y: number;
    private health: number;
    private maxHealth: number;
    private attack: number;
    private defense: number;
    private speed: number;
    private baseSpeed: number;
    private range: number;
    private visionRange: number;
    private isMoving: boolean = false;
    private isCharging: boolean = false;
    private chargeCooldown: number = 0;
    private isGarrisoned: boolean = false;
    private isInCombat: boolean = false;
    private combatTarget: UnitComponent | null = null;
    private combatCooldown: number = 0;
    private flashTimer: number = 0;
    private flashState: boolean = false;
    private sprite: egret.Sprite;
    private target: any = null;
    private stage: egret.Stage;
    private map: MapNode[][];
    private trainingTime: number;
    private foodCost: number;
    private goldCost: number;

    constructor(type: UnitType, playerId: number, x: number, y: number, stage: egret.Stage, map: MapNode[][]) {
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
            case UnitType.INFANTRY:
                this.maxHealth = 100;
                this.attack = 20;
                this.defense = 10;
                this.baseSpeed = 2;
                this.range = 1;
                this.visionRange = 5;
                this.trainingTime = 5000; // 5秒
                this.foodCost = 10;
                this.goldCost = 5;
                break;
            case UnitType.ARCHER:
                this.maxHealth = 80;
                this.attack = 30;
                this.defense = 5;
                this.baseSpeed = 1.5;
                this.range = 3;
                this.visionRange = 5;
                this.trainingTime = 10000; // 10秒
                this.foodCost = 20;
                this.goldCost = 15;
                break;
            case UnitType.CAVALRY:
                this.maxHealth = 120;
                this.attack = 40;
                this.defense = 15;
                this.baseSpeed = 3;
                this.range = 1;
                this.visionRange = 7;
                this.trainingTime = 20000; // 20秒
                this.foodCost = 50;
                this.goldCost = 40;
                break;
        }
        this.health = this.maxHealth;
        this.speed = this.baseSpeed;
    }

    public onInit(): void {
        this.createSprite();
    }

    private createSprite(): void {
        this.sprite = new egret.Sprite();
        let color = 0xFFFFFF; // 士兵用白色
        
        switch (this.type) {
            case UnitType.INFANTRY:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawRect(0, 0, 30, 30);
                break;
            case UnitType.ARCHER:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawRect(2, 2, 26, 26);
                break;
            case UnitType.CAVALRY:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawRect(-2, -2, 34, 34);
                break;
        }
        this.sprite.graphics.endFill();
        this.sprite.graphics.lineStyle(2, 0x000000);
        switch (this.type) {
            case UnitType.INFANTRY:
                this.sprite.graphics.drawRect(0, 0, 30, 30);
                break;
            case UnitType.ARCHER:
                this.sprite.graphics.drawRect(2, 2, 26, 26);
                break;
            case UnitType.CAVALRY:
                this.sprite.graphics.drawRect(-2, -2, 34, 34);
                break;
        }
        this.sprite.x = this.x * 20 + 15;
        this.sprite.y = this.y * 20 + 15;
        this.sprite.anchorOffsetX = 15;
        this.sprite.anchorOffsetY = 15;
        this.stage.addChild(this.sprite);
    }

    public onUpdate(deltaTime: number): void {
        if (this.target) {
            this.moveToTarget(deltaTime);
        }
        if (this.chargeCooldown > 0) {
            this.chargeCooldown -= deltaTime * 1000;
            if (this.chargeCooldown <= 0) {
                this.chargeCooldown = 0;
                this.isCharging = false;
            }
        }
        
        // 战斗逻辑
        this.checkForCombat();
        if (this.isInCombat) {
            this.updateCombat(deltaTime);
            this.updateFlashEffect(deltaTime);
        }
    }
    
    private checkForCombat(): void {
        // 这里需要获取所有单位来检测敌对单位
        // 暂时简单实现，实际需要从GameManager获取
    }
    
    private updateCombat(deltaTime: number): void {
        if (this.combatTarget && this.combatTarget.getHealth() > 0) {
            this.combatCooldown -= deltaTime * 1000;
            if (this.combatCooldown <= 0) {
                this.combatCooldown = 1000; // 1秒攻击间隔
                this.combatTarget.takeDamage(this.getAttack());
            }
        } else {
            this.isInCombat = false;
            this.combatTarget = null;
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
            case UnitType.INFANTRY:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawRect(0, 0, 30, 30);
                break;
            case UnitType.ARCHER:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawRect(2, 2, 26, 26);
                break;
            case UnitType.CAVALRY:
                this.sprite.graphics.beginFill(color);
                this.sprite.graphics.drawRect(-2, -2, 34, 34);
                break;
        }
        this.sprite.graphics.endFill();
        this.sprite.graphics.lineStyle(2, 0x000000);
        switch (this.type) {
            case UnitType.INFANTRY:
                this.sprite.graphics.drawRect(0, 0, 30, 30);
                break;
            case UnitType.ARCHER:
                this.sprite.graphics.drawRect(2, 2, 26, 26);
                break;
            case UnitType.CAVALRY:
                this.sprite.graphics.drawRect(-2, -2, 34, 34);
                break;
        }
    }
    
    public setCombatTarget(target: UnitComponent): void {
        this.isInCombat = true;
        this.combatTarget = target;
        this.combatCooldown = 0;
    }
    
    public getIsInCombat(): boolean {
        return this.isInCombat;
    }

    private moveToTarget(deltaTime: number): void {
        if (!this.target) return;

        let targetX: number;
        let targetY: number;

        if (this.target instanceof UnitComponent) {
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
            
            let moveSpeed = this.speed;
            if (this.isCharging) {
                moveSpeed *= 1.3; // 冲锋时速度提升30%
            }
            
            const moveDistance = moveSpeed * deltaTime;
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
            this.speed = this.baseSpeed * node.getMovementModifier();
            
            if (this.type === UnitType.CAVALRY && node.terrain === TerrainType.HILL) {
                this.speed *= 0.8; // 骑兵在浅丘降低20%
            } else if (this.type === UnitType.INFANTRY && node.terrain === TerrainType.HILL) {
                this.speed *= 0.9; // 步兵在浅丘降低10%
            }
        }
    }

    private updatePosition(): void {
        if (this.sprite) {
            this.sprite.x = this.x * 20 + 15;
            this.sprite.y = this.y * 20 + 15;
        }
    }

    public moveTo(x: number, y: number): void {
        this.target = { x: x, y: y };
        this.isMoving = true;
    }

    public charge(): void {
        if (this.type === UnitType.CAVALRY && this.chargeCooldown <= 0) {
            this.isCharging = true;
            this.chargeCooldown = 5000; // 5秒冷却
        }
    }

    public garrison(): void {
        if (this.type === UnitType.INFANTRY) {
            this.isGarrisoned = true;
            this.maxHealth *= 1.2; // 驻守时生命值提升20%
            this.health = this.maxHealth;
        }
    }

    public ungarrison(): void {
        this.isGarrisoned = false;
        this.initStats(); // 重置 stats
    }

    public getType(): UnitType {
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
        let attack = this.attack;
        if (this.isCharging) {
            attack *= 1.5; // 冲锋时1.5倍伤害
        }
        return attack;
    }

    public getDefense(): number {
        return this.defense;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public getRange(): number {
        let range = this.range;
        const gridX = Math.floor(this.x);
        const gridY = Math.floor(this.y);
        
        if (gridX >= 0 && gridX < this.map.length && gridY >= 0 && gridY < this.map[0].length) {
            const node = this.map[gridX][gridY];
            if (this.type === UnitType.ARCHER && node.terrain === TerrainType.HILL) {
                range *= 1.1; // 弓兵在浅丘射程提升10%
            }
        }
        return range;
    }

    public getVisionRange(): number {
        return this.visionRange;
    }

    public getTrainingTime(): number {
        return this.trainingTime;
    }

    public getFoodCost(): number {
        return this.foodCost;
    }

    public getGoldCost(): number {
        return this.goldCost;
    }

    public takeDamage(amount: number): void {
        let damage = amount - this.defense;
        if (this.type === UnitType.ARCHER && this.isAttackedByCavalry()) {
            damage *= 1.3; // 弓兵被骑兵攻击时伤害增加30%
        }
        this.health -= Math.max(1, damage);
        if (this.health <= 0) {
            this.die();
        }
    }

    private isAttackedByCavalry(): boolean {
        return false; // 需要实现敌人类型检测
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
