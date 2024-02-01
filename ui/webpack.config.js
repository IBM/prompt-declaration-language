const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/pdl_viewer.js',
    output: {
        environment: {
            // The environment supports arrow functions ('() => { ... }').
            arrowFunction: true,
            // The environment supports async function and await ('async function () { await ... }').
            asyncFunction: true,
            // The environment supports BigInt as literal (123n).
            bigIntLiteral: false,
            // The environment supports const and let for variable declarations.
            const: true,
            // The environment supports destructuring ('{ a, b } = obj').
            destructuring: true,
            // The environment supports an async import() function to import EcmaScript modules.
            dynamicImport: false,
            // The environment supports an async import() when creating a worker, only for web targets at the moment.
            dynamicImportInWorker: false,
            // The environment supports 'for of' iteration ('for (const x of array) { ... }').
            forOf: true,
            // The environment supports 'globalThis'.
            globalThis: true,
            // The environment supports ECMAScript Module syntax to import ECMAScript modules (import ... from '...').
            module: false,
            // The environment supports optional chaining ('obj?.a' or 'obj?.()').
            optionalChaining: true,
            // The environment supports template literals.
            templateLiteral: true,
        },
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: 'pdl_viewer'
    },
};