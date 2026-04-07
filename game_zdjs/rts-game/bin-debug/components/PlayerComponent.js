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
var PlayerComponent = /** @class */ (function (_super) {
    __extends(PlayerComponent, _super);
    function PlayerComponent(playerId, name) {
        var _this = _super.call(this) || this;
        _this.population = 0;
        _this.maxPopulation = 20;
        _this.playerId = playerId;
        _this.name = name;
        return _this;
    }
    PlayerComponent.prototype.getPlayerId = function () {
        return this.playerId;
    };
    PlayerComponent.prototype.getName = function () {
        return this.name;
    };
    PlayerComponent.prototype.getPopulation = function () {
        return this.population;
    };
    PlayerComponent.prototype.getMaxPopulation = function () {
        return this.maxPopulation;
    };
    PlayerComponent.prototype.addPopulation = function (amount) {
        if (this.population + amount <= this.maxPopulation) {
            this.population += amount;
            return true;
        }
        return false;
    };
    PlayerComponent.prototype.removePopulation = function (amount) {
        if (this.population >= amount) {
            this.population -= amount;
            return true;
        }
        return false;
    };
    PlayerComponent.prototype.setMaxPopulation = function (maxPopulation) {
        this.maxPopulation = maxPopulation;
    };
    return PlayerComponent;
}(Component));
