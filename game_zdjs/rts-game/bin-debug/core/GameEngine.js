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
var GameEngine = /** @class */ (function (_super) {
    __extends(GameEngine, _super);
    function GameEngine() {
        var _this = _super.call(this) || this;
        _this.lastFrameTime = 0;
        _this.deltaTime = 0;
        _this.isRunning = false;
        _this.rootGameObject = new GameObject("Root");
        return _this;
    }
    GameEngine.getInstance = function () {
        if (!GameEngine.instance) {
            GameEngine.instance = new GameEngine();
        }
        return GameEngine.instance;
    };
    GameEngine.prototype.onInit = function () {
        this.lastFrameTime = egret.getTimer();
        this.rootGameObject.init();
    };
    GameEngine.prototype.start = function (stage) {
        this.stage = stage;
        this.init();
        this.isRunning = true;
        this.rootGameObject.init();
        this.startGameLoop();
    };
    GameEngine.prototype.startGameLoop = function () {
        var _this = this;
        egret.startTick(function (timestamp) {
            _this.update(timestamp);
            return true;
        }, this);
    };
    GameEngine.prototype.update = function (timestamp) {
        var currentTime = egret.getTimer();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        this.rootGameObject.update(this.deltaTime);
        if (GameManager.getInstance().isStarted()) {
            GameManager.getInstance().onUpdate(this.deltaTime);
        }
    };
    GameEngine.prototype.getDeltaTime = function () {
        return this.deltaTime;
    };
    GameEngine.prototype.getStage = function () {
        return this.stage;
    };
    GameEngine.prototype.getRootGameObject = function () {
        return this.rootGameObject;
    };
    GameEngine.prototype.stop = function () {
        this.isRunning = false;
        this.rootGameObject.destroy();
    };
    GameEngine.prototype.isGameRunning = function () {
        return this.isRunning;
    };
    return GameEngine;
}(Component));
