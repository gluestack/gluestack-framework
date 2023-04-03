var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "child_process"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tsc = void 0;
    const child_process_1 = require("child_process");
    const tsc = () => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const _spawn = (0, child_process_1.spawn)('tsc', ['-v'], process.platform === 'win32'
                ? { shell: true }
                : { shell: false });
            _spawn.on('error', () => {
                reject(`"TYPESCRIPT" is installed?`);
            });
            _spawn.stdout.on('data', (data) => {
                const version = data
                    .toString()
                    .replace(/[^\d.]/g, '')
                    .replace(/\.\d+/g, '');
                if (version < '4') {
                    reject(`"TYPESCRIPT" version must be greater than or equal to 4`);
                }
                else {
                    resolve(`"TYPESCRIPT" is installed?`);
                }
            });
            _spawn.on('exit', (result) => {
                if (result) {
                    reject(`"TYPESCRIPT" is installed?`);
                }
            });
        });
    });
    exports.tsc = tsc;
});
