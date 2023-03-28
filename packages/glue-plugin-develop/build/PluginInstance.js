(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PluginInstance = void 0;
    class PluginInstance {
        constructor(app, callerPlugin, name, gluePluginStore, installationPath) {
            this.isOfTypeInstance = false;
            this.app = app;
            this.name = name;
            this.callerPlugin = callerPlugin;
            this.gluePluginStore = gluePluginStore;
            this.installationPath = installationPath;
        }
        init() {
            //
        }
        destroy() {
            //
        }
        getName() {
            return this.name;
        }
        getCallerPlugin() {
            return this.callerPlugin;
        }
        getInstallationPath() {
            return this.installationPath;
        }
        watch() {
            return [
                'pages',
                'public',
                'styles',
                'components'
            ];
        }
    }
    exports.PluginInstance = PluginInstance;
});
