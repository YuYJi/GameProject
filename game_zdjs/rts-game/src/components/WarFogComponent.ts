class WarFogComponent extends Component {
    private map: MapNode[][];
    private stage: egret.Stage;
    private fogSprites: egret.Sprite[][];
    private gridSize: number = 40;
    private visionLossTimer: Map<string, number> = new Map();
    private visionLossDelay: number = 10000; // 10秒

    constructor(stage: egret.Stage, map: MapNode[][]) {
        super();
        this.stage = stage;
        this.map = map;
    }

    public onInit(): void {
        this.createFog();
    }

    private createFog(): void {
        const width = this.map.length;
        const height = this.map[0].length;
        this.fogSprites = [];

        for (let x = 0; x < width; x++) {
            this.fogSprites[x] = [];
            for (let y = 0; y < height; y++) {
                const sprite = new egret.Sprite();
                sprite.graphics.beginFill(0x000000, 0.8);
                sprite.graphics.drawRect(0, 0, this.gridSize, this.gridSize);
                sprite.graphics.endFill();
                sprite.x = x * this.gridSize;
                sprite.y = y * this.gridSize;
                this.stage.addChild(sprite);
                this.fogSprites[x][y] = sprite;
            }
        }
    }

    public updateVision(units: UnitComponent[]): void {
        this.resetVision();
        this.calculateVision(units);
        this.updateFog();
        this.checkVisionLoss();
    }

    public updateHeroVision(hero: PlayerHeroComponent): void {
        this.resetVision();
        this.calculateHeroVision(hero);
        this.updateBuildingVision();
        this.updateFog();
        this.checkVisionLoss();
    }

    private calculateHeroVision(hero: PlayerHeroComponent): void {
        const x = Math.floor(hero.getX());
        const y = Math.floor(hero.getY());
        const visionRange = hero.getVisionRange();
        this.updateUnitVision(x, y, visionRange);
    }

    private resetVision(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.map[x][y].isVisible = false;
            }
        }
    }

    private calculateVision(units: UnitComponent[]): void {
        for (const unit of units) {
            if (unit.getPlayerId() === 0) {
                const x = Math.floor(unit.getX());
                const y = Math.floor(unit.getY());
                const visionRange = unit.getVisionRange();
                this.updateUnitVision(x, y, visionRange);
            }
        }

        this.updateBuildingVision();
    }

    private updateUnitVision(centerX: number, centerY: number, range: number): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let x = Math.max(0, centerX - range); x <= Math.min(width - 1, centerX + range); x++) {
            for (let y = Math.max(0, centerY - range); y <= Math.min(height - 1, centerY + range); y++) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (distance <= range) {
                    this.map[x][y].isVisible = true;
                    this.map[x][y].isExplored = true;
                    this.visionLossTimer.delete(`${x},${y}`);
                }
            }
        }
    }

    private updateBuildingVision(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const node = this.map[x][y];
                if (node.building === BuildingType.TOWN || node.building === BuildingType.SUPPLY_STATION) {
                    this.updateUnitVision(x, y, 8); // 建筑视野半径8格
                }
            }
        }
    }

    private updateFog(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const node = this.map[x][y];
                const sprite = this.fogSprites[x][y];
                
                if (node.isVisible) {
                    sprite.alpha = 0;
                } else if (node.isExplored) {
                    sprite.alpha = 0.5;
                } else {
                    sprite.alpha = 0.8;
                }
            }
        }
    }

    private checkVisionLoss(): void {
        const width = this.map.length;
        const height = this.map[0].length;
        const currentTime = egret.getTimer();

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const node = this.map[x][y];
                const key = `${x},${y}`;
                
                if (!node.isVisible && node.isExplored) {
                    if (!this.visionLossTimer.has(key)) {
                        this.visionLossTimer.set(key, currentTime);
                    } else {
                        const startTime = this.visionLossTimer.get(key);
                        if (currentTime - startTime >= this.visionLossDelay) {
                            node.isExplored = false;
                            this.visionLossTimer.delete(key);
                        }
                    }
                }
            }
        }
    }

    public onUpdate(deltaTime: number): void {
        this.updateFog();
        this.checkVisionLoss();
    }

    public onDestroy(): void {
        const width = this.map.length;
        const height = this.map[0].length;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const sprite = this.fogSprites[x][y];
                if (sprite && sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
            }
        }
    }
}
