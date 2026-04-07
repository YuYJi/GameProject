var GameObject = /** @class */ (function () {
    function GameObject(name) {
        if (name === void 0) { name = "GameObject"; }
        this.components = [];
        this.parent = null;
        this.children = [];
        this.id = GameObject.nextId++;
        this.name = name;
    }
    GameObject.prototype.getId = function () {
        return this.id;
    };
    GameObject.prototype.getName = function () {
        return this.name;
    };
    GameObject.prototype.setName = function (name) {
        this.name = name;
    };
    GameObject.prototype.addComponent = function (component) {
        if (this.components.indexOf(component) === -1) {
            this.components.push(component);
            if (this.isInitialized()) {
                component.init();
            }
        }
    };
    GameObject.prototype.getComponent = function (componentType) {
        return this.components.find(function (c) { return c instanceof componentType; });
    };
    GameObject.prototype.getComponents = function (componentType) {
        return this.components.filter(function (c) { return c instanceof componentType; });
    };
    GameObject.prototype.removeComponent = function (component) {
        var index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.destroy();
        }
    };
    GameObject.prototype.addChild = function (child) {
        if (this.children.indexOf(child) === -1) {
            if (child.parent) {
                child.parent.removeChild(child);
            }
            this.children.push(child);
            child.parent = this;
        }
    };
    GameObject.prototype.removeChild = function (child) {
        var index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    };
    GameObject.prototype.getChild = function (name) {
        return this.children.find(function (c) { return c.getName() === name; });
    };
    GameObject.prototype.getChildren = function () {
        return this.children;
    };
    GameObject.prototype.getParent = function () {
        return this.parent;
    };
    GameObject.prototype.isInitialized = function () {
        return this.components.some(function (c) { return c.isInitialized(); });
    };
    GameObject.prototype.init = function () {
        for (var _i = 0, _a = this.components; _i < _a.length; _i++) {
            var component = _a[_i];
            if (!component.isInitialized()) {
                component.init();
            }
        }
        for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
            var child = _c[_b];
            child.init();
        }
    };
    GameObject.prototype.update = function (deltaTime) {
        for (var _i = 0, _a = this.components; _i < _a.length; _i++) {
            var component = _a[_i];
            component.update(deltaTime);
        }
        for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
            var child = _c[_b];
            child.update(deltaTime);
        }
    };
    GameObject.prototype.destroy = function () {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.destroy();
        }
        this.children = [];
        for (var _b = 0, _c = this.components; _b < _c.length; _b++) {
            var component = _c[_b];
            component.destroy();
        }
        this.components = [];
    };
    GameObject.nextId = 0;
    return GameObject;
}());
