enum TerrainType {
    PLAIN = "plain",      // 平原（绿色）
    HILL = "hill",        // 浅丘（黄色）
    OBSTACLE = "obstacle", // 障碍（灰色）
    MUD = "mud",          // 泥泞（褐色）
    ROAD_MAIN = "road_main", // 大路（棕色粗线条）
    ROAD_SIDE = "road_side"  // 小路（棕色细线条）
}

enum BuildingType {
    TOWN = "town",        // 城镇
    SUPPLY_STATION = "supply_station", // 补给站
    RESOURCE_POINT = "resource_point", // 资源点
    ENEMY_BASE = "enemy_base" // 敌人据点
}

class MapNode {
    public x: number;
    public y: number;
    public terrain: TerrainType;
    public building: BuildingType | null = null;
    public isVisible: boolean = false;
    public isExplored: boolean = false;

    constructor(x: number, y: number, terrain: TerrainType) {
        this.x = x;
        this.y = y;
        this.terrain = terrain;
    }

    public canPass(): boolean {
        return this.terrain !== TerrainType.OBSTACLE;
    }

    public getMovementModifier(): number {
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
    }

    public getTerrainColor(): number {
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
    }
}

class MapComponent extends Component {
    private mapWidth: number = 414;
    private mapHeight: number = 896;
    private gridSize: number = 20;
    private map: MapNode[][];
    private stage: egret.Stage;
    private sprites: egret.Sprite[][];

    constructor(stage: egret.Stage) {
        super();
        this.stage = stage;
    }

    public onInit(): void {
        this.createMap();
        this.drawMap();
    }

    private createMap(): void {
        const width = Math.ceil(this.mapWidth / this.gridSize);
        const height = Math.ceil(this.mapHeight / this.gridSize);
        this.map = [];
        this.sprites = [];

        for (let x = 0; x < width; x++) {
            this.map[x] = [];
            this.sprites[x] = [];
            for (let y = 0; y < height; y++) {
                let terrain: TerrainType;
                
                // 基于位置和距离生成更有规律的地形
                const distanceToCenter = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
                
                if (distanceToCenter < 3) {
                    // 中心区域设置为平原
                    terrain = TerrainType.PLAIN;
                } else if (distanceToCenter < 6) {
                    // 中间区域设置为浅丘
                    terrain = TerrainType.HILL;
                } else if (distanceToCenter < 9) {
                    // 外围区域设置为泥泞
                    terrain = TerrainType.MUD;
                } else {
                    // 最外围设置为平原
                    terrain = TerrainType.PLAIN;
                }

                this.map[x][y] = new MapNode(x, y, terrain);
            }
        }

        this.placeBuildings();
        this.createRoads();
        this.createResourcePoints();
    }

    private placeBuildings(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        this.map[2][2].building = BuildingType.TOWN;
        this.map[width - 3][height - 3].building = BuildingType.TOWN;
        this.map[Math.floor(width / 2)][Math.floor(height / 2)].building = BuildingType.SUPPLY_STATION;

        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (this.map[x][y].terrain !== TerrainType.OBSTACLE && !this.map[x][y].building) {
                this.map[x][y].building = BuildingType.RESOURCE_POINT;
            }
        }

        for (let i = 0; i < 2; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (this.map[x][y].terrain !== TerrainType.OBSTACLE && !this.map[x][y].building) {
                this.map[x][y].building = BuildingType.ENEMY_BASE;
            }
        }
    }

    private createRoads(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        const towns: {x: number, y: number}[] = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (this.map[x][y].building === BuildingType.TOWN) {
                    towns.push({x, y});
                }
            }
        }

        const supplyStation = {x: Math.floor(width / 2), y: Math.floor(height / 2)};

        for (const town of towns) {
            this.createRoadBetween(town.x, town.y, supplyStation.x, supplyStation.y);
        }
    }

    private createRoadBetween(x1: number, y1: number, x2: number, y2: number): void {
        let x = x1;
        let y = y1;

        while (x !== x2 || y !== y2) {
            if (x < x2) {
                x++;
            } else if (x > x2) {
                x--;
            } else if (y < y2) {
                y++;
            } else if (y > y2) {
                y--;
            }

            if (x >= 0 && x < this.map.length && y >= 0 && y < this.map[0].length) {
                if (this.map[x][y].terrain !== TerrainType.OBSTACLE && !this.map[x][y].building) {
                    this.map[x][y].terrain = Math.random() < 0.5 ? TerrainType.ROAD_MAIN : TerrainType.ROAD_SIDE;
                }
            }
        }
    }

    private createResourcePoints(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (this.map[x][y].terrain !== TerrainType.OBSTACLE && !this.map[x][y].building) {
                this.map[x][y].building = BuildingType.RESOURCE_POINT;
            }
        }
    }

    private drawMap(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const node = this.map[x][y];
                const sprite = new egret.Sprite();
                
                sprite.graphics.beginFill(node.getTerrainColor());
                sprite.graphics.drawRect(0, 0, this.gridSize, this.gridSize);
                sprite.graphics.endFill();
                
                if (node.terrain === TerrainType.ROAD_MAIN) {
                    sprite.graphics.beginFill(0x8B4513, 0.5);
                    sprite.graphics.drawRect(5, 5, this.gridSize - 10, this.gridSize - 10);
                    sprite.graphics.endFill();
                } else if (node.terrain === TerrainType.ROAD_SIDE) {
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
    }

    private drawBuilding(sprite: egret.Sprite, buildingType: BuildingType): void {
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
    }

    public getMap(): MapNode[][] {
        return this.map;
    }

    public getMapWidth(): number {
        return this.mapWidth;
    }

    public getMapHeight(): number {
        return this.mapHeight;
    }

    public getGridSize(): number {
        return this.gridSize;
    }

    public updateVisibility(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const node = this.map[x][y];
                const sprite = this.sprites[x][y];
                
                if (node.isVisible) {
                    sprite.alpha = 1.0;
                } else if (node.isExplored) {
                    sprite.alpha = 0.5;
                } else {
                    sprite.alpha = 0.3;
                }
            }
        }
    }

    public onDestroy(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const sprite = this.sprites[x][y];
                if (sprite && sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
            }
        }
    }
}
