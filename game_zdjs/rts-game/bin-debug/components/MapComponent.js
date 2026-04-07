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
var TerrainType;
(function (TerrainType) {
    TerrainType["PLAIN"] = "plain";
    TerrainType["HILL"] = "hill";
    TerrainType["OBSTACLE"] = "obstacle";
    TerrainType["MUD"] = "mud";
    TerrainType["ROAD_MAIN"] = "road_main";
    TerrainType["ROAD_SIDE"] = "road_side"; // 小路（棕色细线条）
})(TerrainType || (TerrainType = {}));
var BuildingType;
(function (BuildingType) {
    BuildingType["TOWN"] = "town";
    BuildingType["SUPPLY_STATION"] = "supply_station";
    BuildingType["RESOURCE_POINT"] = "resource_point";
    BuildingType["ENEMY_BASE"] = "enemy_base"; // 敌人据点
})(BuildingType || (BuildingType = {}));
var MapNode = /** @class */ (function () {
    function MapNode(x, y, terrain) {
        this.building = null;
        this.isVisible = false;
        this.isExplored = false;
        this.x = x;
        this.y = y;
        this.terrain = terrain;
    }
    MapNode.prototype.canPass = function () {
        return this.terrain !== TerrainType.OBSTACLE;
    };
    MapNode.prototype.getMovementModifier = function () {
        switch (this.terrain) {
            case TerrainType.PLAIN:
                return 1.0;
            case TerrainType.HILL:
                return 1.0;
            case TerrainType.MUD:
                return 0.7; // 降低30%
            case TerrainType.ROAD_MAIN:
            case TerrainType.ROAD_SIDE:
                return 1.2; // 提升20%
            default:
                return 1.0;
        }
    };
    MapNode.prototype.getTerrainColor = function () {
        switch (this.terrain) {
            case TerrainType.PLAIN:
                return 0x00FF00;
            case TerrainType.HILL:
                return 0xFFFF00;
            case TerrainType.OBSTACLE:
                return 0x888888;
            case TerrainType.MUD:
                return 0x8B4513;
            case TerrainType.ROAD_MAIN:
                return 0xA0522D;
            case TerrainType.ROAD_SIDE:
                return 0xCD853F;
            default:
                return 0xCCCCCC;
        }
    };
    return MapNode;
}());
var MapComponent = /** @class */ (function (_super) {
    __extends(MapComponent, _super);
    function MapComponent(stage) {
        var _this = _super.call(this) || this;
        _this.mapWidth = 414;
        _this.mapHeight = 896;
        _this.gridSize = 20;
        _this.stage = stage;
        return _this;
    }
    MapComponent.prototype.onInit = function () {
        this.createMap();
        this.drawMap();
    };
    MapComponent.prototype.createMap = function () {
        var width = Math.ceil(this.mapWidth / this.gridSize);
        var height = Math.ceil(this.mapHeight / this.gridSize);
        this.map = [];
        this.sprites = [];
        for (var x = 0; x < width; x++) {
            this.map[x] = [];
            this.sprites[x] = [];
            for (var y = 0; y < height; y++) {
                var terrain = void 0;
                // 基于位置和距离生成更有规律的地形
                var distanceToCenter = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
                if (distanceToCenter < 3) {
                    // 中心区域设置为平原
                    terrain = TerrainType.PLAIN;
                }
                else if (distanceToCenter < 6) {
                    // 中间区域设置为浅丘
                    terrain = TerrainType.HILL;
                }
                else if (distanceToCenter < 9) {
                    // 外围区域设置为泥泞
                    terrain = TerrainType.MUD;
                }
                else {
                    // 最外围设置为平原
                    terrain = TerrainType.PLAIN;
                }
                this.map[x][y] = new MapNode(x, y, terrain);
            }
        }
        this.placeBuildings();
        this.createRoads();
        this.createResourcePoints();
    };
    MapComponent.prototype.placeBuildings = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        this.map[2][2].building = BuildingType.TOWN;
        this.map[width - 3][height - 3].building = BuildingType.TOWN;
        this.map[Math.floor(width / 2)][Math.floor(height / 2)].building = BuildingType.SUPPLY_STATION;
        for (var i = 0; i < 3; i++) {
            var x = Math.floor(Math.random() * width);
            var y = Math.floor(Math.random() * height);
            if (this.map[x][y].terrain !== TerrainType.OBSTACLE && !this.map[x][y].building) {
                this.map[x][y].building = BuildingType.RESOURCE_POINT;
            }
        }
        for (var i = 0; i < 2; i++) {
            var x = Math.floor(Math.random() * width);
            var y = Math.floor(Math.random() * height);
            if (this.map[x][y].terrain !== TerrainType.OBSTACLE && !this.map[x][y].building) {
                this.map[x][y].building = BuildingType.ENEMY_BASE;
            }
        }
    };
    MapComponent.prototype.createRoads = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        var towns = [];
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                if (this.map[x][y].building === BuildingType.TOWN) {
                    towns.push({ x: x, y: y });
                }
            }
        }
        var supplyStation = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
        for (var _i = 0, towns_1 = towns; _i < towns_1.length; _i++) {
            var town = towns_1[_i];
            this.createRoadBetween(town.x, town.y, supplyStation.x, supplyStation.y);
        }
    };
    MapComponent.prototype.createRoadBetween = function (x1, y1, x2, y2) {
        var x = x1;
        var y = y1;
        while (x !== x2 || y !== y2) {
            if (x < x2) {
                x++;
            }
            else if (x > x2) {
                x--;
            }
            else if (y < y2) {
                y++;
            }
            else if (y > y2) {
                y--;
            }
            if (x >= 0 && x < this.map.length && y >= 0 && y < this.map[0].length) {
                if (this.map[x][y].terrain !== TerrainType.OBSTACLE && !this.map[x][y].building) {
                    this.map[x][y].terrain = Math.random() < 0.5 ? TerrainType.ROAD_MAIN : TerrainType.ROAD_SIDE;
                }
            }
        }
    };
    MapComponent.prototype.createResourcePoints = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var i = 0; i < 8; i++) {
            var x = Math.floor(Math.random() * width);
            var y = Math.floor(Math.random() * height);
            if (this.map[x][y].terrain !== TerrainType.OBSTACLE && !this.map[x][y].building) {
                this.map[x][y].building = BuildingType.RESOURCE_POINT;
            }
        }
    };
    MapComponent.prototype.drawMap = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var node = this.map[x][y];
                var sprite = new egret.Sprite();
                sprite.graphics.beginFill(node.getTerrainColor());
                sprite.graphics.drawRect(0, 0, this.gridSize, this.gridSize);
                sprite.graphics.endFill();
                if (node.terrain === TerrainType.ROAD_MAIN) {
                    sprite.graphics.beginFill(0x8B4513, 0.5);
                    sprite.graphics.drawRect(5, 5, this.gridSize - 10, this.gridSize - 10);
                    sprite.graphics.endFill();
                }
                else if (node.terrain === TerrainType.ROAD_SIDE) {
                    sprite.graphics.beginFill(0xCD853F, 0.5);
                    sprite.graphics.drawRect(10, 10, this.gridSize - 20, this.gridSize - 20);
                    sprite.graphics.endFill();
                }
                if (node.building) {
                    this.drawBuilding(sprite, node.building);
                }
                sprite.x = x * this.gridSize;
                sprite.y = y * this.gridSize;
                this.stage.addChild(sprite);
                this.sprites[x][y] = sprite;
            }
        }
    };
    MapComponent.prototype.drawBuilding = function (sprite, buildingType) {
        switch (buildingType) {
            case BuildingType.TOWN:
                sprite.graphics.beginFill(0xFF0000);
                sprite.graphics.drawRect(10, 10, 20, 20);
                sprite.graphics.endFill();
                break;
            case BuildingType.SUPPLY_STATION:
                sprite.graphics.beginFill(0x00FFFF);
                sprite.graphics.drawCircle(20, 20, 10);
                sprite.graphics.endFill();
                break;
            case BuildingType.RESOURCE_POINT:
                sprite.graphics.beginFill(0xFFD700);
                sprite.graphics.drawRect(15, 15, 10, 10);
                sprite.graphics.endFill();
                break;
            case BuildingType.ENEMY_BASE:
                sprite.graphics.beginFill(0x800080);
                sprite.graphics.drawRect(5, 5, 30, 30);
                sprite.graphics.endFill();
                break;
        }
    };
    MapComponent.prototype.getMap = function () {
        return this.map;
    };
    MapComponent.prototype.getMapWidth = function () {
        return this.mapWidth;
    };
    MapComponent.prototype.getMapHeight = function () {
        return this.mapHeight;
    };
    MapComponent.prototype.getGridSize = function () {
        return this.gridSize;
    };
    MapComponent.prototype.updateVisibility = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var node = this.map[x][y];
                var sprite = this.sprites[x][y];
                if (node.isVisible) {
                    sprite.alpha = 1.0;
                }
                else if (node.isExplored) {
                    sprite.alpha = 0.5;
                }
                else {
                    sprite.alpha = 0.3;
                }
            }
        }
    };
    MapComponent.prototype.onDestroy = function () {
        var width = this.map.length;
        var height = this.map[0].length;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var sprite = this.sprites[x][y];
                if (sprite && sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
            }
        }
    };
    return MapComponent;
}(Component));
