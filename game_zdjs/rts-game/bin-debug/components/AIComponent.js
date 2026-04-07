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
var AIDifficulty;
(function (AIDifficulty) {
    AIDifficulty["EASY"] = "easy";
    AIDifficulty["MEDIUM"] = "medium";
    AIDifficulty["HARD"] = "hard";
})(AIDifficulty || (AIDifficulty = {}));
var AIComponent = /** @class */ (function (_super) {
    __extends(AIComponent, _super);
    function AIComponent(stage, map, difficulty) {
        var _this = _super.call(this) || this;
        _this.lastActionTime = 0;
        _this.actionCooldown = 2000;
        _this.resourceGathered = 0;
        _this.stage = stage;
        _this.map = map;
        _this.difficulty = difficulty;
        _this.enemyUnits = [];
        _this.playerUnits = [];
        return _this;
    }
    AIComponent.prototype.onInit = function () {
        this.lastActionTime = egret.getTimer();
    };
    AIComponent.prototype.setEnemyUnits = function (units) {
        this.enemyUnits = units;
    };
    AIComponent.prototype.setPlayerUnits = function (units) {
        this.playerUnits = units;
    };
    AIComponent.prototype.onUpdate = function (deltaTime) {
        var currentTime = egret.getTimer();
        if (currentTime - this.lastActionTime >= this.actionCooldown) {
            this.performAction();
            this.lastActionTime = currentTime;
        }
    };
    AIComponent.prototype.performAction = function () {
        switch (this.difficulty) {
            case AIDifficulty.EASY:
                this.performEasyAction();
                break;
            case AIDifficulty.MEDIUM:
                this.performMediumAction();
                break;
            case AIDifficulty.HARD:
                this.performHardAction();
                break;
        }
    };
    AIComponent.prototype.performEasyAction = function () {
        if (this.enemyUnits.length < 10) {
            this.trainUnit(UnitType.INFANTRY);
        }
        this.moveUnitsToNearestPlayer();
    };
    AIComponent.prototype.performMediumAction = function () {
        if (this.enemyUnits.length < 15) {
            var rand = Math.random();
            if (rand < 0.7) {
                this.trainUnit(UnitType.INFANTRY);
            }
            else {
                this.trainUnit(UnitType.ARCHER);
            }
        }
        if (this.enemyUnits.length >= 10) {
            this.attackPlayerBase();
        }
        else {
            this.moveUnitsToNearestPlayer();
        }
    };
    AIComponent.prototype.performHardAction = function () {
        if (this.enemyUnits.length < 20) {
            var rand = Math.random();
            if (rand < 0.4) {
                this.trainUnit(UnitType.INFANTRY);
            }
            else if (rand < 0.8) {
                this.trainUnit(UnitType.ARCHER);
            }
            else {
                this.trainUnit(UnitType.CAVALRY);
            }
        }
        this.attackPlayerBase();
        this.scoutMap();
    };
    AIComponent.prototype.trainUnit = function (type) {
        var rootGameObject = GameManager.getInstance().getGameEngine().getRootGameObject();
        var unitGameObject = new GameObject("EnemyUnit" + this.enemyUnits.length);
        var unitComponent = new UnitComponent(type, 1, this.getEnemyBaseX(), this.getEnemyBaseY(), this.stage, this.map);
        unitGameObject.addComponent(unitComponent);
        this.enemyUnits.push(unitComponent);
        rootGameObject.addChild(unitGameObject);
    };
    AIComponent.prototype.moveUnitsToNearestPlayer = function () {
        for (var _i = 0, _a = this.enemyUnits; _i < _a.length; _i++) {
            var unit = _a[_i];
            var nearestPlayer = this.findNearestPlayer(unit);
            if (nearestPlayer) {
                unit.moveTo(nearestPlayer.getX(), nearestPlayer.getY());
            }
        }
    };
    AIComponent.prototype.attackPlayerBase = function () {
        for (var _i = 0, _a = this.enemyUnits; _i < _a.length; _i++) {
            var unit = _a[_i];
            unit.moveTo(4, 8); // 玩家基地位置
        }
    };
    AIComponent.prototype.scoutMap = function () {
        if (this.enemyUnits.length > 5) {
            var cavalryUnit = this.enemyUnits.find(function (unit) { return unit.getType() === UnitType.CAVALRY; });
            if (cavalryUnit) {
                var randomX = Math.floor(Math.random() * this.map.length);
                var randomY = Math.floor(Math.random() * this.map[0].length);
                cavalryUnit.moveTo(randomX, randomY);
            }
        }
    };
    AIComponent.prototype.findNearestPlayer = function (unit) {
        var nearestPlayer = null;
        var minDistance = Infinity;
        for (var _i = 0, _a = this.playerUnits; _i < _a.length; _i++) {
            var playerUnit = _a[_i];
            var dx = playerUnit.getX() - unit.getX();
            var dy = playerUnit.getY() - unit.getY();
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPlayer = playerUnit;
            }
        }
        return nearestPlayer;
    };
    AIComponent.prototype.getEnemyBaseX = function () {
        return this.map.length - 5;
    };
    AIComponent.prototype.getEnemyBaseY = function () {
        return this.map[0].length - 5;
    };
    AIComponent.prototype.onDestroy = function () {
    };
    return AIComponent;
}(Component));
