class GameManager {
    private static instance: GameManager;
    private gameEngine: GameEngine;
    public stage: egret.Stage;
    private isGameStarted: boolean = false;
    private startButton: egret.TextField;
    private mapComponent: MapComponent;
    private resourceComponent: ResourceComponent;
    private warFogComponent: WarFogComponent;
    private aiComponent: AIComponent;
    private playerHero: PlayerHeroComponent;
    private unitComponents: UnitComponent[] = [];
    private enemyComponents: UnitComponent[] = [];
    private uiComponent: UIComponent;
    private population: number = 30;
    private maxPopulation: number = 30;
    private townCount: number = 0;

    private constructor() {}

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public init(stage: egret.Stage): void {
        this.stage = stage;
        this.gameEngine = GameEngine.getInstance();
        this.createStartButton();
    }

    private createStartButton(): void {
        this.startButton = new egret.TextField();
        this.startButton.text = "开始游戏";
        this.startButton.size = 20;
        this.startButton.textColor = 0xFFFFFF;
        this.startButton.background = true;
        this.startButton.backgroundColor = 0x00AA00;
        this.startButton.width = 120;
        this.startButton.height = 40;
        this.startButton.x = (this.stage.stageWidth - this.startButton.width) / 2;
        this.startButton.y = (this.stage.stageHeight - this.startButton.height) / 2;
        this.startButton.textAlign = egret.HorizontalAlign.CENTER;
        this.startButton.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.startButton.touchEnabled = true;
        this.startButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onStartButtonClick, this);
        this.stage.addChild(this.startButton);
    }

    private onStartButtonClick(): void {
        if (this.startButton && this.startButton.parent) {
            this.startButton.parent.removeChild(this.startButton);
        }
        this.startGame();
    }

    private startGame(): void {
        this.isGameStarted = true;
        
        const rootGameObject = this.gameEngine.getRootGameObject();
        
        const mapGameObject = new GameObject("Map");
        this.mapComponent = new MapComponent(this.stage);
        mapGameObject.addComponent(this.mapComponent);
        rootGameObject.addChild(mapGameObject);

        this.mapComponent.onInit();

        const resourceGameObject = new GameObject("Resource");
        this.resourceComponent = new ResourceComponent(this.stage);
        resourceGameObject.addComponent(this.resourceComponent);
        rootGameObject.addChild(resourceGameObject);
        this.resourceComponent.onInit();

        // 暂时禁用战争迷雾效果
        // const warFogGameObject = new GameObject("WarFog");
        // this.warFogComponent = new WarFogComponent(this.stage, this.mapComponent.getMap());
        // warFogGameObject.addComponent(this.warFogComponent);
        // rootGameObject.addChild(warFogGameObject);
        // this.warFogComponent.onInit();

        this.createPlayerHero();
        this.createInitialEnemies();

        const aiGameObject = new GameObject("AI");
        this.aiComponent = new AIComponent(this.stage, this.mapComponent.getMap(), AIDifficulty.MEDIUM);
        this.aiComponent.setEnemyUnits(this.enemyComponents);
        this.aiComponent.setPlayerUnits(this.unitComponents);
        aiGameObject.addComponent(this.aiComponent);
        rootGameObject.addChild(aiGameObject);
        this.aiComponent.onInit();

        const uiGameObject = new GameObject("UI");
        this.uiComponent = new UIComponent(this.stage);
        this.uiComponent.setUnitComponents(this.unitComponents);
        this.uiComponent.setPlayerHero(this.playerHero);
        this.uiComponent.setResourceComponent(this.resourceComponent);
        uiGameObject.addComponent(this.uiComponent);
        rootGameObject.addChild(uiGameObject);

        this.gameEngine.start(this.stage);
    }

    private createPlayerHero(): void {
        const rootGameObject = this.gameEngine.getRootGameObject();
        const map = this.mapComponent.getMap();

        const heroGameObject = new GameObject("PlayerHero");
        this.playerHero = new PlayerHeroComponent(HeroType.WARRIOR, 0, 4, 8, this.stage, map);
        heroGameObject.addComponent(this.playerHero);
        rootGameObject.addChild(heroGameObject);
    }

    private createInitialEnemies(): void {
        const rootGameObject = this.gameEngine.getRootGameObject();
        const map = this.mapComponent.getMap();
        const width = map.length;
        const height = map[0].length;

        for (let i = 0; i < 5; i++) {
            const unitGameObject = new GameObject("EnemyUnit" + i);
            const unitComponent = new UnitComponent(UnitType.INFANTRY, 1, width - 5, height - 5, this.stage, map);
            unitGameObject.addComponent(unitComponent);
            this.enemyComponents.push(unitComponent);
            rootGameObject.addChild(unitGameObject);
        }
    }

    public trainUnit(type: UnitType): boolean {
        if (this.unitComponents.length >= this.maxPopulation) {
            return false;
        }

        let foodCost = 0;
        let goldCost = 0;

        switch (type) {
            case UnitType.INFANTRY:
                foodCost = 10;
                goldCost = 5;
                break;
            case UnitType.ARCHER:
                foodCost = 20;
                goldCost = 15;
                break;
            case UnitType.CAVALRY:
                foodCost = 50;
                goldCost = 40;
                break;
        }

        if (this.resourceComponent.removeFood(foodCost) && this.resourceComponent.removeGold(goldCost)) {
            const rootGameObject = this.gameEngine.getRootGameObject();
            const unitGameObject = new GameObject("PlayerUnit" + this.unitComponents.length);
            const unitComponent = new UnitComponent(type, 0, 4, 8, this.stage, this.mapComponent.getMap());
            unitGameObject.addComponent(unitComponent);
            this.unitComponents.push(unitComponent);
            rootGameObject.addChild(unitGameObject);
            return true;
        }
        return false;
    }

    public updateWarFog(): void {
        if (this.playerHero) {
            this.warFogComponent.updateHeroVision(this.playerHero);
        }
    }

    public setTownCount(count: number): void {
        this.townCount = count;
        this.resourceComponent.setTownCount(count);
        this.maxPopulation = 30 + (count * 2);
    }

    public getUnitComponents(): UnitComponent[] {
        return this.unitComponents;
    }

    public getEnemyComponents(): UnitComponent[] {
        return this.enemyComponents;
    }

    public getMapComponent(): MapComponent {
        return this.mapComponent;
    }

    public getResourceComponent(): ResourceComponent {
        return this.resourceComponent;
    }

    public getWarFogComponent(): WarFogComponent {
        return this.warFogComponent;
    }

    public getPopulation(): number {
        return this.unitComponents.length;
    }

    public getMaxPopulation(): number {
        return this.maxPopulation;
    }

    public getTownCount(): number {
        return this.townCount;
    }

    public isStarted(): boolean {
        return this.isGameStarted;
    }

    public getGameEngine(): GameEngine {
        return this.gameEngine;
    }

    public getUIComponent(): UIComponent {
        return this.uiComponent;
    }
    
    public onUpdate(deltaTime: number): void {
        this.checkCombatTriggers();
    }
    
    private checkCombatTriggers(): void {
        // 检查玩家单位与敌人单位之间的战斗
        for (const playerUnit of this.unitComponents) {
            for (const enemyUnit of this.enemyComponents) {
                this.checkCombatBetween(playerUnit, enemyUnit);
            }
        }
        
        // 检查玩家英雄与敌人单位之间的战斗
        if (this.playerHero) {
            for (const enemyUnit of this.enemyComponents) {
                this.checkCombatBetweenHeroAndUnit(this.playerHero, enemyUnit);
            }
        }
    }
    
    private checkCombatBetween(unit1: UnitComponent, unit2: UnitComponent): void {
        const distance = Math.sqrt(
            Math.pow(unit1.getX() - unit2.getX(), 2) + 
            Math.pow(unit1.getY() - unit2.getY(), 2)
        );
        
        if (distance <= 1.5) { // 距离小于1.5格子时触发战斗
            if (!unit1.getIsInCombat()) {
                unit1.setCombatTarget(unit2);
            }
            if (!unit2.getIsInCombat()) {
                unit2.setCombatTarget(unit1);
            }
        }
    }
    
    private checkCombatBetweenHeroAndUnit(hero: PlayerHeroComponent, unit: UnitComponent): void {
        const distance = Math.sqrt(
            Math.pow(hero.getX() - unit.getX(), 2) + 
            Math.pow(hero.getY() - unit.getY(), 2)
        );
        
        if (distance <= 1.5) { // 距离小于1.5格子时触发战斗
            if (!unit.getIsInCombat()) {
                unit.setCombatTarget(unit); // 暂时让单位攻击自己，实际应该让单位攻击英雄
            }
            if (!hero.getIsInCombat()) {
                hero.setInCombat(true);
            }
        }
    }
}
