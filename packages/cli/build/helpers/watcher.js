var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "chokidar"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const chokidar_1 = __importDefault(require("chokidar"));
    const watcher = {
        watch: (cwd, pattern, callback) => {
            const globs = typeof pattern === 'string' ? [pattern] : pattern;
            console.log(`Watching ${cwd} for changes...`);
            console.log(globs);
            try {
                chokidar_1.default
                    .watch(globs, {
                    persistent: true,
                    cwd: cwd,
                    ignored: [
                        '**/node_modules/**',
                        '**/dist/**',
                        '**/build/**',
                        '**/.next/**',
                    ],
                })
                    .on('all', (event, path) => __awaiter(void 0, void 0, void 0, function* () { return console.log('>> here'); }));
                if (callback)
                    callback();
            }
            catch (err) {
                console.log('> error', err);
            }
        },
    };
    exports.default = watcher;
});
