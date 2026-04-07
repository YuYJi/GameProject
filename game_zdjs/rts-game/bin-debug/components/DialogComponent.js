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
var DialogComponent = /** @class */ (function (_super) {
    __extends(DialogComponent, _super);
    function DialogComponent(stage) {
        var _this = _super.call(this) || this;
        _this.stage = stage;
        return _this;
    }
    DialogComponent.prototype.onInit = function () {
        this.createDialog();
    };
    DialogComponent.prototype.createDialog = function () {
        this.container = new egret.Sprite();
        this.background = new egret.Sprite();
        this.background.graphics.beginFill(0x000000, 0.8);
        this.background.graphics.drawRect(0, 0, 280, 180);
        this.background.graphics.endFill();
        this.background.x = (this.stage.stageWidth - 280) / 2;
        this.background.y = (this.stage.stageHeight - 180) / 2;
        this.container.addChild(this.background);
        this.titleText = new egret.TextField();
        this.titleText.text = "发现流民！";
        this.titleText.size = 20;
        this.titleText.textColor = 0xFFFFFF;
        this.titleText.x = (this.stage.stageWidth - 280) / 2 + 20;
        this.titleText.y = (this.stage.stageHeight - 180) / 2 + 20;
        this.container.addChild(this.titleText);
        this.recruitButton = new egret.TextField();
        this.recruitButton.text = "收编";
        this.recruitButton.size = 18;
        this.recruitButton.textColor = 0xFFFFFF;
        this.recruitButton.background = true;
        this.recruitButton.backgroundColor = 0x00AA00;
        this.recruitButton.width = 100;
        this.recruitButton.height = 40;
        this.recruitButton.x = (this.stage.stageWidth - 280) / 2 + 30;
        this.recruitButton.y = (this.stage.stageHeight - 180) / 2 + 100;
        this.recruitButton.textAlign = egret.HorizontalAlign.CENTER;
        this.recruitButton.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.recruitButton.touchEnabled = true;
        this.recruitButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRecruitClick, this);
        this.container.addChild(this.recruitButton);
        this.passButton = new egret.TextField();
        this.passButton.text = "路过";
        this.passButton.size = 18;
        this.passButton.textColor = 0xFFFFFF;
        this.passButton.background = true;
        this.passButton.backgroundColor = 0xFF0000;
        this.passButton.width = 100;
        this.passButton.height = 40;
        this.passButton.x = (this.stage.stageWidth - 280) / 2 + 150;
        this.passButton.y = (this.stage.stageHeight - 180) / 2 + 100;
        this.passButton.textAlign = egret.HorizontalAlign.CENTER;
        this.passButton.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.passButton.touchEnabled = true;
        this.passButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onPassClick, this);
        this.container.addChild(this.passButton);
        this.stage.addChild(this.container);
    };
    DialogComponent.prototype.onRecruitClick = function () {
        if (this.onRecruitCallback) {
            this.onRecruitCallback();
        }
        this.hide();
    };
    DialogComponent.prototype.onPassClick = function () {
        if (this.onPassCallback) {
            this.onPassCallback();
        }
        this.hide();
    };
    DialogComponent.prototype.setOnRecruit = function (callback) {
        this.onRecruitCallback = callback;
    };
    DialogComponent.prototype.setOnPass = function (callback) {
        this.onPassCallback = callback;
    };
    DialogComponent.prototype.show = function () {
        if (!this.container.parent) {
            this.stage.addChild(this.container);
        }
    };
    DialogComponent.prototype.hide = function () {
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
    };
    DialogComponent.prototype.onDestroy = function () {
        this.hide();
    };
    return DialogComponent;
}(Component));
