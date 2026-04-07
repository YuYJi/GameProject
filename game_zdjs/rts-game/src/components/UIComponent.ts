class UIComponent extends Component {
    private stage: egret.Stage;
    private unitComponents: UnitComponent[] = [];
    private resourceComponent: ResourceComponent;
    private playerHero: PlayerHeroComponent;
    private trainingButtons: egret.TextField[] = [];
    private populationText: egret.TextField;

    constructor(stage: egret.Stage) {
        super();
        this.stage = stage;
    }

    public onInit(): void {
        this.createUI();
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMapClick, this);
    }

    private createUI(): void {
        this.createTrainingButtons();
        this.createPopulationDisplay();
    }

    private createTrainingButtons(): void {
        const buttonWidth = 100;
        const buttonHeight = 40;
        const spacing = 10;
        const startX = 10;
        const startY = 50;

        const infantryButton = this.createButton("训练步兵", startX, startY, buttonWidth, buttonHeight, 0x00AA00);
        infantryButton.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.trainUnit(UnitType.INFANTRY), this);
        this.trainingButtons.push(infantryButton);

        const archerButton = this.createButton("训练弓兵", startX, startY + buttonHeight + spacing, buttonWidth, buttonHeight, 0x0000FF);
        archerButton.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.trainUnit(UnitType.ARCHER), this);
        this.trainingButtons.push(archerButton);

        const cavalryButton = this.createButton("训练骑兵", startX, startY + (buttonHeight + spacing) * 2, buttonWidth, buttonHeight, 0xFF0000);
        cavalryButton.addEventListener(egret.TouchEvent.TOUCH_TAP, () => this.trainUnit(UnitType.CAVALRY), this);
        this.trainingButtons.push(cavalryButton);
    }

    private createButton(text: string, x: number, y: number, width: number, height: number, color: number): egret.TextField {
        const button = new egret.TextField();
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
    }

    private createPopulationDisplay(): void {
        this.populationText = new egret.TextField();
        this.populationText.text = "人口: 0/0";
        this.populationText.size = 16;
        this.populationText.textColor = 0xFFFFFF;
        this.populationText.x = 120;
        this.populationText.y = 10;
        this.stage.addChild(this.populationText);
    }

    private onMapClick(event: egret.TouchEvent): void {
        const map = GameManager.getInstance().getMapComponent().getMap();
        const gridSize = GameManager.getInstance().getMapComponent().getGridSize();
        const x = Math.floor(event.localX / gridSize);
        const y = Math.floor(event.localY / gridSize);

        if (x >= 0 && x < map.length && y >= 0 && y < map[0].length) {
            const node = map[x][y];
            if (node.canPass()) {
                this.movePlayerHero(x, y);
            }
        }
    }

    private movePlayerHero(x: number, y: number): void {
        if (this.playerHero) {
            this.playerHero.moveTo(x, y);
        }
    }

    private trainUnit(type: UnitType): void {
        GameManager.getInstance().trainUnit(type);
    }

    public setUnitComponents(units: UnitComponent[]): void {
        this.unitComponents = units;
    }

    public setPlayerHero(hero: PlayerHeroComponent): void {
        this.playerHero = hero;
    }

    public setResourceComponent(resource: ResourceComponent): void {
        this.resourceComponent = resource;
    }

    public onUpdate(deltaTime: number): void {
        this.updatePopulationDisplay();
    }

    private updatePopulationDisplay(): void {
        if (this.populationText) {
            const population = GameManager.getInstance().getPopulation();
            const maxPopulation = GameManager.getInstance().getMaxPopulation();
            this.populationText.text = `人口: ${population}/${maxPopulation}`;
        }
    }

    public onDestroy(): void {
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onMapClick, this);
        for (const button of this.trainingButtons) {
            if (button.parent) {
                button.parent.removeChild(button);
            }
        }
        if (this.populationText && this.populationText.parent) {
            this.populationText.parent.removeChild(this.populationText);
        }
    }
}
