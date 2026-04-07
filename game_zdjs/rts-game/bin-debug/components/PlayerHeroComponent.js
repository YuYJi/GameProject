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
var HeroType;
(function (HeroType) {
    HeroType["WARRIOR"] = "warrior";
    HeroType["MAGE"] = "mage";
    HeroType["RANGER"] = "ranger";
})(HeroType || (HeroType = {}));
var PlayerHeroComponent = /** @class */ (function (_super) {
    __extends(PlayerHeroComponent, _super);
    function PlayerHeroComponent(type, playerId, x, y, stage, map) {
        var _this = _super.call(this) || this;
        _this.target = null;
        _this.level = 1;
        _this.experience = 0;
        _this.isMoving = false;
        _this.isInCombat = false;
        _this.flashTimer = 0;
        _this.flashState = false;
        _this.type = type;
        _this.playerId = playerId;
        _this.x = x;
        _this.y = y;
        _this.stage = stage;
        _this.map = map;
        _this.initStats();
        return _this;
    }
    PlayerHeroComponent.prototype.initStats = function () {
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
    };
    PlayerHeroComponent.prototype.onInit = function () {
        this.createSprite();
    };
    PlayerHeroComponent.prototype.createSprite = function () {
        this.sprite = new egret.Sprite();
        var color = 0xFFFFFF; // 玩家英雄用白色
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
    };
    PlayerHeroComponent.prototype.onUpdate = function (deltaTime) {
        if (this.target) {
            this.moveToTarget(deltaTime);
        }
        // 战斗闪烁效果
        if (this.isInCombat) {
            this.updateFlashEffect(deltaTime);
        }
    };
    PlayerHeroComponent.prototype.updateFlashEffect = function (deltaTime) {
        this.flashTimer += deltaTime * 1000;
        if (this.flashTimer >= 100) { // 100ms闪烁一次
            this.flashTimer = 0;
            this.flashState = !this.flashState;
            this.updateSpriteColor();
        }
    };
    PlayerHeroComponent.prototype.updateSpriteColor = function () {
        if (!this.sprite)
            return;
        this.sprite.graphics.clear();
        var color = this.isInCombat && this.flashState ? 0xFF0000 : 0xFFFFFF;
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
    };
    PlayerHeroComponent.prototype.setInCombat = function (inCombat) {
        this.isInCombat = inCombat;
    };
    PlayerHeroComponent.prototype.getIsInCombat = function () {
        return this.isInCombat;
    };
    PlayerHeroComponent.prototype.moveToTarget = function (deltaTime) {
        if (!this.target)
            return;
        var targetX;
        var targetY;
        if (this.target instanceof PlayerHeroComponent) {
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
            var moveDistance = this.speed * deltaTime;
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
    PlayerHeroComponent.prototype.updateSpeed = function () {
        var gridX = Math.floor(this.x);
        var gridY = Math.floor(this.y);
        if (gridX >= 0 && gridX < this.map.length && gridY >= 0 && gridY < this.map[0].length) {
            var node = this.map[gridX][gridY];
            this.speed = 2.5 * node.getMovementModifier();
            if (node.terrain === TerrainType.MUD) {
                this.speed *= 0.7; // 泥泞地形移速降低30%
            }
        }
    };
    PlayerHeroComponent.prototype.updatePosition = function () {
        if (this.sprite) {
            this.sprite.x = this.x * 20 + 17.5;
            this.sprite.y = this.y * 20 + 17.5;
        }
    };
    PlayerHeroComponent.prototype.moveTo = function (x, y) {
        this.target = { x: x, y: y };
        this.isMoving = true;
    };
    PlayerHeroComponent.prototype.gainExperience = function (amount) {
        this.experience += amount;
        if (this.experience >= this.level * 100) {
            this.levelUp();
        }
    };
    PlayerHeroComponent.prototype.levelUp = function () {
        this.level++;
        this.experience = 0;
        this.maxHealth += 10;
        this.health = this.maxHealth;
        this.attack += 5;
        this.defense += 2;
    };
    PlayerHeroComponent.prototype.getType = function () {
        return this.type;
    };
    PlayerHeroComponent.prototype.getPlayerId = function () {
        return this.playerId;
    };
    PlayerHeroComponent.prototype.getX = function () {
        return this.x;
    };
    PlayerHeroComponent.prototype.getY = function () {
        return this.y;
    };
    PlayerHeroComponent.prototype.getHealth = function () {
        return this.health;
    };
    PlayerHeroComponent.prototype.getMaxHealth = function () {
        return this.maxHealth;
    };
    PlayerHeroComponent.prototype.getAttack = function () {
        return this.attack;
    };
    PlayerHeroComponent.prototype.getDefense = function () {
        return this.defense;
    };
    PlayerHeroComponent.prototype.getSpeed = function () {
        return this.speed;
    };
    PlayerHeroComponent.prototype.getVisionRange = function () {
        return this.visionRange;
    };
    PlayerHeroComponent.prototype.getLevel = function () {
        return this.level;
    };
    PlayerHeroComponent.prototype.getExperience = function () {
        return this.experience;
    };
    PlayerHeroComponent.prototype.takeDamage = function (amount) {
        this.health -= Math.max(1, amount - this.defense);
        if (this.health <= 0) {
            this.die();
        }
    };
    PlayerHeroComponent.prototype.die = function () {
        this.setEnabled(false);
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    };
    PlayerHeroComponent.prototype.onDestroy = function () {
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    };
    return PlayerHeroComponent;
}(Component));
