var GameManager = /** @class */ (function () {
    function GameManager() {
        this.isGameStarted = false;
        this.unitComponents = [];
        this.enemyComponents = [];
        this.population = 30;
        this.maxPopulation = 30;
        this.townCount = 0;
    }
    GameManager.getInstance = function () {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    };
    GameManager.prototype.init = function (stage) {
        this.stage = stage;
        this.gameEngine = GameEngine.getInstance();
        this.createStartButton();
    };
    GameManager.prototype.createStartButton = function () {
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
    };
    GameManager.prototype.onStartButtonClick = function () {
        if (this.startButton && this.startButton.parent) {
            this.startButton.parent.removeChild(this.startButton);
        }
        this.startGame();
    };
    GameManager.prototype.startGame = function () {
        this.isGameStarted = true;
        var rootGameObject = this.gameEngine.getRootGameObject();
        var mapGameObject = new GameObject("Map");
        this.mapComponent = new MapComponent(this.stage);
        mapGameObject.addComponent(this.mapComponent);
        rootGameObject.addChild(mapGameObject);
        this.mapComponent.onInit();
        var resourceGameObject = new GameObject("Resource");
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
        var aiGameObject = new GameObject("AI");
        this.aiComponent = new AIComponent(this.stage, this.mapComponent.getMap(), AIDifficulty.MEDIUM);
        this.aiComponent.setEnemyUnits(this.enemyComponents);
        this.aiComponent.setPlayerUnits(this.unitComponents);
        aiGameObject.addComponent(this.aiComponent);
        rootGameObject.addChild(aiGameObject);
        this.aiComponent.onInit();
        var uiGameObject = new GameObject("UI");
        this.uiComponent = new UIComponent(this.stage);
        this.uiComponent.setUnitComponents(this.unitComponents);
        this.uiComponent.setPlayerHero(this.playerHero);
        this.uiComponent.setResourceComponent(this.resourceComponent);
        uiGameObject.addComponent(this.uiComponent);
        rootGameObject.addChild(uiGameObject);
        this.gameEngine.start(this.stage);
    };
    GameManager.prototype.createPlayerHero = function () {
        var rootGameObject = this.gameEngine.getRootGameObject();
        var map = this.mapComponent.getMap();
        var heroGameObject = new GameObject("PlayerHero");
        this.playerHero = new PlayerHeroComponent(HeroType.WARRIOR, 0, 4, 8, this.stage, map);
        heroGameObject.addComponent(this.playerHero);
        rootGameObject.addChild(heroGameObject);
    };
    GameManager.prototype.createInitialEnemies = function () {
        var rootGameObject = this.gameEngine.getRootGameObject();
        var map = this.mapComponent.getMap();
        var width = map.length;
        var height = map[0].length;
        for (var i = 0; i < 5; i++) {
            var unitGameObject = new GameObject("EnemyUnit" + i);
            var unitComponent = new UnitComponent(UnitType.INFANTRY, 1, width - 5, height - 5, this.stage, map);
            unitGameObject.addComponent(unitComponent);
            this.enemyComponents.push(unitComponent);
            rootGameObject.addChild(unitGameObject);
        }
    };
    GameManager.prototype.trainUnit = function (type) {
        if (this.unitComponents.length >= this.maxPopulation) {
            return false;
        }
        var foodCost = 0;
        var goldCost = 0;
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
            var rootGameObject = this.gameEngine.getRootGameObject();
            var unitGameObject = new GameObject("PlayerUnit" + this.unitComponents.length);
            var unitComponent = new UnitComponent(type, 0, 4, 8, this.stage, this.mapComponent.getMap());
            unitGameObject.addComponent(unitComponent);
            this.unitComponents.push(unitComponent);
            rootGameObject.addChild(unitGameObject);
            return true;
        }
        return false;
    };
    GameManager.prototype.updateWarFog = function () {
        if (this.playerHero) {
            this.warFogComponent.updateHeroVision(this.playerHero);
        }
    };
    GameManager.prototype.setTownCount = function (count) {
        this.townCount = count;
        this.resourceComponent.setTownCount(count);
        this.maxPopulation = 30 + (count * 2);
    };
    GameManager.prototype.getUnitComponents = function () {
        return this.unitComponents;
    };
    GameManager.prototype.getEnemyComponents = function () {
        return this.enemyComponents;
    };
    GameManager.prototype.getMapComponent = function () {
        return this.mapComponent;
    };
    GameManager.prototype.getResourceComponent = function () {
        return this.resourceComponent;
    };
    GameManager.prototype.getWarFogComponent = function () {
        return this.warFogComponent;
    };
    GameManager.prototype.getPopulation = function () {
        return this.unitComponents.length;
    };
    GameManager.prototype.getMaxPopulation = function () {
        return this.maxPopulation;
    };
    GameManager.prototype.getTownCount = function () {
        return this.townCount;
    };
    GameManager.prototype.isStarted = function () {
        return this.isGameStarted;
    };
    GameManager.prototype.getGameEngine = function () {
        return this.gameEngine;
    };
    GameManager.prototype.getUIComponent = function () {
        return this.uiComponent;
    };
    GameManager.prototype.onUpdate = function (deltaTime) {
        this.checkCombatTriggers();
    };
    GameManager.prototype.checkCombatTriggers = function () {
        // 检查玩家单位与敌人单位之间的战斗
        for (var _i = 0, _a = this.unitComponents; _i < _a.length; _i++) {
            var playerUnit = _a[_i];
            for (var _b = 0, _c = this.enemyComponents; _b < _c.length; _b++) {
                var enemyUnit = _c[_b];
                this.checkCombatBetween(playerUnit, enemyUnit);
            }
        }
        // 检查玩家英雄与敌人单位之间的战斗
        if (this.playerHero) {
            for (var _d = 0, _e = this.enemyComponents; _d < _e.length; _d++) {
                var enemyUnit = _e[_d];
                this.checkCombatBetweenHeroAndUnit(this.playerHero, enemyUnit);
            }
        }
    };
    GameManager.prototype.checkCombatBetween = function (unit1, unit2) {
        var distance = Math.sqrt(Math.pow(unit1.getX() - unit2.getX(), 2) +
            Math.pow(unit1.getY() - unit2.getY(), 2));
        if (distance <= 1.5) { // 距离小于1.5格子时触发战斗
            if (!unit1.getIsInCombat()) {
                unit1.setCombatTarget(unit2);
            }
            if (!unit2.getIsInCombat()) {
                unit2.setCombatTarget(unit1);
            }
        }
    };
    GameManager.prototype.checkCombatBetweenHeroAndUnit = function (hero, unit) {
        var distance = Math.sqrt(Math.pow(hero.getX() - unit.getX(), 2) +
            Math.pow(hero.getY() - unit.getY(), 2));
        if (distance <= 1.5) { // 距离小于1.5格子时触发战斗
            if (!unit.getIsInCombat()) {
                unit.setCombatTarget(unit); // 暂时让单位攻击自己，实际应该让单位攻击英雄
            }
            if (!hero.getIsInCombat()) {
                hero.setInCombat(true);
            }
        }
    };
    return GameManager;
}());
