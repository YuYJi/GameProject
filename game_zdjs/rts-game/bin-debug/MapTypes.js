var ResourceType;
(function (ResourceType) {
    ResourceType["WOOD"] = "wood";
    ResourceType["FOOD"] = "food";
    ResourceType["GOLD"] = "gold";
})(ResourceType || (ResourceType = {}));
var BuildingType;
(function (BuildingType) {
    BuildingType["BASE"] = "base";
    BuildingType["BARRACKS"] = "barracks";
})(BuildingType || (BuildingType = {}));
var GridNode = /** @class */ (function () {
    function GridNode(x, y, size) {
        this.resource = null;
        this.building = null;
        this.x = x;
        this.y = y;
        this.size = size;
    }
    return GridNode;
}());
var ResourceNode = /** @class */ (function () {
    function ResourceNode(x, y, type, amount) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.amount = amount;
    }
    ResourceNode.prototype.draw = function (stage) {
        this.sprite = new egret.Sprite();
        var color;
        switch (this.type) {
            case ResourceType.WOOD:
                color = 0x8B4513;
                break;
            case ResourceType.FOOD:
                color = 0x00FF00;
                break;
            case ResourceType.GOLD:
                color = 0xFFD700;
                break;
        }
        this.sprite.graphics.beginFill(color);
        this.sprite.graphics.drawCircle(20, 20, 15);
        this.sprite.graphics.endFill();
        this.sprite.x = this.x * 40;
        this.sprite.y = this.y * 40;
        stage.addChild(this.sprite);
    };
    return ResourceNode;
}());
var BuildingNode = /** @class */ (function () {
    function BuildingNode(x, y, type, playerId) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.playerId = playerId;
    }
    BuildingNode.prototype.draw = function (stage) {
        this.sprite = new egret.Sprite();
        var color = this.playerId === 0 ? 0x0000FF : 0xFF0000;
        this.sprite.graphics.beginFill(color);
        this.sprite.graphics.drawRect(0, 0, 40, 40);
        this.sprite.graphics.endFill();
        this.sprite.x = this.x * 40;
        this.sprite.y = this.y * 40;
        stage.addChild(this.sprite);
    };
    return BuildingNode;
}());
