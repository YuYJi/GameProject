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
var ResourceComponent = /** @class */ (function (_super) {
    __extends(ResourceComponent, _super);
    function ResourceComponent(stage) {
        var _this = _super.call(this) || this;
        _this.food = 500;
        _this.gold = 300;
        _this.foodCapacity = 1000;
        _this.goldCapacity = 800;
        _this.townCount = 0;
        _this.lastResourceTime = 0;
        _this.lastTownTime = 0;
        _this.exchangeCount = 0;
        _this.exchangeLimit = 3;
        _this.exchangeCooldown = 24 * 60 * 60; // 24小时
        _this.lastExchangeTime = 0;
        _this.stage = stage;
        return _this;
    }
    ResourceComponent.prototype.onInit = function () {
        this.createResourceUI();
        this.lastResourceTime = egret.getTimer();
        this.lastTownTime = egret.getTimer();
    };
    ResourceComponent.prototype.createResourceUI = function () {
        this.resourceText = new egret.TextField();
        this.resourceText.text = this.getResourceText();
        this.resourceText.size = 16;
        this.resourceText.textColor = 0xFFFFFF;
        this.resourceText.x = 10;
        this.resourceText.y = 10;
        this.stage.addChild(this.resourceText);
    };
    ResourceComponent.prototype.getResourceText = function () {
        return "\u7CAE\u98DF: ".concat(this.food, "/").concat(this.getFoodCapacity(), " | \u91D1\u5E01: ").concat(this.gold, "/").concat(this.getGoldCapacity());
    };
    ResourceComponent.prototype.onUpdate = function (deltaTime) {
        this.updateResources(deltaTime);
        this.updateTownProduction(deltaTime);
        this.updateResourceUI();
    };
    ResourceComponent.prototype.updateResources = function (deltaTime) {
        var currentTime = egret.getTimer();
        if (currentTime - this.lastResourceTime >= 10000) { // 10秒
            this.addFood(10);
            this.addGold(5);
            this.lastResourceTime = currentTime;
        }
    };
    ResourceComponent.prototype.updateTownProduction = function (deltaTime) {
        if (this.townCount > 0) {
            var currentTime = egret.getTimer();
            if (currentTime - this.lastTownTime >= 12000) { // 12秒
                this.addGold(15 * this.townCount);
                this.lastTownTime = currentTime;
            }
        }
    };
    ResourceComponent.prototype.updateResourceUI = function () {
        if (this.resourceText) {
            this.resourceText.text = this.getResourceText();
        }
    };
    ResourceComponent.prototype.addFood = function (amount) {
        this.food = Math.min(this.food + amount, this.getFoodCapacity());
    };
    ResourceComponent.prototype.addGold = function (amount) {
        this.gold = Math.min(this.gold + amount, this.getGoldCapacity());
    };
    ResourceComponent.prototype.removeFood = function (amount) {
        if (this.food >= amount) {
            this.food -= amount;
            return true;
        }
        return false;
    };
    ResourceComponent.prototype.removeGold = function (amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    };
    ResourceComponent.prototype.exchangeFoodToGold = function (amount) {
        var currentTime = egret.getTimer();
        if (currentTime - this.lastExchangeTime >= this.exchangeCooldown) {
            this.exchangeCount = 0;
            this.lastExchangeTime = currentTime;
        }
        if (this.exchangeCount >= this.exchangeLimit) {
            return false;
        }
        if (this.food >= amount * 2) {
            this.removeFood(amount * 2);
            this.addGold(amount);
            this.exchangeCount++;
            return true;
        }
        return false;
    };
    ResourceComponent.prototype.exchangeGoldToFood = function (amount) {
        var currentTime = egret.getTimer();
        if (currentTime - this.lastExchangeTime >= this.exchangeCooldown) {
            this.exchangeCount = 0;
            this.lastExchangeTime = currentTime;
        }
        if (this.exchangeCount >= this.exchangeLimit) {
            return false;
        }
        if (this.gold >= amount) {
            this.removeGold(amount);
            this.addFood(amount * 2);
            this.exchangeCount++;
            return true;
        }
        return false;
    };
    ResourceComponent.prototype.setTownCount = function (count) {
        this.townCount = count;
    };
    ResourceComponent.prototype.getFood = function () {
        return this.food;
    };
    ResourceComponent.prototype.getGold = function () {
        return this.gold;
    };
    ResourceComponent.prototype.getFoodCapacity = function () {
        return this.foodCapacity + (this.townCount * 200);
    };
    ResourceComponent.prototype.getGoldCapacity = function () {
        return this.goldCapacity + (this.townCount * 150);
    };
    ResourceComponent.prototype.getExchangeCount = function () {
        return this.exchangeCount;
    };
    ResourceComponent.prototype.getExchangeLimit = function () {
        return this.exchangeLimit;
    };
    ResourceComponent.prototype.onDestroy = function () {
        if (this.resourceText && this.resourceText.parent) {
            this.resourceText.parent.removeChild(this.resourceText);
        }
    };
    return ResourceComponent;
}(Component));
