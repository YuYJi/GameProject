class GameObject {
    private static nextId: number = 0;
    private id: number;
    private name: string;
    private components: Component[] = [];
    private parent: GameObject = null;
    private children: GameObject[] = [];

    constructor(name: string = "GameObject") {
        this.id = GameObject.nextId++;
        this.name = name;
    }

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public addComponent(component: Component): void {
        if (this.components.indexOf(component) === -1) {
            this.components.push(component);
            if (this.isInitialized()) {
                component.init();
            }
        }
    }

    public getComponent<T extends Component>(componentType: new () => T): T {
        return this.components.find(c => c instanceof componentType) as T;
    }

    public getComponents<T extends Component>(componentType: new () => T): T[] {
        return this.components.filter(c => c instanceof componentType) as T[];
    }

    public removeComponent(component: Component): void {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.destroy();
        }
    }

    public addChild(child: GameObject): void {
        if (this.children.indexOf(child) === -1) {
            if (child.parent) {
                child.parent.removeChild(child);
            }
            this.children.push(child);
            child.parent = this;
        }
    }

    public removeChild(child: GameObject): void {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    public getChild(name: string): GameObject {
        return this.children.find(c => c.getName() === name);
    }

    public getChildren(): GameObject[] {
        return this.children;
    }

    public getParent(): GameObject {
        return this.parent;
    }

    private isInitialized(): boolean {
        return this.components.some(c => c.isInitialized());
    }

    public init(): void {
        for (const component of this.components) {
            if (!component.isInitialized()) {
                component.init();
            }
        }
        for (const child of this.children) {
            child.init();
        }
    }

    public update(deltaTime: number): void {
        for (const component of this.components) {
            component.update(deltaTime);
        }
        for (const child of this.children) {
            child.update(deltaTime);
        }
    }

    public destroy(): void {
        for (const child of this.children) {
            child.destroy();
        }
        this.children = [];
        for (const component of this.components) {
            component.destroy();
        }
        this.components = [];
    }
}
