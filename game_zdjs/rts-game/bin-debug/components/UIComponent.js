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
var UIComponent = /** @class */ (function (_super) {
    __extends(UIComponent, _super);
    function UIComponent(stage) {
        var _this = _super.call(this) || this;
        _this.unitComponents = [];
        _this.trainingButtons = [];
        _this.stage = stage;
        return _this;
    }
    UIComponent.prototype.onInit = function () {
        this.createUI();
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMapClick, this);
    };
    UIComponent.prototype.createUI = function () {
        this.createTrainingButtons();
        this.createPopulationDisplay();
    };
    UIComponent.prototype.createTrainingButtons = function () {
        var _this = this;
        var buttonWidth = 100;
        var buttonHeight = 40;
        var spacing = 10;
        var startX = 10;
        var startY = 50;
        var infantryButton = this.createButton("训练步兵", startX, startY, buttonWidth, buttonHeight, 0x00AA00);
        infantryButton.addEventListener(egret.TouchEvent.TOUCH_TAP, function () { return _this.trainUnit(UnitType.INFANTRY); }, this);
        this.trainingButtons.push(infantryButton);
        var archerButton = this.createButton("训练弓兵", startX, startY + buttonHeight + spacing, buttonWidth, buttonHeight, 0x0000FF);
        archerButton.addEventListener(egret.TouchEvent.TOUCH_TAP, function () { return _this.trainUnit(UnitType.ARCHER); }, this);
        this.trainingButtons.push(archerButton);
        var cavalryButton = this.createButton("训练骑兵", startX, startY + (buttonHeight + spacing) * 2, buttonWidth, buttonHeight, 0xFF0000);
        cavalryButton.addEventListener(egret.TouchEvent.TOUCH_TAP, function () { return _this.trainUnit(UnitType.CAVALRY); }, this);
        this.trainingButtons.push(cavalryButton);
    };
    UIComponent.prototype.createButton = function (text, x, y, width, height, color) {
        var button = new egret.TextField();
        button.text = text;
        button.size = 14;
        button.textColor = 0xFFFFFF;
        button.background = true;
        button.backgroundColor = color;
        button.width = width;
        button.height = height;
        button.x = x;
        button.y = y;
        button.textAlign = egret.HorizontalAlign.CENTER;
        button.verticalAlign = egret.VerticalAlign.MIDDLE;
        button.touchEnabled = true;
        this.stage.addChild(button);
        return button;
    };
    UIComponent.prototype.createPopulationDisplay = function () {
        this.populationText = new egret.TextField();
        this.populationText.text = "人口: 0/0";
        this.populationText.size = 16;
        this.populationText.textColor = 0xFFFFFF;
        this.populationText.x = 120;
        this.populationText.y = 10;
        this.stage.addChild(this.populationText);
    };
    UIComponent.prototype.onMapClick = function (event) {
        var map = GameManager.getInstance().getMapComponent().getMap();
        var gridSize = GameManager.getInstance().getMapComponent().getGridSize();
        var x = Math.floor(event.localX / gridSize);
        var y = Math.floor(event.localY / gridSize);
        if (x >= 0 && x < map.length && y >= 0 && y < map[0].length) {
            var node = map[x][y];
            if (node.canPass()) {
                this.movePlayerHero(x, y);
            }
        }
    };
    UIComponent.prototype.movePlayerHero = function (x, y) {
        if (this.playerHero) {
            this.playerHero.moveTo(x, y);
        }
    };
    UIComponent.prototype.trainUnit = function (type) {
        GameManager.getInstance().trainUnit(type);
    };
    UIComponent.prototype.setUnitComponents = function (units) {
        this.unitComponents = units;
    };
    UIComponent.prototype.setPlayerHero = function (hero) {
        this.playerHero = hero;
    };
    UIComponent.prototype.setResourceComponent = function (resource) {
        this.resourceComponent = resource;
    };
    UIComponent.prototype.onUpdate = function (deltaTime) {
        this.updatePopulationDisplay();
    };
    UIComponent.prototype.updatePopulationDisplay = function () {
        if (this.populationText) {
            var population = GameManager.getInstance().getPopulation();
            var maxPopulation = GameManager.getInstance().getMaxPopulation();
            this.populationText.text = "\u4EBA\u53E3: ".concat(population, "/").concat(maxPopulation);
        }
    };
    UIComponent.prototype.onDestroy = function () {
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onMapClick, this);
        for (var _i = 0, _a = this.trainingButtons; _i < _a.length; _i++) {
            var button = _a[_i];
            if (button.parent) {
                button.parent.removeChild(button);
            }
        }
        if (this.populationText && this.populationText.parent) {
            this.populationText.parent.removeChild(this.populationText);
        }
    };
    return UIComponent;
}(Component));
