enum AIDifficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}

class AIComponent extends Component {
    private stage: egret.Stage;
    private map: MapNode[][];
    private enemyUnits: UnitComponent[];
    private playerUnits: UnitComponent[];
    private difficulty: AIDifficulty;
    private lastActionTime: number = 0;
    private actionCooldown: number = 2000;
    private resourceGathered: number = 0;

    constructor(stage: egret.Stage, map: MapNode[][], difficulty: AIDifficulty) {
        super();
        this.stage = stage;
        this.map = map;
        this.difficulty = difficulty;
        this.enemyUnits = [];
        this.playerUnits = [];
    }

    public onInit(): void {
        this.lastActionTime = egret.getTimer();
    }

    public setEnemyUnits(units: UnitComponent[]): void {
        this.enemyUnits = units;
    }

    public setPlayerUnits(units: UnitComponent[]): void {
        this.playerUnits = units;
    }

    public onUpdate(deltaTime: number): void {
        const currentTime = egret.getTimer();
        if (currentTime - this.lastActionTime >= this.actionCooldown) {
            this.performAction();
            this.lastActionTime = currentTime;
        }
    }

    private performAction(): void {
        switch (this.difficulty) {
            case AIDifficulty.EASY:
                this.performEasyAction();
                break;
            case AIDifficulty.MEDIUM:
                this.performMediumAction();
                break;
            case AIDifficulty.HARD:
                this.performHardAction();
                break;
        }
    }

    private performEasyAction(): void {
        if (this.enemyUnits.length < 10) {
            this.trainUnit(UnitType.INFANTRY);
        }
        this.moveUnitsToNearestPlayer();
    }

    private performMediumAction(): void {
        if (this.enemyUnits.length < 15) {
            const rand = Math.random();
            if (rand < 0.7) {
                this.trainUnit(UnitType.INFANTRY);
            } else {
                this.trainUnit(UnitType.ARCHER);
            }
        }
        if (this.enemyUnits.length >= 10) {
            this.attackPlayerBase();
        } else {
            this.moveUnitsToNearestPlayer();
        }
    }

    private performHardAction(): void {
        if (this.enemyUnits.length < 20) {
            const rand = Math.random();
            if (rand < 0.4) {
                this.trainUnit(UnitType.INFANTRY);
            } else if (rand < 0.8) {
                this.trainUnit(UnitType.ARCHER);
            } else {
                this.trainUnit(UnitType.CAVALRY);
            }
        }
        this.attackPlayerBase();
        this.scoutMap();
    }

    private trainUnit(type: UnitType): void {
        const rootGameObject = GameManager.getInstance().getGameEngine().getRootGameObject();
        const unitGameObject = new GameObject("EnemyUnit" + this.enemyUnits.length);
        const unitComponent = new UnitComponent(type, 1, this.getEnemyBaseX(), this.getEnemyBaseY(), this.stage, this.map);
        unitGameObject.addComponent(unitComponent);
        this.enemyUnits.push(unitComponent);
        rootGameObject.addChild(unitGameObject);
    }

    private moveUnitsToNearestPlayer(): void {
        for (const unit of this.enemyUnits) {
            const nearestPlayer = this.findNearestPlayer(unit);
            if (nearestPlayer) {
                unit.moveTo(nearestPlayer.getX(), nearestPlayer.getY());
            }
        }
    }

    private attackPlayerBase(): void {
        for (const unit of this.enemyUnits) {
            unit.moveTo(4, 8); // 玩家基地位置
        }
    }

    private scoutMap(): void {
        if (this.enemyUnits.length > 5) {
            const cavalryUnit = this.enemyUnits.find(unit => unit.getType() === UnitType.CAVALRY);
            if (cavalryUnit) {
                const randomX = Math.floor(Math.random() * this.map.length);
                const randomY = Math.floor(Math.random() * this.map[0].length);
                cavalryUnit.moveTo(randomX, randomY);
            }
        }
    }

    private findNearestPlayer(unit: UnitComponent): UnitComponent | null {
        let nearestPlayer: UnitComponent | null = null;
        let minDistance = Infinity;

        for (const playerUnit of this.playerUnits) {
            const dx = playerUnit.getX() - unit.getX();
            const dy = playerUnit.getY() - unit.getY();
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPlayer = playerUnit;
            }
        }

        return nearestPlayer;
    }

    private getEnemyBaseX(): number {
        return this.map.length - 5;
    }

    private getEnemyBaseY(): number {
        return this.map[0].length - 5;
    }

    public onDestroy(): void {
    }
}
