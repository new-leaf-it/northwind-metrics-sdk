/**
 * copied from the TypeScript handbook; joins two or more class declarations
 * @see https://blog.logrocket.com/typescript-mixins-examples-and-use-cases/
 * @param derivedCtor
 * @param constructors
 */
export function applyMixins(derivedCtor: any, constructors: any[]) {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                Object.create(null)
            );
        });
    });
}
