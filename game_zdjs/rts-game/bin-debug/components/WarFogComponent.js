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
var WarFogComponent = /** @class */ (function (_super) {
    __extends(WarFogComponent, _super);
    function WarFogComponent(stage, map) {
        var _this = _super.call(this) || this;
        _this.gridSize = 40;
        _this.visionLossTimer = new Map();
        _this.visionLossDelay = 10000; // 10秒
        _this.stage = stage;
        _this.map = map;
        return _this;
    }
    WarFogComponent.prototype.onInit = function () {
        this.createFog();
    };
    WarFogComponent.prototype.createFog = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        this.fogSprites = [];
        for (var x = 0; x < width; x++) {
            this.fogSprites[x] = [];
            for (var y = 0; y < height; y++) {
                var sprite = new egret.Sprite();
                sprite.graphics.beginFill(0x000000, 0.8);
                sprite.graphics.drawRect(0, 0, this.gridSize, this.gridSize);
                sprite.graphics.endFill();
                sprite.x = x * this.gridSize;
                sprite.y = y * this.gridSize;
                this.stage.addChild(sprite);
                this.fogSprites[x][y] = sprite;
            }
        }
    };
    WarFogComponent.prototype.updateVision = function (units) {
        this.resetVision();
        this.calculateVision(units);
        this.updateFog();
        this.checkVisionLoss();
    };
    WarFogComponent.prototype.updateHeroVision = function (hero) {
        this.resetVision();
        this.calculateHeroVision(hero);
        this.updateBuildingVision();
        this.updateFog();
        this.checkVisionLoss();
    };
    WarFogComponent.prototype.calculateHeroVision = function (hero) {
        var x = Math.floor(hero.getX());
        var y = Math.floor(hero.getY());
        var visionRange = hero.getVisionRange();
        this.updateUnitVision(x, y, visionRange);
    };
    WarFogComponent.prototype.resetVision = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                this.map[x][y].isVisible = false;
            }
        }
    };
    WarFogComponent.prototype.calculateVision = function (units) {
        for (var _i = 0, units_1 = units; _i < units_1.length; _i++) {
            var unit = units_1[_i];
            if (unit.getPlayerId() === 0) {
                var x = Math.floor(unit.getX());
                var y = Math.floor(unit.getY());
                var visionRange = unit.getVisionRange();
                this.updateUnitVision(x, y, visionRange);
            }
        }
        this.updateBuildingVision();
    };
    WarFogComponent.prototype.updateUnitVision = function (centerX, centerY, range) {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var x = Math.max(0, centerX - range); x <= Math.min(width - 1, centerX + range); x++) {
            for (var y = Math.max(0, centerY - range); y <= Math.min(height - 1, centerY + range); y++) {
                var distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (distance <= range) {
                    this.map[x][y].isVisible = true;
                    this.map[x][y].isExplored = true;
                    this.visionLossTimer.delete("".concat(x, ",").concat(y));
                }
            }
        }
    };
    WarFogComponent.prototype.updateBuildingVision = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var node = this.map[x][y];
                if (node.building === BuildingType.TOWN || node.building === BuildingType.SUPPLY_STATION) {
                    this.updateUnitVision(x, y, 8); // 建筑视野半径8格
                }
            }
        }
    };
    WarFogComponent.prototype.updateFog = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var node = this.map[x][y];
                var sprite = this.fogSprites[x][y];
                if (node.isVisible) {
                    sprite.alpha = 0;
                }
                else if (node.isExplored) {
                    sprite.alpha = 0.5;
                }
                else {
                    sprite.alpha = 0.8;
                }
            }
        }
    };
    WarFogComponent.prototype.checkVisionLoss = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        var currentTime = egret.getTimer();
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var node = this.map[x][y];
                var key = "".concat(x, ",").concat(y);
                if (!node.isVisible && node.isExplored) {
                    if (!this.visionLossTimer.has(key)) {
                        this.visionLossTimer.set(key, currentTime);
                    }
                    else {
                        var startTime = this.visionLossTimer.get(key);
                        if (currentTime - startTime >= this.visionLossDelay) {
                            node.isExplored = false;
                            this.visionLossTimer.delete(key);
                        }
                    }
                }
            }
        }
    };
    WarFogComponent.prototype.onUpdate = function (deltaTime) {
        this.updateFog();
        this.checkVisionLoss();
    };
    WarFogComponent.prototype.onDestroy = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var sprite = this.fogSprites[x][y];
                if (sprite && sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
            }
        }
    };
    return WarFogComponent;
}(Component));
