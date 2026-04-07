class PlayerComponent extends Component {
    private playerId: number;
    private name: string;
    private population: number = 0;
    private maxPopulation: number = 20;

    constructor(playerId: number, name: string) {
        super();
        this.playerId = playerId;
        this.name = name;
    }

    public getPlayerId(): number {
        return this.playerId;
    }

    public getName(): string {
        return this.name;
    }

    public getPopulation(): number {
        return this.population;
    }

    public getMaxPopulation(): number {
        return this.maxPopulation;
    }

    public addPopulation(amount: number): boolean {
        if (this.population + amount <= this.maxPopulation) {
            this.population += amount;
            return true;
        }
        return false;
    }

    public removePopulation(amount: number): boolean {
        if (this.population >= amount) {
            this.population -= amount;
            return true;
        }
        return false;
    }

    public setMaxPopulation(maxPopulation: number): void {
        this.maxPopulation = maxPopulation;
    }
}
