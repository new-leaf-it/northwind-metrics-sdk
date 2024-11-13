"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMixins = applyMixins;
/**
 * copied from the TypeScript handbook; joins two or more class declarations
 * @see https://blog.logrocket.com/typescript-mixins-examples-and-use-cases/
 * @param derivedCtor
 * @param constructors
 */
function applyMixins(derivedCtor, constructors) {
    constructors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                Object.create(null));
        });
    });
}
