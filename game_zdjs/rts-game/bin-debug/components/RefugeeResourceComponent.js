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
var RefugeeResourceComponent = /** @class */ (function (_super) {
    __extends(RefugeeResourceComponent, _super);
    function RefugeeResourceComponent(x, y, stage) {
        var _this = _super.call(this) || this;
        _this.radius = 30;
        _this.isCollected = false;
        _this.x = x;
        _this.y = y;
        _this.stage = stage;
        return _this;
    }
    RefugeeResourceComponent.prototype.onInit = function () {
        this.createSprite();
    };
    RefugeeResourceComponent.prototype.createSprite = function () {
        this.sprite = new egret.Sprite();
        this.sprite.graphics.beginFill(0xFFFF00);
        this.sprite.graphics.drawCircle(0, 0, this.radius);
        this.sprite.graphics.endFill();
        this.sprite.x = this.x * 40 + 20;
        this.sprite.y = this.y * 40 + 20;
        this.stage.addChild(this.sprite);
    };
    RefugeeResourceComponent.prototype.checkCollision = function (playerX, playerY) {
        if (this.isCollected)
            return false;
        var dx = (this.x * 40 + 20) - (playerX * 40 + 20);
        var dy = (this.y * 40 + 20) - (playerY * 40 + 20);
        var distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + 15);
    };
    RefugeeResourceComponent.prototype.collect = function () {
        this.isCollected = true;
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    };
    RefugeeResourceComponent.prototype.getX = function () {
        return this.x;
    };
    RefugeeResourceComponent.prototype.getY = function () {
        return this.y;
    };
    RefugeeResourceComponent.prototype.isAlreadyCollected = function () {
        return this.isCollected;
    };
    RefugeeResourceComponent.prototype.onDestroy = function () {
        if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    };
    return RefugeeResourceComponent;
}(Component));
