var Component = /** @class */ (function () {
    function Component() {
        this.enabled = true;
        this.initialized = false;
    }
    Component.prototype.init = function () {
        this.initialized = true;
        this.onInit();
    };
    Component.prototype.update = function (deltaTime) {
        if (!this.enabled || !this.initialized)
            return;
        this.onUpdate(deltaTime);
    };
    Component.prototype.destroy = function () {
        this.onDestroy();
        this.initialized = false;
    };
    Component.prototype.setEnabled = function (enabled) {
        this.enabled = enabled;
    };
    Component.prototype.isEnabled = function () {
        return this.enabled;
    };
    Component.prototype.isInitialized = function () {
        return this.initialized;
    };
    Component.prototype.onInit = function () { };
    Component.prototype.onUpdate = function (deltaTime) { };
    Component.prototype.onDestroy = function () { };
    return Component;
}());
