var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var UnitType;
(function (UnitType) {
    UnitType["INFANTRY"] = "infantry";
    UnitType["ARCHER"] = "archer";
    UnitType["CAVALRY"] = "cavalry";
})(UnitType || (UnitType = {}));
var UnitComponent = /** @class */ (function (_super) {
    __extends(UnitComponent, _super);
    function UnitComponent(type, playerId, x, y, stage, map) {
        var _this = _super.call(this) || this;
        _this.isMoving = false;
        _this.isCharging = false;
        _this.chargeCooldown = 0;
        _this.isGarrisoned = false;
        _this.isInCombat = false;
        _this.combatTarget = null;
        _this.combatCooldown = 0;
        _this.flashTimer = 0;
        _this.flashState = false;
        _this.target = null;
        _this.type = type;
        _this.playerId = playerId;
        _this.x = x;
        _this.y = y;
        _this.stage = stage;
        _this.map = map;
        _this.initStats();
        return _this;
    }
    UnitComponent.prototype.initStats = function () {
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
    };
    UnitComponent.prototype.onInit = function () {
        this.createSprite();
    };
    UnitComponent.prototype.createSprite = function () {
        this.sprite = new egret.Sprite();
        var color = 0xFFFFFF; // 士兵用白色
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
    };
    UnitComponent.prototype.onUpdate = function (deltaTime) {
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
    };
    UnitComponent.prototype.checkForCombat = function () {
        // 这里需要获取所有单位来检测敌对单位
        // 暂时简单实现，实际需要从GameManager获取
    };
    UnitComponent.prototype.updateCombat = function (deltaTime) {
        if (this.combatTarget && this.combatTarget.getHealth() > 0) {
            this.combatCooldown -= deltaTime * 1000;
            if (this.combatCooldown <= 0) {
                this.combatCooldown = 1000; // 1秒攻击间隔
                this.combatTarget.takeDamage(this.getAttack());
            }
        }
        else {
            this.isInCombat = false;
            this.combatTarget = null;
        }
    };
    UnitComponent.prototype.updateFlashEffect = function (deltaTime) {
        this.flashTimer += deltaTime * 1000;
        if (this.flashTimer >= 100) { // 100ms闪烁一次
            this.flashTimer = 0;
            this.flashState = !this.flashState;
            this.updateSpriteColor();
        }
    };
    UnitComponent.prototype.updateSpriteColor = function () {
        if (!this.sprite)
            return;
        this.sprite.graphics.clear();
        var color = this.isInCombat && this.flashState ? 0xFF0000 : 0xFFFFFF;
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
    };
    UnitComponent.prototype.setCombatTarget = function (target) {
        this.isInCombat = true;
        this.combatTarget = target;
        this.combatCooldown = 0;
    };
    UnitComponent.prototype.getIsInCombat = function () {
        return this.isInCombat;
    };
    UnitComponent.prototype.moveToTarget = function (deltaTime) {
        if (!this.target)
            return;
        var targetX;
        var targetY;
        if (this.target instanceof UnitComponent) {
            targetX = this.target.x;
            targetY = this.target.y;
        }
        else if (this.target.x !== undefined) {
            targetX = this.target.x;
            targetY = this.target.y;
        }
        else {
            return;
        }
        var dx = targetX - this.x;
        var dy = targetY - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0.05) {
            this.isMoving = true;
            this.updateSpeed();
            var moveSpeed = this.speed;
            if (this.isCharging) {
                moveSpeed *= 1.3; // 冲锋时速度提升30%
            }
            var moveDistance = moveSpeed * deltaTime;
            var actualMove = Math.min(moveDistance, distance);
            this.x += (dx / distance) * actualMove;
            this.y += (dy / distance) * actualMove;
            this.updatePosition();
        }
        else {
            this.isMoving = false;
            this.target = null;
            this.x = targetX;
            this.y = targetY;
            this.updatePosition();
        }
    };
    UnitComponent.prototype.updateSpeed = function () {
        var gridX = Math.floor(this.x);
        var gridY = Math.floor(this.y);
        if (gridX >= 0 && gridX < this.map.length && gridY >= 0 && gridY < this.map[0].length) {
            var node = this.map[gridX][gridY];
            this.speed = this.baseSpeed * node.getMovementModifier();
            if (this.type === UnitType.CAVALRY && node.terrain === TerrainType.HILL) {
                this.speed *= 0.8; // 骑兵在浅丘降低20%
            }
            else if (this.type === UnitType.INFANTRY && node.terrain === TerrainType.HILL) {
                this.speed *= 0.9; // 步兵在浅丘降低10%
            }
        }
    };
    UnitComponent.prototype.updatePosition = function () {
        if (this.sprite) {
            this.sprite.x = this.x * 20 + 15;
            this.sprite.y = this.y * 20 + 15;
        }
    };
    UnitComponent.prototype.moveTo = function (x, y) {
        this.target = { x: x, y: y };
        this.isMoving = true;
    };
    UnitComponent.prototype.charge = function () {
        if (this.type === UnitType.CAVALRY && this.chargeCooldown <= 0) {
            this.isCharging = true;
            this.chargeCooldown = 5000; // 5秒冷却
        }
    };
    UnitComponent.prototype.garrison = function () {
        if (this.type === UnitType.INFANTRY) {
            this.isGarrisoned = true;
            this.maxHealth *= 1.2; // 驻守时生命值提升20%
            this.health = this.maxHealth;
        }
    };
    UnitComponent.prototype.ungarrison = function () {
        this.isGarrisoned = false;
        this.initStats(); // 重置 stats
    };
    UnitComponent.prototype.getType = function () {
        return this.type;
    };
    UnitComponent.prototype.getPlayerId = function () {
        return this.playerId;
    };
    UnitComponent.prototype.getX = function () {
        return this.x;
    };
    UnitComponent.prototype.getY = function () {
        return this.y;
    };
    UnitComponent.prototype.getHealth = function () {
        return this.health;
    };
    UnitComponent.prototype.getMaxHealth = function () {
        return this.maxHealth;
    };
    UnitComponent.prototype.getAttack = function () {
        var attack = this.attack;
        if (this.isCharging) {
            attack *= 1.5; // 冲锋时1.5倍伤害
        }
        return attack;
    };
    UnitComponent.prototype.getDefense = function () {
        return this.defense;
    };
    UnitComponent.prototype.getSpeed = function () {
        return this.speed;
    };
    UnitComponent.prototype.getRange = function () {
        var range = this.range;
        var gridX = Math.floor(this.x);
        var gridY = Math.floor(this.y);
        if (gridX >= 0 && gridX < this.map.length && gridY >= 0 && gridY < this.map[0].length) {
            var node = this.map[gridX][gridY];
            if (this.type === UnitType.ARCHER && node.terrain === TerrainType.HILL) {
                range *= 1.1; // 弓兵在浅丘射程提升10%
            }
        }
        return range;
    };
    UnitComponent.prototype.getVisionRange = function () {
        return this.visionRange;
    };
    UnitComponent.prototype.getTrainingTime = function () {
        return this.trainingTime;
    };
    UnitComponent.prototype.getFoodCost = function () {
        return this.foodCost;
    };
    UnitComponent.prototype.getGoldCost = function () {
        return this.goldCost;
    };
    UnitComponent.prototype.takeDamage = function (amount) {
        var damage = amount - this.defense;
        if (this.type === UnitType.ARCHER && this.isAttackedByCavalry()) {
            damage *= 1.3; // 弓兵被骑兵攻击时伤害增加30%
        }
        this.health -= Math.max(1, damage);
        if (this.health <= 0) {
            this.die();
        }
    };
    UnitComponent.prototype.isAttackedByCavalry = function () {
        return false; // 需要实现敌人类型检测
    };
    UnitComponent.prototype.die = function () {
        this.setEnabled(false);
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    };
    UnitComponent.prototype.onDestroy = function () {
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    };
    return UnitComponent;
}(Component));
