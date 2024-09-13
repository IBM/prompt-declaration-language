var pdl_viewer;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/pdl_ast_utils.ts":
/*!******************************!*\
  !*** ./src/pdl_ast_utils.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.iter_blocks = exports.iter_block_children = exports.map_blocks = exports.map_block_children = void 0;
const ts_pattern_1 = __webpack_require__(/*! ts-pattern */ "./node_modules/ts-pattern/dist/index.cjs");
function map_block_children(f, block) {
    if (typeof block === 'number' || typeof block === 'string') {
        return block;
    }
    let new_block;
    if ((block === null || block === void 0 ? void 0 : block.defs) === undefined) {
        new_block = { ...block };
    }
    else {
        const defs = {};
        for (const x in block.defs) {
            defs[x] = map_blocks(f, block.defs[x]);
        }
        new_block = { ...block, defs: defs };
    }
    new_block = (0, ts_pattern_1.match)(new_block)
        // .with(P.string, s => s)
        .with({ kind: 'empty' }, block => block)
        .with({ kind: 'function' }, block => {
        const returns = map_blocks(f, block.return);
        return { ...block, return: returns };
    })
        .with({ kind: 'call' }, block => block)
        .with({ kind: 'model' }, block => {
        if (block.input) {
            const input = map_blocks(f, block.input);
            block = { ...block, input: input };
        }
        return block;
    })
        .with({ kind: 'code' }, block => {
        const code = map_blocks(f, block.code);
        return { ...block, code: code };
    })
        .with({ kind: 'api' }, block => {
        const input = map_blocks(f, block.input);
        return { ...block, input: input };
    })
        .with({ kind: 'get' }, block => block)
        .with({ kind: 'data' }, block => block)
        .with({ kind: 'document' }, block => {
        const document = map_blocks(f, block.document);
        return { ...block, document: document };
    })
        .with({ kind: 'sequence' }, block => {
        const sequence = map_blocks(f, block.sequence);
        return { ...block, sequence: sequence };
    })
        .with({ kind: 'array' }, block => {
        const array = map_blocks(f, block.array);
        return { ...block, array: array };
    })
        .with({ kind: 'message' }, block => {
        const content = map_blocks(f, block.content);
        return { ...block, content: content };
    })
        .with({ kind: 'if' }, block => {
        const then_ = map_blocks(f, block.then);
        const else_ = block.else ? map_blocks(f, block.else) : undefined;
        return { ...block, then: then_, else: else_ };
    })
        .with({ kind: 'repeat' }, block => {
        const repeat = map_blocks(f, block.repeat);
        return { ...block, repeat: repeat };
    })
        .with({ kind: 'repeat_until' }, block => {
        const repeat = map_blocks(f, block.repeat);
        return { ...block, repeat: repeat };
    })
        .with({ kind: 'for' }, block => {
        const repeat = map_blocks(f, block.repeat);
        return { ...block, repeat: repeat };
    })
        .with({ kind: 'error' }, block => {
        const doc = map_blocks(f, block.program);
        return { ...block, program: doc };
    })
        .with({ kind: 'read' }, block => block)
        .with({ kind: 'include' }, block => block)
        .with({ kind: undefined }, block => block)
        .exhaustive();
    (0, ts_pattern_1.match)(new_block)
        .with({ parser: { pdl: ts_pattern_1.P._ } }, block => {
        block.parser.pdl = map_blocks(f, block.parser.pdl);
    })
        .otherwise(() => { });
    if (block.fallback) {
        block.fallback = map_blocks(f, block.fallback);
    }
    return new_block;
}
exports.map_block_children = map_block_children;
function map_blocks(f, blocks) {
    blocks = (0, ts_pattern_1.match)(blocks)
        .with(ts_pattern_1.P.string, s => s)
        .with(ts_pattern_1.P.array(ts_pattern_1.P._), sequence => sequence.map(f))
        .otherwise(block => f(block));
    return blocks;
}
exports.map_blocks = map_blocks;
function iter_block_children(f, block) {
    if (typeof block === 'number' || typeof block === 'string') {
        return;
    }
    if (block === null || block === void 0 ? void 0 : block.defs) {
        for (const x in block.defs) {
            iter_blocks(f, block.defs[x]);
        }
    }
    (0, ts_pattern_1.match)(block)
        .with(ts_pattern_1.P.string, () => { })
        .with({ kind: 'empty' }, () => { })
        .with({ kind: 'function' }, block => {
        iter_blocks(f, block.return);
    })
        .with({ kind: 'call' }, () => { })
        .with({ kind: 'model' }, block => {
        if (block.input)
            iter_blocks(f, block.input);
    })
        .with({ kind: 'code' }, block => {
        iter_blocks(f, block.code);
    })
        .with({ kind: 'api' }, block => {
        iter_blocks(f, block.input);
    })
        .with({ kind: 'get' }, () => { })
        .with({ kind: 'data' }, () => { })
        .with({ kind: 'document' }, block => {
        iter_blocks(f, block.document);
    })
        .with({ kind: 'sequence' }, block => {
        iter_blocks(f, block.sequence);
    })
        .with({ kind: 'array' }, block => {
        iter_blocks(f, block.array);
    })
        .with({ kind: 'message' }, block => {
        iter_blocks(f, block.content);
    })
        .with({ kind: 'if' }, block => {
        if (block.then)
            iter_blocks(f, block.then);
        if (block.else)
            iter_blocks(f, block.else);
    })
        .with({ kind: 'repeat' }, block => {
        iter_blocks(f, block.repeat);
    })
        .with({ kind: 'repeat_until' }, block => {
        iter_blocks(f, block.repeat);
    })
        .with({ kind: 'for' }, block => {
        iter_blocks(f, block.repeat);
    })
        .with({ kind: 'error' }, block => iter_blocks(f, block.program))
        .with({ kind: 'read' }, () => { })
        .with({ kind: 'include' }, () => { })
        .with({ kind: undefined }, () => { })
        .exhaustive();
    (0, ts_pattern_1.match)(block)
        .with({ parser: { pdl: ts_pattern_1.P._ } }, block => {
        iter_blocks(f, block.parser.pdl);
    })
        .otherwise(() => { });
    if (block.fallback) {
        iter_blocks(f, block.fallback);
    }
}
exports.iter_block_children = iter_block_children;
function iter_blocks(f, blocks) {
    (0, ts_pattern_1.match)(blocks)
        .with(ts_pattern_1.P.string, () => { })
        .with(ts_pattern_1.P.array(ts_pattern_1.P._), sequence => {
        sequence.forEach(doc => iter_blocks(f, doc));
    })
        .otherwise(block => f(block));
}
exports.iter_blocks = iter_blocks;


/***/ }),

/***/ "./node_modules/ts-pattern/dist/index.cjs":
/*!************************************************!*\
  !*** ./node_modules/ts-pattern/dist/index.cjs ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {

function n(t){return n=Object.setPrototypeOf?Object.getPrototypeOf:function(n){return n.__proto__||Object.getPrototypeOf(n)},n(t)}function t(n,r){return t=Object.setPrototypeOf||function(n,t){return n.__proto__=t,n},t(n,r)}function r(n,e,u){return r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(n){return!1}}()?Reflect.construct:function(n,r,e){var u=[null];u.push.apply(u,r);var i=new(Function.bind.apply(n,u));return e&&t(i,e.prototype),i},r.apply(null,arguments)}function e(u){var i="function"==typeof Map?new Map:void 0;return e=function(e){if(null===e||-1===Function.toString.call(e).indexOf("[native code]"))return e;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==i){if(i.has(e))return i.get(e);i.set(e,u)}function u(){return r(e,arguments,n(this).constructor)}return u.prototype=Object.create(e.prototype,{constructor:{value:u,enumerable:!1,writable:!0,configurable:!0}}),t(u,e)},e(u)}function u(n,t){(null==t||t>n.length)&&(t=n.length);for(var r=0,e=new Array(t);r<t;r++)e[r]=n[r];return e}function i(n,t){var r="undefined"!=typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(r)return(r=r.call(n)).next.bind(r);if(Array.isArray(n)||(r=function(n,t){if(n){if("string"==typeof n)return u(n,t);var r=Object.prototype.toString.call(n).slice(8,-1);return"Object"===r&&n.constructor&&(r=n.constructor.name),"Map"===r||"Set"===r?Array.from(n):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?u(n,t):void 0}}(n))||t&&n&&"number"==typeof n.length){r&&(n=r);var e=0;return function(){return e>=n.length?{done:!0}:{done:!1,value:n[e++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o=Symbol.for("@ts-pattern/matcher"),c=Symbol.for("@ts-pattern/isVariadic"),f="@ts-pattern/anonymous-select-key",a=function(n){return Boolean(n&&"object"==typeof n)},l=function(n){return n&&!!n[o]},s=function n(t,r,e){if(l(t)){var u=t[o]().match(r),f=u.matched,s=u.selections;return f&&s&&Object.keys(s).forEach(function(n){return e(n,s[n])}),f}if(a(t)){if(!a(r))return!1;if(Array.isArray(t)){if(!Array.isArray(r))return!1;for(var h,v=[],p=[],g=[],y=i(t.keys());!(h=y()).done;){var m=t[h.value];l(m)&&m[c]?g.push(m):g.length?p.push(m):v.push(m)}if(g.length){if(g.length>1)throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");if(r.length<v.length+p.length)return!1;var d=r.slice(0,v.length),b=0===p.length?[]:r.slice(-p.length),w=r.slice(v.length,0===p.length?Infinity:-p.length);return v.every(function(t,r){return n(t,d[r],e)})&&p.every(function(t,r){return n(t,b[r],e)})&&(0===g.length||n(g[0],w,e))}return t.length===r.length&&t.every(function(t,u){return n(t,r[u],e)})}return Reflect.ownKeys(t).every(function(u){var i,c=t[u];return(u in r||l(i=c)&&"optional"===i[o]().matcherType)&&n(c,r[u],e)})}return Object.is(r,t)},h=function n(t){var r,e,u;return a(t)?l(t)?null!=(r=null==(e=(u=t[o]()).getSelectionKeys)?void 0:e.call(u))?r:[]:Array.isArray(t)?v(t,n):v(Object.values(t),n):[]},v=function(n,t){return n.reduce(function(n,r){return n.concat(t(r))},[])};function p(){var n=[].slice.call(arguments);if(1===n.length){var t=n[0];return function(n){return s(t,n,function(){})}}if(2===n.length)return s(n[0],n[1],function(){});throw new Error("isMatching wasn't given the right number of arguments: expected 1 or 2, received "+n.length+".")}function g(n){return Object.assign(n,{optional:function(){return m(n)},and:function(t){return w(n,t)},or:function(t){return O(n,t)},select:function(t){return void 0===t?j(n):j(t,n)}})}function y(n){return Object.assign(function(n){var t;return Object.assign(n,((t={})[Symbol.iterator]=function(){var t,r=0,e=[{value:Object.assign(n,((t={})[c]=!0,t)),done:!1},{done:!0,value:void 0}];return{next:function(){var n;return null!=(n=e[r++])?n:e.at(-1)}}},t))}(n),{optional:function(){return y(m(n))},select:function(t){return y(void 0===t?j(n):j(t,n))}})}function m(n){var t;return g(((t={})[o]=function(){return{match:function(t){var r={},e=function(n,t){r[n]=t};return void 0===t?(h(n).forEach(function(n){return e(n,void 0)}),{matched:!0,selections:r}):{matched:s(n,t,e),selections:r}},getSelectionKeys:function(){return h(n)},matcherType:"optional"}},t))}var d=function(n,t){for(var r,e=i(n);!(r=e()).done;)if(!t(r.value))return!1;return!0},b=function(n,t){for(var r,e=i(n.entries());!(r=e()).done;){var u=r.value;if(!t(u[1],u[0]))return!1}return!0};function w(){var n,t=[].slice.call(arguments);return g(((n={})[o]=function(){return{match:function(n){var r={},e=function(n,t){r[n]=t};return{matched:t.every(function(t){return s(t,n,e)}),selections:r}},getSelectionKeys:function(){return v(t,h)},matcherType:"and"}},n))}function O(){var n,t=[].slice.call(arguments);return g(((n={})[o]=function(){return{match:function(n){var r={},e=function(n,t){r[n]=t};return v(t,h).forEach(function(n){return e(n,void 0)}),{matched:t.some(function(t){return s(t,n,e)}),selections:r}},getSelectionKeys:function(){return v(t,h)},matcherType:"or"}},n))}function S(n){var t;return(t={})[o]=function(){return{match:function(t){return{matched:Boolean(n(t))}}}},t}function j(){var n,t=[].slice.call(arguments),r="string"==typeof t[0]?t[0]:void 0,e=2===t.length?t[1]:"string"==typeof t[0]?void 0:t[0];return g(((n={})[o]=function(){return{match:function(n){var t,u=((t={})[null!=r?r:f]=n,t);return{matched:void 0===e||s(e,n,function(n,t){u[n]=t}),selections:u}},getSelectionKeys:function(){return[null!=r?r:f].concat(void 0===e?[]:h(e))}}},n))}function x(n){return"number"==typeof n}function A(n){return"string"==typeof n}function E(n){return"bigint"==typeof n}var _=g(S(function(n){return!0})),P=_,K=function n(t){return Object.assign(g(t),{startsWith:function(r){return n(w(t,(e=r,S(function(n){return A(n)&&n.startsWith(e)}))));var e},endsWith:function(r){return n(w(t,(e=r,S(function(n){return A(n)&&n.endsWith(e)}))));var e},minLength:function(r){return n(w(t,function(n){return S(function(t){return A(t)&&t.length>=n})}(r)))},length:function(r){return n(w(t,function(n){return S(function(t){return A(t)&&t.length===n})}(r)))},maxLength:function(r){return n(w(t,function(n){return S(function(t){return A(t)&&t.length<=n})}(r)))},includes:function(r){return n(w(t,(e=r,S(function(n){return A(n)&&n.includes(e)}))));var e},regex:function(r){return n(w(t,(e=r,S(function(n){return A(n)&&Boolean(n.match(e))}))));var e}})}(S(A)),T=function n(t){return Object.assign(g(t),{between:function(r,e){return n(w(t,function(n,t){return S(function(r){return x(r)&&n<=r&&t>=r})}(r,e)))},lt:function(r){return n(w(t,function(n){return S(function(t){return x(t)&&t<n})}(r)))},gt:function(r){return n(w(t,function(n){return S(function(t){return x(t)&&t>n})}(r)))},lte:function(r){return n(w(t,function(n){return S(function(t){return x(t)&&t<=n})}(r)))},gte:function(r){return n(w(t,function(n){return S(function(t){return x(t)&&t>=n})}(r)))},int:function(){return n(w(t,S(function(n){return x(n)&&Number.isInteger(n)})))},finite:function(){return n(w(t,S(function(n){return x(n)&&Number.isFinite(n)})))},positive:function(){return n(w(t,S(function(n){return x(n)&&n>0})))},negative:function(){return n(w(t,S(function(n){return x(n)&&n<0})))}})}(S(x)),B=function n(t){return Object.assign(g(t),{between:function(r,e){return n(w(t,function(n,t){return S(function(r){return E(r)&&n<=r&&t>=r})}(r,e)))},lt:function(r){return n(w(t,function(n){return S(function(t){return E(t)&&t<n})}(r)))},gt:function(r){return n(w(t,function(n){return S(function(t){return E(t)&&t>n})}(r)))},lte:function(r){return n(w(t,function(n){return S(function(t){return E(t)&&t<=n})}(r)))},gte:function(r){return n(w(t,function(n){return S(function(t){return E(t)&&t>=n})}(r)))},positive:function(){return n(w(t,S(function(n){return E(n)&&n>0})))},negative:function(){return n(w(t,S(function(n){return E(n)&&n<0})))}})}(S(E)),M=g(S(function(n){return"boolean"==typeof n})),R=g(S(function(n){return"symbol"==typeof n})),I=g(S(function(n){return null==n})),N=g(S(function(n){return null!=n})),k={__proto__:null,matcher:o,optional:m,array:function(){var n,t=[].slice.call(arguments);return y(((n={})[o]=function(){return{match:function(n){if(!Array.isArray(n))return{matched:!1};if(0===t.length)return{matched:!0};var r=t[0],e={};if(0===n.length)return h(r).forEach(function(n){e[n]=[]}),{matched:!0,selections:e};var u=function(n,t){e[n]=(e[n]||[]).concat([t])};return{matched:n.every(function(n){return s(r,n,u)}),selections:e}},getSelectionKeys:function(){return 0===t.length?[]:h(t[0])}}},n))},set:function(){var n,t=[].slice.call(arguments);return g(((n={})[o]=function(){return{match:function(n){if(!(n instanceof Set))return{matched:!1};var r={};if(0===n.size)return{matched:!0,selections:r};if(0===t.length)return{matched:!0};var e=function(n,t){r[n]=(r[n]||[]).concat([t])},u=t[0];return{matched:d(n,function(n){return s(u,n,e)}),selections:r}},getSelectionKeys:function(){return 0===t.length?[]:h(t[0])}}},n))},map:function(){var n,t=[].slice.call(arguments);return g(((n={})[o]=function(){return{match:function(n){if(!(n instanceof Map))return{matched:!1};var r={};if(0===n.size)return{matched:!0,selections:r};var e,u=function(n,t){r[n]=(r[n]||[]).concat([t])};if(0===t.length)return{matched:!0};if(1===t.length)throw new Error("`P.map` wasn't given enough arguments. Expected (key, value), received "+(null==(e=t[0])?void 0:e.toString()));var i=t[0],o=t[1];return{matched:b(n,function(n,t){var r=s(i,t,u),e=s(o,n,u);return r&&e}),selections:r}},getSelectionKeys:function(){return 0===t.length?[]:[].concat(h(t[0]),h(t[1]))}}},n))},intersection:w,union:O,not:function(n){var t;return g(((t={})[o]=function(){return{match:function(t){return{matched:!s(n,t,function(){})}},getSelectionKeys:function(){return[]},matcherType:"not"}},t))},when:S,select:j,any:_,_:P,string:K,number:T,bigint:B,boolean:M,symbol:R,nullish:I,nonNullable:N,instanceOf:function(n){return g(S(function(n){return function(t){return t instanceof n}}(n)))},shape:function(n){return g(S(p(n)))}},W=/*#__PURE__*/function(n){var r,e;function u(t){var r,e;try{e=JSON.stringify(t)}catch(n){e=t}return(r=n.call(this,"Pattern matching error: no pattern matches value "+e)||this).input=void 0,r.input=t,r}return e=n,(r=u).prototype=Object.create(e.prototype),r.prototype.constructor=r,t(r,e),u}(/*#__PURE__*/e(Error)),F={matched:!1,value:void 0},z=/*#__PURE__*/function(){function n(n,t){this.input=void 0,this.state=void 0,this.input=n,this.state=t}var t=n.prototype;return t.with=function(){var t=this,r=[].slice.call(arguments);if(this.state.matched)return this;var e=r[r.length-1],u=[r[0]],i=void 0;3===r.length&&"function"==typeof r[1]?i=r[1]:r.length>2&&u.push.apply(u,r.slice(1,r.length-1));var o=!1,c={},a=function(n,t){o=!0,c[n]=t},l=!u.some(function(n){return s(n,t.input,a)})||i&&!Boolean(i(this.input))?F:{matched:!0,value:e(o?f in c?c[f]:c:this.input,this.input)};return new n(this.input,l)},t.when=function(t,r){if(this.state.matched)return this;var e=Boolean(t(this.input));return new n(this.input,e?{matched:!0,value:r(this.input,this.input)}:F)},t.otherwise=function(n){return this.state.matched?this.state.value:n(this.input)},t.exhaustive=function(){if(this.state.matched)return this.state.value;throw new W(this.input)},t.run=function(){return this.exhaustive()},t.returnType=function(){return this},n}();exports.NonExhaustiveError=W,exports.P=k,exports.Pattern=k,exports.isMatching=p,exports.match=function(n){return new z(n,F)};
//# sourceMappingURL=index.cjs.map


/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/compose-collection.js":
/*!**********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/compose-collection.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeCollection: () => (/* binding */ composeCollection)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../nodes/YAMLMap.js */ "./node_modules/yaml/browser/dist/nodes/YAMLMap.js");
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../nodes/YAMLSeq.js */ "./node_modules/yaml/browser/dist/nodes/YAMLSeq.js");
/* harmony import */ var _resolve_block_map_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./resolve-block-map.js */ "./node_modules/yaml/browser/dist/compose/resolve-block-map.js");
/* harmony import */ var _resolve_block_seq_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./resolve-block-seq.js */ "./node_modules/yaml/browser/dist/compose/resolve-block-seq.js");
/* harmony import */ var _resolve_flow_collection_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./resolve-flow-collection.js */ "./node_modules/yaml/browser/dist/compose/resolve-flow-collection.js");








function resolveCollection(CN, ctx, token, onError, tagName, tag) {
    const coll = token.type === 'block-map'
        ? (0,_resolve_block_map_js__WEBPACK_IMPORTED_MODULE_4__.resolveBlockMap)(CN, ctx, token, onError, tag)
        : token.type === 'block-seq'
            ? (0,_resolve_block_seq_js__WEBPACK_IMPORTED_MODULE_5__.resolveBlockSeq)(CN, ctx, token, onError, tag)
            : (0,_resolve_flow_collection_js__WEBPACK_IMPORTED_MODULE_6__.resolveFlowCollection)(CN, ctx, token, onError, tag);
    const Coll = coll.constructor;
    // If we got a tagName matching the class, or the tag name is '!',
    // then use the tagName from the node class used to create it.
    if (tagName === '!' || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
    }
    if (tagName)
        coll.tag = tagName;
    return coll;
}
function composeCollection(CN, ctx, token, props, onError) {
    const tagToken = props.tag;
    const tagName = !tagToken
        ? null
        : ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg));
    if (token.type === 'block-seq') {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken
            ? anchor.offset > tagToken.offset
                ? anchor
                : tagToken
            : (anchor ?? tagToken);
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
            const message = 'Missing newline after block sequence props';
            onError(lastProp, 'MISSING_CHAR', message);
        }
    }
    const expType = token.type === 'block-map'
        ? 'map'
        : token.type === 'block-seq'
            ? 'seq'
            : token.start.source === '{'
                ? 'map'
                : 'seq';
    // shortcut: check if it's a generic YAMLMap or YAMLSeq
    // before jumping into the custom tag logic.
    if (!tagToken ||
        !tagName ||
        tagName === '!' ||
        (tagName === _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.tagName && expType === 'map') ||
        (tagName === _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq.tagName && expType === 'seq')) {
        return resolveCollection(CN, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find(t => t.tag === tagName && t.collection === expType);
    if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt && kt.collection === expType) {
            ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
            tag = kt;
        }
        else {
            if (kt?.collection) {
                onError(tagToken, 'BAD_COLLECTION_TYPE', `${kt.tag} used for ${expType} collection, but expects ${kt.collection}`, true);
            }
            else {
                onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, true);
            }
            return resolveCollection(CN, ctx, token, onError, tagName);
        }
    }
    const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg), ctx.options) ?? coll;
    const node = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(res)
        ? res
        : new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
        node.format = tag.format;
    return node;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/compose-doc.js":
/*!***************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/compose-doc.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeDoc: () => (/* binding */ composeDoc)
/* harmony export */ });
/* harmony import */ var _doc_Document_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../doc/Document.js */ "./node_modules/yaml/browser/dist/doc/Document.js");
/* harmony import */ var _compose_node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compose-node.js */ "./node_modules/yaml/browser/dist/compose/compose-node.js");
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resolve-end.js */ "./node_modules/yaml/browser/dist/compose/resolve-end.js");
/* harmony import */ var _resolve_props_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./resolve-props.js */ "./node_modules/yaml/browser/dist/compose/resolve-props.js");





function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new _doc_Document_js__WEBPACK_IMPORTED_MODULE_0__.Document(undefined, opts);
    const ctx = {
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
    };
    const props = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_3__.resolveProps)(start, {
        indicator: 'doc-start',
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
    });
    if (props.found) {
        doc.directives.docStart = true;
        if (value &&
            (value.type === 'block-map' || value.type === 'block-seq') &&
            !props.hasNewline)
            onError(props.end, 'MISSING_CHAR', 'Block collection cannot start on same line with directives-end marker');
    }
    // @ts-expect-error If Contents is set, let's trust the user
    doc.contents = value
        ? (0,_compose_node_js__WEBPACK_IMPORTED_MODULE_1__.composeNode)(ctx, value, props, onError)
        : (0,_compose_node_js__WEBPACK_IMPORTED_MODULE_1__.composeEmptyNode)(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_2__.resolveEnd)(end, contentEnd, false, onError);
    if (re.comment)
        doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/compose-node.js":
/*!****************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/compose-node.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeEmptyNode: () => (/* binding */ composeEmptyNode),
/* harmony export */   composeNode: () => (/* binding */ composeNode)
/* harmony export */ });
/* harmony import */ var _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/Alias.js */ "./node_modules/yaml/browser/dist/nodes/Alias.js");
/* harmony import */ var _compose_collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compose-collection.js */ "./node_modules/yaml/browser/dist/compose/compose-collection.js");
/* harmony import */ var _compose_scalar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./compose-scalar.js */ "./node_modules/yaml/browser/dist/compose/compose-scalar.js");
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./resolve-end.js */ "./node_modules/yaml/browser/dist/compose/resolve-end.js");
/* harmony import */ var _util_empty_scalar_position_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util-empty-scalar-position.js */ "./node_modules/yaml/browser/dist/compose/util-empty-scalar-position.js");






const CN = { composeNode, composeEmptyNode };
function composeNode(ctx, token, props, onError) {
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
        case 'alias':
            node = composeAlias(ctx, token, onError);
            if (anchor || tag)
                onError(token, 'ALIAS_PROPS', 'An alias node must not specify any properties');
            break;
        case 'scalar':
        case 'single-quoted-scalar':
        case 'double-quoted-scalar':
        case 'block-scalar':
            node = (0,_compose_scalar_js__WEBPACK_IMPORTED_MODULE_2__.composeScalar)(ctx, token, tag, onError);
            if (anchor)
                node.anchor = anchor.source.substring(1);
            break;
        case 'block-map':
        case 'block-seq':
        case 'flow-collection':
            node = (0,_compose_collection_js__WEBPACK_IMPORTED_MODULE_1__.composeCollection)(CN, ctx, token, props, onError);
            if (anchor)
                node.anchor = anchor.source.substring(1);
            break;
        default: {
            const message = token.type === 'error'
                ? token.message
                : `Unsupported token (type: ${token.type})`;
            onError(token, 'UNEXPECTED_TOKEN', message);
            node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError);
            isSrcToken = false;
        }
    }
    if (anchor && node.anchor === '')
        onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
    if (spaceBefore)
        node.spaceBefore = true;
    if (comment) {
        if (token.type === 'scalar' && token.source === '')
            node.comment = comment;
        else
            node.commentBefore = comment;
    }
    // @ts-expect-error Type checking misses meaning of isSrcToken
    if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
    return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
        type: 'scalar',
        offset: (0,_util_empty_scalar_position_js__WEBPACK_IMPORTED_MODULE_4__.emptyScalarPosition)(offset, before, pos),
        indent: -1,
        source: ''
    };
    const node = (0,_compose_scalar_js__WEBPACK_IMPORTED_MODULE_2__.composeScalar)(ctx, token, tag, onError);
    if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === '')
            onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
    }
    if (spaceBefore)
        node.spaceBefore = true;
    if (comment) {
        node.comment = comment;
        node.range[2] = end;
    }
    return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__.Alias(source.substring(1));
    if (alias.source === '')
        onError(offset, 'BAD_ALIAS', 'Alias cannot be an empty string');
    if (alias.source.endsWith(':'))
        onError(offset + source.length - 1, 'BAD_ALIAS', 'Alias ending in : is ambiguous', true);
    const valueEnd = offset + source.length;
    const re = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_3__.resolveEnd)(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
        alias.comment = re.comment;
    return alias;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/compose-scalar.js":
/*!******************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/compose-scalar.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeScalar: () => (/* binding */ composeScalar)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _resolve_block_scalar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resolve-block-scalar.js */ "./node_modules/yaml/browser/dist/compose/resolve-block-scalar.js");
/* harmony import */ var _resolve_flow_scalar_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./resolve-flow-scalar.js */ "./node_modules/yaml/browser/dist/compose/resolve-flow-scalar.js");





function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === 'block-scalar'
        ? (0,_resolve_block_scalar_js__WEBPACK_IMPORTED_MODULE_2__.resolveBlockScalar)(ctx, token, onError)
        : (0,_resolve_flow_scalar_js__WEBPACK_IMPORTED_MODULE_3__.resolveFlowScalar)(token, ctx.options.strict, onError);
    const tagName = tagToken
        ? ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg))
        : null;
    const tag = tagToken && tagName
        ? findScalarTagByName(ctx.schema, value, tagName, tagToken, onError)
        : token.type === 'scalar'
            ? findScalarTagByTest(ctx, value, token, onError)
            : ctx.schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
    let scalar;
    try {
        const res = tag.resolve(value, msg => onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg), ctx.options);
        scalar = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(res) ? res : new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar(res);
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg);
        scalar = new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
        scalar.type = type;
    if (tagName)
        scalar.tag = tagName;
    if (tag.format)
        scalar.format = tag.format;
    if (comment)
        scalar.comment = comment;
    return scalar;
}
function findScalarTagByName(schema, value, tagName, tagToken, onError) {
    if (tagName === '!')
        return schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR]; // non-specific tag
    const matchWithTest = [];
    for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
            if (tag.default && tag.test)
                matchWithTest.push(tag);
            else
                return tag;
        }
    }
    for (const tag of matchWithTest)
        if (tag.test?.test(value))
            return tag;
    const kt = schema.knownTags[tagName];
    if (kt && !kt.collection) {
        // Ensure that the known tag is available for stringifying,
        // but does not get used by default.
        schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
        return kt;
    }
    onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, tagName !== 'tag:yaml.org,2002:str');
    return schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
}
function findScalarTagByTest({ directives, schema }, value, token, onError) {
    const tag = schema.tags.find(tag => tag.default && tag.test?.test(value)) || schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
    if (schema.compat) {
        const compat = schema.compat.find(tag => tag.default && tag.test?.test(value)) ??
            schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR];
        if (tag.tag !== compat.tag) {
            const ts = directives.tagString(tag.tag);
            const cs = directives.tagString(compat.tag);
            const msg = `Value may be parsed as either ${ts} or ${cs}`;
            onError(token, 'TAG_RESOLVE_FAILED', msg, true);
        }
    }
    return tag;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/composer.js":
/*!************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/composer.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Composer: () => (/* binding */ Composer)
/* harmony export */ });
/* harmony import */ var _doc_directives_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../doc/directives.js */ "./node_modules/yaml/browser/dist/doc/directives.js");
/* harmony import */ var _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../doc/Document.js */ "./node_modules/yaml/browser/dist/doc/Document.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../errors.js */ "./node_modules/yaml/browser/dist/errors.js");
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _compose_doc_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./compose-doc.js */ "./node_modules/yaml/browser/dist/compose/compose-doc.js");
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./resolve-end.js */ "./node_modules/yaml/browser/dist/compose/resolve-end.js");







function getErrorPos(src) {
    if (typeof src === 'number')
        return [src, src + 1];
    if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === 'string' ? source.length : 1)];
}
function parsePrelude(prelude) {
    let comment = '';
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
            case '#':
                comment +=
                    (comment === '' ? '' : afterEmptyLine ? '\n\n' : '\n') +
                        (source.substring(1) || ' ');
                atComment = true;
                afterEmptyLine = false;
                break;
            case '%':
                if (prelude[i + 1]?.[0] !== '#')
                    i += 1;
                atComment = false;
                break;
            default:
                // This may be wrong after doc-end, but in that case it doesn't matter
                if (!atComment)
                    afterEmptyLine = true;
                atComment = false;
        }
    }
    return { comment, afterEmptyLine };
}
/**
 * Compose a stream of CST nodes into a stream of YAML Documents.
 *
 * ```ts
 * import { Composer, Parser } from 'yaml'
 *
 * const src: string = ...
 * const tokens = new Parser().parse(src)
 * const docs = new Composer().compose(tokens)
 * ```
 */
class Composer {
    constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
            const pos = getErrorPos(source);
            if (warning)
                this.warnings.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLWarning(pos, code, message));
            else
                this.errors.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(pos, code, message));
        };
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        this.directives = new _doc_directives_js__WEBPACK_IMPORTED_MODULE_0__.Directives({ version: options.version || '1.2' });
        this.options = options;
    }
    decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        //console.log({ dc: doc.comment, prelude, comment })
        if (comment) {
            const dc = doc.contents;
            if (afterDoc) {
                doc.comment = doc.comment ? `${doc.comment}\n${comment}` : comment;
            }
            else if (afterEmptyLine || doc.directives.docStart || !dc) {
                doc.commentBefore = comment;
            }
            else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_3__.isCollection)(dc) && !dc.flow && dc.items.length > 0) {
                let it = dc.items[0];
                if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_3__.isPair)(it))
                    it = it.key;
                const cb = it.commentBefore;
                it.commentBefore = cb ? `${comment}\n${cb}` : comment;
            }
            else {
                const cb = dc.commentBefore;
                dc.commentBefore = cb ? `${comment}\n${cb}` : comment;
            }
        }
        if (afterDoc) {
            Array.prototype.push.apply(doc.errors, this.errors);
            Array.prototype.push.apply(doc.warnings, this.warnings);
        }
        else {
            doc.errors = this.errors;
            doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
    }
    /**
     * Current stream status information.
     *
     * Mostly useful at the end of input for an empty stream.
     */
    streamInfo() {
        return {
            comment: parsePrelude(this.prelude).comment,
            directives: this.directives,
            errors: this.errors,
            warnings: this.warnings
        };
    }
    /**
     * Compose tokens into documents.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
            yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
    }
    /** Advance the composer by one CST token. */
    *next(token) {
        switch (token.type) {
            case 'directive':
                this.directives.add(token.source, (offset, message, warning) => {
                    const pos = getErrorPos(token);
                    pos[0] += offset;
                    this.onError(pos, 'BAD_DIRECTIVE', message, warning);
                });
                this.prelude.push(token.source);
                this.atDirectives = true;
                break;
            case 'document': {
                const doc = (0,_compose_doc_js__WEBPACK_IMPORTED_MODULE_4__.composeDoc)(this.options, this.directives, token, this.onError);
                if (this.atDirectives && !doc.directives.docStart)
                    this.onError(token, 'MISSING_CHAR', 'Missing directives-end/doc-start indicator line');
                this.decorate(doc, false);
                if (this.doc)
                    yield this.doc;
                this.doc = doc;
                this.atDirectives = false;
                break;
            }
            case 'byte-order-mark':
            case 'space':
                break;
            case 'comment':
            case 'newline':
                this.prelude.push(token.source);
                break;
            case 'error': {
                const msg = token.source
                    ? `${token.message}: ${JSON.stringify(token.source)}`
                    : token.message;
                const error = new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg);
                if (this.atDirectives || !this.doc)
                    this.errors.push(error);
                else
                    this.doc.errors.push(error);
                break;
            }
            case 'doc-end': {
                if (!this.doc) {
                    const msg = 'Unexpected doc-end without preceding document';
                    this.errors.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg));
                    break;
                }
                this.doc.directives.docEnd = true;
                const end = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_5__.resolveEnd)(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
                this.decorate(this.doc, true);
                if (end.comment) {
                    const dc = this.doc.comment;
                    this.doc.comment = dc ? `${dc}\n${end.comment}` : end.comment;
                }
                this.doc.range[2] = end.offset;
                break;
            }
            default:
                this.errors.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', `Unsupported token ${token.type}`));
        }
    }
    /**
     * Call at end of input to yield any remaining document.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
            this.decorate(this.doc, true);
            yield this.doc;
            this.doc = null;
        }
        else if (forceDoc) {
            const opts = Object.assign({ _directives: this.directives }, this.options);
            const doc = new _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__.Document(undefined, opts);
            if (this.atDirectives)
                this.onError(endOffset, 'MISSING_CHAR', 'Missing directives-end indicator line');
            doc.range = [0, endOffset, endOffset];
            this.decorate(doc, false);
            yield doc;
        }
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/resolve-block-map.js":
/*!*********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/resolve-block-map.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveBlockMap: () => (/* binding */ resolveBlockMap)
/* harmony export */ });
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/Pair.js */ "./node_modules/yaml/browser/dist/nodes/Pair.js");
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../nodes/YAMLMap.js */ "./node_modules/yaml/browser/dist/nodes/YAMLMap.js");
/* harmony import */ var _resolve_props_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resolve-props.js */ "./node_modules/yaml/browser/dist/compose/resolve-props.js");
/* harmony import */ var _util_contains_newline_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util-contains-newline.js */ "./node_modules/yaml/browser/dist/compose/util-contains-newline.js");
/* harmony import */ var _util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util-flow-indent-check.js */ "./node_modules/yaml/browser/dist/compose/util-flow-indent-check.js");
/* harmony import */ var _util_map_includes_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./util-map-includes.js */ "./node_modules/yaml/browser/dist/compose/util-map-includes.js");







const startColMsg = 'All mapping items must start at the same column';
function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__.YAMLMap;
    const map = new NodeClass(ctx.schema);
    if (ctx.atRoot)
        ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        // key properties
        const keyProps = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_2__.resolveProps)(start, {
            indicator: 'explicit-key-ind',
            next: key ?? sep?.[0],
            offset,
            onError,
            parentIndent: bm.indent,
            startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
            if (key) {
                if (key.type === 'block-seq')
                    onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'A block sequence may not be used as an implicit map key');
                else if ('indent' in key && key.indent !== bm.indent)
                    onError(offset, 'BAD_INDENT', startColMsg);
            }
            if (!keyProps.anchor && !keyProps.tag && !sep) {
                commentEnd = keyProps.end;
                if (keyProps.comment) {
                    if (map.comment)
                        map.comment += '\n' + keyProps.comment;
                    else
                        map.comment = keyProps.comment;
                }
                continue;
            }
            if (keyProps.newlineAfterProp || (0,_util_contains_newline_js__WEBPACK_IMPORTED_MODULE_3__.containsNewline)(key)) {
                onError(key ?? start[start.length - 1], 'MULTILINE_IMPLICIT_KEY', 'Implicit keys need to be on a single line');
            }
        }
        else if (keyProps.found?.indent !== bm.indent) {
            onError(offset, 'BAD_INDENT', startColMsg);
        }
        // key value
        const keyStart = keyProps.end;
        const keyNode = key
            ? composeNode(ctx, key, keyProps, onError)
            : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
            (0,_util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_4__.flowIndentCheck)(bm.indent, key, onError);
        if ((0,_util_map_includes_js__WEBPACK_IMPORTED_MODULE_5__.mapIncludes)(ctx, map.items, keyNode))
            onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
        // value properties
        const valueProps = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_2__.resolveProps)(sep ?? [], {
            indicator: 'map-value-ind',
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: bm.indent,
            startOnNewline: !key || key.type === 'block-scalar'
        });
        offset = valueProps.end;
        if (valueProps.found) {
            if (implicitKey) {
                if (value?.type === 'block-map' && !valueProps.hasNewline)
                    onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'Nested mappings are not allowed in compact mappings');
                if (ctx.options.strict &&
                    keyProps.start < valueProps.found.offset - 1024)
                    onError(keyNode.range, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit block mapping key');
            }
            // value value
            const valueNode = value
                ? composeNode(ctx, value, valueProps, onError)
                : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
            if (ctx.schema.compat)
                (0,_util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_4__.flowIndentCheck)(bm.indent, value, onError);
            offset = valueNode.range[2];
            const pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_0__.Pair(keyNode, valueNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            map.items.push(pair);
        }
        else {
            // key with no value
            if (implicitKey)
                onError(keyNode.range, 'MISSING_CHAR', 'Implicit map keys need to be followed by map values');
            if (valueProps.comment) {
                if (keyNode.comment)
                    keyNode.comment += '\n' + valueProps.comment;
                else
                    keyNode.comment = valueProps.comment;
            }
            const pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_0__.Pair(keyNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            map.items.push(pair);
        }
    }
    if (commentEnd && commentEnd < offset)
        onError(commentEnd, 'IMPOSSIBLE', 'Map comment with trailing content');
    map.range = [bm.offset, offset, commentEnd ?? offset];
    return map;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/resolve-block-scalar.js":
/*!************************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/resolve-block-scalar.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveBlockScalar: () => (/* binding */ resolveBlockScalar)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");


function resolveBlockScalar(ctx, scalar, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
    if (!header)
        return { value: '', type: null, comment: '', range: [start, start, start] };
    const type = header.mode === '>' ? _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_FOLDED : _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    // determine the end of content & start of chomping
    let chompStart = lines.length;
    for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === '' || content === '\r')
            chompStart = i;
        else
            break;
    }
    // shortcut for empty contents
    if (chompStart === 0) {
        const value = header.chomp === '+' && lines.length > 0
            ? '\n'.repeat(Math.max(1, lines.length - 1))
            : '';
        let end = start + header.length;
        if (scalar.source)
            end += scalar.source.length;
        return { value, type, comment: header.comment, range: [start, end, end] };
    }
    // find the indentation level to trim from start
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === '' || content === '\r') {
            if (header.indent === 0 && indent.length > trimIndent)
                trimIndent = indent.length;
        }
        else {
            if (indent.length < trimIndent) {
                const message = 'Block scalars with more-indented leading empty lines must use an explicit indentation indicator';
                onError(offset + indent.length, 'MISSING_CHAR', message);
            }
            if (header.indent === 0)
                trimIndent = indent.length;
            contentStart = i;
            if (trimIndent === 0 && !ctx.atRoot) {
                const message = 'Block scalar values in collections must be indented';
                onError(offset, 'BAD_INDENT', message);
            }
            break;
        }
        offset += indent.length + content.length + 1;
    }
    // include trailing more-indented empty lines in content
    for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
            chompStart = i + 1;
    }
    let value = '';
    let sep = '';
    let prevMoreIndented = false;
    // leading whitespace is kept intact
    for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + '\n';
    for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === '\r';
        if (crlf)
            content = content.slice(0, -1);
        /* istanbul ignore if already caught in lexer */
        if (content && indent.length < trimIndent) {
            const src = header.indent
                ? 'explicit indentation indicator'
                : 'first line';
            const message = `Block scalar lines must not be less indented than their ${src}`;
            onError(offset - content.length - (crlf ? 2 : 1), 'BAD_INDENT', message);
            indent = '';
        }
        if (type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL) {
            value += sep + indent.slice(trimIndent) + content;
            sep = '\n';
        }
        else if (indent.length > trimIndent || content[0] === '\t') {
            // more-indented content within a folded block
            if (sep === ' ')
                sep = '\n';
            else if (!prevMoreIndented && sep === '\n')
                sep = '\n\n';
            value += sep + indent.slice(trimIndent) + content;
            sep = '\n';
            prevMoreIndented = true;
        }
        else if (content === '') {
            // empty line
            if (sep === '\n')
                value += '\n';
            else
                sep = '\n';
        }
        else {
            value += sep + content;
            sep = ' ';
            prevMoreIndented = false;
        }
    }
    switch (header.chomp) {
        case '-':
            break;
        case '+':
            for (let i = chompStart; i < lines.length; ++i)
                value += '\n' + lines[i][0].slice(trimIndent);
            if (value[value.length - 1] !== '\n')
                value += '\n';
            break;
        default:
            value += '\n';
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
    /* istanbul ignore if should not happen */
    if (props[0].type !== 'block-scalar-header') {
        onError(props[0], 'IMPOSSIBLE', 'Block scalar header not found');
        return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent = 0;
    let chomp = '';
    let error = -1;
    for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === '-' || ch === '+'))
            chomp = ch;
        else {
            const n = Number(ch);
            if (!indent && n)
                indent = n;
            else if (error === -1)
                error = offset + i;
        }
    }
    if (error !== -1)
        onError(error, 'UNEXPECTED_TOKEN', `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = '';
    let length = source.length;
    for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
            case 'space':
                hasSpace = true;
            // fallthrough
            case 'newline':
                length += token.source.length;
                break;
            case 'comment':
                if (strict && !hasSpace) {
                    const message = 'Comments must be separated from other tokens by white space characters';
                    onError(token, 'MISSING_CHAR', message);
                }
                length += token.source.length;
                comment = token.source.substring(1);
                break;
            case 'error':
                onError(token, 'UNEXPECTED_TOKEN', token.message);
                length += token.source.length;
                break;
            /* istanbul ignore next should not happen */
            default: {
                const message = `Unexpected token in block scalar header: ${token.type}`;
                onError(token, 'UNEXPECTED_TOKEN', message);
                const ts = token.source;
                if (ts && typeof ts === 'string')
                    length += ts.length;
            }
        }
    }
    return { mode, indent, chomp, comment, length };
}
/** @returns Array of lines split up as `[indent, content]` */
function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1]
        ? [m[1], first.slice(m[1].length)]
        : ['', first];
    const lines = [line0];
    for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
    return lines;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/resolve-block-seq.js":
/*!*********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/resolve-block-seq.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveBlockSeq: () => (/* binding */ resolveBlockSeq)
/* harmony export */ });
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/YAMLSeq.js */ "./node_modules/yaml/browser/dist/nodes/YAMLSeq.js");
/* harmony import */ var _resolve_props_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resolve-props.js */ "./node_modules/yaml/browser/dist/compose/resolve-props.js");
/* harmony import */ var _util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util-flow-indent-check.js */ "./node_modules/yaml/browser/dist/compose/util-flow-indent-check.js");




function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_0__.YAMLSeq;
    const seq = new NodeClass(ctx.schema);
    if (ctx.atRoot)
        ctx.atRoot = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
        const props = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_1__.resolveProps)(start, {
            indicator: 'seq-item-ind',
            next: value,
            offset,
            onError,
            parentIndent: bs.indent,
            startOnNewline: true
        });
        if (!props.found) {
            if (props.anchor || props.tag || value) {
                if (value && value.type === 'block-seq')
                    onError(props.end, 'BAD_INDENT', 'All sequence items must start at the same column');
                else
                    onError(offset, 'MISSING_CHAR', 'Sequence item without - indicator');
            }
            else {
                commentEnd = props.end;
                if (props.comment)
                    seq.comment = props.comment;
                continue;
            }
        }
        const node = value
            ? composeNode(ctx, value, props, onError)
            : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
            (0,_util_flow_indent_check_js__WEBPACK_IMPORTED_MODULE_2__.flowIndentCheck)(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
    }
    seq.range = [bs.offset, offset, commentEnd ?? offset];
    return seq;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/resolve-end.js":
/*!***************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/resolve-end.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveEnd: () => (/* binding */ resolveEnd)
/* harmony export */ });
function resolveEnd(end, offset, reqSpace, onError) {
    let comment = '';
    if (end) {
        let hasSpace = false;
        let sep = '';
        for (const token of end) {
            const { source, type } = token;
            switch (type) {
                case 'space':
                    hasSpace = true;
                    break;
                case 'comment': {
                    if (reqSpace && !hasSpace)
                        onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                    const cb = source.substring(1) || ' ';
                    if (!comment)
                        comment = cb;
                    else
                        comment += sep + cb;
                    sep = '';
                    break;
                }
                case 'newline':
                    if (comment)
                        sep += source;
                    hasSpace = true;
                    break;
                default:
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${type} at node end`);
            }
            offset += source.length;
        }
    }
    return { comment, offset };
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/resolve-flow-collection.js":
/*!***************************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/resolve-flow-collection.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveFlowCollection: () => (/* binding */ resolveFlowCollection)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../nodes/Pair.js */ "./node_modules/yaml/browser/dist/nodes/Pair.js");
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../nodes/YAMLMap.js */ "./node_modules/yaml/browser/dist/nodes/YAMLMap.js");
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../nodes/YAMLSeq.js */ "./node_modules/yaml/browser/dist/nodes/YAMLSeq.js");
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./resolve-end.js */ "./node_modules/yaml/browser/dist/compose/resolve-end.js");
/* harmony import */ var _resolve_props_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./resolve-props.js */ "./node_modules/yaml/browser/dist/compose/resolve-props.js");
/* harmony import */ var _util_contains_newline_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util-contains-newline.js */ "./node_modules/yaml/browser/dist/compose/util-contains-newline.js");
/* harmony import */ var _util_map_includes_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./util-map-includes.js */ "./node_modules/yaml/browser/dist/compose/util-map-includes.js");









const blockMsg = 'Block collections are not allowed within flow collections';
const isBlock = (token) => token && (token.type === 'block-map' || token.type === 'block-seq');
function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
    const isMap = fc.start.source === '{';
    const fcName = isMap ? 'flow map' : 'flow sequence';
    const NodeClass = (tag?.nodeClass ?? (isMap ? _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap : _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq));
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
        ctx.atRoot = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_5__.resolveProps)(start, {
            flow: fcName,
            indicator: 'explicit-key-ind',
            next: key ?? sep?.[0],
            offset,
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
        });
        if (!props.found) {
            if (!props.anchor && !props.tag && !sep && !value) {
                if (i === 0 && props.comma)
                    onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
                else if (i < fc.items.length - 1)
                    onError(props.start, 'UNEXPECTED_TOKEN', `Unexpected empty item in ${fcName}`);
                if (props.comment) {
                    if (coll.comment)
                        coll.comment += '\n' + props.comment;
                    else
                        coll.comment = props.comment;
                }
                offset = props.end;
                continue;
            }
            if (!isMap && ctx.options.strict && (0,_util_contains_newline_js__WEBPACK_IMPORTED_MODULE_6__.containsNewline)(key))
                onError(key, // checked by containsNewline()
                'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
        }
        if (i === 0) {
            if (props.comma)
                onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
        }
        else {
            if (!props.comma)
                onError(props.start, 'MISSING_CHAR', `Missing , between ${fcName} items`);
            if (props.comment) {
                let prevItemComment = '';
                loop: for (const st of start) {
                    switch (st.type) {
                        case 'comma':
                        case 'space':
                            break;
                        case 'comment':
                            prevItemComment = st.source.substring(1);
                            break loop;
                        default:
                            break loop;
                    }
                }
                if (prevItemComment) {
                    let prev = coll.items[coll.items.length - 1];
                    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(prev))
                        prev = prev.value ?? prev.key;
                    if (prev.comment)
                        prev.comment += '\n' + prevItemComment;
                    else
                        prev.comment = prevItemComment;
                    props.comment = props.comment.substring(prevItemComment.length + 1);
                }
            }
        }
        if (!isMap && !sep && !props.found) {
            // item is a value in a seq
            // → key & sep are empty, start does not include ? or :
            const valueNode = value
                ? composeNode(ctx, value, props, onError)
                : composeEmptyNode(ctx, props.end, sep, null, props, onError);
            coll.items.push(valueNode);
            offset = valueNode.range[2];
            if (isBlock(value))
                onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
        }
        else {
            // item is a key+value pair
            // key value
            const keyStart = props.end;
            const keyNode = key
                ? composeNode(ctx, key, props, onError)
                : composeEmptyNode(ctx, keyStart, start, null, props, onError);
            if (isBlock(key))
                onError(keyNode.range, 'BLOCK_IN_FLOW', blockMsg);
            // value properties
            const valueProps = (0,_resolve_props_js__WEBPACK_IMPORTED_MODULE_5__.resolveProps)(sep ?? [], {
                flow: fcName,
                indicator: 'map-value-ind',
                next: value,
                offset: keyNode.range[2],
                onError,
                parentIndent: fc.indent,
                startOnNewline: false
            });
            if (valueProps.found) {
                if (!isMap && !props.found && ctx.options.strict) {
                    if (sep)
                        for (const st of sep) {
                            if (st === valueProps.found)
                                break;
                            if (st.type === 'newline') {
                                onError(st, 'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
                                break;
                            }
                        }
                    if (props.start < valueProps.found.offset - 1024)
                        onError(valueProps.found, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit flow sequence key');
                }
            }
            else if (value) {
                if ('source' in value && value.source && value.source[0] === ':')
                    onError(value, 'MISSING_CHAR', `Missing space after : in ${fcName}`);
                else
                    onError(valueProps.start, 'MISSING_CHAR', `Missing , or : between ${fcName} items`);
            }
            // value value
            const valueNode = value
                ? composeNode(ctx, value, valueProps, onError)
                : valueProps.found
                    ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError)
                    : null;
            if (valueNode) {
                if (isBlock(value))
                    onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
            }
            else if (valueProps.comment) {
                if (keyNode.comment)
                    keyNode.comment += '\n' + valueProps.comment;
                else
                    keyNode.comment = valueProps.comment;
            }
            const pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(keyNode, valueNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            if (isMap) {
                const map = coll;
                if ((0,_util_map_includes_js__WEBPACK_IMPORTED_MODULE_7__.mapIncludes)(ctx, map.items, keyNode))
                    onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
                map.items.push(pair);
            }
            else {
                const map = new _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap(ctx.schema);
                map.flow = true;
                map.items.push(pair);
                coll.items.push(map);
            }
            offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
    }
    const expectedEnd = isMap ? '}' : ']';
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce && ce.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
    else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot
            ? `${name} must end with a ${expectedEnd}`
            : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? 'MISSING_CHAR' : 'BAD_INDENT', msg);
        if (ce && ce.source.length !== 1)
            ee.unshift(ce);
    }
    if (ee.length > 0) {
        const end = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_4__.resolveEnd)(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
            if (coll.comment)
                coll.comment += '\n' + end.comment;
            else
                coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
    }
    else {
        coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/resolve-flow-scalar.js":
/*!***********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/resolve-flow-scalar.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveFlowScalar: () => (/* binding */ resolveFlowScalar)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _resolve_end_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resolve-end.js */ "./node_modules/yaml/browser/dist/compose/resolve-end.js");



function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
        case 'scalar':
            _type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.PLAIN;
            value = plainValue(source, _onError);
            break;
        case 'single-quoted-scalar':
            _type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_SINGLE;
            value = singleQuotedValue(source, _onError);
            break;
        case 'double-quoted-scalar':
            _type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE;
            value = doubleQuotedValue(source, _onError);
            break;
        /* istanbul ignore next should not happen */
        default:
            onError(scalar, 'UNEXPECTED_TOKEN', `Expected a flow scalar value, but found: ${type}`);
            return {
                value: '',
                type: null,
                comment: '',
                range: [offset, offset + source.length, offset + source.length]
            };
    }
    const valueEnd = offset + source.length;
    const re = (0,_resolve_end_js__WEBPACK_IMPORTED_MODULE_1__.resolveEnd)(end, valueEnd, strict, onError);
    return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
    };
}
function plainValue(source, onError) {
    let badChar = '';
    switch (source[0]) {
        /* istanbul ignore next should not happen */
        case '\t':
            badChar = 'a tab character';
            break;
        case ',':
            badChar = 'flow indicator character ,';
            break;
        case '%':
            badChar = 'directive indicator character %';
            break;
        case '|':
        case '>': {
            badChar = `block scalar indicator ${source[0]}`;
            break;
        }
        case '@':
        case '`': {
            badChar = `reserved character ${source[0]}`;
            break;
        }
    }
    if (badChar)
        onError(0, 'BAD_SCALAR_START', `Plain value cannot start with ${badChar}`);
    return foldLines(source);
}
function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, 'MISSING_CHAR', "Missing closing 'quote");
    return foldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function foldLines(source) {
    /**
     * The negative lookbehind here and in the `re` RegExp is to
     * prevent causing a polynomial search time in certain cases.
     *
     * The try-catch is for Safari, which doesn't support this yet:
     * https://caniuse.com/js-regexp-lookbehind
     */
    let first, line;
    try {
        first = new RegExp('(.*?)(?<![ \t])[ \t]*\r?\n', 'sy');
        line = new RegExp('[ \t]*(.*?)(?:(?<![ \t])[ \t]*)?\r?\n', 'sy');
    }
    catch (_) {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let match = first.exec(source);
    if (!match)
        return source;
    let res = match[1];
    let sep = ' ';
    let pos = first.lastIndex;
    line.lastIndex = pos;
    while ((match = line.exec(source))) {
        if (match[1] === '') {
            if (sep === '\n')
                res += sep;
            else
                sep = '\n';
        }
        else {
            res += sep + match[1];
            sep = ' ';
        }
        pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? '');
}
function doubleQuotedValue(source, onError) {
    let res = '';
    for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === '\r' && source[i + 1] === '\n')
            continue;
        if (ch === '\n') {
            const { fold, offset } = foldNewline(source, i);
            res += fold;
            i = offset;
        }
        else if (ch === '\\') {
            let next = source[++i];
            const cc = escapeCodes[next];
            if (cc)
                res += cc;
            else if (next === '\n') {
                // skip escaped newlines, but still trim the following line
                next = source[i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
            }
            else if (next === '\r' && source[i + 1] === '\n') {
                // skip escaped CRLF newlines, but still trim the following line
                next = source[++i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
            }
            else if (next === 'x' || next === 'u' || next === 'U') {
                const length = { x: 2, u: 4, U: 8 }[next];
                res += parseCharCode(source, i + 1, length, onError);
                i += length;
            }
            else {
                const raw = source.substr(i - 1, 2);
                onError(i - 1, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
                res += raw;
            }
        }
        else if (ch === ' ' || ch === '\t') {
            // trim trailing whitespace
            const wsStart = i;
            let next = source[i + 1];
            while (next === ' ' || next === '\t')
                next = source[++i + 1];
            if (next !== '\n' && !(next === '\r' && source[i + 2] === '\n'))
                res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        }
        else {
            res += ch;
        }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, 'MISSING_CHAR', 'Missing closing "quote');
    return res;
}
/**
 * Fold a single newline into a space, multiple newlines to N - 1 newlines.
 * Presumes `source[offset] === '\n'`
 */
function foldNewline(source, offset) {
    let fold = '';
    let ch = source[offset + 1];
    while (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        if (ch === '\r' && source[offset + 2] !== '\n')
            break;
        if (ch === '\n')
            fold += '\n';
        offset += 1;
        ch = source[offset + 1];
    }
    if (!fold)
        fold = ' ';
    return { fold, offset };
}
const escapeCodes = {
    '0': '\0', // null character
    a: '\x07', // bell character
    b: '\b', // backspace
    e: '\x1b', // escape character
    f: '\f', // form feed
    n: '\n', // line feed
    r: '\r', // carriage return
    t: '\t', // horizontal tab
    v: '\v', // vertical tab
    N: '\u0085', // Unicode next line
    _: '\u00a0', // Unicode non-breaking space
    L: '\u2028', // Unicode line separator
    P: '\u2029', // Unicode paragraph separator
    ' ': ' ',
    '"': '"',
    '/': '/',
    '\\': '\\',
    '\t': '\t'
};
function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    if (isNaN(code)) {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
        return raw;
    }
    return String.fromCodePoint(code);
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/resolve-props.js":
/*!*****************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/resolve-props.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveProps: () => (/* binding */ resolveProps)
/* harmony export */ });
function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = '';
    let commentSep = '';
    let hasNewline = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
    let newlineAfterProp = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
        if (reqSpace) {
            if (token.type !== 'space' &&
                token.type !== 'newline' &&
                token.type !== 'comma')
                onError(token.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
            reqSpace = false;
        }
        if (tab) {
            if (atNewline && token.type !== 'comment' && token.type !== 'newline') {
                onError(tab, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
            }
            tab = null;
        }
        switch (token.type) {
            case 'space':
                // At the doc level, tabs at line start may be parsed
                // as leading white space rather than indentation.
                // In a flow collection, only the parser handles indent.
                if (!flow &&
                    (indicator !== 'doc-start' || next?.type !== 'flow-collection') &&
                    token.source.includes('\t')) {
                    tab = token;
                }
                hasSpace = true;
                break;
            case 'comment': {
                if (!hasSpace)
                    onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                const cb = token.source.substring(1) || ' ';
                if (!comment)
                    comment = cb;
                else
                    comment += commentSep + cb;
                commentSep = '';
                atNewline = false;
                break;
            }
            case 'newline':
                if (atNewline) {
                    if (comment)
                        comment += token.source;
                    else
                        spaceBefore = true;
                }
                else
                    commentSep += token.source;
                atNewline = true;
                hasNewline = true;
                if (anchor || tag)
                    newlineAfterProp = token;
                hasSpace = true;
                break;
            case 'anchor':
                if (anchor)
                    onError(token, 'MULTIPLE_ANCHORS', 'A node can have at most one anchor');
                if (token.source.endsWith(':'))
                    onError(token.offset + token.source.length - 1, 'BAD_ALIAS', 'Anchor ending in : is ambiguous', true);
                anchor = token;
                if (start === null)
                    start = token.offset;
                atNewline = false;
                hasSpace = false;
                reqSpace = true;
                break;
            case 'tag': {
                if (tag)
                    onError(token, 'MULTIPLE_TAGS', 'A node can have at most one tag');
                tag = token;
                if (start === null)
                    start = token.offset;
                atNewline = false;
                hasSpace = false;
                reqSpace = true;
                break;
            }
            case indicator:
                // Could here handle preceding comments differently
                if (anchor || tag)
                    onError(token, 'BAD_PROP_ORDER', `Anchors and tags must be after the ${token.source} indicator`);
                if (found)
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.source} in ${flow ?? 'collection'}`);
                found = token;
                atNewline =
                    indicator === 'seq-item-ind' || indicator === 'explicit-key-ind';
                hasSpace = false;
                break;
            case 'comma':
                if (flow) {
                    if (comma)
                        onError(token, 'UNEXPECTED_TOKEN', `Unexpected , in ${flow}`);
                    comma = token;
                    atNewline = false;
                    hasSpace = false;
                    break;
                }
            // else fallthrough
            default:
                onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.type} token`);
                atNewline = false;
                hasSpace = false;
        }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace &&
        next &&
        next.type !== 'space' &&
        next.type !== 'newline' &&
        next.type !== 'comma' &&
        (next.type !== 'scalar' || next.source !== '')) {
        onError(next.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
    }
    if (tab &&
        ((atNewline && tab.indent <= parentIndent) ||
            next?.type === 'block-map' ||
            next?.type === 'block-seq'))
        onError(tab, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
    return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
    };
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/util-contains-newline.js":
/*!*************************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/util-contains-newline.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   containsNewline: () => (/* binding */ containsNewline)
/* harmony export */ });
function containsNewline(key) {
    if (!key)
        return null;
    switch (key.type) {
        case 'alias':
        case 'scalar':
        case 'double-quoted-scalar':
        case 'single-quoted-scalar':
            if (key.source.includes('\n'))
                return true;
            if (key.end)
                for (const st of key.end)
                    if (st.type === 'newline')
                        return true;
            return false;
        case 'flow-collection':
            for (const it of key.items) {
                for (const st of it.start)
                    if (st.type === 'newline')
                        return true;
                if (it.sep)
                    for (const st of it.sep)
                        if (st.type === 'newline')
                            return true;
                if (containsNewline(it.key) || containsNewline(it.value))
                    return true;
            }
            return false;
        default:
            return true;
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/util-empty-scalar-position.js":
/*!******************************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/util-empty-scalar-position.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   emptyScalarPosition: () => (/* binding */ emptyScalarPosition)
/* harmony export */ });
function emptyScalarPosition(offset, before, pos) {
    if (before) {
        if (pos === null)
            pos = before.length;
        for (let i = pos - 1; i >= 0; --i) {
            let st = before[i];
            switch (st.type) {
                case 'space':
                case 'comment':
                case 'newline':
                    offset -= st.source.length;
                    continue;
            }
            // Technically, an empty scalar is immediately after the last non-empty
            // node, but it's more useful to place it after any whitespace.
            st = before[++i];
            while (st?.type === 'space') {
                offset += st.source.length;
                st = before[++i];
            }
            break;
        }
    }
    return offset;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/util-flow-indent-check.js":
/*!**************************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/util-flow-indent-check.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   flowIndentCheck: () => (/* binding */ flowIndentCheck)
/* harmony export */ });
/* harmony import */ var _util_contains_newline_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util-contains-newline.js */ "./node_modules/yaml/browser/dist/compose/util-contains-newline.js");


function flowIndentCheck(indent, fc, onError) {
    if (fc?.type === 'flow-collection') {
        const end = fc.end[0];
        if (end.indent === indent &&
            (end.source === ']' || end.source === '}') &&
            (0,_util_contains_newline_js__WEBPACK_IMPORTED_MODULE_0__.containsNewline)(fc)) {
            const msg = 'Flow end indicator should be more indented than parent';
            onError(end, 'BAD_INDENT', msg, true);
        }
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/compose/util-map-includes.js":
/*!*********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/compose/util-map-includes.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mapIncludes: () => (/* binding */ mapIncludes)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");


function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
        return false;
    const isEqual = typeof uniqueKeys === 'function'
        ? uniqueKeys
        : (a, b) => a === b ||
            ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(a) &&
                (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(b) &&
                a.value === b.value &&
                !(a.value === '<<' && ctx.schema.merge));
    return items.some(pair => isEqual(pair.key, search));
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/doc/Document.js":
/*!********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/doc/Document.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Document: () => (/* binding */ Document)
/* harmony export */ });
/* harmony import */ var _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/Alias.js */ "./node_modules/yaml/browser/dist/nodes/Alias.js");
/* harmony import */ var _nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../nodes/Collection.js */ "./node_modules/yaml/browser/dist/nodes/Collection.js");
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../nodes/Pair.js */ "./node_modules/yaml/browser/dist/nodes/Pair.js");
/* harmony import */ var _nodes_toJS_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../nodes/toJS.js */ "./node_modules/yaml/browser/dist/nodes/toJS.js");
/* harmony import */ var _schema_Schema_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../schema/Schema.js */ "./node_modules/yaml/browser/dist/schema/Schema.js");
/* harmony import */ var _stringify_stringifyDocument_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../stringify/stringifyDocument.js */ "./node_modules/yaml/browser/dist/stringify/stringifyDocument.js");
/* harmony import */ var _anchors_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./anchors.js */ "./node_modules/yaml/browser/dist/doc/anchors.js");
/* harmony import */ var _applyReviver_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./applyReviver.js */ "./node_modules/yaml/browser/dist/doc/applyReviver.js");
/* harmony import */ var _createNode_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./createNode.js */ "./node_modules/yaml/browser/dist/doc/createNode.js");
/* harmony import */ var _directives_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./directives.js */ "./node_modules/yaml/browser/dist/doc/directives.js");












class Document {
    constructor(value, replacer, options) {
        /** A comment before this Document */
        this.commentBefore = null;
        /** A comment immediately after this Document */
        this.comment = null;
        /** Errors encountered during parsing. */
        this.errors = [];
        /** Warnings encountered during parsing. */
        this.warnings = [];
        Object.defineProperty(this, _nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.NODE_TYPE, { value: _nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.DOC });
        let _replacer = null;
        if (typeof replacer === 'function' || Array.isArray(replacer)) {
            _replacer = replacer;
        }
        else if (options === undefined && replacer) {
            options = replacer;
            replacer = undefined;
        }
        const opt = Object.assign({
            intAsBigInt: false,
            keepSourceTokens: false,
            logLevel: 'warn',
            prettyErrors: true,
            strict: true,
            uniqueKeys: true,
            version: '1.2'
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
            this.directives = options._directives.atDocument();
            if (this.directives.yaml.explicit)
                version = this.directives.yaml.version;
        }
        else
            this.directives = new _directives_js__WEBPACK_IMPORTED_MODULE_10__.Directives({ version });
        this.setSchema(version, options);
        // @ts-expect-error We can't really know that this matches Contents.
        this.contents =
            value === undefined ? null : this.createNode(value, _replacer, options);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
        const copy = Object.create(Document.prototype, {
            [_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.NODE_TYPE]: { value: _nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
            copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        // @ts-expect-error We can't really know that this matches Contents.
        copy.contents = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isNode)(this.contents)
            ? this.contents.clone(copy.schema)
            : this.contents;
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /** Adds a value to the document. */
    add(value) {
        if (assertCollection(this.contents))
            this.contents.add(value);
    }
    /** Adds a value to the document. */
    addIn(path, value) {
        if (assertCollection(this.contents))
            this.contents.addIn(path, value);
    }
    /**
     * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
     *
     * If `node` already has an anchor, `name` is ignored.
     * Otherwise, the `node.anchor` value will be set to `name`,
     * or if an anchor with that name is already present in the document,
     * `name` will be used as a prefix for a new unique anchor.
     * If `name` is undefined, the generated anchor will use 'a' as a prefix.
     */
    createAlias(node, name) {
        if (!node.anchor) {
            const prev = (0,_anchors_js__WEBPACK_IMPORTED_MODULE_7__.anchorNames)(this);
            node.anchor =
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                !name || prev.has(name) ? (0,_anchors_js__WEBPACK_IMPORTED_MODULE_7__.findNewAnchor)(name || 'a', prev) : name;
        }
        return new _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__.Alias(node.anchor);
    }
    createNode(value, replacer, options) {
        let _replacer = undefined;
        if (typeof replacer === 'function') {
            value = replacer.call({ '': value }, '', value);
            _replacer = replacer;
        }
        else if (Array.isArray(replacer)) {
            const keyToStr = (v) => typeof v === 'number' || v instanceof String || v instanceof Number;
            const asStr = replacer.filter(keyToStr).map(String);
            if (asStr.length > 0)
                replacer = replacer.concat(asStr);
            _replacer = replacer;
        }
        else if (options === undefined && replacer) {
            options = replacer;
            replacer = undefined;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = (0,_anchors_js__WEBPACK_IMPORTED_MODULE_7__.createNodeAnchors)(this, 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        anchorPrefix || 'a');
        const ctx = {
            aliasDuplicateObjects: aliasDuplicateObjects ?? true,
            keepUndefined: keepUndefined ?? false,
            onAnchor,
            onTagObj,
            replacer: _replacer,
            schema: this.schema,
            sourceObjects
        };
        const node = (0,_createNode_js__WEBPACK_IMPORTED_MODULE_9__.createNode)(value, tag, ctx);
        if (flow && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(node))
            node.flow = true;
        setAnchors();
        return node;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_3__.Pair(k, v);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        if ((0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyPath)(path)) {
            if (this.contents == null)
                return false;
            // @ts-expect-error Presumed impossible if Strict extends false
            this.contents = null;
            return true;
        }
        return assertCollection(this.contents)
            ? this.contents.deleteIn(path)
            : false;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(key, keepScalar) {
        return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(this.contents)
            ? this.contents.get(key, keepScalar)
            : undefined;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        if ((0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyPath)(path))
            return !keepScalar && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isScalar)(this.contents)
                ? this.contents.value
                : this.contents;
        return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(this.contents)
            ? this.contents.getIn(path, keepScalar)
            : undefined;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(key) {
        return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(this.contents) ? this.contents.has(key) : false;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(path) {
        if ((0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyPath)(path))
            return this.contents !== undefined;
        return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(this.contents) ? this.contents.hasIn(path) : false;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(key, value) {
        if (this.contents == null) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = (0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.collectionFromPath)(this.schema, [key], value);
        }
        else if (assertCollection(this.contents)) {
            this.contents.set(key, value);
        }
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        if ((0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyPath)(path)) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = value;
        }
        else if (this.contents == null) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = (0,_nodes_Collection_js__WEBPACK_IMPORTED_MODULE_1__.collectionFromPath)(this.schema, Array.from(path), value);
        }
        else if (assertCollection(this.contents)) {
            this.contents.setIn(path, value);
        }
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(version, options = {}) {
        if (typeof version === 'number')
            version = String(version);
        let opt;
        switch (version) {
            case '1.1':
                if (this.directives)
                    this.directives.yaml.version = '1.1';
                else
                    this.directives = new _directives_js__WEBPACK_IMPORTED_MODULE_10__.Directives({ version: '1.1' });
                opt = { merge: true, resolveKnownTags: false, schema: 'yaml-1.1' };
                break;
            case '1.2':
            case 'next':
                if (this.directives)
                    this.directives.yaml.version = version;
                else
                    this.directives = new _directives_js__WEBPACK_IMPORTED_MODULE_10__.Directives({ version });
                opt = { merge: false, resolveKnownTags: true, schema: 'core' };
                break;
            case null:
                if (this.directives)
                    delete this.directives;
                opt = null;
                break;
            default: {
                const sv = JSON.stringify(version);
                throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
            }
        }
        // Not using `instanceof Schema` to allow for duck typing
        if (options.schema instanceof Object)
            this.schema = options.schema;
        else if (opt)
            this.schema = new _schema_Schema_js__WEBPACK_IMPORTED_MODULE_5__.Schema(Object.assign(opt, options));
        else
            throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
            anchors: new Map(),
            doc: this,
            keep: !json,
            mapAsMap: mapAsMap === true,
            mapKeyWarned: false,
            maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100
        };
        const res = (0,_nodes_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(this.contents, jsonArg ?? '', ctx);
        if (typeof onAnchor === 'function')
            for (const { count, res } of ctx.anchors.values())
                onAnchor(res, count);
        return typeof reviver === 'function'
            ? (0,_applyReviver_js__WEBPACK_IMPORTED_MODULE_8__.applyReviver)(reviver, { '': res }, '', res)
            : res;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    /** A YAML representation of the document. */
    toString(options = {}) {
        if (this.errors.length > 0)
            throw new Error('Document with errors cannot be stringified');
        if ('indent' in options &&
            (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
            const s = JSON.stringify(options.indent);
            throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return (0,_stringify_stringifyDocument_js__WEBPACK_IMPORTED_MODULE_6__.stringifyDocument)(this, options);
    }
}
function assertCollection(contents) {
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(contents))
        return true;
    throw new Error('Expected a YAML collection as document contents');
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/doc/anchors.js":
/*!*******************************************************!*\
  !*** ./node_modules/yaml/browser/dist/doc/anchors.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   anchorIsValid: () => (/* binding */ anchorIsValid),
/* harmony export */   anchorNames: () => (/* binding */ anchorNames),
/* harmony export */   createNodeAnchors: () => (/* binding */ createNodeAnchors),
/* harmony export */   findNewAnchor: () => (/* binding */ findNewAnchor)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _visit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../visit.js */ "./node_modules/yaml/browser/dist/visit.js");



/**
 * Verify that the input string is a valid anchor.
 *
 * Will throw on errors.
 */
function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
    }
    return true;
}
function anchorNames(root) {
    const anchors = new Set();
    (0,_visit_js__WEBPACK_IMPORTED_MODULE_1__.visit)(root, {
        Value(_key, node) {
            if (node.anchor)
                anchors.add(node.anchor);
        }
    });
    return anchors;
}
/** Find a new anchor name with the given `prefix` and a one-indexed suffix. */
function findNewAnchor(prefix, exclude) {
    for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
            return name;
    }
}
function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = new Map();
    let prevAnchors = null;
    return {
        onAnchor: (source) => {
            aliasObjects.push(source);
            if (!prevAnchors)
                prevAnchors = anchorNames(doc);
            const anchor = findNewAnchor(prefix, prevAnchors);
            prevAnchors.add(anchor);
            return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
            for (const source of aliasObjects) {
                const ref = sourceObjects.get(source);
                if (typeof ref === 'object' &&
                    ref.anchor &&
                    ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(ref.node) || (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(ref.node))) {
                    ref.node.anchor = ref.anchor;
                }
                else {
                    const error = new Error('Failed to resolve repeated object (this should not happen)');
                    error.source = source;
                    throw error;
                }
            }
        },
        sourceObjects
    };
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/doc/applyReviver.js":
/*!************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/doc/applyReviver.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyReviver: () => (/* binding */ applyReviver)
/* harmony export */ });
/**
 * Applies the JSON.parse reviver algorithm as defined in the ECMA-262 spec,
 * in section 24.5.1.1 "Runtime Semantics: InternalizeJSONProperty" of the
 * 2021 edition: https://tc39.es/ecma262/#sec-json.parse
 *
 * Includes extensions for handling Map and Set objects.
 */
function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
            for (let i = 0, len = val.length; i < len; ++i) {
                const v0 = val[i];
                const v1 = applyReviver(reviver, val, String(i), v0);
                if (v1 === undefined)
                    delete val[i];
                else if (v1 !== v0)
                    val[i] = v1;
            }
        }
        else if (val instanceof Map) {
            for (const k of Array.from(val.keys())) {
                const v0 = val.get(k);
                const v1 = applyReviver(reviver, val, k, v0);
                if (v1 === undefined)
                    val.delete(k);
                else if (v1 !== v0)
                    val.set(k, v1);
            }
        }
        else if (val instanceof Set) {
            for (const v0 of Array.from(val)) {
                const v1 = applyReviver(reviver, val, v0, v0);
                if (v1 === undefined)
                    val.delete(v0);
                else if (v1 !== v0) {
                    val.delete(v0);
                    val.add(v1);
                }
            }
        }
        else {
            for (const [k, v0] of Object.entries(val)) {
                const v1 = applyReviver(reviver, val, k, v0);
                if (v1 === undefined)
                    delete val[k];
                else if (v1 !== v0)
                    val[k] = v1;
            }
        }
    }
    return reviver.call(obj, key, val);
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/doc/createNode.js":
/*!**********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/doc/createNode.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createNode: () => (/* binding */ createNode)
/* harmony export */ });
/* harmony import */ var _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/Alias.js */ "./node_modules/yaml/browser/dist/nodes/Alias.js");
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");




const defaultTagPrefix = 'tag:yaml.org,2002:';
function findTagObject(value, tagName, tags) {
    if (tagName) {
        const match = tags.filter(t => t.tag === tagName);
        const tagObj = match.find(t => !t.format) ?? match[0];
        if (!tagObj)
            throw new Error(`Tag ${tagName} not found`);
        return tagObj;
    }
    return tags.find(t => t.identify?.(value) && !t.format);
}
function createNode(value, tagName, ctx) {
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isDocument)(value))
        value = value.contents;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isNode)(value))
        return value;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isPair)(value)) {
        const map = ctx.schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
    }
    if (value instanceof String ||
        value instanceof Number ||
        value instanceof Boolean ||
        (typeof BigInt !== 'undefined' && value instanceof BigInt) // not supported everywhere
    ) {
        // https://tc39.es/ecma262/#sec-serializejsonproperty
        value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    // Detect duplicate references to the same object & use Alias nodes for all
    // after first. The `ref` wrapper allows for circular references to resolve.
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === 'object') {
        ref = sourceObjects.get(value);
        if (ref) {
            if (!ref.anchor)
                ref.anchor = onAnchor(value);
            return new _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_0__.Alias(ref.anchor);
        }
        else {
            ref = { anchor: null, node: null };
            sourceObjects.set(value, ref);
        }
    }
    if (tagName?.startsWith('!!'))
        tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
        if (value && typeof value.toJSON === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            value = value.toJSON();
        }
        if (!value || typeof value !== 'object') {
            const node = new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__.Scalar(value);
            if (ref)
                ref.node = node;
            return node;
        }
        tagObj =
            value instanceof Map
                ? schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.MAP]
                : Symbol.iterator in Object(value)
                    ? schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.SEQ]
                    : schema[_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.MAP];
    }
    if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
    }
    const node = tagObj?.createNode
        ? tagObj.createNode(ctx.schema, value, ctx)
        : typeof tagObj?.nodeClass?.from === 'function'
            ? tagObj.nodeClass.from(ctx.schema, value, ctx)
            : new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__.Scalar(value);
    if (tagName)
        node.tag = tagName;
    else if (!tagObj.default)
        node.tag = tagObj.tag;
    if (ref)
        ref.node = node;
    return node;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/doc/directives.js":
/*!**********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/doc/directives.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Directives: () => (/* binding */ Directives)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _visit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../visit.js */ "./node_modules/yaml/browser/dist/visit.js");



const escapeChars = {
    '!': '%21',
    ',': '%2C',
    '[': '%5B',
    ']': '%5D',
    '{': '%7B',
    '}': '%7D'
};
const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, ch => escapeChars[ch]);
class Directives {
    constructor(yaml, tags) {
        /**
         * The directives-end/doc-start marker `---`. If `null`, a marker may still be
         * included in the document's stringified representation.
         */
        this.docStart = null;
        /** The doc-end marker `...`.  */
        this.docEnd = false;
        this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, Directives.defaultTags, tags);
    }
    clone() {
        const copy = new Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
        const res = new Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
            case '1.1':
                this.atNextDocument = true;
                break;
            case '1.2':
                this.atNextDocument = false;
                this.yaml = {
                    explicit: Directives.defaultYaml.explicit,
                    version: '1.2'
                };
                this.tags = Object.assign({}, Directives.defaultTags);
                break;
        }
        return res;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(line, onError) {
        if (this.atNextDocument) {
            this.yaml = { explicit: Directives.defaultYaml.explicit, version: '1.1' };
            this.tags = Object.assign({}, Directives.defaultTags);
            this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
            case '%TAG': {
                if (parts.length !== 2) {
                    onError(0, '%TAG directive should contain exactly two parts');
                    if (parts.length < 2)
                        return false;
                }
                const [handle, prefix] = parts;
                this.tags[handle] = prefix;
                return true;
            }
            case '%YAML': {
                this.yaml.explicit = true;
                if (parts.length !== 1) {
                    onError(0, '%YAML directive should contain exactly one part');
                    return false;
                }
                const [version] = parts;
                if (version === '1.1' || version === '1.2') {
                    this.yaml.version = version;
                    return true;
                }
                else {
                    const isValid = /^\d+\.\d+$/.test(version);
                    onError(6, `Unsupported YAML version ${version}`, isValid);
                    return false;
                }
            }
            default:
                onError(0, `Unknown directive ${name}`, true);
                return false;
        }
    }
    /**
     * Resolves a tag, matching handles to those defined in %TAG directives.
     *
     * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
     *   `'!local'` tag, or `null` if unresolvable.
     */
    tagName(source, onError) {
        if (source === '!')
            return '!'; // non-specific tag
        if (source[0] !== '!') {
            onError(`Not a valid tag: ${source}`);
            return null;
        }
        if (source[1] === '<') {
            const verbatim = source.slice(2, -1);
            if (verbatim === '!' || verbatim === '!!') {
                onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
                return null;
            }
            if (source[source.length - 1] !== '>')
                onError('Verbatim tags must end with a >');
            return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
            onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
            try {
                return prefix + decodeURIComponent(suffix);
            }
            catch (error) {
                onError(String(error));
                return null;
            }
        }
        if (handle === '!')
            return source; // local tag
        onError(`Could not resolve tag: ${source}`);
        return null;
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
            if (tag.startsWith(prefix))
                return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === '!' ? tag : `!<${tag}>`;
    }
    toString(doc) {
        const lines = this.yaml.explicit
            ? [`%YAML ${this.yaml.version || '1.2'}`]
            : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(doc.contents)) {
            const tags = {};
            (0,_visit_js__WEBPACK_IMPORTED_MODULE_1__.visit)(doc.contents, (_key, node) => {
                if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(node) && node.tag)
                    tags[node.tag] = true;
            });
            tagNames = Object.keys(tags);
        }
        else
            tagNames = [];
        for (const [handle, prefix] of tagEntries) {
            if (handle === '!!' && prefix === 'tag:yaml.org,2002:')
                continue;
            if (!doc || tagNames.some(tn => tn.startsWith(prefix)))
                lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join('\n');
    }
}
Directives.defaultYaml = { explicit: false, version: '1.2' };
Directives.defaultTags = { '!!': 'tag:yaml.org,2002:' };




/***/ }),

/***/ "./node_modules/yaml/browser/dist/errors.js":
/*!**************************************************!*\
  !*** ./node_modules/yaml/browser/dist/errors.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLError: () => (/* binding */ YAMLError),
/* harmony export */   YAMLParseError: () => (/* binding */ YAMLParseError),
/* harmony export */   YAMLWarning: () => (/* binding */ YAMLWarning),
/* harmony export */   prettifyError: () => (/* binding */ prettifyError)
/* harmony export */ });
class YAMLError extends Error {
    constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
    }
}
class YAMLParseError extends YAMLError {
    constructor(pos, code, message) {
        super('YAMLParseError', pos, code, message);
    }
}
class YAMLWarning extends YAMLError {
    constructor(pos, code, message) {
        super('YAMLWarning', pos, code, message);
    }
}
const prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
        return;
    error.linePos = error.pos.map(pos => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src
        .substring(lc.lineStarts[line - 1], lc.lineStarts[line])
        .replace(/[\n\r]+$/, '');
    // Trim to max 80 chars, keeping col position near the middle
    if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = '…' + lineStr.substring(trimStart);
        ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + '…';
    // Include previous line in context if pointing at line start
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        // Regexp won't match if start is trimmed
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
            prev = prev.substring(0, 79) + '…\n';
        lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end && end.line === line && end.col > col) {
            count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = ' '.repeat(ci) + '^'.repeat(count);
        error.message += `:\n\n${lineStr}\n${pointer}\n`;
    }
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/index.js":
/*!*************************************************!*\
  !*** ./node_modules/yaml/browser/dist/index.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alias: () => (/* reexport safe */ _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_4__.Alias),
/* harmony export */   CST: () => (/* reexport module object */ _parse_cst_js__WEBPACK_IMPORTED_MODULE_10__),
/* harmony export */   Composer: () => (/* reexport safe */ _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__.Composer),
/* harmony export */   Document: () => (/* reexport safe */ _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__.Document),
/* harmony export */   Lexer: () => (/* reexport safe */ _parse_lexer_js__WEBPACK_IMPORTED_MODULE_11__.Lexer),
/* harmony export */   LineCounter: () => (/* reexport safe */ _parse_line_counter_js__WEBPACK_IMPORTED_MODULE_12__.LineCounter),
/* harmony export */   Pair: () => (/* reexport safe */ _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_6__.Pair),
/* harmony export */   Parser: () => (/* reexport safe */ _parse_parser_js__WEBPACK_IMPORTED_MODULE_13__.Parser),
/* harmony export */   Scalar: () => (/* reexport safe */ _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_7__.Scalar),
/* harmony export */   Schema: () => (/* reexport safe */ _schema_Schema_js__WEBPACK_IMPORTED_MODULE_2__.Schema),
/* harmony export */   YAMLError: () => (/* reexport safe */ _errors_js__WEBPACK_IMPORTED_MODULE_3__.YAMLError),
/* harmony export */   YAMLMap: () => (/* reexport safe */ _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_8__.YAMLMap),
/* harmony export */   YAMLParseError: () => (/* reexport safe */ _errors_js__WEBPACK_IMPORTED_MODULE_3__.YAMLParseError),
/* harmony export */   YAMLSeq: () => (/* reexport safe */ _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_9__.YAMLSeq),
/* harmony export */   YAMLWarning: () => (/* reexport safe */ _errors_js__WEBPACK_IMPORTED_MODULE_3__.YAMLWarning),
/* harmony export */   isAlias: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isAlias),
/* harmony export */   isCollection: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isCollection),
/* harmony export */   isDocument: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isDocument),
/* harmony export */   isMap: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isMap),
/* harmony export */   isNode: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isNode),
/* harmony export */   isPair: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isPair),
/* harmony export */   isScalar: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isScalar),
/* harmony export */   isSeq: () => (/* reexport safe */ _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__.isSeq),
/* harmony export */   parse: () => (/* reexport safe */ _public_api_js__WEBPACK_IMPORTED_MODULE_14__.parse),
/* harmony export */   parseAllDocuments: () => (/* reexport safe */ _public_api_js__WEBPACK_IMPORTED_MODULE_14__.parseAllDocuments),
/* harmony export */   parseDocument: () => (/* reexport safe */ _public_api_js__WEBPACK_IMPORTED_MODULE_14__.parseDocument),
/* harmony export */   stringify: () => (/* reexport safe */ _public_api_js__WEBPACK_IMPORTED_MODULE_14__.stringify),
/* harmony export */   visit: () => (/* reexport safe */ _visit_js__WEBPACK_IMPORTED_MODULE_15__.visit),
/* harmony export */   visitAsync: () => (/* reexport safe */ _visit_js__WEBPACK_IMPORTED_MODULE_15__.visitAsync)
/* harmony export */ });
/* harmony import */ var _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./compose/composer.js */ "./node_modules/yaml/browser/dist/compose/composer.js");
/* harmony import */ var _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./doc/Document.js */ "./node_modules/yaml/browser/dist/doc/Document.js");
/* harmony import */ var _schema_Schema_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./schema/Schema.js */ "./node_modules/yaml/browser/dist/schema/Schema.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./errors.js */ "./node_modules/yaml/browser/dist/errors.js");
/* harmony import */ var _nodes_Alias_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./nodes/Alias.js */ "./node_modules/yaml/browser/dist/nodes/Alias.js");
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./nodes/Pair.js */ "./node_modules/yaml/browser/dist/nodes/Pair.js");
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./nodes/YAMLMap.js */ "./node_modules/yaml/browser/dist/nodes/YAMLMap.js");
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./nodes/YAMLSeq.js */ "./node_modules/yaml/browser/dist/nodes/YAMLSeq.js");
/* harmony import */ var _parse_cst_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./parse/cst.js */ "./node_modules/yaml/browser/dist/parse/cst.js");
/* harmony import */ var _parse_lexer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./parse/lexer.js */ "./node_modules/yaml/browser/dist/parse/lexer.js");
/* harmony import */ var _parse_line_counter_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./parse/line-counter.js */ "./node_modules/yaml/browser/dist/parse/line-counter.js");
/* harmony import */ var _parse_parser_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./parse/parser.js */ "./node_modules/yaml/browser/dist/parse/parser.js");
/* harmony import */ var _public_api_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./public-api.js */ "./node_modules/yaml/browser/dist/public-api.js");
/* harmony import */ var _visit_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./visit.js */ "./node_modules/yaml/browser/dist/visit.js");



















/***/ }),

/***/ "./node_modules/yaml/browser/dist/log.js":
/*!***********************************************!*\
  !*** ./node_modules/yaml/browser/dist/log.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debug: () => (/* binding */ debug),
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
function debug(logLevel, ...messages) {
    if (logLevel === 'debug')
        console.log(...messages);
}
function warn(logLevel, warning) {
    if (logLevel === 'debug' || logLevel === 'warn') {
        // https://github.com/typescript-eslint/typescript-eslint/issues/7478
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (typeof process !== 'undefined' && process.emitWarning)
            process.emitWarning(warning);
        else
            console.warn(warning);
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/Alias.js":
/*!*******************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/Alias.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alias: () => (/* binding */ Alias)
/* harmony export */ });
/* harmony import */ var _doc_anchors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../doc/anchors.js */ "./node_modules/yaml/browser/dist/doc/anchors.js");
/* harmony import */ var _visit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../visit.js */ "./node_modules/yaml/browser/dist/visit.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Node.js */ "./node_modules/yaml/browser/dist/nodes/Node.js");
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./toJS.js */ "./node_modules/yaml/browser/dist/nodes/toJS.js");






class Alias extends _Node_js__WEBPACK_IMPORTED_MODULE_3__.NodeBase {
    constructor(source) {
        super(_identity_js__WEBPACK_IMPORTED_MODULE_2__.ALIAS);
        this.source = source;
        Object.defineProperty(this, 'tag', {
            set() {
                throw new Error('Alias nodes cannot have tags');
            }
        });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(doc) {
        let found = undefined;
        (0,_visit_js__WEBPACK_IMPORTED_MODULE_1__.visit)(doc, {
            Node: (_key, node) => {
                if (node === this)
                    return _visit_js__WEBPACK_IMPORTED_MODULE_1__.visit.BREAK;
                if (node.anchor === this.source)
                    found = node;
            }
        });
        return found;
    }
    toJSON(_arg, ctx) {
        if (!ctx)
            return { source: this.source };
        const { anchors, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc);
        if (!source) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new ReferenceError(msg);
        }
        let data = anchors.get(source);
        if (!data) {
            // Resolve anchors for Node.prototype.toJS()
            (0,_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(source, null, ctx);
            data = anchors.get(source);
        }
        /* istanbul ignore if */
        if (!data || data.res === undefined) {
            const msg = 'This should not happen: Alias anchor was not resolved?';
            throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
                data.aliasCount = getAliasCount(doc, source, anchors);
            if (data.count * data.aliasCount > maxAliasCount) {
                const msg = 'Excessive alias count indicates a resource exhaustion attack';
                throw new ReferenceError(msg);
            }
        }
        return data.res;
    }
    toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
            (0,_doc_anchors_js__WEBPACK_IMPORTED_MODULE_0__.anchorIsValid)(this.source);
            if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
                const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
                throw new Error(msg);
            }
            if (ctx.implicitKey)
                return `${src} `;
        }
        return src;
    }
}
function getAliasCount(doc, node, anchors) {
    if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isAlias)(node)) {
        const source = node.resolve(doc);
        const anchor = anchors && source && anchors.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
    }
    else if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isCollection)(node)) {
        let count = 0;
        for (const item of node.items) {
            const c = getAliasCount(doc, item, anchors);
            if (c > count)
                count = c;
        }
        return count;
    }
    else if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isPair)(node)) {
        const kc = getAliasCount(doc, node.key, anchors);
        const vc = getAliasCount(doc, node.value, anchors);
        return Math.max(kc, vc);
    }
    return 1;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/Collection.js":
/*!************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/Collection.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collection: () => (/* binding */ Collection),
/* harmony export */   collectionFromPath: () => (/* binding */ collectionFromPath),
/* harmony export */   isEmptyPath: () => (/* binding */ isEmptyPath)
/* harmony export */ });
/* harmony import */ var _doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../doc/createNode.js */ "./node_modules/yaml/browser/dist/doc/createNode.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Node.js */ "./node_modules/yaml/browser/dist/nodes/Node.js");




function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === 'number' && Number.isInteger(k) && k >= 0) {
            const a = [];
            a[k] = v;
            v = a;
        }
        else {
            v = new Map([[k, v]]);
        }
    }
    return (0,_doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__.createNode)(v, undefined, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
            throw new Error('This should not happen, please report a bug.');
        },
        schema,
        sourceObjects: new Map()
    });
}
// Type guard is intentionally a little wrong so as to be more useful,
// as it does not cover untypable empty non-string iterables (e.g. []).
const isEmptyPath = (path) => path == null ||
    (typeof path === 'object' && !!path[Symbol.iterator]().next().done);
class Collection extends _Node_js__WEBPACK_IMPORTED_MODULE_2__.NodeBase {
    constructor(type, schema) {
        super(type);
        Object.defineProperty(this, 'schema', {
            value: schema,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    /**
     * Create a copy of this collection.
     *
     * @param schema - If defined, overwrites the original's schema
     */
    clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
            copy.schema = schema;
        copy.items = copy.items.map(it => (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isNode)(it) || (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isPair)(it) ? it.clone(schema) : it);
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(path, value) {
        if (isEmptyPath(path))
            this.add(value);
        else {
            const [key, ...rest] = path;
            const node = this.get(key, true);
            if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node))
                node.addIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.delete(key);
        const node = this.get(key, true);
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node))
            return node.deleteIn(rest);
        else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
            return !keepScalar && (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node) ? node.value : node;
        else
            return (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
        return this.items.every(node => {
            if (!(0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isPair)(node))
                return false;
            const n = node.value;
            return (n == null ||
                (allowScalar &&
                    (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(n) &&
                    n.value == null &&
                    !n.commentBefore &&
                    !n.comment &&
                    !n.tag));
        });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.has(key);
        const node = this.get(key, true);
        return (0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node) ? node.hasIn(rest) : false;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
            this.set(key, value);
        }
        else {
            const node = this.get(key, true);
            if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node))
                node.setIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/Node.js":
/*!******************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/Node.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NodeBase: () => (/* binding */ NodeBase)
/* harmony export */ });
/* harmony import */ var _doc_applyReviver_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../doc/applyReviver.js */ "./node_modules/yaml/browser/dist/doc/applyReviver.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./toJS.js */ "./node_modules/yaml/browser/dist/nodes/toJS.js");




class NodeBase {
    constructor(type) {
        Object.defineProperty(this, _identity_js__WEBPACK_IMPORTED_MODULE_1__.NODE_TYPE, { value: type });
    }
    /** Create a copy of this node.  */
    clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /** A plain JavaScript representation of this node. */
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!(0,_identity_js__WEBPACK_IMPORTED_MODULE_1__.isDocument)(doc))
            throw new TypeError('A document argument is required');
        const ctx = {
            anchors: new Map(),
            doc,
            keep: true,
            mapAsMap: mapAsMap === true,
            mapKeyWarned: false,
            maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100
        };
        const res = (0,_toJS_js__WEBPACK_IMPORTED_MODULE_2__.toJS)(this, '', ctx);
        if (typeof onAnchor === 'function')
            for (const { count, res } of ctx.anchors.values())
                onAnchor(res, count);
        return typeof reviver === 'function'
            ? (0,_doc_applyReviver_js__WEBPACK_IMPORTED_MODULE_0__.applyReviver)(reviver, { '': res }, '', res)
            : res;
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/Pair.js":
/*!******************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/Pair.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pair: () => (/* binding */ Pair),
/* harmony export */   createPair: () => (/* binding */ createPair)
/* harmony export */ });
/* harmony import */ var _doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../doc/createNode.js */ "./node_modules/yaml/browser/dist/doc/createNode.js");
/* harmony import */ var _stringify_stringifyPair_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../stringify/stringifyPair.js */ "./node_modules/yaml/browser/dist/stringify/stringifyPair.js");
/* harmony import */ var _addPairToJSMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./addPairToJSMap.js */ "./node_modules/yaml/browser/dist/nodes/addPairToJSMap.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");





function createPair(key, value, ctx) {
    const k = (0,_doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__.createNode)(key, undefined, ctx);
    const v = (0,_doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__.createNode)(value, undefined, ctx);
    return new Pair(k, v);
}
class Pair {
    constructor(key, value = null) {
        Object.defineProperty(this, _identity_js__WEBPACK_IMPORTED_MODULE_3__.NODE_TYPE, { value: _identity_js__WEBPACK_IMPORTED_MODULE_3__.PAIR });
        this.key = key;
        this.value = value;
    }
    clone(schema) {
        let { key, value } = this;
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isNode)(key))
            key = key.clone(schema);
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isNode)(value))
            value = value.clone(schema);
        return new Pair(key, value);
    }
    toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? new Map() : {};
        return (0,_addPairToJSMap_js__WEBPACK_IMPORTED_MODULE_2__.addPairToJSMap)(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
        return ctx?.doc
            ? (0,_stringify_stringifyPair_js__WEBPACK_IMPORTED_MODULE_1__.stringifyPair)(this, ctx, onComment, onChompKeep)
            : JSON.stringify(this);
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/Scalar.js":
/*!********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/Scalar.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scalar: () => (/* binding */ Scalar),
/* harmony export */   isScalarValue: () => (/* binding */ isScalarValue)
/* harmony export */ });
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _Node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Node.js */ "./node_modules/yaml/browser/dist/nodes/Node.js");
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./toJS.js */ "./node_modules/yaml/browser/dist/nodes/toJS.js");




const isScalarValue = (value) => !value || (typeof value !== 'function' && typeof value !== 'object');
class Scalar extends _Node_js__WEBPACK_IMPORTED_MODULE_1__.NodeBase {
    constructor(value) {
        super(_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR);
        this.value = value;
    }
    toJSON(arg, ctx) {
        return ctx?.keep ? this.value : (0,_toJS_js__WEBPACK_IMPORTED_MODULE_2__.toJS)(this.value, arg, ctx);
    }
    toString() {
        return String(this.value);
    }
}
Scalar.BLOCK_FOLDED = 'BLOCK_FOLDED';
Scalar.BLOCK_LITERAL = 'BLOCK_LITERAL';
Scalar.PLAIN = 'PLAIN';
Scalar.QUOTE_DOUBLE = 'QUOTE_DOUBLE';
Scalar.QUOTE_SINGLE = 'QUOTE_SINGLE';




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/YAMLMap.js":
/*!*********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/YAMLMap.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLMap: () => (/* binding */ YAMLMap),
/* harmony export */   findPair: () => (/* binding */ findPair)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyCollection_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../stringify/stringifyCollection.js */ "./node_modules/yaml/browser/dist/stringify/stringifyCollection.js");
/* harmony import */ var _addPairToJSMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./addPairToJSMap.js */ "./node_modules/yaml/browser/dist/nodes/addPairToJSMap.js");
/* harmony import */ var _Collection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Collection.js */ "./node_modules/yaml/browser/dist/nodes/Collection.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _Pair_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Pair.js */ "./node_modules/yaml/browser/dist/nodes/Pair.js");
/* harmony import */ var _Scalar_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");







function findPair(items, key) {
    const k = (0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(key) ? key.value : key;
    for (const it of items) {
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isPair)(it)) {
            if (it.key === key || it.key === k)
                return it;
            if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(it.key) && it.key.value === k)
                return it;
        }
    }
    return undefined;
}
class YAMLMap extends _Collection_js__WEBPACK_IMPORTED_MODULE_2__.Collection {
    static get tagName() {
        return 'tag:yaml.org,2002:map';
    }
    constructor(schema) {
        super(_identity_js__WEBPACK_IMPORTED_MODULE_3__.MAP, schema);
        this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
            if (typeof replacer === 'function')
                value = replacer.call(obj, key, value);
            else if (Array.isArray(replacer) && !replacer.includes(key))
                return;
            if (value !== undefined || keepUndefined)
                map.items.push((0,_Pair_js__WEBPACK_IMPORTED_MODULE_4__.createPair)(key, value, ctx));
        };
        if (obj instanceof Map) {
            for (const [key, value] of obj)
                add(key, value);
        }
        else if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj))
                add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === 'function') {
            map.items.sort(schema.sortMapEntries);
        }
        return map;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(pair, overwrite) {
        let _pair;
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isPair)(pair))
            _pair = pair;
        else if (!pair || typeof pair !== 'object' || !('key' in pair)) {
            // In TypeScript, this never happens.
            _pair = new _Pair_js__WEBPACK_IMPORTED_MODULE_4__.Pair(pair, pair?.value);
        }
        else
            _pair = new _Pair_js__WEBPACK_IMPORTED_MODULE_4__.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
            if (!overwrite)
                throw new Error(`Key ${_pair.key} already set`);
            // For scalars, keep the old node & its comments and anchors
            if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(prev.value) && (0,_Scalar_js__WEBPACK_IMPORTED_MODULE_5__.isScalarValue)(_pair.value))
                prev.value.value = _pair.value;
            else
                prev.value = _pair.value;
        }
        else if (sortEntries) {
            const i = this.items.findIndex(item => sortEntries(_pair, item) < 0);
            if (i === -1)
                this.items.push(_pair);
            else
                this.items.splice(i, 0, _pair);
        }
        else {
            this.items.push(_pair);
        }
    }
    delete(key) {
        const it = findPair(this.items, key);
        if (!it)
            return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && (0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(node) ? node.value : node) ?? undefined;
    }
    has(key) {
        return !!findPair(this.items, key);
    }
    set(key, value) {
        this.add(new _Pair_js__WEBPACK_IMPORTED_MODULE_4__.Pair(key, value), true);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? new Map() : {};
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const item of this.items)
            (0,_addPairToJSMap_js__WEBPACK_IMPORTED_MODULE_1__.addPairToJSMap)(ctx, map, item);
        return map;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        for (const item of this.items) {
            if (!(0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isPair)(item))
                throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
            ctx = Object.assign({}, ctx, { allNullValues: true });
        return (0,_stringify_stringifyCollection_js__WEBPACK_IMPORTED_MODULE_0__.stringifyCollection)(this, ctx, {
            blockItemPrefix: '',
            flowChars: { start: '{', end: '}' },
            itemIndent: ctx.indent || '',
            onChompKeep,
            onComment
        });
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/YAMLSeq.js":
/*!*********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/YAMLSeq.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLSeq: () => (/* binding */ YAMLSeq)
/* harmony export */ });
/* harmony import */ var _doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../doc/createNode.js */ "./node_modules/yaml/browser/dist/doc/createNode.js");
/* harmony import */ var _stringify_stringifyCollection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../stringify/stringifyCollection.js */ "./node_modules/yaml/browser/dist/stringify/stringifyCollection.js");
/* harmony import */ var _Collection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Collection.js */ "./node_modules/yaml/browser/dist/nodes/Collection.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _Scalar_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./toJS.js */ "./node_modules/yaml/browser/dist/nodes/toJS.js");







class YAMLSeq extends _Collection_js__WEBPACK_IMPORTED_MODULE_2__.Collection {
    static get tagName() {
        return 'tag:yaml.org,2002:seq';
    }
    constructor(schema) {
        super(_identity_js__WEBPACK_IMPORTED_MODULE_3__.SEQ, schema);
        this.items = [];
    }
    add(value) {
        this.items.push(value);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return undefined;
        const it = this.items[idx];
        return !keepScalar && (0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(it) ? it.value : it;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(key) {
        const idx = asItemIndex(key);
        return typeof idx === 'number' && idx < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(prev) && (0,_Scalar_js__WEBPACK_IMPORTED_MODULE_4__.isScalarValue)(value))
            prev.value = value;
        else
            this.items[idx] = value;
    }
    toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
            ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
            seq.push((0,_toJS_js__WEBPACK_IMPORTED_MODULE_5__.toJS)(item, String(i++), ctx));
        return seq;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        return (0,_stringify_stringifyCollection_js__WEBPACK_IMPORTED_MODULE_1__.stringifyCollection)(this, ctx, {
            blockItemPrefix: '- ',
            flowChars: { start: '[', end: ']' },
            itemIndent: (ctx.indent || '') + '  ',
            onChompKeep,
            onComment
        });
    }
    static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
            let i = 0;
            for (let it of obj) {
                if (typeof replacer === 'function') {
                    const key = obj instanceof Set ? it : String(i++);
                    it = replacer.call(obj, key, it);
                }
                seq.items.push((0,_doc_createNode_js__WEBPACK_IMPORTED_MODULE_0__.createNode)(it, undefined, ctx));
            }
        }
        return seq;
    }
}
function asItemIndex(key) {
    let idx = (0,_identity_js__WEBPACK_IMPORTED_MODULE_3__.isScalar)(key) ? key.value : key;
    if (idx && typeof idx === 'string')
        idx = Number(idx);
    return typeof idx === 'number' && Number.isInteger(idx) && idx >= 0
        ? idx
        : null;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/addPairToJSMap.js":
/*!****************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/addPairToJSMap.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addPairToJSMap: () => (/* binding */ addPairToJSMap)
/* harmony export */ });
/* harmony import */ var _log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../log.js */ "./node_modules/yaml/browser/dist/log.js");
/* harmony import */ var _stringify_stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../stringify/stringify.js */ "./node_modules/yaml/browser/dist/stringify/stringify.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _Scalar_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _toJS_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./toJS.js */ "./node_modules/yaml/browser/dist/nodes/toJS.js");






const MERGE_KEY = '<<';
function addPairToJSMap(ctx, map, { key, value }) {
    if (ctx?.doc.schema.merge && isMergeKey(key)) {
        value = (0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isAlias)(value) ? value.resolve(ctx.doc) : value;
        if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isSeq)(value))
            for (const it of value.items)
                mergeToJSMap(ctx, map, it);
        else if (Array.isArray(value))
            for (const it of value)
                mergeToJSMap(ctx, map, it);
        else
            mergeToJSMap(ctx, map, value);
    }
    else {
        const jsKey = (0,_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(key, '', ctx);
        if (map instanceof Map) {
            map.set(jsKey, (0,_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(value, jsKey, ctx));
        }
        else if (map instanceof Set) {
            map.add(jsKey);
        }
        else {
            const stringKey = stringifyKey(key, jsKey, ctx);
            const jsValue = (0,_toJS_js__WEBPACK_IMPORTED_MODULE_4__.toJS)(value, stringKey, ctx);
            if (stringKey in map)
                Object.defineProperty(map, stringKey, {
                    value: jsValue,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            else
                map[stringKey] = jsValue;
        }
    }
    return map;
}
const isMergeKey = (key) => key === MERGE_KEY ||
    ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isScalar)(key) &&
        key.value === MERGE_KEY &&
        (!key.type || key.type === _Scalar_js__WEBPACK_IMPORTED_MODULE_3__.Scalar.PLAIN));
// If the value associated with a merge key is a single mapping node, each of
// its key/value pairs is inserted into the current mapping, unless the key
// already exists in it. If the value associated with the merge key is a
// sequence, then this sequence is expected to contain mapping nodes and each
// of these nodes is merged in turn according to its order in the sequence.
// Keys in mapping nodes earlier in the sequence override keys specified in
// later mapping nodes. -- http://yaml.org/type/merge.html
function mergeToJSMap(ctx, map, value) {
    const source = ctx && (0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isAlias)(value) ? value.resolve(ctx.doc) : value;
    if (!(0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isMap)(source))
        throw new Error('Merge sources must be maps or map aliases');
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value] of srcMap) {
        if (map instanceof Map) {
            if (!map.has(key))
                map.set(key, value);
        }
        else if (map instanceof Set) {
            map.add(key);
        }
        else if (!Object.prototype.hasOwnProperty.call(map, key)) {
            Object.defineProperty(map, key, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
    }
    return map;
}
function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
        return '';
    if (typeof jsKey !== 'object')
        return String(jsKey);
    if ((0,_identity_js__WEBPACK_IMPORTED_MODULE_2__.isNode)(key) && ctx?.doc) {
        const strCtx = (0,_stringify_stringify_js__WEBPACK_IMPORTED_MODULE_1__.createStringifyContext)(ctx.doc, {});
        strCtx.anchors = new Set();
        for (const node of ctx.anchors.keys())
            strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
            let jsonStr = JSON.stringify(strKey);
            if (jsonStr.length > 40)
                jsonStr = jsonStr.substring(0, 36) + '..."';
            (0,_log_js__WEBPACK_IMPORTED_MODULE_0__.warn)(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
            ctx.mapKeyWarned = true;
        }
        return strKey;
    }
    return JSON.stringify(jsKey);
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/identity.js":
/*!**********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/identity.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ALIAS: () => (/* binding */ ALIAS),
/* harmony export */   DOC: () => (/* binding */ DOC),
/* harmony export */   MAP: () => (/* binding */ MAP),
/* harmony export */   NODE_TYPE: () => (/* binding */ NODE_TYPE),
/* harmony export */   PAIR: () => (/* binding */ PAIR),
/* harmony export */   SCALAR: () => (/* binding */ SCALAR),
/* harmony export */   SEQ: () => (/* binding */ SEQ),
/* harmony export */   hasAnchor: () => (/* binding */ hasAnchor),
/* harmony export */   isAlias: () => (/* binding */ isAlias),
/* harmony export */   isCollection: () => (/* binding */ isCollection),
/* harmony export */   isDocument: () => (/* binding */ isDocument),
/* harmony export */   isMap: () => (/* binding */ isMap),
/* harmony export */   isNode: () => (/* binding */ isNode),
/* harmony export */   isPair: () => (/* binding */ isPair),
/* harmony export */   isScalar: () => (/* binding */ isScalar),
/* harmony export */   isSeq: () => (/* binding */ isSeq)
/* harmony export */ });
const ALIAS = Symbol.for('yaml.alias');
const DOC = Symbol.for('yaml.document');
const MAP = Symbol.for('yaml.map');
const PAIR = Symbol.for('yaml.pair');
const SCALAR = Symbol.for('yaml.scalar');
const SEQ = Symbol.for('yaml.seq');
const NODE_TYPE = Symbol.for('yaml.node.type');
const isAlias = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
const isDocument = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
const isMap = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
const isPair = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
const isScalar = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR;
const isSeq = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
function isCollection(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case MAP:
            case SEQ:
                return true;
        }
    return false;
}
function isNode(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case ALIAS:
            case MAP:
            case SCALAR:
            case SEQ:
                return true;
        }
    return false;
}
const hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;




/***/ }),

/***/ "./node_modules/yaml/browser/dist/nodes/toJS.js":
/*!******************************************************!*\
  !*** ./node_modules/yaml/browser/dist/nodes/toJS.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toJS: () => (/* binding */ toJS)
/* harmony export */ });
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");


/**
 * Recursively convert any node or its contents to native JavaScript
 *
 * @param value - The input value
 * @param arg - If `value` defines a `toJSON()` method, use this
 *   as its first argument
 * @param ctx - Conversion context, originally set in Document#toJS(). If
 *   `{ keep: true }` is not set, output should be suitable for JSON
 *   stringification.
 */
function toJS(value, arg, ctx) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!ctx || !(0,_identity_js__WEBPACK_IMPORTED_MODULE_0__.hasAnchor)(value))
            return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: undefined };
        ctx.anchors.set(value, data);
        ctx.onCreate = res => {
            data.res = res;
            delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
            ctx.onCreate(res);
        return res;
    }
    if (typeof value === 'bigint' && !ctx?.keep)
        return Number(value);
    return value;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/parse/cst-scalar.js":
/*!************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/parse/cst-scalar.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createScalarToken: () => (/* binding */ createScalarToken),
/* harmony export */   resolveAsScalar: () => (/* binding */ resolveAsScalar),
/* harmony export */   setScalarValue: () => (/* binding */ setScalarValue)
/* harmony export */ });
/* harmony import */ var _compose_resolve_block_scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../compose/resolve-block-scalar.js */ "./node_modules/yaml/browser/dist/compose/resolve-block-scalar.js");
/* harmony import */ var _compose_resolve_flow_scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../compose/resolve-flow-scalar.js */ "./node_modules/yaml/browser/dist/compose/resolve-flow-scalar.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../errors.js */ "./node_modules/yaml/browser/dist/errors.js");
/* harmony import */ var _stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../stringify/stringifyString.js */ "./node_modules/yaml/browser/dist/stringify/stringifyString.js");





function resolveAsScalar(token, strict = true, onError) {
    if (token) {
        const _onError = (pos, code, message) => {
            const offset = typeof pos === 'number' ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
            if (onError)
                onError(offset, code, message);
            else
                throw new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return (0,_compose_resolve_flow_scalar_js__WEBPACK_IMPORTED_MODULE_1__.resolveFlowScalar)(token, strict, _onError);
            case 'block-scalar':
                return (0,_compose_resolve_block_scalar_js__WEBPACK_IMPORTED_MODULE_0__.resolveBlockScalar)({ options: { strict } }, token, _onError);
        }
    }
    return null;
}
/**
 * Create a new scalar token with `value`
 *
 * Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`,
 * as this function does not support any schema operations and won't check for such conflicts.
 *
 * @param value The string representation of the value, which will have its content properly indented.
 * @param context.end Comments and whitespace after the end of the value, or after the block scalar header. If undefined, a newline will be added.
 * @param context.implicitKey Being within an implicit key may affect the resolved type of the token's value.
 * @param context.indent The indent level of the token.
 * @param context.inFlow Is this scalar within a flow collection? This may affect the resolved type of the token's value.
 * @param context.offset The offset position of the token.
 * @param context.type The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`.
 */
function createScalarToken(value, context) {
    const { implicitKey = false, indent, inFlow = false, offset = -1, type = 'PLAIN' } = context;
    const source = (0,_stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_3__.stringifyString)({ type, value }, {
        implicitKey,
        indent: indent > 0 ? ' '.repeat(indent) : '',
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
    });
    const end = context.end ?? [
        { type: 'newline', offset: -1, indent, source: '\n' }
    ];
    switch (source[0]) {
        case '|':
        case '>': {
            const he = source.indexOf('\n');
            const head = source.substring(0, he);
            const body = source.substring(he + 1) + '\n';
            const props = [
                { type: 'block-scalar-header', offset, indent, source: head }
            ];
            if (!addEndtoBlockProps(props, end))
                props.push({ type: 'newline', offset: -1, indent, source: '\n' });
            return { type: 'block-scalar', offset, indent, props, source: body };
        }
        case '"':
            return { type: 'double-quoted-scalar', offset, indent, source, end };
        case "'":
            return { type: 'single-quoted-scalar', offset, indent, source, end };
        default:
            return { type: 'scalar', offset, indent, source, end };
    }
}
/**
 * Set the value of `token` to the given string `value`, overwriting any previous contents and type that it may have.
 *
 * Best efforts are made to retain any comments previously associated with the `token`,
 * though all contents within a collection's `items` will be overwritten.
 *
 * Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`,
 * as this function does not support any schema operations and won't check for such conflicts.
 *
 * @param token Any token. If it does not include an `indent` value, the value will be stringified as if it were an implicit key.
 * @param value The string representation of the value, which will have its content properly indented.
 * @param context.afterKey In most cases, values after a key should have an additional level of indentation.
 * @param context.implicitKey Being within an implicit key may affect the resolved type of the token's value.
 * @param context.inFlow Being within a flow collection may affect the resolved type of the token's value.
 * @param context.type The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`.
 */
function setScalarValue(token, value, context = {}) {
    let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
    let indent = 'indent' in token ? token.indent : null;
    if (afterKey && typeof indent === 'number')
        indent += 2;
    if (!type)
        switch (token.type) {
            case 'single-quoted-scalar':
                type = 'QUOTE_SINGLE';
                break;
            case 'double-quoted-scalar':
                type = 'QUOTE_DOUBLE';
                break;
            case 'block-scalar': {
                const header = token.props[0];
                if (header.type !== 'block-scalar-header')
                    throw new Error('Invalid block scalar header');
                type = header.source[0] === '>' ? 'BLOCK_FOLDED' : 'BLOCK_LITERAL';
                break;
            }
            default:
                type = 'PLAIN';
        }
    const source = (0,_stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_3__.stringifyString)({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? ' '.repeat(indent) : '',
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
    });
    switch (source[0]) {
        case '|':
        case '>':
            setBlockScalarValue(token, source);
            break;
        case '"':
            setFlowScalarValue(token, source, 'double-quoted-scalar');
            break;
        case "'":
            setFlowScalarValue(token, source, 'single-quoted-scalar');
            break;
        default:
            setFlowScalarValue(token, source, 'scalar');
    }
}
function setBlockScalarValue(token, source) {
    const he = source.indexOf('\n');
    const head = source.substring(0, he);
    const body = source.substring(he + 1) + '\n';
    if (token.type === 'block-scalar') {
        const header = token.props[0];
        if (header.type !== 'block-scalar-header')
            throw new Error('Invalid block scalar header');
        header.source = head;
        token.source = body;
    }
    else {
        const { offset } = token;
        const indent = 'indent' in token ? token.indent : -1;
        const props = [
            { type: 'block-scalar-header', offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, 'end' in token ? token.end : undefined))
            props.push({ type: 'newline', offset: -1, indent, source: '\n' });
        for (const key of Object.keys(token))
            if (key !== 'type' && key !== 'offset')
                delete token[key];
        Object.assign(token, { type: 'block-scalar', indent, props, source: body });
    }
}
/** @returns `true` if last token is a newline */
function addEndtoBlockProps(props, end) {
    if (end)
        for (const st of end)
            switch (st.type) {
                case 'space':
                case 'comment':
                    props.push(st);
                    break;
                case 'newline':
                    props.push(st);
                    return true;
            }
    return false;
}
function setFlowScalarValue(token, source, type) {
    switch (token.type) {
        case 'scalar':
        case 'double-quoted-scalar':
        case 'single-quoted-scalar':
            token.type = type;
            token.source = source;
            break;
        case 'block-scalar': {
            const end = token.props.slice(1);
            let oa = source.length;
            if (token.props[0].type === 'block-scalar-header')
                oa -= token.props[0].source.length;
            for (const tok of end)
                tok.offset += oa;
            delete token.props;
            Object.assign(token, { type, source, end });
            break;
        }
        case 'block-map':
        case 'block-seq': {
            const offset = token.offset + source.length;
            const nl = { type: 'newline', offset, indent: token.indent, source: '\n' };
            delete token.items;
            Object.assign(token, { type, source, end: [nl] });
            break;
        }
        default: {
            const indent = 'indent' in token ? token.indent : -1;
            const end = 'end' in token && Array.isArray(token.end)
                ? token.end.filter(st => st.type === 'space' ||
                    st.type === 'comment' ||
                    st.type === 'newline')
                : [];
            for (const key of Object.keys(token))
                if (key !== 'type' && key !== 'offset')
                    delete token[key];
            Object.assign(token, { type, indent, source, end });
        }
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/parse/cst-stringify.js":
/*!***************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/parse/cst-stringify.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringify: () => (/* binding */ stringify)
/* harmony export */ });
/**
 * Stringify a CST document, token, or collection item
 *
 * Fair warning: This applies no validation whatsoever, and
 * simply concatenates the sources in their logical order.
 */
const stringify = (cst) => 'type' in cst ? stringifyToken(cst) : stringifyItem(cst);
function stringifyToken(token) {
    switch (token.type) {
        case 'block-scalar': {
            let res = '';
            for (const tok of token.props)
                res += stringifyToken(tok);
            return res + token.source;
        }
        case 'block-map':
        case 'block-seq': {
            let res = '';
            for (const item of token.items)
                res += stringifyItem(item);
            return res;
        }
        case 'flow-collection': {
            let res = token.start.source;
            for (const item of token.items)
                res += stringifyItem(item);
            for (const st of token.end)
                res += st.source;
            return res;
        }
        case 'document': {
            let res = stringifyItem(token);
            if (token.end)
                for (const st of token.end)
                    res += st.source;
            return res;
        }
        default: {
            let res = token.source;
            if ('end' in token && token.end)
                for (const st of token.end)
                    res += st.source;
            return res;
        }
    }
}
function stringifyItem({ start, key, sep, value }) {
    let res = '';
    for (const st of start)
        res += st.source;
    if (key)
        res += stringifyToken(key);
    if (sep)
        for (const st of sep)
            res += st.source;
    if (value)
        res += stringifyToken(value);
    return res;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/parse/cst-visit.js":
/*!***********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/parse/cst-visit.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   visit: () => (/* binding */ visit)
/* harmony export */ });
const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove item');
/**
 * Apply a visitor to a CST document or item.
 *
 * Walks through the tree (depth-first) starting from the root, calling a
 * `visitor` function with two arguments when entering each item:
 *   - `item`: The current item, which included the following members:
 *     - `start: SourceToken[]` – Source tokens before the key or value,
 *       possibly including its anchor or tag.
 *     - `key?: Token | null` – Set for pair values. May then be `null`, if
 *       the key before the `:` separator is empty.
 *     - `sep?: SourceToken[]` – Source tokens between the key and the value,
 *       which should include the `:` map value indicator if `value` is set.
 *     - `value?: Token` – The value of a sequence item, or of a map pair.
 *   - `path`: The steps from the root to the current node, as an array of
 *     `['key' | 'value', number]` tuples.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this token, continue with
 *      next sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current item, then continue with the next one
 *   - `number`: Set the index of the next step. This is useful especially if
 *     the index of the current token has changed.
 *   - `function`: Define the next visitor for this item. After the original
 *     visitor is called on item entry, next visitors are called after handling
 *     a non-empty `key` and when exiting the item.
 */
function visit(cst, visitor) {
    if ('type' in cst && cst.type === 'document')
        cst = { start: cst.start, value: cst.value };
    _visit(Object.freeze([]), cst, visitor);
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current item */
visit.SKIP = SKIP;
/** Remove the current item */
visit.REMOVE = REMOVE;
/** Find the item at `path` from `cst` as the root */
visit.itemAtPath = (cst, path) => {
    let item = cst;
    for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && 'items' in tok) {
            item = tok.items[index];
        }
        else
            return undefined;
    }
    return item;
};
/**
 * Get the immediate parent collection of the item at `path` from `cst` as the root.
 *
 * Throws an error if the collection is not found, which should never happen if the item itself exists.
 */
visit.parentCollection = (cst, path) => {
    const parent = visit.itemAtPath(cst, path.slice(0, -1));
    const field = path[path.length - 1][0];
    const coll = parent?.[field];
    if (coll && 'items' in coll)
        return coll;
    throw new Error('Parent collection not found');
};
function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === 'symbol')
        return ctrl;
    for (const field of ['key', 'value']) {
        const token = item[field];
        if (token && 'items' in token) {
            for (let i = 0; i < token.items.length; ++i) {
                const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    token.items.splice(i, 1);
                    i -= 1;
                }
            }
            if (typeof ctrl === 'function' && field === 'key')
                ctrl = ctrl(item, path);
        }
    }
    return typeof ctrl === 'function' ? ctrl(item, path) : ctrl;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/parse/cst.js":
/*!*****************************************************!*\
  !*** ./node_modules/yaml/browser/dist/parse/cst.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BOM: () => (/* binding */ BOM),
/* harmony export */   DOCUMENT: () => (/* binding */ DOCUMENT),
/* harmony export */   FLOW_END: () => (/* binding */ FLOW_END),
/* harmony export */   SCALAR: () => (/* binding */ SCALAR),
/* harmony export */   createScalarToken: () => (/* reexport safe */ _cst_scalar_js__WEBPACK_IMPORTED_MODULE_0__.createScalarToken),
/* harmony export */   isCollection: () => (/* binding */ isCollection),
/* harmony export */   isScalar: () => (/* binding */ isScalar),
/* harmony export */   prettyToken: () => (/* binding */ prettyToken),
/* harmony export */   resolveAsScalar: () => (/* reexport safe */ _cst_scalar_js__WEBPACK_IMPORTED_MODULE_0__.resolveAsScalar),
/* harmony export */   setScalarValue: () => (/* reexport safe */ _cst_scalar_js__WEBPACK_IMPORTED_MODULE_0__.setScalarValue),
/* harmony export */   stringify: () => (/* reexport safe */ _cst_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify),
/* harmony export */   tokenType: () => (/* binding */ tokenType),
/* harmony export */   visit: () => (/* reexport safe */ _cst_visit_js__WEBPACK_IMPORTED_MODULE_2__.visit)
/* harmony export */ });
/* harmony import */ var _cst_scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cst-scalar.js */ "./node_modules/yaml/browser/dist/parse/cst-scalar.js");
/* harmony import */ var _cst_stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./cst-stringify.js */ "./node_modules/yaml/browser/dist/parse/cst-stringify.js");
/* harmony import */ var _cst_visit_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cst-visit.js */ "./node_modules/yaml/browser/dist/parse/cst-visit.js");




/** The byte order mark */
const BOM = '\u{FEFF}';
/** Start of doc-mode */
const DOCUMENT = '\x02'; // C0: Start of Text
/** Unexpected end of flow-mode */
const FLOW_END = '\x18'; // C0: Cancel
/** Next token is a scalar value */
const SCALAR = '\x1f'; // C0: Unit Separator
/** @returns `true` if `token` is a flow or block collection */
const isCollection = (token) => !!token && 'items' in token;
/** @returns `true` if `token` is a flow or block scalar; not an alias */
const isScalar = (token) => !!token &&
    (token.type === 'scalar' ||
        token.type === 'single-quoted-scalar' ||
        token.type === 'double-quoted-scalar' ||
        token.type === 'block-scalar');
/* istanbul ignore next */
/** Get a printable representation of a lexer token */
function prettyToken(token) {
    switch (token) {
        case BOM:
            return '<BOM>';
        case DOCUMENT:
            return '<DOC>';
        case FLOW_END:
            return '<FLOW_END>';
        case SCALAR:
            return '<SCALAR>';
        default:
            return JSON.stringify(token);
    }
}
/** Identify the type of a lexer token. May return `null` for unknown tokens. */
function tokenType(source) {
    switch (source) {
        case BOM:
            return 'byte-order-mark';
        case DOCUMENT:
            return 'doc-mode';
        case FLOW_END:
            return 'flow-error-end';
        case SCALAR:
            return 'scalar';
        case '---':
            return 'doc-start';
        case '...':
            return 'doc-end';
        case '':
        case '\n':
        case '\r\n':
            return 'newline';
        case '-':
            return 'seq-item-ind';
        case '?':
            return 'explicit-key-ind';
        case ':':
            return 'map-value-ind';
        case '{':
            return 'flow-map-start';
        case '}':
            return 'flow-map-end';
        case '[':
            return 'flow-seq-start';
        case ']':
            return 'flow-seq-end';
        case ',':
            return 'comma';
    }
    switch (source[0]) {
        case ' ':
        case '\t':
            return 'space';
        case '#':
            return 'comment';
        case '%':
            return 'directive-line';
        case '*':
            return 'alias';
        case '&':
            return 'anchor';
        case '!':
            return 'tag';
        case "'":
            return 'single-quoted-scalar';
        case '"':
            return 'double-quoted-scalar';
        case '|':
        case '>':
            return 'block-scalar-header';
    }
    return null;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/parse/lexer.js":
/*!*******************************************************!*\
  !*** ./node_modules/yaml/browser/dist/parse/lexer.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Lexer: () => (/* binding */ Lexer)
/* harmony export */ });
/* harmony import */ var _cst_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cst.js */ "./node_modules/yaml/browser/dist/parse/cst.js");


/*
START -> stream

stream
  directive -> line-end -> stream
  indent + line-end -> stream
  [else] -> line-start

line-end
  comment -> line-end
  newline -> .
  input-end -> END

line-start
  doc-start -> doc
  doc-end -> stream
  [else] -> indent -> block-start

block-start
  seq-item-start -> block-start
  explicit-key-start -> block-start
  map-value-start -> block-start
  [else] -> doc

doc
  line-end -> line-start
  spaces -> doc
  anchor -> doc
  tag -> doc
  flow-start -> flow -> doc
  flow-end -> error -> doc
  seq-item-start -> error -> doc
  explicit-key-start -> error -> doc
  map-value-start -> doc
  alias -> doc
  quote-start -> quoted-scalar -> doc
  block-scalar-header -> line-end -> block-scalar(min) -> line-start
  [else] -> plain-scalar(false, min) -> doc

flow
  line-end -> flow
  spaces -> flow
  anchor -> flow
  tag -> flow
  flow-start -> flow -> flow
  flow-end -> .
  seq-item-start -> error -> flow
  explicit-key-start -> flow
  map-value-start -> flow
  alias -> flow
  quote-start -> quoted-scalar -> flow
  comma -> flow
  [else] -> plain-scalar(true, 0) -> flow

quoted-scalar
  quote-end -> .
  [else] -> quoted-scalar

block-scalar(min)
  newline + peek(indent < min) -> .
  [else] -> block-scalar(min)

plain-scalar(is-flow, min)
  scalar-end(is-flow) -> .
  peek(newline + (indent < min)) -> .
  [else] -> plain-scalar(min)
*/
function isEmpty(ch) {
    switch (ch) {
        case undefined:
        case ' ':
        case '\n':
        case '\r':
        case '\t':
            return true;
        default:
            return false;
    }
}
const hexDigits = new Set('0123456789ABCDEFabcdef');
const tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
const flowIndicatorChars = new Set(',[]{}');
const invalidAnchorChars = new Set(' ,[]{}\n\r\t');
const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
/**
 * Splits an input string into lexical tokens, i.e. smaller strings that are
 * easily identifiable by `tokens.tokenType()`.
 *
 * Lexing starts always in a "stream" context. Incomplete input may be buffered
 * until a complete token can be emitted.
 *
 * In addition to slices of the original input, the following control characters
 * may also be emitted:
 *
 * - `\x02` (Start of Text): A document starts with the next token
 * - `\x18` (Cancel): Unexpected end of flow-mode (indicates an error)
 * - `\x1f` (Unit Separator): Next token is a scalar value
 * - `\u{FEFF}` (Byte order mark): Emitted separately outside documents
 */
class Lexer {
    constructor() {
        /**
         * Flag indicating whether the end of the current buffer marks the end of
         * all input
         */
        this.atEnd = false;
        /**
         * Explicit indent set in block scalar header, as an offset from the current
         * minimum indent, so e.g. set to 1 from a header `|2+`. Set to -1 if not
         * explicitly set.
         */
        this.blockScalarIndent = -1;
        /**
         * Block scalars that include a + (keep) chomping indicator in their header
         * include trailing empty lines, which are otherwise excluded from the
         * scalar's contents.
         */
        this.blockScalarKeep = false;
        /** Current input */
        this.buffer = '';
        /**
         * Flag noting whether the map value indicator : can immediately follow this
         * node within a flow context.
         */
        this.flowKey = false;
        /** Count of surrounding flow collection levels. */
        this.flowLevel = 0;
        /**
         * Minimum level of indentation required for next lines to be parsed as a
         * part of the current scalar value.
         */
        this.indentNext = 0;
        /** Indentation level of the current line. */
        this.indentValue = 0;
        /** Position of the next \n character. */
        this.lineEndPos = null;
        /** Stores the state of the lexer if reaching the end of incpomplete input */
        this.next = null;
        /** A pointer to `buffer`; the current position of the lexer. */
        this.pos = 0;
    }
    /**
     * Generate YAML tokens from the `source` string. If `incomplete`,
     * a part of the last line may be left as a buffer for the next call.
     *
     * @returns A generator of lexical tokens
     */
    *lex(source, incomplete = false) {
        if (source) {
            if (typeof source !== 'string')
                throw TypeError('source is not a string');
            this.buffer = this.buffer ? this.buffer + source : source;
            this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? 'stream';
        while (next && (incomplete || this.hasChars(1)))
            next = yield* this.parseNext(next);
    }
    atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === ' ' || ch === '\t')
            ch = this.buffer[++i];
        if (!ch || ch === '#' || ch === '\n')
            return true;
        if (ch === '\r')
            return this.buffer[i + 1] === '\n';
        return false;
    }
    charAt(n) {
        return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
            let indent = 0;
            while (ch === ' ')
                ch = this.buffer[++indent + offset];
            if (ch === '\r') {
                const next = this.buffer[indent + offset + 1];
                if (next === '\n' || (!next && !this.atEnd))
                    return offset + indent + 1;
            }
            return ch === '\n' || indent >= this.indentNext || (!ch && !this.atEnd)
                ? offset + indent
                : -1;
        }
        if (ch === '-' || ch === '.') {
            const dt = this.buffer.substr(offset, 3);
            if ((dt === '---' || dt === '...') && isEmpty(this.buffer[offset + 3]))
                return -1;
        }
        return offset;
    }
    getLine() {
        let end = this.lineEndPos;
        if (typeof end !== 'number' || (end !== -1 && end < this.pos)) {
            end = this.buffer.indexOf('\n', this.pos);
            this.lineEndPos = end;
        }
        if (end === -1)
            return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === '\r')
            end -= 1;
        return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
        return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
    }
    peek(n) {
        return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
        switch (next) {
            case 'stream':
                return yield* this.parseStream();
            case 'line-start':
                return yield* this.parseLineStart();
            case 'block-start':
                return yield* this.parseBlockStart();
            case 'doc':
                return yield* this.parseDocument();
            case 'flow':
                return yield* this.parseFlowCollection();
            case 'quoted-scalar':
                return yield* this.parseQuotedScalar();
            case 'block-scalar':
                return yield* this.parseBlockScalar();
            case 'plain-scalar':
                return yield* this.parsePlainScalar();
        }
    }
    *parseStream() {
        let line = this.getLine();
        if (line === null)
            return this.setNext('stream');
        if (line[0] === _cst_js__WEBPACK_IMPORTED_MODULE_0__.BOM) {
            yield* this.pushCount(1);
            line = line.substring(1);
        }
        if (line[0] === '%') {
            let dirEnd = line.length;
            let cs = line.indexOf('#');
            while (cs !== -1) {
                const ch = line[cs - 1];
                if (ch === ' ' || ch === '\t') {
                    dirEnd = cs - 1;
                    break;
                }
                else {
                    cs = line.indexOf('#', cs + 1);
                }
            }
            while (true) {
                const ch = line[dirEnd - 1];
                if (ch === ' ' || ch === '\t')
                    dirEnd -= 1;
                else
                    break;
            }
            const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
            yield* this.pushCount(line.length - n); // possible comment
            this.pushNewline();
            return 'stream';
        }
        if (this.atLineEnd()) {
            const sp = yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - sp);
            yield* this.pushNewline();
            return 'stream';
        }
        yield _cst_js__WEBPACK_IMPORTED_MODULE_0__.DOCUMENT;
        return yield* this.parseLineStart();
    }
    *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
            return this.setNext('line-start');
        if (ch === '-' || ch === '.') {
            if (!this.atEnd && !this.hasChars(4))
                return this.setNext('line-start');
            const s = this.peek(3);
            if ((s === '---' || s === '...') && isEmpty(this.charAt(3))) {
                yield* this.pushCount(3);
                this.indentValue = 0;
                this.indentNext = 0;
                return s === '---' ? 'doc' : 'stream';
            }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
            this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
            return this.setNext('block-start');
        if ((ch0 === '-' || ch0 === '?' || ch0 === ':') && isEmpty(ch1)) {
            const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
            this.indentNext = this.indentValue + 1;
            this.indentValue += n;
            return yield* this.parseBlockStart();
        }
        return 'doc';
    }
    *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
            return this.setNext('doc');
        let n = yield* this.pushIndicators();
        switch (line[n]) {
            case '#':
                yield* this.pushCount(line.length - n);
            // fallthrough
            case undefined:
                yield* this.pushNewline();
                return yield* this.parseLineStart();
            case '{':
            case '[':
                yield* this.pushCount(1);
                this.flowKey = false;
                this.flowLevel = 1;
                return 'flow';
            case '}':
            case ']':
                // this is an error
                yield* this.pushCount(1);
                return 'doc';
            case '*':
                yield* this.pushUntil(isNotAnchorChar);
                return 'doc';
            case '"':
            case "'":
                return yield* this.parseQuotedScalar();
            case '|':
            case '>':
                n += yield* this.parseBlockScalarHeader();
                n += yield* this.pushSpaces(true);
                yield* this.pushCount(line.length - n);
                yield* this.pushNewline();
                return yield* this.parseBlockScalar();
            default:
                return yield* this.parsePlainScalar();
        }
    }
    *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
            nl = yield* this.pushNewline();
            if (nl > 0) {
                sp = yield* this.pushSpaces(false);
                this.indentValue = indent = sp;
            }
            else {
                sp = 0;
            }
            sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
            return this.setNext('flow');
        if ((indent !== -1 && indent < this.indentNext && line[0] !== '#') ||
            (indent === 0 &&
                (line.startsWith('---') || line.startsWith('...')) &&
                isEmpty(line[3]))) {
            // Allowing for the terminal ] or } at the same (rather than greater)
            // indent level as the initial [ or { is technically invalid, but
            // failing here would be surprising to users.
            const atFlowEndMarker = indent === this.indentNext - 1 &&
                this.flowLevel === 1 &&
                (line[0] === ']' || line[0] === '}');
            if (!atFlowEndMarker) {
                // this is an error
                this.flowLevel = 0;
                yield _cst_js__WEBPACK_IMPORTED_MODULE_0__.FLOW_END;
                return yield* this.parseLineStart();
            }
        }
        let n = 0;
        while (line[n] === ',') {
            n += yield* this.pushCount(1);
            n += yield* this.pushSpaces(true);
            this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
            case undefined:
                return 'flow';
            case '#':
                yield* this.pushCount(line.length - n);
                return 'flow';
            case '{':
            case '[':
                yield* this.pushCount(1);
                this.flowKey = false;
                this.flowLevel += 1;
                return 'flow';
            case '}':
            case ']':
                yield* this.pushCount(1);
                this.flowKey = true;
                this.flowLevel -= 1;
                return this.flowLevel ? 'flow' : 'doc';
            case '*':
                yield* this.pushUntil(isNotAnchorChar);
                return 'flow';
            case '"':
            case "'":
                this.flowKey = true;
                return yield* this.parseQuotedScalar();
            case ':': {
                const next = this.charAt(1);
                if (this.flowKey || isEmpty(next) || next === ',') {
                    this.flowKey = false;
                    yield* this.pushCount(1);
                    yield* this.pushSpaces(true);
                    return 'flow';
                }
            }
            // fallthrough
            default:
                this.flowKey = false;
                return yield* this.parsePlainScalar();
        }
    }
    *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
            while (end !== -1 && this.buffer[end + 1] === "'")
                end = this.buffer.indexOf("'", end + 2);
        }
        else {
            // double-quote
            while (end !== -1) {
                let n = 0;
                while (this.buffer[end - 1 - n] === '\\')
                    n += 1;
                if (n % 2 === 0)
                    break;
                end = this.buffer.indexOf('"', end + 1);
            }
        }
        // Only looking for newlines within the quotes
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf('\n', this.pos);
        if (nl !== -1) {
            while (nl !== -1) {
                const cs = this.continueScalar(nl + 1);
                if (cs === -1)
                    break;
                nl = qb.indexOf('\n', cs);
            }
            if (nl !== -1) {
                // this is an error caused by an unexpected unindent
                end = nl - (qb[nl - 1] === '\r' ? 2 : 1);
            }
        }
        if (end === -1) {
            if (!this.atEnd)
                return this.setNext('quoted-scalar');
            end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? 'flow' : 'doc';
    }
    *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
            const ch = this.buffer[++i];
            if (ch === '+')
                this.blockScalarKeep = true;
            else if (ch > '0' && ch <= '9')
                this.blockScalarIndent = Number(ch) - 1;
            else if (ch !== '-')
                break;
        }
        return yield* this.pushUntil(ch => isEmpty(ch) || ch === '#');
    }
    *parseBlockScalar() {
        let nl = this.pos - 1; // may be -1 if this.pos === 0
        let indent = 0;
        let ch;
        loop: for (let i = this.pos; (ch = this.buffer[i]); ++i) {
            switch (ch) {
                case ' ':
                    indent += 1;
                    break;
                case '\n':
                    nl = i;
                    indent = 0;
                    break;
                case '\r': {
                    const next = this.buffer[i + 1];
                    if (!next && !this.atEnd)
                        return this.setNext('block-scalar');
                    if (next === '\n')
                        break;
                } // fallthrough
                default:
                    break loop;
            }
        }
        if (!ch && !this.atEnd)
            return this.setNext('block-scalar');
        if (indent >= this.indentNext) {
            if (this.blockScalarIndent === -1)
                this.indentNext = indent;
            else {
                this.indentNext =
                    this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
            }
            do {
                const cs = this.continueScalar(nl + 1);
                if (cs === -1)
                    break;
                nl = this.buffer.indexOf('\n', cs);
            } while (nl !== -1);
            if (nl === -1) {
                if (!this.atEnd)
                    return this.setNext('block-scalar');
                nl = this.buffer.length;
            }
        }
        // Trailing insufficiently indented tabs are invalid.
        // To catch that during parsing, we include them in the block scalar value.
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === ' ')
            ch = this.buffer[++i];
        if (ch === '\t') {
            while (ch === '\t' || ch === ' ' || ch === '\r' || ch === '\n')
                ch = this.buffer[++i];
            nl = i - 1;
        }
        else if (!this.blockScalarKeep) {
            do {
                let i = nl - 1;
                let ch = this.buffer[i];
                if (ch === '\r')
                    ch = this.buffer[--i];
                const lastChar = i; // Drop the line if last char not more indented
                while (ch === ' ')
                    ch = this.buffer[--i];
                if (ch === '\n' && i >= this.pos && i + 1 + indent > lastChar)
                    nl = i;
                else
                    break;
            } while (true);
        }
        yield _cst_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while ((ch = this.buffer[++i])) {
            if (ch === ':') {
                const next = this.buffer[i + 1];
                if (isEmpty(next) || (inFlow && flowIndicatorChars.has(next)))
                    break;
                end = i;
            }
            else if (isEmpty(ch)) {
                let next = this.buffer[i + 1];
                if (ch === '\r') {
                    if (next === '\n') {
                        i += 1;
                        ch = '\n';
                        next = this.buffer[i + 1];
                    }
                    else
                        end = i;
                }
                if (next === '#' || (inFlow && flowIndicatorChars.has(next)))
                    break;
                if (ch === '\n') {
                    const cs = this.continueScalar(i + 1);
                    if (cs === -1)
                        break;
                    i = Math.max(i, cs - 2); // to advance, but still account for ' #'
                }
            }
            else {
                if (inFlow && flowIndicatorChars.has(ch))
                    break;
                end = i;
            }
        }
        if (!ch && !this.atEnd)
            return this.setNext('plain-scalar');
        yield _cst_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? 'flow' : 'doc';
    }
    *pushCount(n) {
        if (n > 0) {
            yield this.buffer.substr(this.pos, n);
            this.pos += n;
            return n;
        }
        return 0;
    }
    *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
            yield s;
            this.pos += s.length;
            return s.length;
        }
        else if (allowEmpty)
            yield '';
        return 0;
    }
    *pushIndicators() {
        switch (this.charAt(0)) {
            case '!':
                return ((yield* this.pushTag()) +
                    (yield* this.pushSpaces(true)) +
                    (yield* this.pushIndicators()));
            case '&':
                return ((yield* this.pushUntil(isNotAnchorChar)) +
                    (yield* this.pushSpaces(true)) +
                    (yield* this.pushIndicators()));
            case '-': // this is an error
            case '?': // this is an error outside flow collections
            case ':': {
                const inFlow = this.flowLevel > 0;
                const ch1 = this.charAt(1);
                if (isEmpty(ch1) || (inFlow && flowIndicatorChars.has(ch1))) {
                    if (!inFlow)
                        this.indentNext = this.indentValue + 1;
                    else if (this.flowKey)
                        this.flowKey = false;
                    return ((yield* this.pushCount(1)) +
                        (yield* this.pushSpaces(true)) +
                        (yield* this.pushIndicators()));
                }
            }
        }
        return 0;
    }
    *pushTag() {
        if (this.charAt(1) === '<') {
            let i = this.pos + 2;
            let ch = this.buffer[i];
            while (!isEmpty(ch) && ch !== '>')
                ch = this.buffer[++i];
            return yield* this.pushToIndex(ch === '>' ? i + 1 : i, false);
        }
        else {
            let i = this.pos + 1;
            let ch = this.buffer[i];
            while (ch) {
                if (tagChars.has(ch))
                    ch = this.buffer[++i];
                else if (ch === '%' &&
                    hexDigits.has(this.buffer[i + 1]) &&
                    hexDigits.has(this.buffer[i + 2])) {
                    ch = this.buffer[(i += 3)];
                }
                else
                    break;
            }
            return yield* this.pushToIndex(i, false);
        }
    }
    *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === '\n')
            return yield* this.pushCount(1);
        else if (ch === '\r' && this.charAt(1) === '\n')
            return yield* this.pushCount(2);
        else
            return 0;
    }
    *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
            ch = this.buffer[++i];
        } while (ch === ' ' || (allowTabs && ch === '\t'));
        const n = i - this.pos;
        if (n > 0) {
            yield this.buffer.substr(this.pos, n);
            this.pos = i;
        }
        return n;
    }
    *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
            ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/parse/line-counter.js":
/*!**************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/parse/line-counter.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineCounter: () => (/* binding */ LineCounter)
/* harmony export */ });
/**
 * Tracks newlines during parsing in order to provide an efficient API for
 * determining the one-indexed `{ line, col }` position for any offset
 * within the input.
 */
class LineCounter {
    constructor() {
        this.lineStarts = [];
        /**
         * Should be called in ascending order. Otherwise, call
         * `lineCounter.lineStarts.sort()` before calling `linePos()`.
         */
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        /**
         * Performs a binary search and returns the 1-indexed { line, col }
         * position of `offset`. If `line === 0`, `addNewLine` has never been
         * called or `offset` is before the first known newline.
         */
        this.linePos = (offset) => {
            let low = 0;
            let high = this.lineStarts.length;
            while (low < high) {
                const mid = (low + high) >> 1; // Math.floor((low + high) / 2)
                if (this.lineStarts[mid] < offset)
                    low = mid + 1;
                else
                    high = mid;
            }
            if (this.lineStarts[low] === offset)
                return { line: low + 1, col: 1 };
            if (low === 0)
                return { line: 0, col: offset };
            const start = this.lineStarts[low - 1];
            return { line: low, col: offset - start + 1 };
        };
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/parse/parser.js":
/*!********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/parse/parser.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Parser: () => (/* binding */ Parser)
/* harmony export */ });
/* harmony import */ var _cst_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cst.js */ "./node_modules/yaml/browser/dist/parse/cst.js");
/* harmony import */ var _lexer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lexer.js */ "./node_modules/yaml/browser/dist/parse/lexer.js");



function includesToken(list, type) {
    for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
            return true;
    return false;
}
function findNonEmptyIndex(list) {
    for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
            case 'space':
            case 'comment':
            case 'newline':
                break;
            default:
                return i;
        }
    }
    return -1;
}
function isFlowToken(token) {
    switch (token?.type) {
        case 'alias':
        case 'scalar':
        case 'single-quoted-scalar':
        case 'double-quoted-scalar':
        case 'flow-collection':
            return true;
        default:
            return false;
    }
}
function getPrevProps(parent) {
    switch (parent.type) {
        case 'document':
            return parent.start;
        case 'block-map': {
            const it = parent.items[parent.items.length - 1];
            return it.sep ?? it.start;
        }
        case 'block-seq':
            return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
            return [];
    }
}
/** Note: May modify input array */
function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
        return [];
    let i = prev.length;
    loop: while (--i >= 0) {
        switch (prev[i].type) {
            case 'doc-start':
            case 'explicit-key-ind':
            case 'map-value-ind':
            case 'seq-item-ind':
            case 'newline':
                break loop;
        }
    }
    while (prev[++i]?.type === 'space') {
        /* loop */
    }
    return prev.splice(i, prev.length);
}
function fixFlowSeqItems(fc) {
    if (fc.start.type === 'flow-seq-start') {
        for (const it of fc.items) {
            if (it.sep &&
                !it.value &&
                !includesToken(it.start, 'explicit-key-ind') &&
                !includesToken(it.sep, 'map-value-ind')) {
                if (it.key)
                    it.value = it.key;
                delete it.key;
                if (isFlowToken(it.value)) {
                    if (it.value.end)
                        Array.prototype.push.apply(it.value.end, it.sep);
                    else
                        it.value.end = it.sep;
                }
                else
                    Array.prototype.push.apply(it.start, it.sep);
                delete it.sep;
            }
        }
    }
}
/**
 * A YAML concrete syntax tree (CST) parser
 *
 * ```ts
 * const src: string = ...
 * for (const token of new Parser().parse(src)) {
 *   // token: Token
 * }
 * ```
 *
 * To use the parser with a user-provided lexer:
 *
 * ```ts
 * function* parse(source: string, lexer: Lexer) {
 *   const parser = new Parser()
 *   for (const lexeme of lexer.lex(source))
 *     yield* parser.next(lexeme)
 *   yield* parser.end()
 * }
 *
 * const src: string = ...
 * const lexer = new Lexer()
 * for (const token of parse(src, lexer)) {
 *   // token: Token
 * }
 * ```
 */
class Parser {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(onNewLine) {
        /** If true, space and sequence indicators count as indentation */
        this.atNewLine = true;
        /** If true, next token is a scalar value */
        this.atScalar = false;
        /** Current indentation level */
        this.indent = 0;
        /** Current offset since the start of parsing */
        this.offset = 0;
        /** On the same line with a block map key */
        this.onKeyLine = false;
        /** Top indicates the node that's currently being built */
        this.stack = [];
        /** The source of the current token, set in parse() */
        this.source = '';
        /** The type of the current token, set in parse() */
        this.type = '';
        // Must be defined after `next()`
        this.lexer = new _lexer_js__WEBPACK_IMPORTED_MODULE_1__.Lexer();
        this.onNewLine = onNewLine;
    }
    /**
     * Parse `source` as a YAML stream.
     * If `incomplete`, a part of the last line may be left as a buffer for the next call.
     *
     * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
     *
     * @returns A generator of tokens representing each directive, document, and other structure.
     */
    *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
            this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
            yield* this.next(lexeme);
        if (!incomplete)
            yield* this.end();
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(source) {
        this.source = source;
        if (this.atScalar) {
            this.atScalar = false;
            yield* this.step();
            this.offset += source.length;
            return;
        }
        const type = (0,_cst_js__WEBPACK_IMPORTED_MODULE_0__.tokenType)(source);
        if (!type) {
            const message = `Not a YAML token: ${source}`;
            yield* this.pop({ type: 'error', offset: this.offset, message, source });
            this.offset += source.length;
        }
        else if (type === 'scalar') {
            this.atNewLine = false;
            this.atScalar = true;
            this.type = 'scalar';
        }
        else {
            this.type = type;
            yield* this.step();
            switch (type) {
                case 'newline':
                    this.atNewLine = true;
                    this.indent = 0;
                    if (this.onNewLine)
                        this.onNewLine(this.offset + source.length);
                    break;
                case 'space':
                    if (this.atNewLine && source[0] === ' ')
                        this.indent += source.length;
                    break;
                case 'explicit-key-ind':
                case 'map-value-ind':
                case 'seq-item-ind':
                    if (this.atNewLine)
                        this.indent += source.length;
                    break;
                case 'doc-mode':
                case 'flow-error-end':
                    return;
                default:
                    this.atNewLine = false;
            }
            this.offset += source.length;
        }
    }
    /** Call at end of input to push out any remaining constructions */
    *end() {
        while (this.stack.length > 0)
            yield* this.pop();
    }
    get sourceToken() {
        const st = {
            type: this.type,
            offset: this.offset,
            indent: this.indent,
            source: this.source
        };
        return st;
    }
    *step() {
        const top = this.peek(1);
        if (this.type === 'doc-end' && (!top || top.type !== 'doc-end')) {
            while (this.stack.length > 0)
                yield* this.pop();
            this.stack.push({
                type: 'doc-end',
                offset: this.offset,
                source: this.source
            });
            return;
        }
        if (!top)
            return yield* this.stream();
        switch (top.type) {
            case 'document':
                return yield* this.document(top);
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return yield* this.scalar(top);
            case 'block-scalar':
                return yield* this.blockScalar(top);
            case 'block-map':
                return yield* this.blockMap(top);
            case 'block-seq':
                return yield* this.blockSequence(top);
            case 'flow-collection':
                return yield* this.flowCollection(top);
            case 'doc-end':
                return yield* this.documentEnd(top);
        }
        /* istanbul ignore next should not happen */
        yield* this.pop();
    }
    peek(n) {
        return this.stack[this.stack.length - n];
    }
    *pop(error) {
        const token = error ?? this.stack.pop();
        /* istanbul ignore if should not happen */
        if (!token) {
            const message = 'Tried to pop an empty stack';
            yield { type: 'error', offset: this.offset, source: '', message };
        }
        else if (this.stack.length === 0) {
            yield token;
        }
        else {
            const top = this.peek(1);
            if (token.type === 'block-scalar') {
                // Block scalars use their parent rather than header indent
                token.indent = 'indent' in top ? top.indent : 0;
            }
            else if (token.type === 'flow-collection' && top.type === 'document') {
                // Ignore all indent for top-level flow collections
                token.indent = 0;
            }
            if (token.type === 'flow-collection')
                fixFlowSeqItems(token);
            switch (top.type) {
                case 'document':
                    top.value = token;
                    break;
                case 'block-scalar':
                    top.props.push(token); // error
                    break;
                case 'block-map': {
                    const it = top.items[top.items.length - 1];
                    if (it.value) {
                        top.items.push({ start: [], key: token, sep: [] });
                        this.onKeyLine = true;
                        return;
                    }
                    else if (it.sep) {
                        it.value = token;
                    }
                    else {
                        Object.assign(it, { key: token, sep: [] });
                        this.onKeyLine = !it.explicitKey;
                        return;
                    }
                    break;
                }
                case 'block-seq': {
                    const it = top.items[top.items.length - 1];
                    if (it.value)
                        top.items.push({ start: [], value: token });
                    else
                        it.value = token;
                    break;
                }
                case 'flow-collection': {
                    const it = top.items[top.items.length - 1];
                    if (!it || it.value)
                        top.items.push({ start: [], key: token, sep: [] });
                    else if (it.sep)
                        it.value = token;
                    else
                        Object.assign(it, { key: token, sep: [] });
                    return;
                }
                /* istanbul ignore next should not happen */
                default:
                    yield* this.pop();
                    yield* this.pop(token);
            }
            if ((top.type === 'document' ||
                top.type === 'block-map' ||
                top.type === 'block-seq') &&
                (token.type === 'block-map' || token.type === 'block-seq')) {
                const last = token.items[token.items.length - 1];
                if (last &&
                    !last.sep &&
                    !last.value &&
                    last.start.length > 0 &&
                    findNonEmptyIndex(last.start) === -1 &&
                    (token.indent === 0 ||
                        last.start.every(st => st.type !== 'comment' || st.indent < token.indent))) {
                    if (top.type === 'document')
                        top.end = last.start;
                    else
                        top.items.push({ start: last.start });
                    token.items.splice(-1, 1);
                }
            }
        }
    }
    *stream() {
        switch (this.type) {
            case 'directive-line':
                yield { type: 'directive', offset: this.offset, source: this.source };
                return;
            case 'byte-order-mark':
            case 'space':
            case 'comment':
            case 'newline':
                yield this.sourceToken;
                return;
            case 'doc-mode':
            case 'doc-start': {
                const doc = {
                    type: 'document',
                    offset: this.offset,
                    start: []
                };
                if (this.type === 'doc-start')
                    doc.start.push(this.sourceToken);
                this.stack.push(doc);
                return;
            }
        }
        yield {
            type: 'error',
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML stream`,
            source: this.source
        };
    }
    *document(doc) {
        if (doc.value)
            return yield* this.lineEnd(doc);
        switch (this.type) {
            case 'doc-start': {
                if (findNonEmptyIndex(doc.start) !== -1) {
                    yield* this.pop();
                    yield* this.step();
                }
                else
                    doc.start.push(this.sourceToken);
                return;
            }
            case 'anchor':
            case 'tag':
            case 'space':
            case 'comment':
            case 'newline':
                doc.start.push(this.sourceToken);
                return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
            this.stack.push(bv);
        else {
            yield {
                type: 'error',
                offset: this.offset,
                message: `Unexpected ${this.type} token in YAML document`,
                source: this.source
            };
        }
    }
    *scalar(scalar) {
        if (this.type === 'map-value-ind') {
            const prev = getPrevProps(this.peek(2));
            const start = getFirstKeyStartProps(prev);
            let sep;
            if (scalar.end) {
                sep = scalar.end;
                sep.push(this.sourceToken);
                delete scalar.end;
            }
            else
                sep = [this.sourceToken];
            const map = {
                type: 'block-map',
                offset: scalar.offset,
                indent: scalar.indent,
                items: [{ start, key: scalar, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
        }
        else
            yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
        switch (this.type) {
            case 'space':
            case 'comment':
            case 'newline':
                scalar.props.push(this.sourceToken);
                return;
            case 'scalar':
                scalar.source = this.source;
                // block-scalar source includes trailing newline
                this.atNewLine = true;
                this.indent = 0;
                if (this.onNewLine) {
                    let nl = this.source.indexOf('\n') + 1;
                    while (nl !== 0) {
                        this.onNewLine(this.offset + nl);
                        nl = this.source.indexOf('\n', nl) + 1;
                    }
                }
                yield* this.pop();
                break;
            /* istanbul ignore next should not happen */
            default:
                yield* this.pop();
                yield* this.step();
        }
    }
    *blockMap(map) {
        const it = map.items[map.items.length - 1];
        // it.sep is true-ish if pair already has key or : separator
        switch (this.type) {
            case 'newline':
                this.onKeyLine = false;
                if (it.value) {
                    const end = 'end' in it.value ? it.value.end : undefined;
                    const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                    if (last?.type === 'comment')
                        end?.push(this.sourceToken);
                    else
                        map.items.push({ start: [this.sourceToken] });
                }
                else if (it.sep) {
                    it.sep.push(this.sourceToken);
                }
                else {
                    it.start.push(this.sourceToken);
                }
                return;
            case 'space':
            case 'comment':
                if (it.value) {
                    map.items.push({ start: [this.sourceToken] });
                }
                else if (it.sep) {
                    it.sep.push(this.sourceToken);
                }
                else {
                    if (this.atIndentedComment(it.start, map.indent)) {
                        const prev = map.items[map.items.length - 2];
                        const end = prev?.value?.end;
                        if (Array.isArray(end)) {
                            Array.prototype.push.apply(end, it.start);
                            end.push(this.sourceToken);
                            map.items.pop();
                            return;
                        }
                    }
                    it.start.push(this.sourceToken);
                }
                return;
        }
        if (this.indent >= map.indent) {
            const atMapIndent = !this.onKeyLine && this.indent === map.indent;
            const atNextItem = atMapIndent &&
                (it.sep || it.explicitKey) &&
                this.type !== 'seq-item-ind';
            // For empty nodes, assign newline-separated not indented empty tokens to following node
            let start = [];
            if (atNextItem && it.sep && !it.value) {
                const nl = [];
                for (let i = 0; i < it.sep.length; ++i) {
                    const st = it.sep[i];
                    switch (st.type) {
                        case 'newline':
                            nl.push(i);
                            break;
                        case 'space':
                            break;
                        case 'comment':
                            if (st.indent > map.indent)
                                nl.length = 0;
                            break;
                        default:
                            nl.length = 0;
                    }
                }
                if (nl.length >= 2)
                    start = it.sep.splice(nl[1]);
            }
            switch (this.type) {
                case 'anchor':
                case 'tag':
                    if (atNextItem || it.value) {
                        start.push(this.sourceToken);
                        map.items.push({ start });
                        this.onKeyLine = true;
                    }
                    else if (it.sep) {
                        it.sep.push(this.sourceToken);
                    }
                    else {
                        it.start.push(this.sourceToken);
                    }
                    return;
                case 'explicit-key-ind':
                    if (!it.sep && !it.explicitKey) {
                        it.start.push(this.sourceToken);
                        it.explicitKey = true;
                    }
                    else if (atNextItem || it.value) {
                        start.push(this.sourceToken);
                        map.items.push({ start, explicitKey: true });
                    }
                    else {
                        this.stack.push({
                            type: 'block-map',
                            offset: this.offset,
                            indent: this.indent,
                            items: [{ start: [this.sourceToken], explicitKey: true }]
                        });
                    }
                    this.onKeyLine = true;
                    return;
                case 'map-value-ind':
                    if (it.explicitKey) {
                        if (!it.sep) {
                            if (includesToken(it.start, 'newline')) {
                                Object.assign(it, { key: null, sep: [this.sourceToken] });
                            }
                            else {
                                const start = getFirstKeyStartProps(it.start);
                                this.stack.push({
                                    type: 'block-map',
                                    offset: this.offset,
                                    indent: this.indent,
                                    items: [{ start, key: null, sep: [this.sourceToken] }]
                                });
                            }
                        }
                        else if (it.value) {
                            map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                        }
                        else if (includesToken(it.sep, 'map-value-ind')) {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start, key: null, sep: [this.sourceToken] }]
                            });
                        }
                        else if (isFlowToken(it.key) &&
                            !includesToken(it.sep, 'newline')) {
                            const start = getFirstKeyStartProps(it.start);
                            const key = it.key;
                            const sep = it.sep;
                            sep.push(this.sourceToken);
                            // @ts-expect-error type guard is wrong here
                            delete it.key, delete it.sep;
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start, key, sep }]
                            });
                        }
                        else if (start.length > 0) {
                            // Not actually at next item
                            it.sep = it.sep.concat(start, this.sourceToken);
                        }
                        else {
                            it.sep.push(this.sourceToken);
                        }
                    }
                    else {
                        if (!it.sep) {
                            Object.assign(it, { key: null, sep: [this.sourceToken] });
                        }
                        else if (it.value || atNextItem) {
                            map.items.push({ start, key: null, sep: [this.sourceToken] });
                        }
                        else if (includesToken(it.sep, 'map-value-ind')) {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start: [], key: null, sep: [this.sourceToken] }]
                            });
                        }
                        else {
                            it.sep.push(this.sourceToken);
                        }
                    }
                    this.onKeyLine = true;
                    return;
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar': {
                    const fs = this.flowScalar(this.type);
                    if (atNextItem || it.value) {
                        map.items.push({ start, key: fs, sep: [] });
                        this.onKeyLine = true;
                    }
                    else if (it.sep) {
                        this.stack.push(fs);
                    }
                    else {
                        Object.assign(it, { key: fs, sep: [] });
                        this.onKeyLine = true;
                    }
                    return;
                }
                default: {
                    const bv = this.startBlockValue(map);
                    if (bv) {
                        if (atMapIndent && bv.type !== 'block-seq') {
                            map.items.push({ start });
                        }
                        this.stack.push(bv);
                        return;
                    }
                }
            }
        }
        yield* this.pop();
        yield* this.step();
    }
    *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
            case 'newline':
                if (it.value) {
                    const end = 'end' in it.value ? it.value.end : undefined;
                    const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                    if (last?.type === 'comment')
                        end?.push(this.sourceToken);
                    else
                        seq.items.push({ start: [this.sourceToken] });
                }
                else
                    it.start.push(this.sourceToken);
                return;
            case 'space':
            case 'comment':
                if (it.value)
                    seq.items.push({ start: [this.sourceToken] });
                else {
                    if (this.atIndentedComment(it.start, seq.indent)) {
                        const prev = seq.items[seq.items.length - 2];
                        const end = prev?.value?.end;
                        if (Array.isArray(end)) {
                            Array.prototype.push.apply(end, it.start);
                            end.push(this.sourceToken);
                            seq.items.pop();
                            return;
                        }
                    }
                    it.start.push(this.sourceToken);
                }
                return;
            case 'anchor':
            case 'tag':
                if (it.value || this.indent <= seq.indent)
                    break;
                it.start.push(this.sourceToken);
                return;
            case 'seq-item-ind':
                if (this.indent !== seq.indent)
                    break;
                if (it.value || includesToken(it.start, 'seq-item-ind'))
                    seq.items.push({ start: [this.sourceToken] });
                else
                    it.start.push(this.sourceToken);
                return;
        }
        if (this.indent > seq.indent) {
            const bv = this.startBlockValue(seq);
            if (bv) {
                this.stack.push(bv);
                return;
            }
        }
        yield* this.pop();
        yield* this.step();
    }
    *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === 'flow-error-end') {
            let top;
            do {
                yield* this.pop();
                top = this.peek(1);
            } while (top && top.type === 'flow-collection');
        }
        else if (fc.end.length === 0) {
            switch (this.type) {
                case 'comma':
                case 'explicit-key-ind':
                    if (!it || it.sep)
                        fc.items.push({ start: [this.sourceToken] });
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'map-value-ind':
                    if (!it || it.value)
                        fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
                    else if (it.sep)
                        it.sep.push(this.sourceToken);
                    else
                        Object.assign(it, { key: null, sep: [this.sourceToken] });
                    return;
                case 'space':
                case 'comment':
                case 'newline':
                case 'anchor':
                case 'tag':
                    if (!it || it.value)
                        fc.items.push({ start: [this.sourceToken] });
                    else if (it.sep)
                        it.sep.push(this.sourceToken);
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar': {
                    const fs = this.flowScalar(this.type);
                    if (!it || it.value)
                        fc.items.push({ start: [], key: fs, sep: [] });
                    else if (it.sep)
                        this.stack.push(fs);
                    else
                        Object.assign(it, { key: fs, sep: [] });
                    return;
                }
                case 'flow-map-end':
                case 'flow-seq-end':
                    fc.end.push(this.sourceToken);
                    return;
            }
            const bv = this.startBlockValue(fc);
            /* istanbul ignore else should not happen */
            if (bv)
                this.stack.push(bv);
            else {
                yield* this.pop();
                yield* this.step();
            }
        }
        else {
            const parent = this.peek(2);
            if (parent.type === 'block-map' &&
                ((this.type === 'map-value-ind' && parent.indent === fc.indent) ||
                    (this.type === 'newline' &&
                        !parent.items[parent.items.length - 1].sep))) {
                yield* this.pop();
                yield* this.step();
            }
            else if (this.type === 'map-value-ind' &&
                parent.type !== 'flow-collection') {
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                fixFlowSeqItems(fc);
                const sep = fc.end.splice(1, fc.end.length);
                sep.push(this.sourceToken);
                const map = {
                    type: 'block-map',
                    offset: fc.offset,
                    indent: fc.indent,
                    items: [{ start, key: fc, sep }]
                };
                this.onKeyLine = true;
                this.stack[this.stack.length - 1] = map;
            }
            else {
                yield* this.lineEnd(fc);
            }
        }
    }
    flowScalar(type) {
        if (this.onNewLine) {
            let nl = this.source.indexOf('\n') + 1;
            while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf('\n', nl) + 1;
            }
        }
        return {
            type,
            offset: this.offset,
            indent: this.indent,
            source: this.source
        };
    }
    startBlockValue(parent) {
        switch (this.type) {
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return this.flowScalar(this.type);
            case 'block-scalar-header':
                return {
                    type: 'block-scalar',
                    offset: this.offset,
                    indent: this.indent,
                    props: [this.sourceToken],
                    source: ''
                };
            case 'flow-map-start':
            case 'flow-seq-start':
                return {
                    type: 'flow-collection',
                    offset: this.offset,
                    indent: this.indent,
                    start: this.sourceToken,
                    items: [],
                    end: []
                };
            case 'seq-item-ind':
                return {
                    type: 'block-seq',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [this.sourceToken] }]
                };
            case 'explicit-key-ind': {
                this.onKeyLine = true;
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                start.push(this.sourceToken);
                return {
                    type: 'block-map',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, explicitKey: true }]
                };
            }
            case 'map-value-ind': {
                this.onKeyLine = true;
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                return {
                    type: 'block-map',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                };
            }
        }
        return null;
    }
    atIndentedComment(start, indent) {
        if (this.type !== 'comment')
            return false;
        if (this.indent <= indent)
            return false;
        return start.every(st => st.type === 'newline' || st.type === 'space');
    }
    *documentEnd(docEnd) {
        if (this.type !== 'doc-mode') {
            if (docEnd.end)
                docEnd.end.push(this.sourceToken);
            else
                docEnd.end = [this.sourceToken];
            if (this.type === 'newline')
                yield* this.pop();
        }
    }
    *lineEnd(token) {
        switch (this.type) {
            case 'comma':
            case 'doc-start':
            case 'doc-end':
            case 'flow-seq-end':
            case 'flow-map-end':
            case 'map-value-ind':
                yield* this.pop();
                yield* this.step();
                break;
            case 'newline':
                this.onKeyLine = false;
            // fallthrough
            case 'space':
            case 'comment':
            default:
                // all other values are errors
                if (token.end)
                    token.end.push(this.sourceToken);
                else
                    token.end = [this.sourceToken];
                if (this.type === 'newline')
                    yield* this.pop();
        }
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/public-api.js":
/*!******************************************************!*\
  !*** ./node_modules/yaml/browser/dist/public-api.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parse: () => (/* binding */ parse),
/* harmony export */   parseAllDocuments: () => (/* binding */ parseAllDocuments),
/* harmony export */   parseDocument: () => (/* binding */ parseDocument),
/* harmony export */   stringify: () => (/* binding */ stringify)
/* harmony export */ });
/* harmony import */ var _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./compose/composer.js */ "./node_modules/yaml/browser/dist/compose/composer.js");
/* harmony import */ var _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./doc/Document.js */ "./node_modules/yaml/browser/dist/doc/Document.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./errors.js */ "./node_modules/yaml/browser/dist/errors.js");
/* harmony import */ var _log_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./log.js */ "./node_modules/yaml/browser/dist/log.js");
/* harmony import */ var _parse_line_counter_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./parse/line-counter.js */ "./node_modules/yaml/browser/dist/parse/line-counter.js");
/* harmony import */ var _parse_parser_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./parse/parser.js */ "./node_modules/yaml/browser/dist/parse/parser.js");







function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter = options.lineCounter || (prettyErrors && new _parse_line_counter_js__WEBPACK_IMPORTED_MODULE_4__.LineCounter()) || null;
    return { lineCounter, prettyErrors };
}
/**
 * Parse the input as a stream of YAML documents.
 *
 * Documents should be separated from each other by `...` or `---` marker lines.
 *
 * @returns If an empty `docs` array is returned, it will be of type
 *   EmptyStream and contain additional stream information. In
 *   TypeScript, you should use `'empty' in docs` as a type guard for it.
 */
function parseAllDocuments(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser = new _parse_parser_js__WEBPACK_IMPORTED_MODULE_5__.Parser(lineCounter?.addNewLine);
    const composer = new _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__.Composer(options);
    const docs = Array.from(composer.compose(parser.parse(source)));
    if (prettyErrors && lineCounter)
        for (const doc of docs) {
            doc.errors.forEach((0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.prettifyError)(source, lineCounter));
            doc.warnings.forEach((0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.prettifyError)(source, lineCounter));
        }
    if (docs.length > 0)
        return docs;
    return Object.assign([], { empty: true }, composer.streamInfo());
}
/** Parse an input string into a single YAML.Document */
function parseDocument(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser = new _parse_parser_js__WEBPACK_IMPORTED_MODULE_5__.Parser(lineCounter?.addNewLine);
    const composer = new _compose_composer_js__WEBPACK_IMPORTED_MODULE_0__.Composer(options);
    // `doc` is always set by compose.end(true) at the very latest
    let doc = null;
    for (const _doc of composer.compose(parser.parse(source), true, source.length)) {
        if (!doc)
            doc = _doc;
        else if (doc.options.logLevel !== 'silent') {
            doc.errors.push(new _errors_js__WEBPACK_IMPORTED_MODULE_2__.YAMLParseError(_doc.range.slice(0, 2), 'MULTIPLE_DOCS', 'Source contains multiple documents; please use YAML.parseAllDocuments()'));
            break;
        }
    }
    if (prettyErrors && lineCounter) {
        doc.errors.forEach((0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.prettifyError)(source, lineCounter));
        doc.warnings.forEach((0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.prettifyError)(source, lineCounter));
    }
    return doc;
}
function parse(src, reviver, options) {
    let _reviver = undefined;
    if (typeof reviver === 'function') {
        _reviver = reviver;
    }
    else if (options === undefined && reviver && typeof reviver === 'object') {
        options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
        return null;
    doc.warnings.forEach(warning => (0,_log_js__WEBPACK_IMPORTED_MODULE_3__.warn)(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
        if (doc.options.logLevel !== 'silent')
            throw doc.errors[0];
        else
            doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
}
function stringify(value, replacer, options) {
    let _replacer = null;
    if (typeof replacer === 'function' || Array.isArray(replacer)) {
        _replacer = replacer;
    }
    else if (options === undefined && replacer) {
        options = replacer;
    }
    if (typeof options === 'string')
        options = options.length;
    if (typeof options === 'number') {
        const indent = Math.round(options);
        options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent };
    }
    if (value === undefined) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
            return undefined;
    }
    return new _doc_Document_js__WEBPACK_IMPORTED_MODULE_1__.Document(value, _replacer, options).toString(options);
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/Schema.js":
/*!*********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/Schema.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Schema: () => (/* binding */ Schema)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/map.js */ "./node_modules/yaml/browser/dist/schema/common/map.js");
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common/seq.js */ "./node_modules/yaml/browser/dist/schema/common/seq.js");
/* harmony import */ var _common_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common/string.js */ "./node_modules/yaml/browser/dist/schema/common/string.js");
/* harmony import */ var _tags_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tags.js */ "./node_modules/yaml/browser/dist/schema/tags.js");






const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
class Schema {
    constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat)
            ? (0,_tags_js__WEBPACK_IMPORTED_MODULE_4__.getTags)(compat, 'compat')
            : compat
                ? (0,_tags_js__WEBPACK_IMPORTED_MODULE_4__.getTags)(null, compat)
                : null;
        this.merge = !!merge;
        this.name = (typeof schema === 'string' && schema) || 'core';
        this.knownTags = resolveKnownTags ? _tags_js__WEBPACK_IMPORTED_MODULE_4__.coreKnownTags : {};
        this.tags = (0,_tags_js__WEBPACK_IMPORTED_MODULE_4__.getTags)(customTags, this.name);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.MAP, { value: _common_map_js__WEBPACK_IMPORTED_MODULE_1__.map });
        Object.defineProperty(this, _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SCALAR, { value: _common_string_js__WEBPACK_IMPORTED_MODULE_3__.string });
        Object.defineProperty(this, _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.SEQ, { value: _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq });
        // Used by createMap()
        this.sortMapEntries =
            typeof sortMapEntries === 'function'
                ? sortMapEntries
                : sortMapEntries === true
                    ? sortMapEntriesByKey
                    : null;
    }
    clone() {
        const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/common/map.js":
/*!*************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/common/map.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   map: () => (/* binding */ map)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../nodes/YAMLMap.js */ "./node_modules/yaml/browser/dist/nodes/YAMLMap.js");



const map = {
    collection: 'map',
    default: true,
    nodeClass: _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__.YAMLMap,
    tag: 'tag:yaml.org,2002:map',
    resolve(map, onError) {
        if (!(0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(map))
            onError('Expected a mapping for this tag');
        return map;
    },
    createNode: (schema, obj, ctx) => _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_1__.YAMLMap.from(schema, obj, ctx)
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/common/null.js":
/*!**************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/common/null.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   nullTag: () => (/* binding */ nullTag)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");


const nullTag = {
    identify: value => value == null,
    createNode: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(null),
    default: true,
    tag: 'tag:yaml.org,2002:null',
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(null),
    stringify: ({ source }, ctx) => typeof source === 'string' && nullTag.test.test(source)
        ? source
        : ctx.options.nullStr
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/common/seq.js":
/*!*************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/common/seq.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   seq: () => (/* binding */ seq)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../nodes/YAMLSeq.js */ "./node_modules/yaml/browser/dist/nodes/YAMLSeq.js");



const seq = {
    collection: 'seq',
    default: true,
    nodeClass: _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_1__.YAMLSeq,
    tag: 'tag:yaml.org,2002:seq',
    resolve(seq, onError) {
        if (!(0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(seq))
            onError('Expected a sequence for this tag');
        return seq;
    },
    createNode: (schema, obj, ctx) => _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_1__.YAMLSeq.from(schema, obj, ctx)
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/common/string.js":
/*!****************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/common/string.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   string: () => (/* binding */ string)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../stringify/stringifyString.js */ "./node_modules/yaml/browser/dist/stringify/stringifyString.js");


const string = {
    identify: value => typeof value === 'string',
    default: true,
    tag: 'tag:yaml.org,2002:str',
    resolve: str => str,
    stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return (0,_stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_0__.stringifyString)(item, ctx, onComment, onChompKeep);
    }
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/core/bool.js":
/*!************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/core/bool.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   boolTag: () => (/* binding */ boolTag)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");


const boolTag = {
    identify: value => typeof value === 'boolean',
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: str => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(str[0] === 't' || str[0] === 'T'),
    stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
            const sv = source[0] === 't' || source[0] === 'T';
            if (value === sv)
                return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/core/float.js":
/*!*************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/core/float.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   float: () => (/* binding */ float),
/* harmony export */   floatExp: () => (/* binding */ floatExp),
/* harmony export */   floatNaN: () => (/* binding */ floatNaN)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../stringify/stringifyNumber.js */ "./node_modules/yaml/browser/dist/stringify/stringifyNumber.js");



const floatNaN = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: str => str.slice(-3).toLowerCase() === 'nan'
        ? NaN
        : str[0] === '-'
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber
};
const floatExp = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'EXP',
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: str => parseFloat(str),
    stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber)(node);
    }
};
const float = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
        const node = new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(parseFloat(str));
        const dot = str.indexOf('.');
        if (dot !== -1 && str[str.length - 1] === '0')
            node.minFractionDigits = str.length - dot - 1;
        return node;
    },
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/core/int.js":
/*!***********************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/core/int.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   int: () => (/* binding */ int),
/* harmony export */   intHex: () => (/* binding */ intHex),
/* harmony export */   intOct: () => (/* binding */ intOct)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../stringify/stringifyNumber.js */ "./node_modules/yaml/browser/dist/stringify/stringifyNumber.js");


const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
const intResolve = (str, offset, radix, { intAsBigInt }) => (intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix));
function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
    return (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber)(node);
}
const intOct = {
    identify: value => intIdentify(value) && value >= 0,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'OCT',
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
    stringify: node => intStringify(node, 8, '0o')
};
const int = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber
};
const intHex = {
    identify: value => intIdentify(value) && value >= 0,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'HEX',
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: node => intStringify(node, 16, '0x')
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/core/schema.js":
/*!**************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/core/schema.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   schema: () => (/* binding */ schema)
/* harmony export */ });
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/map.js */ "./node_modules/yaml/browser/dist/schema/common/map.js");
/* harmony import */ var _common_null_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/null.js */ "./node_modules/yaml/browser/dist/schema/common/null.js");
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/seq.js */ "./node_modules/yaml/browser/dist/schema/common/seq.js");
/* harmony import */ var _common_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/string.js */ "./node_modules/yaml/browser/dist/schema/common/string.js");
/* harmony import */ var _bool_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./bool.js */ "./node_modules/yaml/browser/dist/schema/core/bool.js");
/* harmony import */ var _float_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./float.js */ "./node_modules/yaml/browser/dist/schema/core/float.js");
/* harmony import */ var _int_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./int.js */ "./node_modules/yaml/browser/dist/schema/core/int.js");








const schema = [
    _common_map_js__WEBPACK_IMPORTED_MODULE_0__.map,
    _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq,
    _common_string_js__WEBPACK_IMPORTED_MODULE_3__.string,
    _common_null_js__WEBPACK_IMPORTED_MODULE_1__.nullTag,
    _bool_js__WEBPACK_IMPORTED_MODULE_4__.boolTag,
    _int_js__WEBPACK_IMPORTED_MODULE_6__.intOct,
    _int_js__WEBPACK_IMPORTED_MODULE_6__.int,
    _int_js__WEBPACK_IMPORTED_MODULE_6__.intHex,
    _float_js__WEBPACK_IMPORTED_MODULE_5__.floatNaN,
    _float_js__WEBPACK_IMPORTED_MODULE_5__.floatExp,
    _float_js__WEBPACK_IMPORTED_MODULE_5__.float
];




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/json/schema.js":
/*!**************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/json/schema.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   schema: () => (/* binding */ schema)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/map.js */ "./node_modules/yaml/browser/dist/schema/common/map.js");
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/seq.js */ "./node_modules/yaml/browser/dist/schema/common/seq.js");




function intIdentify(value) {
    return typeof value === 'bigint' || Number.isInteger(value);
}
const stringifyJSON = ({ value }) => JSON.stringify(value);
const jsonScalars = [
    {
        identify: value => typeof value === 'string',
        default: true,
        tag: 'tag:yaml.org,2002:str',
        resolve: str => str,
        stringify: stringifyJSON
    },
    {
        identify: value => value == null,
        createNode: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(null),
        default: true,
        tag: 'tag:yaml.org,2002:null',
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
    },
    {
        identify: value => typeof value === 'boolean',
        default: true,
        tag: 'tag:yaml.org,2002:bool',
        test: /^true|false$/,
        resolve: str => str === 'true',
        stringify: stringifyJSON
    },
    {
        identify: intIdentify,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
    },
    {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: str => parseFloat(str),
        stringify: stringifyJSON
    }
];
const jsonError = {
    default: true,
    tag: '',
    test: /^/,
    resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
    }
};
const schema = [_common_map_js__WEBPACK_IMPORTED_MODULE_1__.map, _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq].concat(jsonScalars, jsonError);




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/tags.js":
/*!*******************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/tags.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   coreKnownTags: () => (/* binding */ coreKnownTags),
/* harmony export */   getTags: () => (/* binding */ getTags)
/* harmony export */ });
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common/map.js */ "./node_modules/yaml/browser/dist/schema/common/map.js");
/* harmony import */ var _common_null_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/null.js */ "./node_modules/yaml/browser/dist/schema/common/null.js");
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common/seq.js */ "./node_modules/yaml/browser/dist/schema/common/seq.js");
/* harmony import */ var _common_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common/string.js */ "./node_modules/yaml/browser/dist/schema/common/string.js");
/* harmony import */ var _core_bool_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./core/bool.js */ "./node_modules/yaml/browser/dist/schema/core/bool.js");
/* harmony import */ var _core_float_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./core/float.js */ "./node_modules/yaml/browser/dist/schema/core/float.js");
/* harmony import */ var _core_int_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./core/int.js */ "./node_modules/yaml/browser/dist/schema/core/int.js");
/* harmony import */ var _core_schema_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./core/schema.js */ "./node_modules/yaml/browser/dist/schema/core/schema.js");
/* harmony import */ var _json_schema_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./json/schema.js */ "./node_modules/yaml/browser/dist/schema/json/schema.js");
/* harmony import */ var _yaml_1_1_binary_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./yaml-1.1/binary.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/binary.js");
/* harmony import */ var _yaml_1_1_omap_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./yaml-1.1/omap.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/omap.js");
/* harmony import */ var _yaml_1_1_pairs_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./yaml-1.1/pairs.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js");
/* harmony import */ var _yaml_1_1_schema_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./yaml-1.1/schema.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/schema.js");
/* harmony import */ var _yaml_1_1_set_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./yaml-1.1/set.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/set.js");
/* harmony import */ var _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./yaml-1.1/timestamp.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/timestamp.js");
















const schemas = new Map([
    ['core', _core_schema_js__WEBPACK_IMPORTED_MODULE_7__.schema],
    ['failsafe', [_common_map_js__WEBPACK_IMPORTED_MODULE_0__.map, _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq, _common_string_js__WEBPACK_IMPORTED_MODULE_3__.string]],
    ['json', _json_schema_js__WEBPACK_IMPORTED_MODULE_8__.schema],
    ['yaml11', _yaml_1_1_schema_js__WEBPACK_IMPORTED_MODULE_12__.schema],
    ['yaml-1.1', _yaml_1_1_schema_js__WEBPACK_IMPORTED_MODULE_12__.schema]
]);
const tagsByName = {
    binary: _yaml_1_1_binary_js__WEBPACK_IMPORTED_MODULE_9__.binary,
    bool: _core_bool_js__WEBPACK_IMPORTED_MODULE_4__.boolTag,
    float: _core_float_js__WEBPACK_IMPORTED_MODULE_5__.float,
    floatExp: _core_float_js__WEBPACK_IMPORTED_MODULE_5__.floatExp,
    floatNaN: _core_float_js__WEBPACK_IMPORTED_MODULE_5__.floatNaN,
    floatTime: _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_14__.floatTime,
    int: _core_int_js__WEBPACK_IMPORTED_MODULE_6__.int,
    intHex: _core_int_js__WEBPACK_IMPORTED_MODULE_6__.intHex,
    intOct: _core_int_js__WEBPACK_IMPORTED_MODULE_6__.intOct,
    intTime: _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_14__.intTime,
    map: _common_map_js__WEBPACK_IMPORTED_MODULE_0__.map,
    null: _common_null_js__WEBPACK_IMPORTED_MODULE_1__.nullTag,
    omap: _yaml_1_1_omap_js__WEBPACK_IMPORTED_MODULE_10__.omap,
    pairs: _yaml_1_1_pairs_js__WEBPACK_IMPORTED_MODULE_11__.pairs,
    seq: _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq,
    set: _yaml_1_1_set_js__WEBPACK_IMPORTED_MODULE_13__.set,
    timestamp: _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_14__.timestamp
};
const coreKnownTags = {
    'tag:yaml.org,2002:binary': _yaml_1_1_binary_js__WEBPACK_IMPORTED_MODULE_9__.binary,
    'tag:yaml.org,2002:omap': _yaml_1_1_omap_js__WEBPACK_IMPORTED_MODULE_10__.omap,
    'tag:yaml.org,2002:pairs': _yaml_1_1_pairs_js__WEBPACK_IMPORTED_MODULE_11__.pairs,
    'tag:yaml.org,2002:set': _yaml_1_1_set_js__WEBPACK_IMPORTED_MODULE_13__.set,
    'tag:yaml.org,2002:timestamp': _yaml_1_1_timestamp_js__WEBPACK_IMPORTED_MODULE_14__.timestamp
};
function getTags(customTags, schemaName) {
    let tags = schemas.get(schemaName);
    if (!tags) {
        if (Array.isArray(customTags))
            tags = [];
        else {
            const keys = Array.from(schemas.keys())
                .filter(key => key !== 'yaml11')
                .map(key => JSON.stringify(key))
                .join(', ');
            throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
    }
    if (Array.isArray(customTags)) {
        for (const tag of customTags)
            tags = tags.concat(tag);
    }
    else if (typeof customTags === 'function') {
        tags = customTags(tags.slice());
    }
    return tags.map(tag => {
        if (typeof tag !== 'string')
            return tag;
        const tagObj = tagsByName[tag];
        if (tagObj)
            return tagObj;
        const keys = Object.keys(tagsByName)
            .map(key => JSON.stringify(key))
            .join(', ');
        throw new Error(`Unknown custom tag "${tag}"; use one of ${keys}`);
    });
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/binary.js":
/*!******************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/binary.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   binary: () => (/* binding */ binary)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../stringify/stringifyString.js */ "./node_modules/yaml/browser/dist/stringify/stringifyString.js");



const binary = {
    identify: value => value instanceof Uint8Array, // Buffer inherits from Uint8Array
    default: false,
    tag: 'tag:yaml.org,2002:binary',
    /**
     * Returns a Buffer in node and an Uint8Array in browsers
     *
     * To use the resulting buffer as an image, you'll want to do something like:
     *
     *   const blob = new Blob([buffer], { type: 'image/jpeg' })
     *   document.querySelector('#photo').src = URL.createObjectURL(blob)
     */
    resolve(src, onError) {
        if (typeof Buffer === 'function') {
            return Buffer.from(src, 'base64');
        }
        else if (typeof atob === 'function') {
            // On IE 11, atob() can't handle newlines
            const str = atob(src.replace(/[\n\r]/g, ''));
            const buffer = new Uint8Array(str.length);
            for (let i = 0; i < str.length; ++i)
                buffer[i] = str.charCodeAt(i);
            return buffer;
        }
        else {
            onError('This environment does not support reading binary tags; either Buffer or atob is required');
            return src;
        }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        const buf = value; // checked earlier by binary.identify()
        let str;
        if (typeof Buffer === 'function') {
            str =
                buf instanceof Buffer
                    ? buf.toString('base64')
                    : Buffer.from(buf.buffer).toString('base64');
        }
        else if (typeof btoa === 'function') {
            let s = '';
            for (let i = 0; i < buf.length; ++i)
                s += String.fromCharCode(buf[i]);
            str = btoa(s);
        }
        else {
            throw new Error('This environment does not support writing binary tags; either Buffer or btoa is required');
        }
        if (!type)
            type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL;
        if (type !== _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE) {
            const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
            const n = Math.ceil(str.length / lineWidth);
            const lines = new Array(n);
            for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
                lines[i] = str.substr(o, lineWidth);
            }
            str = lines.join(type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL ? '\n' : ' ');
        }
        return (0,_stringify_stringifyString_js__WEBPACK_IMPORTED_MODULE_1__.stringifyString)({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/bool.js":
/*!****************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/bool.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   falseTag: () => (/* binding */ falseTag),
/* harmony export */   trueTag: () => (/* binding */ trueTag)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");


function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
        return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
}
const trueTag = {
    identify: value => value === true,
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(true),
    stringify: boolStringify
};
const falseTag = {
    identify: value => value === false,
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(false),
    stringify: boolStringify
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/float.js":
/*!*****************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/float.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   float: () => (/* binding */ float),
/* harmony export */   floatExp: () => (/* binding */ floatExp),
/* harmony export */   floatNaN: () => (/* binding */ floatNaN)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../stringify/stringifyNumber.js */ "./node_modules/yaml/browser/dist/stringify/stringifyNumber.js");



const floatNaN = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === 'nan'
        ? NaN
        : str[0] === '-'
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber
};
const floatExp = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'EXP',
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, '')),
    stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber)(node);
    }
};
const float = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
        const node = new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar(parseFloat(str.replace(/_/g, '')));
        const dot = str.indexOf('.');
        if (dot !== -1) {
            const f = str.substring(dot + 1).replace(/_/g, '');
            if (f[f.length - 1] === '0')
                node.minFractionDigits = f.length;
        }
        return node;
    },
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_1__.stringifyNumber
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/int.js":
/*!***************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/int.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   int: () => (/* binding */ int),
/* harmony export */   intBin: () => (/* binding */ intBin),
/* harmony export */   intHex: () => (/* binding */ intHex),
/* harmony export */   intOct: () => (/* binding */ intOct)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../stringify/stringifyNumber.js */ "./node_modules/yaml/browser/dist/stringify/stringifyNumber.js");


const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
function intResolve(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === '-' || sign === '+')
        offset += 1;
    str = str.substring(offset).replace(/_/g, '');
    if (intAsBigInt) {
        switch (radix) {
            case 2:
                str = `0b${str}`;
                break;
            case 8:
                str = `0o${str}`;
                break;
            case 16:
                str = `0x${str}`;
                break;
        }
        const n = BigInt(str);
        return sign === '-' ? BigInt(-1) * n : n;
    }
    const n = parseInt(str, radix);
    return sign === '-' ? -1 * n : n;
}
function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? '-' + prefix + str.substr(1) : prefix + str;
    }
    return (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber)(node);
}
const intBin = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'BIN',
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
    stringify: node => intStringify(node, 2, '0b')
};
const intOct = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'OCT',
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
    stringify: node => intStringify(node, 8, '0')
};
const int = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber
};
const intHex = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'HEX',
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: node => intStringify(node, 16, '0x')
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/omap.js":
/*!****************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/omap.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLOMap: () => (/* binding */ YAMLOMap),
/* harmony export */   omap: () => (/* binding */ omap)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_toJS_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../nodes/toJS.js */ "./node_modules/yaml/browser/dist/nodes/toJS.js");
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../nodes/YAMLMap.js */ "./node_modules/yaml/browser/dist/nodes/YAMLMap.js");
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../nodes/YAMLSeq.js */ "./node_modules/yaml/browser/dist/nodes/YAMLSeq.js");
/* harmony import */ var _pairs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pairs.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js");






class YAMLOMap extends _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq {
    constructor() {
        super();
        this.add = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.add.bind(this);
        this.delete = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.delete.bind(this);
        this.get = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.get.bind(this);
        this.has = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.has.bind(this);
        this.set = _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap.prototype.set.bind(this);
        this.tag = YAMLOMap.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(_, ctx) {
        if (!ctx)
            return super.toJSON(_);
        const map = new Map();
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const pair of this.items) {
            let key, value;
            if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(pair)) {
                key = (0,_nodes_toJS_js__WEBPACK_IMPORTED_MODULE_1__.toJS)(pair.key, '', ctx);
                value = (0,_nodes_toJS_js__WEBPACK_IMPORTED_MODULE_1__.toJS)(pair.value, key, ctx);
            }
            else {
                key = (0,_nodes_toJS_js__WEBPACK_IMPORTED_MODULE_1__.toJS)(pair, '', ctx);
            }
            if (map.has(key))
                throw new Error('Ordered maps must not include duplicate keys');
            map.set(key, value);
        }
        return map;
    }
    static from(schema, iterable, ctx) {
        const pairs = (0,_pairs_js__WEBPACK_IMPORTED_MODULE_4__.createPairs)(schema, iterable, ctx);
        const omap = new this();
        omap.items = pairs.items;
        return omap;
    }
}
YAMLOMap.tag = 'tag:yaml.org,2002:omap';
const omap = {
    collection: 'seq',
    identify: value => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: 'tag:yaml.org,2002:omap',
    resolve(seq, onError) {
        const pairs = (0,_pairs_js__WEBPACK_IMPORTED_MODULE_4__.resolvePairs)(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs.items) {
            if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(key)) {
                if (seenKeys.includes(key.value)) {
                    onError(`Ordered maps must not include duplicate keys: ${key.value}`);
                }
                else {
                    seenKeys.push(key.value);
                }
            }
        }
        return Object.assign(new YAMLOMap(), pairs);
    },
    createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js":
/*!*****************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createPairs: () => (/* binding */ createPairs),
/* harmony export */   pairs: () => (/* binding */ pairs),
/* harmony export */   resolvePairs: () => (/* binding */ resolvePairs)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../nodes/Pair.js */ "./node_modules/yaml/browser/dist/nodes/Pair.js");
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../nodes/YAMLSeq.js */ "./node_modules/yaml/browser/dist/nodes/YAMLSeq.js");





function resolvePairs(seq, onError) {
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
            let item = seq.items[i];
            if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(item))
                continue;
            else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(item)) {
                if (item.items.length > 1)
                    onError('Each pair must have its own sequence indicator');
                const pair = item.items[0] || new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(new _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_2__.Scalar(null));
                if (item.commentBefore)
                    pair.key.commentBefore = pair.key.commentBefore
                        ? `${item.commentBefore}\n${pair.key.commentBefore}`
                        : item.commentBefore;
                if (item.comment) {
                    const cn = pair.value ?? pair.key;
                    cn.comment = cn.comment
                        ? `${item.comment}\n${cn.comment}`
                        : item.comment;
                }
                item = pair;
            }
            seq.items[i] = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(item) ? item : new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(item);
        }
    }
    else
        onError('Expected a sequence for this tag');
    return seq;
}
function createPairs(schema, iterable, ctx) {
    const { replacer } = ctx;
    const pairs = new _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq(schema);
    pairs.tag = 'tag:yaml.org,2002:pairs';
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
            if (typeof replacer === 'function')
                it = replacer.call(iterable, String(i++), it);
            let key, value;
            if (Array.isArray(it)) {
                if (it.length === 2) {
                    key = it[0];
                    value = it[1];
                }
                else
                    throw new TypeError(`Expected [key, value] tuple: ${it}`);
            }
            else if (it && it instanceof Object) {
                const keys = Object.keys(it);
                if (keys.length === 1) {
                    key = keys[0];
                    value = it[key];
                }
                else {
                    throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
                }
            }
            else {
                key = it;
            }
            pairs.items.push((0,_nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.createPair)(key, value, ctx));
        }
    return pairs;
}
const pairs = {
    collection: 'seq',
    default: false,
    tag: 'tag:yaml.org,2002:pairs',
    resolve: resolvePairs,
    createNode: createPairs
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/schema.js":
/*!******************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/schema.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   schema: () => (/* binding */ schema)
/* harmony export */ });
/* harmony import */ var _common_map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/map.js */ "./node_modules/yaml/browser/dist/schema/common/map.js");
/* harmony import */ var _common_null_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/null.js */ "./node_modules/yaml/browser/dist/schema/common/null.js");
/* harmony import */ var _common_seq_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/seq.js */ "./node_modules/yaml/browser/dist/schema/common/seq.js");
/* harmony import */ var _common_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/string.js */ "./node_modules/yaml/browser/dist/schema/common/string.js");
/* harmony import */ var _binary_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./binary.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/binary.js");
/* harmony import */ var _bool_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./bool.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/bool.js");
/* harmony import */ var _float_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./float.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/float.js");
/* harmony import */ var _int_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./int.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/int.js");
/* harmony import */ var _omap_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./omap.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/omap.js");
/* harmony import */ var _pairs_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./pairs.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js");
/* harmony import */ var _set_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./set.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/set.js");
/* harmony import */ var _timestamp_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./timestamp.js */ "./node_modules/yaml/browser/dist/schema/yaml-1.1/timestamp.js");













const schema = [
    _common_map_js__WEBPACK_IMPORTED_MODULE_0__.map,
    _common_seq_js__WEBPACK_IMPORTED_MODULE_2__.seq,
    _common_string_js__WEBPACK_IMPORTED_MODULE_3__.string,
    _common_null_js__WEBPACK_IMPORTED_MODULE_1__.nullTag,
    _bool_js__WEBPACK_IMPORTED_MODULE_5__.trueTag,
    _bool_js__WEBPACK_IMPORTED_MODULE_5__.falseTag,
    _int_js__WEBPACK_IMPORTED_MODULE_7__.intBin,
    _int_js__WEBPACK_IMPORTED_MODULE_7__.intOct,
    _int_js__WEBPACK_IMPORTED_MODULE_7__.int,
    _int_js__WEBPACK_IMPORTED_MODULE_7__.intHex,
    _float_js__WEBPACK_IMPORTED_MODULE_6__.floatNaN,
    _float_js__WEBPACK_IMPORTED_MODULE_6__.floatExp,
    _float_js__WEBPACK_IMPORTED_MODULE_6__.float,
    _binary_js__WEBPACK_IMPORTED_MODULE_4__.binary,
    _omap_js__WEBPACK_IMPORTED_MODULE_8__.omap,
    _pairs_js__WEBPACK_IMPORTED_MODULE_9__.pairs,
    _set_js__WEBPACK_IMPORTED_MODULE_10__.set,
    _timestamp_js__WEBPACK_IMPORTED_MODULE_11__.intTime,
    _timestamp_js__WEBPACK_IMPORTED_MODULE_11__.floatTime,
    _timestamp_js__WEBPACK_IMPORTED_MODULE_11__.timestamp
];




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/set.js":
/*!***************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/set.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YAMLSet: () => (/* binding */ YAMLSet),
/* harmony export */   set: () => (/* binding */ set)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../nodes/Pair.js */ "./node_modules/yaml/browser/dist/nodes/Pair.js");
/* harmony import */ var _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../nodes/YAMLMap.js */ "./node_modules/yaml/browser/dist/nodes/YAMLMap.js");




class YAMLSet extends _nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.YAMLMap {
    constructor(schema) {
        super(schema);
        this.tag = YAMLSet.tag;
    }
    add(key) {
        let pair;
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(key))
            pair = key;
        else if (key &&
            typeof key === 'object' &&
            'key' in key &&
            'value' in key &&
            key.value === null)
            pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(key.key, null);
        else
            pair = new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(key, null);
        const prev = (0,_nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.findPair)(this.items, pair.key);
        if (!prev)
            this.items.push(pair);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(key, keepPair) {
        const pair = (0,_nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.findPair)(this.items, key);
        return !keepPair && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(pair)
            ? (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(pair.key)
                ? pair.key.value
                : pair.key
            : pair;
    }
    set(key, value) {
        if (typeof value !== 'boolean')
            throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = (0,_nodes_YAMLMap_js__WEBPACK_IMPORTED_MODULE_2__.findPair)(this.items, key);
        if (prev && !value) {
            this.items.splice(this.items.indexOf(prev), 1);
        }
        else if (!prev && value) {
            this.items.push(new _nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.Pair(key));
        }
    }
    toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        if (this.hasAllNullValues(true))
            return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
            throw new Error('Set items must all have null values');
    }
    static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
            for (let value of iterable) {
                if (typeof replacer === 'function')
                    value = replacer.call(iterable, value, value);
                set.items.push((0,_nodes_Pair_js__WEBPACK_IMPORTED_MODULE_1__.createPair)(value, null, ctx));
            }
        return set;
    }
}
YAMLSet.tag = 'tag:yaml.org,2002:set';
const set = {
    collection: 'map',
    identify: value => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: 'tag:yaml.org,2002:set',
    createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
    resolve(map, onError) {
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(map)) {
            if (map.hasAllNullValues(true))
                return Object.assign(new YAMLSet(), map);
            else
                onError('Set items must all have null values');
        }
        else
            onError('Expected a mapping for this tag');
        return map;
    }
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/schema/yaml-1.1/timestamp.js":
/*!*********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/schema/yaml-1.1/timestamp.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   floatTime: () => (/* binding */ floatTime),
/* harmony export */   intTime: () => (/* binding */ intTime),
/* harmony export */   timestamp: () => (/* binding */ timestamp)
/* harmony export */ });
/* harmony import */ var _stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../stringify/stringifyNumber.js */ "./node_modules/yaml/browser/dist/stringify/stringifyNumber.js");


/** Internal types handle bigint as number, because TS can't figure it out. */
function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === '-' || sign === '+' ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts
        .replace(/_/g, '')
        .split(':')
        .reduce((res, p) => res * num(60) + num(p), num(0));
    return (sign === '-' ? num(-1) * res : res);
}
/**
 * hhhh:mm:ss.sss
 *
 * Internal types handle bigint as number, because TS can't figure it out.
 */
function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === 'bigint')
        num = n => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
        return (0,_stringify_stringifyNumber_js__WEBPACK_IMPORTED_MODULE_0__.stringifyNumber)(node);
    let sign = '';
    if (value < 0) {
        sign = '-';
        value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60]; // seconds, including ms
    if (value < 60) {
        parts.unshift(0); // at least one : is required
    }
    else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60); // minutes
        if (value >= 60) {
            value = (value - parts[0]) / _60;
            parts.unshift(value); // hours
        }
    }
    return (sign +
        parts
            .map(n => String(n).padStart(2, '0'))
            .join(':')
            .replace(/000000\d*$/, '') // % 60 may introduce error
    );
}
const intTime = {
    identify: value => typeof value === 'bigint' || Number.isInteger(value),
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'TIME',
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
};
const floatTime = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'TIME',
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: str => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
};
const timestamp = {
    identify: value => value instanceof Date,
    default: true,
    tag: 'tag:yaml.org,2002:timestamp',
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp('^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})' + // YYYY-Mm-Dd
        '(?:' + // time is optional
        '(?:t|T|[ \\t]+)' + // t | T | whitespace
        '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)' + // Hh:Mm:Ss(.ss)?
        '(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?' + // Z | +5 | -03:30
        ')?$'),
    resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
            throw new Error('!!timestamp expects a date, starting with yyyy-mm-dd');
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + '00').substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== 'Z') {
            let d = parseSexagesimal(tz, false);
            if (Math.abs(d) < 30)
                d *= 60;
            date -= 60000 * d;
        }
        return new Date(date);
    },
    stringify: ({ value }) => value.toISOString().replace(/((T00:00)?:00)?\.000Z$/, '')
};




/***/ }),

/***/ "./node_modules/yaml/browser/dist/stringify/foldFlowLines.js":
/*!*******************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/stringify/foldFlowLines.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FOLD_BLOCK: () => (/* binding */ FOLD_BLOCK),
/* harmony export */   FOLD_FLOW: () => (/* binding */ FOLD_FLOW),
/* harmony export */   FOLD_QUOTED: () => (/* binding */ FOLD_QUOTED),
/* harmony export */   foldFlowLines: () => (/* binding */ foldFlowLines)
/* harmony export */ });
const FOLD_FLOW = 'flow';
const FOLD_BLOCK = 'block';
const FOLD_QUOTED = 'quoted';
/**
 * Tries to keep input at up to `lineWidth` characters, splitting only on spaces
 * not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
 * terminated with `\n` and started with `indent`.
 */
function foldFlowLines(text, indent, mode = 'flow', { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
        return text;
    if (lineWidth < minContentWidth)
        minContentWidth = 0;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
        return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === 'number') {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
            folds.push(0);
        else
            end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
            end = i + endStep;
    }
    for (let ch; (ch = text[(i += 1)]);) {
        if (mode === FOLD_QUOTED && ch === '\\') {
            escStart = i;
            switch (text[i + 1]) {
                case 'x':
                    i += 3;
                    break;
                case 'u':
                    i += 5;
                    break;
                case 'U':
                    i += 9;
                    break;
                default:
                    i += 1;
            }
            escEnd = i;
        }
        if (ch === '\n') {
            if (mode === FOLD_BLOCK)
                i = consumeMoreIndentedLines(text, i, indent.length);
            end = i + indent.length + endStep;
            split = undefined;
        }
        else {
            if (ch === ' ' &&
                prev &&
                prev !== ' ' &&
                prev !== '\n' &&
                prev !== '\t') {
                // space surrounded by non-space can be replaced with newline + indent
                const next = text[i + 1];
                if (next && next !== ' ' && next !== '\n' && next !== '\t')
                    split = i;
            }
            if (i >= end) {
                if (split) {
                    folds.push(split);
                    end = split + endStep;
                    split = undefined;
                }
                else if (mode === FOLD_QUOTED) {
                    // white-space collected at end may stretch past lineWidth
                    while (prev === ' ' || prev === '\t') {
                        prev = ch;
                        ch = text[(i += 1)];
                        overflow = true;
                    }
                    // Account for newline escape, but don't break preceding escape
                    const j = i > escEnd + 1 ? i - 2 : escStart - 1;
                    // Bail out if lineWidth & minContentWidth are shorter than an escape string
                    if (escapedFolds[j])
                        return text;
                    folds.push(j);
                    escapedFolds[j] = true;
                    end = j + endStep;
                    split = undefined;
                }
                else {
                    overflow = true;
                }
            }
        }
        prev = ch;
    }
    if (overflow && onOverflow)
        onOverflow();
    if (folds.length === 0)
        return text;
    if (onFold)
        onFold();
    let res = text.slice(0, folds[0]);
    for (let i = 0; i < folds.length; ++i) {
        const fold = folds[i];
        const end = folds[i + 1] || text.length;
        if (fold === 0)
            res = `\n${indent}${text.slice(0, end)}`;
        else {
            if (mode === FOLD_QUOTED && escapedFolds[fold])
                res += `${text[fold]}\\`;
            res += `\n${indent}${text.slice(fold + 1, end)}`;
        }
    }
    return res;
}
/**
 * Presumes `i + 1` is at the start of a line
 * @returns index of last newline in more-indented block
 */
function consumeMoreIndentedLines(text, i, indent) {
    let end = i;
    let start = i + 1;
    let ch = text[start];
    while (ch === ' ' || ch === '\t') {
        if (i < start + indent) {
            ch = text[++i];
        }
        else {
            do {
                ch = text[++i];
            } while (ch && ch !== '\n');
            end = i;
            start = i + 1;
            ch = text[start];
        }
    }
    return end;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/stringify/stringify.js":
/*!***************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/stringify/stringify.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createStringifyContext: () => (/* binding */ createStringifyContext),
/* harmony export */   stringify: () => (/* binding */ stringify)
/* harmony export */ });
/* harmony import */ var _doc_anchors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../doc/anchors.js */ "./node_modules/yaml/browser/dist/doc/anchors.js");
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringifyComment.js */ "./node_modules/yaml/browser/dist/stringify/stringifyComment.js");
/* harmony import */ var _stringifyString_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./stringifyString.js */ "./node_modules/yaml/browser/dist/stringify/stringifyString.js");





function createStringifyContext(doc, options) {
    const opt = Object.assign({
        blockQuote: true,
        commentString: _stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.stringifyComment,
        defaultKeyType: null,
        defaultStringType: 'PLAIN',
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: 'false',
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: 'null',
        simpleKeys: false,
        singleQuote: null,
        trueStr: 'true',
        verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
        case 'block':
            inFlow = false;
            break;
        case 'flow':
            inFlow = true;
            break;
        default:
            inFlow = null;
    }
    return {
        anchors: new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? ' ' : '',
        indent: '',
        indentStep: typeof opt.indent === 'number' ? ' '.repeat(opt.indent) : '  ',
        inFlow,
        options: opt
    };
}
function getTagObject(tags, item) {
    if (item.tag) {
        const match = tags.filter(t => t.tag === item.tag);
        if (match.length > 0)
            return match.find(t => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(item)) {
        obj = item.value;
        const match = tags.filter(t => t.identify?.(obj));
        tagObj =
            match.find(t => t.format === item.format) ?? match.find(t => !t.format);
    }
    else {
        obj = item;
        tagObj = tags.find(t => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
        const name = obj?.constructor?.name ?? typeof obj;
        throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
}
// needs to be called before value stringifier to allow for circular anchor refs
function stringifyProps(node, tagObj, { anchors, doc }) {
    if (!doc.directives)
        return '';
    const props = [];
    const anchor = ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node) || (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isCollection)(node)) && node.anchor;
    if (anchor && (0,_doc_anchors_js__WEBPACK_IMPORTED_MODULE_0__.anchorIsValid)(anchor)) {
        anchors.add(anchor);
        props.push(`&${anchor}`);
    }
    const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
    if (tag)
        props.push(doc.directives.tagString(tag));
    return props.join(' ');
}
function stringify(item, ctx, onComment, onChompKeep) {
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isPair)(item))
        return item.toString(ctx, onComment, onChompKeep);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isAlias)(item)) {
        if (ctx.doc.directives)
            return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
            throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        }
        else {
            if (ctx.resolvedAliases)
                ctx.resolvedAliases.add(item);
            else
                ctx.resolvedAliases = new Set([item]);
            item = item.resolve(ctx.doc);
        }
    }
    let tagObj = undefined;
    const node = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isNode)(item)
        ? item
        : ctx.doc.createNode(item, { onTagObj: o => (tagObj = o) });
    if (!tagObj)
        tagObj = getTagObject(ctx.doc.schema.tags, node);
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === 'function'
        ? tagObj.stringify(node, ctx, onComment, onChompKeep)
        : (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node)
            ? (0,_stringifyString_js__WEBPACK_IMPORTED_MODULE_3__.stringifyString)(node, ctx, onComment, onChompKeep)
            : node.toString(ctx, onComment, onChompKeep);
    if (!props)
        return str;
    return (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_1__.isScalar)(node) || str[0] === '{' || str[0] === '['
        ? `${props} ${str}`
        : `${props}\n${ctx.indent}${str}`;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/stringify/stringifyCollection.js":
/*!*************************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/stringify/stringifyCollection.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyCollection: () => (/* binding */ stringifyCollection)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/yaml/browser/dist/stringify/stringify.js");
/* harmony import */ var _stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringifyComment.js */ "./node_modules/yaml/browser/dist/stringify/stringifyComment.js");




function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false; // flag for the preceding node's status
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item)) {
            if (!chompKeep && item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
            if (item.comment)
                comment = item.comment;
        }
        else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(item)) {
            const ik = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item.key) ? item.key : null;
            if (ik) {
                if (!chompKeep && ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
            }
        }
        chompKeep = false;
        let str = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify)(item, itemCtx, () => (comment = null), () => (chompKeep = true));
        if (comment)
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.lineComment)(str, itemIndent, commentString(comment));
        if (chompKeep && comment)
            chompKeep = false;
        lines.push(blockItemPrefix + str);
    }
    let str;
    if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
    }
    else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
            const line = lines[i];
            str += line ? `\n${indent}${line}` : '\n';
        }
    }
    if (comment) {
        str += '\n' + (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(commentString(comment), indent);
        if (onComment)
            onComment();
    }
    else if (chompKeep && onChompKeep)
        onChompKeep();
    return str;
}
function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
    const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item)) {
            if (item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, false);
            if (item.comment)
                comment = item.comment;
        }
        else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(item)) {
            const ik = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item.key) ? item.key : null;
            if (ik) {
                if (ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, false);
                if (ik.comment)
                    reqNewline = true;
            }
            const iv = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(item.value) ? item.value : null;
            if (iv) {
                if (iv.comment)
                    comment = iv.comment;
                if (iv.commentBefore)
                    reqNewline = true;
            }
            else if (item.value == null && ik?.comment) {
                comment = ik.comment;
            }
        }
        if (comment)
            reqNewline = true;
        let str = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify)(item, itemCtx, () => (comment = null));
        if (i < items.length - 1)
            str += ',';
        if (comment)
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.lineComment)(str, itemIndent, commentString(comment));
        if (!reqNewline && (lines.length > linesAtValue || str.includes('\n')))
            reqNewline = true;
        lines.push(str);
        linesAtValue = lines.length;
    }
    const { start, end } = flowChars;
    if (lines.length === 0) {
        return start + end;
    }
    else {
        if (!reqNewline) {
            const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
            reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
            let str = start;
            for (const line of lines)
                str += line ? `\n${indentStep}${indent}${line}` : '\n';
            return `${str}\n${indent}${end}`;
        }
        else {
            return `${start}${fcPadding}${lines.join(' ')}${fcPadding}${end}`;
        }
    }
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
        comment = comment.replace(/^\n+/, '');
    if (comment) {
        const ic = (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(commentString(comment), indent);
        lines.push(ic.trimStart()); // Avoid double indent on first line
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/stringify/stringifyComment.js":
/*!**********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/stringify/stringifyComment.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   indentComment: () => (/* binding */ indentComment),
/* harmony export */   lineComment: () => (/* binding */ lineComment),
/* harmony export */   stringifyComment: () => (/* binding */ stringifyComment)
/* harmony export */ });
/**
 * Stringifies a comment.
 *
 * Empty comment lines are left empty,
 * lines consisting of a single space are replaced by `#`,
 * and all other lines are prefixed with a `#`.
 */
const stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, '#');
function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
        return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
const lineComment = (str, indent, comment) => str.endsWith('\n')
    ? indentComment(comment, indent)
    : comment.includes('\n')
        ? '\n' + indentComment(comment, indent)
        : (str.endsWith(' ') ? '' : ' ') + comment;




/***/ }),

/***/ "./node_modules/yaml/browser/dist/stringify/stringifyDocument.js":
/*!***********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/stringify/stringifyDocument.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyDocument: () => (/* binding */ stringifyDocument)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/yaml/browser/dist/stringify/stringify.js");
/* harmony import */ var _stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringifyComment.js */ "./node_modules/yaml/browser/dist/stringify/stringifyComment.js");




function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
            lines.push(dir);
            hasDirectives = true;
        }
        else if (doc.directives.docStart)
            hasDirectives = true;
    }
    if (hasDirectives)
        lines.push('---');
    const ctx = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.createStringifyContext)(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
        if (lines.length !== 1)
            lines.unshift('');
        const cs = commentString(doc.commentBefore);
        lines.unshift((0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(cs, ''));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(doc.contents)) {
            if (doc.contents.spaceBefore && hasDirectives)
                lines.push('');
            if (doc.contents.commentBefore) {
                const cs = commentString(doc.contents.commentBefore);
                lines.push((0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(cs, ''));
            }
            // top-level block scalars need to be indented if followed by a comment
            ctx.forceBlockIndent = !!doc.comment;
            contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? undefined : () => (chompKeep = true);
        let body = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify)(doc.contents, ctx, () => (contentComment = null), onChompKeep);
        if (contentComment)
            body += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.lineComment)(body, '', commentString(contentComment));
        if ((body[0] === '|' || body[0] === '>') &&
            lines[lines.length - 1] === '---') {
            // Top-level block scalars with a preceding doc marker ought to use the
            // same line for their header.
            lines[lines.length - 1] = `--- ${body}`;
        }
        else
            lines.push(body);
    }
    else {
        lines.push((0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.stringify)(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
        if (doc.comment) {
            const cs = commentString(doc.comment);
            if (cs.includes('\n')) {
                lines.push('...');
                lines.push((0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(cs, ''));
            }
            else {
                lines.push(`... ${cs}`);
            }
        }
        else {
            lines.push('...');
        }
    }
    else {
        let dc = doc.comment;
        if (dc && chompKeep)
            dc = dc.replace(/^\n+/, '');
        if (dc) {
            if ((!chompKeep || contentComment) && lines[lines.length - 1] !== '')
                lines.push('');
            lines.push((0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_2__.indentComment)(commentString(dc), ''));
        }
    }
    return lines.join('\n') + '\n';
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/stringify/stringifyNumber.js":
/*!*********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/stringify/stringifyNumber.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyNumber: () => (/* binding */ stringifyNumber)
/* harmony export */ });
function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === 'bigint')
        return String(value);
    const num = typeof value === 'number' ? value : Number(value);
    if (!isFinite(num))
        return isNaN(num) ? '.nan' : num < 0 ? '-.inf' : '.inf';
    let n = JSON.stringify(value);
    if (!format &&
        minFractionDigits &&
        (!tag || tag === 'tag:yaml.org,2002:float') &&
        /^\d/.test(n)) {
        let i = n.indexOf('.');
        if (i < 0) {
            i = n.length;
            n += '.';
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
            n += '0';
    }
    return n;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/stringify/stringifyPair.js":
/*!*******************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/stringify/stringifyPair.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyPair: () => (/* binding */ stringifyPair)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/yaml/browser/dist/stringify/stringify.js");
/* harmony import */ var _stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./stringifyComment.js */ "./node_modules/yaml/browser/dist/stringify/stringifyComment.js");





function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(key) && key.comment) || null;
    if (simpleKeys) {
        if (keyComment) {
            throw new Error('With simple keys, key nodes cannot have comments');
        }
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(key) || (!(0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(key) && typeof key === 'object')) {
            const msg = 'With simple keys, collection cannot be used as a key value';
            throw new Error(msg);
        }
    }
    let explicitKey = !simpleKeys &&
        (!key ||
            (keyComment && value == null && !ctx.inFlow) ||
            (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(key) ||
            ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(key)
                ? key.type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar.BLOCK_FOLDED || key.type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_1__.Scalar.BLOCK_LITERAL
                : typeof key === 'object'));
    ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.stringify)(key, ctx, () => (keyCommentDone = true), () => (chompKeep = true));
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
            throw new Error('With simple keys, single line scalar must not span more than 1024 characters');
        explicitKey = true;
    }
    if (ctx.inFlow) {
        if (allNullValues || value == null) {
            if (keyCommentDone && onComment)
                onComment();
            return str === '' ? '?' : explicitKey ? `? ${str}` : str;
        }
    }
    else if ((allNullValues && !simpleKeys) || (value == null && explicitKey)) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.lineComment)(str, ctx.indent, commentString(keyComment));
        }
        else if (chompKeep && onChompKeep)
            onChompKeep();
        return str;
    }
    if (keyCommentDone)
        keyComment = null;
    if (explicitKey) {
        if (keyComment)
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.lineComment)(str, ctx.indent, commentString(keyComment));
        str = `? ${str}\n${indent}:`;
    }
    else {
        str = `${str}:`;
        if (keyComment)
            str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.lineComment)(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
    }
    else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === 'object')
            value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(value))
        ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq &&
        indentStep.length >= 2 &&
        !ctx.inFlow &&
        !explicitKey &&
        (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(value) &&
        !value.flow &&
        !value.tag &&
        !value.anchor) {
        // If indentSeq === false, consider '- ' as part of indentation where possible
        ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.stringify)(value, ctx, () => (valueCommentDone = true), () => (chompKeep = true));
    let ws = ' ';
    if (keyComment || vsb || vcb) {
        ws = vsb ? '\n' : '';
        if (vcb) {
            const cs = commentString(vcb);
            ws += `\n${(0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.indentComment)(cs, ctx.indent)}`;
        }
        if (valueStr === '' && !ctx.inFlow) {
            if (ws === '\n')
                ws = '\n\n';
        }
        else {
            ws += `\n${ctx.indent}`;
        }
    }
    else if (!explicitKey && (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf('\n');
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
            let hasPropsLine = false;
            if (hasNewline && (vs0 === '&' || vs0 === '!')) {
                let sp0 = valueStr.indexOf(' ');
                if (vs0 === '&' &&
                    sp0 !== -1 &&
                    sp0 < nl0 &&
                    valueStr[sp0 + 1] === '!') {
                    sp0 = valueStr.indexOf(' ', sp0 + 1);
                }
                if (sp0 === -1 || nl0 < sp0)
                    hasPropsLine = true;
            }
            if (!hasPropsLine)
                ws = `\n${ctx.indent}`;
        }
    }
    else if (valueStr === '' || valueStr[0] === '\n') {
        ws = '';
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
        if (valueCommentDone && onComment)
            onComment();
    }
    else if (valueComment && !valueCommentDone) {
        str += (0,_stringifyComment_js__WEBPACK_IMPORTED_MODULE_3__.lineComment)(str, ctx.indent, commentString(valueComment));
    }
    else if (chompKeep && onChompKeep) {
        onChompKeep();
    }
    return str;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/stringify/stringifyString.js":
/*!*********************************************************************!*\
  !*** ./node_modules/yaml/browser/dist/stringify/stringifyString.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyString: () => (/* binding */ stringifyString)
/* harmony export */ });
/* harmony import */ var _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../nodes/Scalar.js */ "./node_modules/yaml/browser/dist/nodes/Scalar.js");
/* harmony import */ var _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./foldFlowLines.js */ "./node_modules/yaml/browser/dist/stringify/foldFlowLines.js");



const getFoldOptions = (ctx, isBlock) => ({
    indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
});
// Also checks for lines starting with %, as parsing the output as YAML 1.1 will
// presume that's starting a new document.
const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
        return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
        return false;
    for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === '\n') {
            if (i - start > limit)
                return true;
            start = i + 1;
            if (strLen - start <= limit)
                return false;
        }
    }
    return true;
}
function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
        return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    let str = '';
    let start = 0;
    for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === ' ' && json[i + 1] === '\\' && json[i + 2] === 'n') {
            // space before newline needs to be escaped to not be folded
            str += json.slice(start, i) + '\\ ';
            i += 1;
            start = i;
            ch = '\\';
        }
        if (ch === '\\')
            switch (json[i + 1]) {
                case 'u':
                    {
                        str += json.slice(start, i);
                        const code = json.substr(i + 2, 4);
                        switch (code) {
                            case '0000':
                                str += '\\0';
                                break;
                            case '0007':
                                str += '\\a';
                                break;
                            case '000b':
                                str += '\\v';
                                break;
                            case '001b':
                                str += '\\e';
                                break;
                            case '0085':
                                str += '\\N';
                                break;
                            case '00a0':
                                str += '\\_';
                                break;
                            case '2028':
                                str += '\\L';
                                break;
                            case '2029':
                                str += '\\P';
                                break;
                            default:
                                if (code.substr(0, 2) === '00')
                                    str += '\\x' + code.substr(2);
                                else
                                    str += json.substr(i, 6);
                        }
                        i += 5;
                        start = i + 1;
                    }
                    break;
                case 'n':
                    if (implicitKey ||
                        json[i + 2] === '"' ||
                        json.length < minMultiLineLength) {
                        i += 1;
                    }
                    else {
                        // folding will eat first newline
                        str += json.slice(start, i) + '\n\n';
                        while (json[i + 2] === '\\' &&
                            json[i + 3] === 'n' &&
                            json[i + 4] !== '"') {
                            str += '\n';
                            i += 2;
                        }
                        str += indent;
                        // space after newline needs to be escaped to not be folded
                        if (json[i + 2] === ' ')
                            str += '\\';
                        i += 1;
                        start = i + 1;
                    }
                    break;
                default:
                    i += 1;
            }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey
        ? str
        : (0,_foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.foldFlowLines)(str, indent, _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false ||
        (ctx.implicitKey && value.includes('\n')) ||
        /[ \t]\n|\n[ \t]/.test(value) // single quoted string can't have leading or trailing whitespace around newline
    )
        return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
    return ctx.implicitKey
        ? res
        : (0,_foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.foldFlowLines)(res, indent, _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
        qs = doubleQuotedString;
    else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
            qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
            qs = doubleQuotedString;
        else
            qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
}
// The negative lookbehind avoids a polynomial search,
// but isn't supported yet on Safari: https://caniuse.com/js-regexp-lookbehind
let blockEndNewlines;
try {
    blockEndNewlines = new RegExp('(^|(?<!\n))\n+(?!\n|$)', 'g');
}
catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    // 1. Block can't end in whitespace unless the last line is non-empty.
    // 2. Strings consisting of only whitespace are best rendered explicitly.
    if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
        return quotedString(value, ctx);
    }
    const indent = ctx.indent ||
        (ctx.forceBlockIndent || containsDocumentMarker(value) ? '  ' : '');
    const literal = blockQuote === 'literal'
        ? true
        : blockQuote === 'folded' || type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_FOLDED
            ? false
            : type === _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL
                ? true
                : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
        return literal ? '|\n' : '>\n';
    // determine chomping from whitespace at value end
    let chomp;
    let endStart;
    for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== '\n' && ch !== '\t' && ch !== ' ')
            break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf('\n');
    if (endNlPos === -1) {
        chomp = '-'; // strip
    }
    else if (value === end || endNlPos !== end.length - 1) {
        chomp = '+'; // keep
        if (onChompKeep)
            onChompKeep();
    }
    else {
        chomp = ''; // clip
    }
    if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === '\n')
            end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
    }
    // determine indent indicator from whitespace at value start
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === ' ')
            startWithSpace = true;
        else if (ch === '\n')
            startNlPos = startEnd;
        else
            break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? '2' : '1'; // root is at -1
    let header = (literal ? '|' : '>') + (startWithSpace ? indentSize : '') + chomp;
    if (comment) {
        header += ' ' + commentString(comment.replace(/ ?[\r\n]+/g, ' '));
        if (onComment)
            onComment();
    }
    if (literal) {
        value = value.replace(/\n+/g, `$&${indent}`);
        return `${header}\n${indent}${start}${value}${end}`;
    }
    value = value
        .replace(/\n+/g, '\n$&')
        .replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, '$1$2') // more-indented lines aren't folded
        //                ^ more-ind. ^ empty     ^ capture next empty lines only at end of indent
        .replace(/\n+/g, `$&${indent}`);
    const body = (0,_foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.foldFlowLines)(`${start}${value}${end}`, indent, _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.FOLD_BLOCK, getFoldOptions(ctx, true));
    return `${header}\n${indent}${body}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
    if ((implicitKey && value.includes('\n')) ||
        (inFlow && /[[\]{},]/.test(value))) {
        return quotedString(value, ctx);
    }
    if (!value ||
        /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        // not allowed:
        // - empty string, '-' or '?'
        // - start with an indicator character (except [?:-]) or /[?-] /
        // - '\n ', ': ' or ' \n' anywhere
        // - '#' not preceded by a non-space char
        // - end with ' ' or ':'
        return implicitKey || inFlow || !value.includes('\n')
            ? quotedString(value, ctx)
            : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey &&
        !inFlow &&
        type !== _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.PLAIN &&
        value.includes('\n')) {
        // Where allowed & type not set explicitly, prefer block style for multiline strings
        return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
        if (indent === '') {
            ctx.forceBlockIndent = true;
            return blockString(item, ctx, onComment, onChompKeep);
        }
        else if (implicitKey && indent === indentStep) {
            return quotedString(value, ctx);
        }
    }
    const str = value.replace(/\n+/g, `$&\n${indent}`);
    // Verify that output will be parsed as a string, as e.g. plain numbers and
    // booleans get parsed with those types in v1.2 (e.g. '42', 'true' & '0.9e-3'),
    // and others in v1.1.
    if (actualString) {
        const test = (tag) => tag.default && tag.tag !== 'tag:yaml.org,2002:str' && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
            return quotedString(value, ctx);
    }
    return implicitKey
        ? str
        : (0,_foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.foldFlowLines)(str, indent, _foldFlowLines_js__WEBPACK_IMPORTED_MODULE_1__.FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === 'string'
        ? item
        : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE) {
        // force double quotes on control characters & unpaired surrogates
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
            type = _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
        switch (_type) {
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_FOLDED:
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.BLOCK_LITERAL:
                return implicitKey || inFlow
                    ? quotedString(ss.value, ctx) // blocks are not valid inside flow containers
                    : blockString(ss, ctx, onComment, onChompKeep);
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_DOUBLE:
                return doubleQuotedString(ss.value, ctx);
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.QUOTE_SINGLE:
                return singleQuotedString(ss.value, ctx);
            case _nodes_Scalar_js__WEBPACK_IMPORTED_MODULE_0__.Scalar.PLAIN:
                return plainString(ss, ctx, onComment, onChompKeep);
            default:
                return null;
        }
    };
    let res = _stringify(type);
    if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = (implicitKey && defaultKeyType) || defaultStringType;
        res = _stringify(t);
        if (res === null)
            throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
}




/***/ }),

/***/ "./node_modules/yaml/browser/dist/visit.js":
/*!*************************************************!*\
  !*** ./node_modules/yaml/browser/dist/visit.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   visit: () => (/* binding */ visit),
/* harmony export */   visitAsync: () => (/* binding */ visitAsync)
/* harmony export */ });
/* harmony import */ var _nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./nodes/identity.js */ "./node_modules/yaml/browser/dist/nodes/identity.js");


const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove node');
/**
 * Apply a visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isDocument)(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
            node.contents = null;
    }
    else
        visit_(null, node, visitor_, Object.freeze([]));
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current node */
visit.SKIP = SKIP;
/** Remove the current node */
visit.REMOVE = REMOVE;
function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(ctrl) || (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== 'symbol') {
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(node)) {
            path = Object.freeze(path.concat(node));
            for (let i = 0; i < node.items.length; ++i) {
                const ci = visit_(i, node.items[i], visitor, path);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    node.items.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(node)) {
            path = Object.freeze(path.concat(node));
            const ck = visit_('key', node.key, visitor, path);
            if (ck === BREAK)
                return BREAK;
            else if (ck === REMOVE)
                node.key = null;
            const cv = visit_('value', node.value, visitor, path);
            if (cv === BREAK)
                return BREAK;
            else if (cv === REMOVE)
                node.value = null;
        }
    }
    return ctrl;
}
/**
 * Apply an async visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `Promise`: Must resolve to one of the following values
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
async function visitAsync(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isDocument)(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
            node.contents = null;
    }
    else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visitAsync.BREAK = BREAK;
/** Do not visit the children of the current node */
visitAsync.SKIP = SKIP;
/** Remove the current node */
visitAsync.REMOVE = REMOVE;
async function visitAsync_(key, node, visitor, path) {
    const ctrl = await callVisitor(key, node, visitor, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isNode)(ctrl) || (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== 'symbol') {
        if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(node)) {
            path = Object.freeze(path.concat(node));
            for (let i = 0; i < node.items.length; ++i) {
                const ci = await visitAsync_(i, node.items[i], visitor, path);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    node.items.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(node)) {
            path = Object.freeze(path.concat(node));
            const ck = await visitAsync_('key', node.key, visitor, path);
            if (ck === BREAK)
                return BREAK;
            else if (ck === REMOVE)
                node.key = null;
            const cv = await visitAsync_('value', node.value, visitor, path);
            if (cv === BREAK)
                return BREAK;
            else if (cv === REMOVE)
                node.value = null;
        }
    }
    return ctrl;
}
function initVisitor(visitor) {
    if (typeof visitor === 'object' &&
        (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
            Alias: visitor.Node,
            Map: visitor.Node,
            Scalar: visitor.Node,
            Seq: visitor.Node
        }, visitor.Value && {
            Map: visitor.Value,
            Scalar: visitor.Value,
            Seq: visitor.Value
        }, visitor.Collection && {
            Map: visitor.Collection,
            Seq: visitor.Collection
        }, visitor);
    }
    return visitor;
}
function callVisitor(key, node, visitor, path) {
    if (typeof visitor === 'function')
        return visitor(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isMap)(node))
        return visitor.Map?.(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isSeq)(node))
        return visitor.Seq?.(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(node))
        return visitor.Pair?.(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isScalar)(node))
        return visitor.Scalar?.(key, node, path);
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isAlias)(node))
        return visitor.Alias?.(key, node, path);
    return undefined;
}
function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isCollection)(parent)) {
        parent.items[key] = node;
    }
    else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isPair)(parent)) {
        if (key === 'key')
            parent.key = node;
        else
            parent.value = node;
    }
    else if ((0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isDocument)(parent)) {
        parent.contents = node;
    }
    else {
        const pt = (0,_nodes_identity_js__WEBPACK_IMPORTED_MODULE_0__.isAlias)(parent) ? 'alias' : 'scalar';
        throw new Error(`Cannot replace node with ${pt} parent`);
    }
}




/***/ }),

/***/ "./node_modules/yaml/browser/index.js":
/*!********************************************!*\
  !*** ./node_modules/yaml/browser/index.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alias: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Alias),
/* harmony export */   CST: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.CST),
/* harmony export */   Composer: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Composer),
/* harmony export */   Document: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Document),
/* harmony export */   Lexer: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Lexer),
/* harmony export */   LineCounter: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.LineCounter),
/* harmony export */   Pair: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Pair),
/* harmony export */   Parser: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Parser),
/* harmony export */   Scalar: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Scalar),
/* harmony export */   Schema: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.Schema),
/* harmony export */   YAMLError: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLError),
/* harmony export */   YAMLMap: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLMap),
/* harmony export */   YAMLParseError: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLParseError),
/* harmony export */   YAMLSeq: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLSeq),
/* harmony export */   YAMLWarning: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.YAMLWarning),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   isAlias: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isAlias),
/* harmony export */   isCollection: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isCollection),
/* harmony export */   isDocument: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isDocument),
/* harmony export */   isMap: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isMap),
/* harmony export */   isNode: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isNode),
/* harmony export */   isPair: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isPair),
/* harmony export */   isScalar: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isScalar),
/* harmony export */   isSeq: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.isSeq),
/* harmony export */   parse: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.parse),
/* harmony export */   parseAllDocuments: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.parseAllDocuments),
/* harmony export */   parseDocument: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.parseDocument),
/* harmony export */   stringify: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.stringify),
/* harmony export */   visit: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.visit),
/* harmony export */   visitAsync: () => (/* reexport safe */ _dist_index_js__WEBPACK_IMPORTED_MODULE_0__.visitAsync)
/* harmony export */ });
/* harmony import */ var _dist_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dist/index.js */ "./node_modules/yaml/browser/dist/index.js");
// `export * as default from ...` fails on Webpack v4
// https://github.com/eemeli/yaml/issues/228

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_dist_index_js__WEBPACK_IMPORTED_MODULE_0__);



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
/*!***************************!*\
  !*** ./src/pdl_viewer.ts ***!
  \***************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.htmlize = exports.replace_div = exports.block_code_cleanup = exports.blocks_code_cleanup = exports.show_value = exports.show_result_or_code = exports.update_code = exports.show_code = exports.add_def = exports.show_loop_trace = exports.show_defs = exports.show_block = exports.show_blocks = exports.show_output = void 0;
const yaml_1 = __webpack_require__(/*! yaml */ "./node_modules/yaml/browser/index.js");
const ts_pattern_1 = __webpack_require__(/*! ts-pattern */ "./node_modules/ts-pattern/dist/index.cjs");
const pdl_ast_utils_1 = __webpack_require__(/*! ./pdl_ast_utils */ "./src/pdl_ast_utils.ts");
function show_output(data) {
    const div = document.createElement('div');
    div.classList.add('pdl_block');
    (0, ts_pattern_1.match)(data)
        .with(ts_pattern_1.P.union(ts_pattern_1.P.string, ts_pattern_1.P.number), output => {
        div.innerHTML = htmlize(output);
    })
        .with({ contribute: ts_pattern_1.P.union([], ['context']) }, () => {
        div.classList.add('pdl_show_result_false');
        div.innerHTML = '☐';
    })
        .with({ result: ts_pattern_1.P.string }, data => {
        div.innerHTML = htmlize(data.result);
    })
        .otherwise(() => {
        div.innerHTML = '☐';
    });
    switch_div_on_click(div, show_blocks, data);
    return div;
}
exports.show_output = show_output;
function show_blocks(blocks) {
    const doc_fragment = document.createDocumentFragment();
    (0, ts_pattern_1.match)(blocks)
        .with(ts_pattern_1.P.array(ts_pattern_1.P._), data => {
        for (const doc of data) {
            const child = show_blocks(doc);
            doc_fragment.appendChild(child);
        }
    })
        .otherwise(block => {
        const child = show_block(block);
        doc_fragment.appendChild(child);
    });
    return doc_fragment;
}
exports.show_blocks = show_blocks;
function show_block(data) {
    if (typeof data === 'number' || typeof data === 'string') {
        return show_output(data);
    }
    const div = document.createElement('div');
    switch_div_on_click(div, show_output, data);
    div.addEventListener('mouseover', e => {
        update_code(data);
        if (e.stopPropagation)
            e.stopPropagation();
    });
    if (data.defs) {
        div.appendChild(show_defs(data.defs));
    }
    const body = document.createElement('fieldset');
    div.appendChild(body);
    add_def(body, data.def);
    body.classList.add('pdl_block');
    if ((data === null || data === void 0 ? void 0 : data.contribute) !== undefined && !data.contribute.includes('result')) {
        body.classList.add('pdl_show_result_false');
    }
    (0, ts_pattern_1.match)(data)
        .with({ kind: 'model' }, data => {
        body.classList.add('pdl_model');
        body.appendChild(show_result_or_code(data));
    })
        .with({ kind: 'code' }, data => {
        body.classList.add('pdl_code');
        body.appendChild(show_result_or_code(data));
    })
        .with({ kind: 'api' }, data => {
        body.classList.add('pdl_api');
        body.appendChild(show_result_or_code(data));
    })
        .with({ kind: 'get' }, data => {
        body.classList.add('pdl_get');
        body.appendChild(show_result_or_code(data));
    })
        .with({ kind: 'data' }, data => {
        body.classList.add('pdl_data');
        body.appendChild(show_result_or_code(data));
    })
        .with({ kind: 'if' }, data => {
        var _a, _b;
        body.classList.add('pdl_if');
        if (data.if_result === undefined) {
            body.appendChild(show_result_or_code(data));
        }
        else {
            let if_child;
            if (data.if_result) {
                if_child = show_blocks((_a = data === null || data === void 0 ? void 0 : data.then) !== null && _a !== void 0 ? _a : '');
            }
            else {
                if_child = show_blocks((_b = data === null || data === void 0 ? void 0 : data.else) !== null && _b !== void 0 ? _b : '');
            }
            body.appendChild(if_child);
        }
    })
        .with({ kind: 'read' }, data => {
        // TODO
        body.classList.add('pdl_read');
        body.appendChild(show_result_or_code(data));
    })
        .with({ kind: 'include' }, data => {
        // TODO
        body.classList.add('pdl_include');
        body.appendChild(show_result_or_code(data));
    })
        .with({ kind: 'function' }, data => {
        // TODO
        body.classList.add('pdl_function');
        body.classList.add('pdl_show_result_false');
        const args = document.createElement('pre');
        args.innerHTML = htmlize((0, yaml_1.stringify)({ function: data.function }));
        body.appendChild(args);
        body.appendChild(show_blocks(data.return));
    })
        .with({ kind: 'call' }, data => {
        body.classList.add('pdl_call');
        if (data.trace) {
            const args = document.createElement('pre');
            args.innerHTML = htmlize((0, yaml_1.stringify)({ call: data.call, args: data.args }));
            body.appendChild(args);
            body.appendChild(show_blocks(data.trace));
        }
        else {
            body.appendChild(show_result_or_code(data));
        }
    })
        .with({ kind: 'document' }, data => {
        body.classList.add('pdl_document');
        const doc_child = show_blocks(data.document);
        body.appendChild(doc_child);
    })
        .with({ kind: 'sequence' }, data => {
        body.classList.add('pdl_sequence');
        const doc_child = show_blocks(data.sequence);
        body.appendChild(doc_child);
    })
        .with({ kind: 'array' }, data => {
        body.classList.add('pdl_array');
        const doc_child = show_blocks(data.array);
        body.appendChild(doc_child);
    })
        .with({ kind: 'message' }, data => {
        body.classList.add('pdl_message');
        const role = document.createElement('pre');
        role.innerHTML = htmlize(data.role + ': ');
        body.appendChild(role);
        const doc_child = show_blocks(data.content);
        body.appendChild(doc_child);
    })
        .with({ kind: 'repeat' }, data => {
        var _a;
        body.classList.add('pdl_repeat');
        const loop_body = show_loop_trace((_a = data === null || data === void 0 ? void 0 : data.trace) !== null && _a !== void 0 ? _a : [data.repeat]);
        body.appendChild(loop_body);
    })
        .with({ kind: 'repeat_until' }, data => {
        var _a;
        body.classList.add('pdl_repeat_until');
        const loop_body = show_loop_trace((_a = data === null || data === void 0 ? void 0 : data.trace) !== null && _a !== void 0 ? _a : [data.repeat]);
        body.appendChild(loop_body);
    })
        .with({ kind: 'for' }, data => {
        var _a;
        body.classList.add('pdl_for');
        const loop_body = show_loop_trace((_a = data === null || data === void 0 ? void 0 : data.trace) !== null && _a !== void 0 ? _a : [data.repeat]);
        body.appendChild(loop_body);
    })
        .with({ kind: 'empty' }, () => {
        body.classList.add('pdl_empty');
        body.innerHTML = htmlize('');
    })
        .with({ kind: 'error' }, data => {
        body.classList.add('pdl_error');
        body.appendChild(show_result_or_code(data));
    })
        .with({ kind: undefined }, () => {
        throw Error('Missing kind:\n' + htmlize(data));
    })
        .exhaustive();
    return div;
}
exports.show_block = show_block;
function show_defs(defs) {
    const doc_fragment = document.createDocumentFragment();
    for (const x in defs) {
        const div = document.createElement('fieldset');
        doc_fragment.appendChild(div);
        div.classList.add('pdl_show_result_false');
        add_def(div, x);
        div.appendChild(show_blocks(defs[x]));
    }
    return doc_fragment;
}
exports.show_defs = show_defs;
function show_loop_trace(trace) {
    const doc_fragment = document.createDocumentFragment();
    if (trace.length > 1) {
        const dot_dot_dot = document.createElement('div');
        dot_dot_dot.innerHTML = '···';
        dot_dot_dot.addEventListener('click', e => {
            dot_dot_dot.replaceWith(show_loop_trace(trace.slice(0, -1)));
            if (e.stopPropagation)
                e.stopPropagation();
        });
        doc_fragment.appendChild(dot_dot_dot);
    }
    if (trace.length > 0) {
        const iteration = document.createElement('div');
        iteration.classList.add('pdl_block', 'pdl_sequence');
        const child = show_blocks(trace.slice(-1)[0]);
        iteration.appendChild(child);
        doc_fragment.appendChild(iteration);
    }
    return doc_fragment;
}
exports.show_loop_trace = show_loop_trace;
function add_def(block_div, name) {
    if (name) {
        const legend = document.createElement('legend');
        legend.innerHTML = name;
        block_div.appendChild(legend);
    }
}
exports.add_def = add_def;
function show_code(blocks) {
    const code = document.createElement('pre');
    blocks = blocks_code_cleanup(blocks);
    code.innerHTML = htmlize((0, yaml_1.stringify)(blocks));
    return code;
}
exports.show_code = show_code;
function update_code(blocks) {
    const code = show_code(blocks);
    replace_div('code', code);
}
exports.update_code = update_code;
function show_result_or_code(block) {
    const div = (0, ts_pattern_1.match)(block)
        .with(ts_pattern_1.P.union(ts_pattern_1.P.string, ts_pattern_1.P.number), data => show_value(data))
        .with({ result: ts_pattern_1.P._ }, data => show_value(data.result))
        .otherwise(data => show_code(data));
    return div;
}
exports.show_result_or_code = show_result_or_code;
function show_value(s) {
    const div = document.createElement('div');
    div.innerHTML = htmlize(s);
    return div;
}
exports.show_value = show_value;
function blocks_code_cleanup(data) {
    const new_data = (0, ts_pattern_1.match)(data)
        .with(ts_pattern_1.P.array(ts_pattern_1.P._), data => data.map(block_code_cleanup))
        .otherwise(data => block_code_cleanup(data));
    return new_data;
}
exports.blocks_code_cleanup = blocks_code_cleanup;
function block_code_cleanup(data) {
    var _a, _b, _c;
    if (typeof data === 'number' || typeof data === 'string') {
        return data;
    }
    // remove result
    const new_data = { ...data, result: undefined };
    // remove trace
    (0, ts_pattern_1.match)(new_data).with({ trace: ts_pattern_1.P._ }, data => {
        data.trace = undefined;
    });
    // remove contribute: ["result", context]
    if (((_a = new_data === null || new_data === void 0 ? void 0 : new_data.contribute) === null || _a === void 0 ? void 0 : _a.includes('result')) &&
        ((_b = new_data === null || new_data === void 0 ? void 0 : new_data.contribute) === null || _b === void 0 ? void 0 : _b.includes('context'))) {
        new_data.contribute = undefined;
    }
    // remove empty defs list
    if (Object.keys((_c = data === null || data === void 0 ? void 0 : data.defs) !== null && _c !== void 0 ? _c : {}).length === 0) {
        new_data.defs = undefined;
    }
    // remove location info
    new_data.location = undefined;
    // recursive cleanup
    return (0, pdl_ast_utils_1.map_block_children)(block_code_cleanup, new_data);
}
exports.block_code_cleanup = block_code_cleanup;
function replace_div(id, elem) {
    var _a;
    const div = document.createElement('div');
    div.id = id;
    div.appendChild(elem);
    (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.replaceWith(div);
}
exports.replace_div = replace_div;
function htmlize(x) {
    const html = (0, ts_pattern_1.match)(x)
        .with(ts_pattern_1.P.nullish, () => '☐')
        .with(ts_pattern_1.P.string, s => {
        if (s === '') {
            return '☐';
        }
        s = s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        s = s.split('\n').join('<br>');
        return s;
    })
        .otherwise(x => htmlize(JSON.stringify(x)));
    return html;
}
exports.htmlize = htmlize;
function switch_div_on_click(div, show, data) {
    div.addEventListener('click', e => {
        div.replaceWith(show(data));
        if (e.stopPropagation)
            e.stopPropagation();
    });
}

})();

pdl_viewer = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJLEVBQUUsVUFBVSxFQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDaEMsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0MsT0FBTyxFQUFDLEdBQUcsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDaEMsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0MsT0FBTyxFQUFDLEdBQUcsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDN0IsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsT0FBTyxFQUFDLEdBQUcsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDL0IsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsT0FBTyxFQUFDLEdBQUcsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDMUIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNqRSxPQUFPLEVBQUMsR0FBRyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDOUMsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQzlCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLE9BQU8sRUFBQyxHQUFHLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQ3BDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLE9BQU8sRUFBQyxHQUFHLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQzNCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLE9BQU8sRUFBQyxHQUFHLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQzdCLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEVBQUUs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QUFDLENBQUM7U0FDRCxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDL0IsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEMsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQzFCLElBQUksS0FBSyxDQUFDLElBQUk7WUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLEtBQUssQ0FBQyxJQUFJO1lBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQzlCLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUMsRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNwQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDM0IsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0QsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxFQUFF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QUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyRkFBMkY7QUFDM0YseUNBQXlDO0FBQ3pDLDBDQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxLQUFLO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHdDQUFHO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRDtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLDZDQUFRO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRCxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQiw2Q0FBUTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0EscUNBQXFDLHVCQUF1QjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBLGNBQWMsMkNBQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsMkNBQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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TSxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO2FBQ3ZCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQyxDQUFDO1NBQ0QsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQWxCRCwwQkFrQkM7QUFFRCxTQUFTLG1CQUFtQixDQUMxQixHQUFZLEVBQ1osSUFBd0MsRUFDeEMsSUFBZTtJQUVmLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDaEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsQ0FBQyxlQUFlO1lBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzdDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3BkbF92aWV3ZXIvLi9zcmMvcGRsX2FzdF91dGlscy50cyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3RzLXBhdHRlcm4vZGlzdC9pbmRleC5janMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL2NvbXBvc2UtY29sbGVjdGlvbi5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvY29tcG9zZS1kb2MuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL2NvbXBvc2Utbm9kZS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvY29tcG9zZS1zY2FsYXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL2NvbXBvc2VyLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWJsb2NrLW1hcC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2VxLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWVuZC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtcHJvcHMuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvdXRpbC1lbXB0eS1zY2FsYXItcG9zaXRpb24uanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtbWFwLWluY2x1ZGVzLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL0RvY3VtZW50LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2FuY2hvcnMuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9kb2MvYXBwbHlSZXZpdmVyLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2NyZWF0ZU5vZGUuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9kb2MvZGlyZWN0aXZlcy5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvbG9nLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvQWxpYXMuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9Db2xsZWN0aW9uLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvTm9kZS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL1BhaXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9TY2FsYXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9ZQU1MTWFwLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvWUFNTFNlcS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL2FkZFBhaXJUb0pTTWFwLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvaWRlbnRpdHkuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy90b0pTLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvY3N0LXNjYWxhci5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3BhcnNlL2NzdC1zdHJpbmdpZnkuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9jc3QtdmlzaXQuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9jc3QuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9sZXhlci5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3BhcnNlL2xpbmUtY291bnRlci5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3BhcnNlL3BhcnNlci5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3B1YmxpYy1hcGkuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvU2NoZW1hLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvbW1vbi9tYXAuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL251bGwuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL3NlcS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb21tb24vc3RyaW5nLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvcmUvYm9vbC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL2Zsb2F0LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvcmUvaW50LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvcmUvc2NoZW1hLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2pzb24vc2NoZW1hLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3RhZ3MuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvYmluYXJ5LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2Jvb2wuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvZmxvYXQuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvaW50LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL29tYXAuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvcGFpcnMuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvc2NoZW1hLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3NldC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS90aW1lc3RhbXAuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvZm9sZEZsb3dMaW5lcy5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnkuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlDb21tZW50LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeURvY3VtZW50LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlQYWlyLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3Zpc2l0LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2luZGV4LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3BkbF92aWV3ZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vc3JjL3BkbF92aWV3ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQZGxCbG9ja3MsIFBkbEJsb2NrfSBmcm9tICcuL3BkbF9hc3QnO1xuaW1wb3J0IHttYXRjaCwgUH0gZnJvbSAndHMtcGF0dGVybic7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBfYmxvY2tfY2hpbGRyZW4oXG4gIGY6IChibG9jazogUGRsQmxvY2spID0+IFBkbEJsb2NrLFxuICBibG9jazogUGRsQmxvY2tcbik6IFBkbEJsb2NrIHtcbiAgaWYgKHR5cGVvZiBibG9jayA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGJsb2NrID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBibG9jaztcbiAgfVxuICBsZXQgbmV3X2Jsb2NrOiBQZGxCbG9jaztcbiAgaWYgKGJsb2NrPy5kZWZzID09PSB1bmRlZmluZWQpIHtcbiAgICBuZXdfYmxvY2sgPSB7Li4uYmxvY2t9O1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRlZnM6IHtbazogc3RyaW5nXTogUGRsQmxvY2tzfSA9IHt9O1xuICAgIGZvciAoY29uc3QgeCBpbiBibG9jay5kZWZzKSB7XG4gICAgICBkZWZzW3hdID0gbWFwX2Jsb2NrcyhmLCBibG9jay5kZWZzW3hdKTtcbiAgICB9XG4gICAgbmV3X2Jsb2NrID0gey4uLmJsb2NrLCBkZWZzOiBkZWZzfTtcbiAgfVxuICBuZXdfYmxvY2sgPSBtYXRjaChuZXdfYmxvY2spXG4gICAgLy8gLndpdGgoUC5zdHJpbmcsIHMgPT4gcylcbiAgICAud2l0aCh7a2luZDogJ2VtcHR5J30sIGJsb2NrID0+IGJsb2NrKVxuICAgIC53aXRoKHtraW5kOiAnZnVuY3Rpb24nfSwgYmxvY2sgPT4ge1xuICAgICAgY29uc3QgcmV0dXJucyA9IG1hcF9ibG9ja3MoZiwgYmxvY2sucmV0dXJuKTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIHJldHVybjogcmV0dXJuc307XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2NhbGwnfSwgYmxvY2sgPT4gYmxvY2spXG4gICAgLndpdGgoe2tpbmQ6ICdtb2RlbCd9LCBibG9jayA9PiB7XG4gICAgICBpZiAoYmxvY2suaW5wdXQpIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBtYXBfYmxvY2tzKGYsIGJsb2NrLmlucHV0KTtcbiAgICAgICAgYmxvY2sgPSB7Li4uYmxvY2ssIGlucHV0OiBpbnB1dH07XG4gICAgICB9XG4gICAgICByZXR1cm4gYmxvY2s7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2NvZGUnfSwgYmxvY2sgPT4ge1xuICAgICAgY29uc3QgY29kZSA9IG1hcF9ibG9ja3MoZiwgYmxvY2suY29kZSk7XG4gICAgICByZXR1cm4gey4uLmJsb2NrLCBjb2RlOiBjb2RlfTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnYXBpJ30sIGJsb2NrID0+IHtcbiAgICAgIGNvbnN0IGlucHV0ID0gbWFwX2Jsb2NrcyhmLCBibG9jay5pbnB1dCk7XG4gICAgICByZXR1cm4gey4uLmJsb2NrLCBpbnB1dDogaW5wdXR9O1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdnZXQnfSwgYmxvY2sgPT4gYmxvY2spXG4gICAgLndpdGgoe2tpbmQ6ICdkYXRhJ30sIGJsb2NrID0+IGJsb2NrKVxuICAgIC53aXRoKHtraW5kOiAnZG9jdW1lbnQnfSwgYmxvY2sgPT4ge1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBtYXBfYmxvY2tzKGYsIGJsb2NrLmRvY3VtZW50KTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIGRvY3VtZW50OiBkb2N1bWVudH07XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3NlcXVlbmNlJ30sIGJsb2NrID0+IHtcbiAgICAgIGNvbnN0IHNlcXVlbmNlID0gbWFwX2Jsb2NrcyhmLCBibG9jay5zZXF1ZW5jZSk7XG4gICAgICByZXR1cm4gey4uLmJsb2NrLCBzZXF1ZW5jZTogc2VxdWVuY2V9O1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdhcnJheSd9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCBhcnJheSA9IG1hcF9ibG9ja3MoZiwgYmxvY2suYXJyYXkpO1xuICAgICAgcmV0dXJuIHsuLi5ibG9jaywgYXJyYXk6IGFycmF5fTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnbWVzc2FnZSd9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCBjb250ZW50ID0gbWFwX2Jsb2NrcyhmLCBibG9jay5jb250ZW50KTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIGNvbnRlbnQ6IGNvbnRlbnR9O1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdpZid9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCB0aGVuXyA9IG1hcF9ibG9ja3MoZiwgYmxvY2sudGhlbik7XG4gICAgICBjb25zdCBlbHNlXyA9IGJsb2NrLmVsc2UgPyBtYXBfYmxvY2tzKGYsIGJsb2NrLmVsc2UpIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHsuLi5ibG9jaywgdGhlbjogdGhlbl8sIGVsc2U6IGVsc2VffTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAncmVwZWF0J30sIGJsb2NrID0+IHtcbiAgICAgIGNvbnN0IHJlcGVhdCA9IG1hcF9ibG9ja3MoZiwgYmxvY2sucmVwZWF0KTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIHJlcGVhdDogcmVwZWF0fTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAncmVwZWF0X3VudGlsJ30sIGJsb2NrID0+IHtcbiAgICAgIGNvbnN0IHJlcGVhdCA9IG1hcF9ibG9ja3MoZiwgYmxvY2sucmVwZWF0KTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIHJlcGVhdDogcmVwZWF0fTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZm9yJ30sIGJsb2NrID0+IHtcbiAgICAgIGNvbnN0IHJlcGVhdCA9IG1hcF9ibG9ja3MoZiwgYmxvY2sucmVwZWF0KTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIHJlcGVhdDogcmVwZWF0fTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZXJyb3InfSwgYmxvY2sgPT4ge1xuICAgICAgY29uc3QgZG9jID0gbWFwX2Jsb2NrcyhmLCBibG9jay5wcm9ncmFtKTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIHByb2dyYW06IGRvY307XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3JlYWQnfSwgYmxvY2sgPT4gYmxvY2spXG4gICAgLndpdGgoe2tpbmQ6ICdpbmNsdWRlJ30sIGJsb2NrID0+IGJsb2NrKVxuICAgIC53aXRoKHtraW5kOiB1bmRlZmluZWR9LCBibG9jayA9PiBibG9jaylcbiAgICAuZXhoYXVzdGl2ZSgpO1xuICBtYXRjaChuZXdfYmxvY2spXG4gICAgLndpdGgoe3BhcnNlcjoge3BkbDogUC5ffX0sIGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnBhcnNlci5wZGwgPSBtYXBfYmxvY2tzKGYsIGJsb2NrLnBhcnNlci5wZGwpO1xuICAgIH0pXG4gICAgLm90aGVyd2lzZSgoKSA9PiB7fSk7XG4gIGlmIChibG9jay5mYWxsYmFjaykge1xuICAgIGJsb2NrLmZhbGxiYWNrID0gbWFwX2Jsb2NrcyhmLCBibG9jay5mYWxsYmFjayk7XG4gIH1cbiAgcmV0dXJuIG5ld19ibG9jaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcF9ibG9ja3MoXG4gIGY6IChibG9jazogUGRsQmxvY2spID0+IFBkbEJsb2NrLFxuICBibG9ja3M6IFBkbEJsb2Nrc1xuKTogUGRsQmxvY2tzIHtcbiAgYmxvY2tzID0gbWF0Y2goYmxvY2tzKVxuICAgIC53aXRoKFAuc3RyaW5nLCBzID0+IHMpXG4gICAgLndpdGgoUC5hcnJheShQLl8pLCBzZXF1ZW5jZSA9PiBzZXF1ZW5jZS5tYXAoZikpXG4gICAgLm90aGVyd2lzZShibG9jayA9PiBmKGJsb2NrKSk7XG4gIHJldHVybiBibG9ja3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpdGVyX2Jsb2NrX2NoaWxkcmVuKFxuICBmOiAoYmxvY2s6IFBkbEJsb2NrKSA9PiB2b2lkLFxuICBibG9jazogUGRsQmxvY2tcbik6IHZvaWQge1xuICBpZiAodHlwZW9mIGJsb2NrID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgYmxvY2sgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChibG9jaz8uZGVmcykge1xuICAgIGZvciAoY29uc3QgeCBpbiBibG9jay5kZWZzKSB7XG4gICAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5kZWZzW3hdKTtcbiAgICB9XG4gIH1cbiAgbWF0Y2goYmxvY2spXG4gICAgLndpdGgoUC5zdHJpbmcsICgpID0+IHt9KVxuICAgIC53aXRoKHtraW5kOiAnZW1wdHknfSwgKCkgPT4ge30pXG4gICAgLndpdGgoe2tpbmQ6ICdmdW5jdGlvbid9LCBibG9jayA9PiB7XG4gICAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5yZXR1cm4pO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdjYWxsJ30sICgpID0+IHt9KVxuICAgIC53aXRoKHtraW5kOiAnbW9kZWwnfSwgYmxvY2sgPT4ge1xuICAgICAgaWYgKGJsb2NrLmlucHV0KSBpdGVyX2Jsb2NrcyhmLCBibG9jay5pbnB1dCk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2NvZGUnfSwgYmxvY2sgPT4ge1xuICAgICAgaXRlcl9ibG9ja3MoZiwgYmxvY2suY29kZSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2FwaSd9LCBibG9jayA9PiB7XG4gICAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5pbnB1dCk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2dldCd9LCAoKSA9PiB7fSlcbiAgICAud2l0aCh7a2luZDogJ2RhdGEnfSwgKCkgPT4ge30pXG4gICAgLndpdGgoe2tpbmQ6ICdkb2N1bWVudCd9LCBibG9jayA9PiB7XG4gICAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5kb2N1bWVudCk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3NlcXVlbmNlJ30sIGJsb2NrID0+IHtcbiAgICAgIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLnNlcXVlbmNlKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnYXJyYXknfSwgYmxvY2sgPT4ge1xuICAgICAgaXRlcl9ibG9ja3MoZiwgYmxvY2suYXJyYXkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdtZXNzYWdlJ30sIGJsb2NrID0+IHtcbiAgICAgIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLmNvbnRlbnQpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdpZid9LCBibG9jayA9PiB7XG4gICAgICBpZiAoYmxvY2sudGhlbikgaXRlcl9ibG9ja3MoZiwgYmxvY2sudGhlbik7XG4gICAgICBpZiAoYmxvY2suZWxzZSkgaXRlcl9ibG9ja3MoZiwgYmxvY2suZWxzZSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3JlcGVhdCd9LCBibG9jayA9PiB7XG4gICAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5yZXBlYXQpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdyZXBlYXRfdW50aWwnfSwgYmxvY2sgPT4ge1xuICAgICAgaXRlcl9ibG9ja3MoZiwgYmxvY2sucmVwZWF0KTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZm9yJ30sIGJsb2NrID0+IHtcbiAgICAgIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLnJlcGVhdCk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2Vycm9yJ30sIGJsb2NrID0+IGl0ZXJfYmxvY2tzKGYsIGJsb2NrLnByb2dyYW0pKVxuICAgIC53aXRoKHtraW5kOiAncmVhZCd9LCAoKSA9PiB7fSlcbiAgICAud2l0aCh7a2luZDogJ2luY2x1ZGUnfSwgKCkgPT4ge30pXG4gICAgLndpdGgoe2tpbmQ6IHVuZGVmaW5lZH0sICgpID0+IHt9KVxuICAgIC5leGhhdXN0aXZlKCk7XG4gIG1hdGNoKGJsb2NrKVxuICAgIC53aXRoKHtwYXJzZXI6IHtwZGw6IFAuX319LCBibG9jayA9PiB7XG4gICAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5wYXJzZXIucGRsKTtcbiAgICB9KVxuICAgIC5vdGhlcndpc2UoKCkgPT4ge30pO1xuICBpZiAoYmxvY2suZmFsbGJhY2spIHtcbiAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5mYWxsYmFjayk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJfYmxvY2tzKFxuICBmOiAoYmxvY2s6IFBkbEJsb2NrKSA9PiB2b2lkLFxuICBibG9ja3M6IFBkbEJsb2Nrc1xuKTogdm9pZCB7XG4gIG1hdGNoKGJsb2NrcylcbiAgICAud2l0aChQLnN0cmluZywgKCkgPT4ge30pXG4gICAgLndpdGgoUC5hcnJheShQLl8pLCBzZXF1ZW5jZSA9PiB7XG4gICAgICBzZXF1ZW5jZS5mb3JFYWNoKGRvYyA9PiBpdGVyX2Jsb2NrcyhmLCBkb2MpKTtcbiAgICB9KVxuICAgIC5vdGhlcndpc2UoYmxvY2sgPT4gZihibG9jaykpO1xufVxuIiwiZnVuY3Rpb24gbih0KXtyZXR1cm4gbj1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKG4pe3JldHVybiBuLl9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKG4pfSxuKHQpfWZ1bmN0aW9uIHQobixyKXtyZXR1cm4gdD1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKG4sdCl7cmV0dXJuIG4uX19wcm90b19fPXQsbn0sdChuLHIpfWZ1bmN0aW9uIHIobixlLHUpe3JldHVybiByPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sZnVuY3Rpb24oKXt9KSksITB9Y2F0Y2gobil7cmV0dXJuITF9fSgpP1JlZmxlY3QuY29uc3RydWN0OmZ1bmN0aW9uKG4scixlKXt2YXIgdT1bbnVsbF07dS5wdXNoLmFwcGx5KHUscik7dmFyIGk9bmV3KEZ1bmN0aW9uLmJpbmQuYXBwbHkobix1KSk7cmV0dXJuIGUmJnQoaSxlLnByb3RvdHlwZSksaX0sci5hcHBseShudWxsLGFyZ3VtZW50cyl9ZnVuY3Rpb24gZSh1KXt2YXIgaT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBNYXA/bmV3IE1hcDp2b2lkIDA7cmV0dXJuIGU9ZnVuY3Rpb24oZSl7aWYobnVsbD09PWV8fC0xPT09RnVuY3Rpb24udG9TdHJpbmcuY2FsbChlKS5pbmRleE9mKFwiW25hdGl2ZSBjb2RlXVwiKSlyZXR1cm4gZTtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtpZih2b2lkIDAhPT1pKXtpZihpLmhhcyhlKSlyZXR1cm4gaS5nZXQoZSk7aS5zZXQoZSx1KX1mdW5jdGlvbiB1KCl7cmV0dXJuIHIoZSxhcmd1bWVudHMsbih0aGlzKS5jb25zdHJ1Y3Rvcil9cmV0dXJuIHUucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp1LGVudW1lcmFibGU6ITEsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLHQodSxlKX0sZSh1KX1mdW5jdGlvbiB1KG4sdCl7KG51bGw9PXR8fHQ+bi5sZW5ndGgpJiYodD1uLmxlbmd0aCk7Zm9yKHZhciByPTAsZT1uZXcgQXJyYXkodCk7cjx0O3IrKyllW3JdPW5bcl07cmV0dXJuIGV9ZnVuY3Rpb24gaShuLHQpe3ZhciByPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJm5bU3ltYm9sLml0ZXJhdG9yXXx8bltcIkBAaXRlcmF0b3JcIl07aWYocilyZXR1cm4ocj1yLmNhbGwobikpLm5leHQuYmluZChyKTtpZihBcnJheS5pc0FycmF5KG4pfHwocj1mdW5jdGlvbihuLHQpe2lmKG4pe2lmKFwic3RyaW5nXCI9PXR5cGVvZiBuKXJldHVybiB1KG4sdCk7dmFyIHI9T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4pLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1yJiZuLmNvbnN0cnVjdG9yJiYocj1uLmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1yfHxcIlNldFwiPT09cj9BcnJheS5mcm9tKG4pOlwiQXJndW1lbnRzXCI9PT1yfHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChyKT91KG4sdCk6dm9pZCAwfX0obikpfHx0JiZuJiZcIm51bWJlclwiPT10eXBlb2Ygbi5sZW5ndGgpe3ImJihuPXIpO3ZhciBlPTA7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGU+PW4ubGVuZ3RoP3tkb25lOiEwfTp7ZG9uZTohMSx2YWx1ZTpuW2UrK119fX10aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGl0ZXJhdGUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9dmFyIG89U3ltYm9sLmZvcihcIkB0cy1wYXR0ZXJuL21hdGNoZXJcIiksYz1TeW1ib2wuZm9yKFwiQHRzLXBhdHRlcm4vaXNWYXJpYWRpY1wiKSxmPVwiQHRzLXBhdHRlcm4vYW5vbnltb3VzLXNlbGVjdC1rZXlcIixhPWZ1bmN0aW9uKG4pe3JldHVybiBCb29sZWFuKG4mJlwib2JqZWN0XCI9PXR5cGVvZiBuKX0sbD1mdW5jdGlvbihuKXtyZXR1cm4gbiYmISFuW29dfSxzPWZ1bmN0aW9uIG4odCxyLGUpe2lmKGwodCkpe3ZhciB1PXRbb10oKS5tYXRjaChyKSxmPXUubWF0Y2hlZCxzPXUuc2VsZWN0aW9ucztyZXR1cm4gZiYmcyYmT2JqZWN0LmtleXMocykuZm9yRWFjaChmdW5jdGlvbihuKXtyZXR1cm4gZShuLHNbbl0pfSksZn1pZihhKHQpKXtpZighYShyKSlyZXR1cm4hMTtpZihBcnJheS5pc0FycmF5KHQpKXtpZighQXJyYXkuaXNBcnJheShyKSlyZXR1cm4hMTtmb3IodmFyIGgsdj1bXSxwPVtdLGc9W10seT1pKHQua2V5cygpKTshKGg9eSgpKS5kb25lOyl7dmFyIG09dFtoLnZhbHVlXTtsKG0pJiZtW2NdP2cucHVzaChtKTpnLmxlbmd0aD9wLnB1c2gobSk6di5wdXNoKG0pfWlmKGcubGVuZ3RoKXtpZihnLmxlbmd0aD4xKXRocm93IG5ldyBFcnJvcihcIlBhdHRlcm4gZXJyb3I6IFVzaW5nIGAuLi5QLmFycmF5KC4uLilgIHNldmVyYWwgdGltZXMgaW4gYSBzaW5nbGUgcGF0dGVybiBpcyBub3QgYWxsb3dlZC5cIik7aWYoci5sZW5ndGg8di5sZW5ndGgrcC5sZW5ndGgpcmV0dXJuITE7dmFyIGQ9ci5zbGljZSgwLHYubGVuZ3RoKSxiPTA9PT1wLmxlbmd0aD9bXTpyLnNsaWNlKC1wLmxlbmd0aCksdz1yLnNsaWNlKHYubGVuZ3RoLDA9PT1wLmxlbmd0aD9JbmZpbml0eTotcC5sZW5ndGgpO3JldHVybiB2LmV2ZXJ5KGZ1bmN0aW9uKHQscil7cmV0dXJuIG4odCxkW3JdLGUpfSkmJnAuZXZlcnkoZnVuY3Rpb24odCxyKXtyZXR1cm4gbih0LGJbcl0sZSl9KSYmKDA9PT1nLmxlbmd0aHx8bihnWzBdLHcsZSkpfXJldHVybiB0Lmxlbmd0aD09PXIubGVuZ3RoJiZ0LmV2ZXJ5KGZ1bmN0aW9uKHQsdSl7cmV0dXJuIG4odCxyW3VdLGUpfSl9cmV0dXJuIFJlZmxlY3Qub3duS2V5cyh0KS5ldmVyeShmdW5jdGlvbih1KXt2YXIgaSxjPXRbdV07cmV0dXJuKHUgaW4gcnx8bChpPWMpJiZcIm9wdGlvbmFsXCI9PT1pW29dKCkubWF0Y2hlclR5cGUpJiZuKGMsclt1XSxlKX0pfXJldHVybiBPYmplY3QuaXMocix0KX0saD1mdW5jdGlvbiBuKHQpe3ZhciByLGUsdTtyZXR1cm4gYSh0KT9sKHQpP251bGwhPShyPW51bGw9PShlPSh1PXRbb10oKSkuZ2V0U2VsZWN0aW9uS2V5cyk/dm9pZCAwOmUuY2FsbCh1KSk/cjpbXTpBcnJheS5pc0FycmF5KHQpP3YodCxuKTp2KE9iamVjdC52YWx1ZXModCksbik6W119LHY9ZnVuY3Rpb24obix0KXtyZXR1cm4gbi5yZWR1Y2UoZnVuY3Rpb24obixyKXtyZXR1cm4gbi5jb25jYXQodChyKSl9LFtdKX07ZnVuY3Rpb24gcCgpe3ZhciBuPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtpZigxPT09bi5sZW5ndGgpe3ZhciB0PW5bMF07cmV0dXJuIGZ1bmN0aW9uKG4pe3JldHVybiBzKHQsbixmdW5jdGlvbigpe30pfX1pZigyPT09bi5sZW5ndGgpcmV0dXJuIHMoblswXSxuWzFdLGZ1bmN0aW9uKCl7fSk7dGhyb3cgbmV3IEVycm9yKFwiaXNNYXRjaGluZyB3YXNuJ3QgZ2l2ZW4gdGhlIHJpZ2h0IG51bWJlciBvZiBhcmd1bWVudHM6IGV4cGVjdGVkIDEgb3IgMiwgcmVjZWl2ZWQgXCIrbi5sZW5ndGgrXCIuXCIpfWZ1bmN0aW9uIGcobil7cmV0dXJuIE9iamVjdC5hc3NpZ24obix7b3B0aW9uYWw6ZnVuY3Rpb24oKXtyZXR1cm4gbShuKX0sYW5kOmZ1bmN0aW9uKHQpe3JldHVybiB3KG4sdCl9LG9yOmZ1bmN0aW9uKHQpe3JldHVybiBPKG4sdCl9LHNlbGVjdDpmdW5jdGlvbih0KXtyZXR1cm4gdm9pZCAwPT09dD9qKG4pOmoodCxuKX19KX1mdW5jdGlvbiB5KG4pe3JldHVybiBPYmplY3QuYXNzaWduKGZ1bmN0aW9uKG4pe3ZhciB0O3JldHVybiBPYmplY3QuYXNzaWduKG4sKCh0PXt9KVtTeW1ib2wuaXRlcmF0b3JdPWZ1bmN0aW9uKCl7dmFyIHQscj0wLGU9W3t2YWx1ZTpPYmplY3QuYXNzaWduKG4sKCh0PXt9KVtjXT0hMCx0KSksZG9uZTohMX0se2RvbmU6ITAsdmFsdWU6dm9pZCAwfV07cmV0dXJue25leHQ6ZnVuY3Rpb24oKXt2YXIgbjtyZXR1cm4gbnVsbCE9KG49ZVtyKytdKT9uOmUuYXQoLTEpfX19LHQpKX0obikse29wdGlvbmFsOmZ1bmN0aW9uKCl7cmV0dXJuIHkobShuKSl9LHNlbGVjdDpmdW5jdGlvbih0KXtyZXR1cm4geSh2b2lkIDA9PT10P2oobik6aih0LG4pKX19KX1mdW5jdGlvbiBtKG4pe3ZhciB0O3JldHVybiBnKCgodD17fSlbb109ZnVuY3Rpb24oKXtyZXR1cm57bWF0Y2g6ZnVuY3Rpb24odCl7dmFyIHI9e30sZT1mdW5jdGlvbihuLHQpe3Jbbl09dH07cmV0dXJuIHZvaWQgMD09PXQ/KGgobikuZm9yRWFjaChmdW5jdGlvbihuKXtyZXR1cm4gZShuLHZvaWQgMCl9KSx7bWF0Y2hlZDohMCxzZWxlY3Rpb25zOnJ9KTp7bWF0Y2hlZDpzKG4sdCxlKSxzZWxlY3Rpb25zOnJ9fSxnZXRTZWxlY3Rpb25LZXlzOmZ1bmN0aW9uKCl7cmV0dXJuIGgobil9LG1hdGNoZXJUeXBlOlwib3B0aW9uYWxcIn19LHQpKX12YXIgZD1mdW5jdGlvbihuLHQpe2Zvcih2YXIgcixlPWkobik7IShyPWUoKSkuZG9uZTspaWYoIXQoci52YWx1ZSkpcmV0dXJuITE7cmV0dXJuITB9LGI9ZnVuY3Rpb24obix0KXtmb3IodmFyIHIsZT1pKG4uZW50cmllcygpKTshKHI9ZSgpKS5kb25lOyl7dmFyIHU9ci52YWx1ZTtpZighdCh1WzFdLHVbMF0pKXJldHVybiExfXJldHVybiEwfTtmdW5jdGlvbiB3KCl7dmFyIG4sdD1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIGcoKChuPXt9KVtvXT1mdW5jdGlvbigpe3JldHVybnttYXRjaDpmdW5jdGlvbihuKXt2YXIgcj17fSxlPWZ1bmN0aW9uKG4sdCl7cltuXT10fTtyZXR1cm57bWF0Y2hlZDp0LmV2ZXJ5KGZ1bmN0aW9uKHQpe3JldHVybiBzKHQsbixlKX0pLHNlbGVjdGlvbnM6cn19LGdldFNlbGVjdGlvbktleXM6ZnVuY3Rpb24oKXtyZXR1cm4gdih0LGgpfSxtYXRjaGVyVHlwZTpcImFuZFwifX0sbikpfWZ1bmN0aW9uIE8oKXt2YXIgbix0PVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtyZXR1cm4gZygoKG49e30pW29dPWZ1bmN0aW9uKCl7cmV0dXJue21hdGNoOmZ1bmN0aW9uKG4pe3ZhciByPXt9LGU9ZnVuY3Rpb24obix0KXtyW25dPXR9O3JldHVybiB2KHQsaCkuZm9yRWFjaChmdW5jdGlvbihuKXtyZXR1cm4gZShuLHZvaWQgMCl9KSx7bWF0Y2hlZDp0LnNvbWUoZnVuY3Rpb24odCl7cmV0dXJuIHModCxuLGUpfSksc2VsZWN0aW9uczpyfX0sZ2V0U2VsZWN0aW9uS2V5czpmdW5jdGlvbigpe3JldHVybiB2KHQsaCl9LG1hdGNoZXJUeXBlOlwib3JcIn19LG4pKX1mdW5jdGlvbiBTKG4pe3ZhciB0O3JldHVybih0PXt9KVtvXT1mdW5jdGlvbigpe3JldHVybnttYXRjaDpmdW5jdGlvbih0KXtyZXR1cm57bWF0Y2hlZDpCb29sZWFuKG4odCkpfX19fSx0fWZ1bmN0aW9uIGooKXt2YXIgbix0PVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxyPVwic3RyaW5nXCI9PXR5cGVvZiB0WzBdP3RbMF06dm9pZCAwLGU9Mj09PXQubGVuZ3RoP3RbMV06XCJzdHJpbmdcIj09dHlwZW9mIHRbMF0/dm9pZCAwOnRbMF07cmV0dXJuIGcoKChuPXt9KVtvXT1mdW5jdGlvbigpe3JldHVybnttYXRjaDpmdW5jdGlvbihuKXt2YXIgdCx1PSgodD17fSlbbnVsbCE9cj9yOmZdPW4sdCk7cmV0dXJue21hdGNoZWQ6dm9pZCAwPT09ZXx8cyhlLG4sZnVuY3Rpb24obix0KXt1W25dPXR9KSxzZWxlY3Rpb25zOnV9fSxnZXRTZWxlY3Rpb25LZXlzOmZ1bmN0aW9uKCl7cmV0dXJuW251bGwhPXI/cjpmXS5jb25jYXQodm9pZCAwPT09ZT9bXTpoKGUpKX19fSxuKSl9ZnVuY3Rpb24geChuKXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2Ygbn1mdW5jdGlvbiBBKG4pe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBufWZ1bmN0aW9uIEUobil7cmV0dXJuXCJiaWdpbnRcIj09dHlwZW9mIG59dmFyIF89ZyhTKGZ1bmN0aW9uKG4pe3JldHVybiEwfSkpLFA9XyxLPWZ1bmN0aW9uIG4odCl7cmV0dXJuIE9iamVjdC5hc3NpZ24oZyh0KSx7c3RhcnRzV2l0aDpmdW5jdGlvbihyKXtyZXR1cm4gbih3KHQsKGU9cixTKGZ1bmN0aW9uKG4pe3JldHVybiBBKG4pJiZuLnN0YXJ0c1dpdGgoZSl9KSkpKTt2YXIgZX0sZW5kc1dpdGg6ZnVuY3Rpb24ocil7cmV0dXJuIG4odyh0LChlPXIsUyhmdW5jdGlvbihuKXtyZXR1cm4gQShuKSYmbi5lbmRzV2l0aChlKX0pKSkpO3ZhciBlfSxtaW5MZW5ndGg6ZnVuY3Rpb24ocil7cmV0dXJuIG4odyh0LGZ1bmN0aW9uKG4pe3JldHVybiBTKGZ1bmN0aW9uKHQpe3JldHVybiBBKHQpJiZ0Lmxlbmd0aD49bn0pfShyKSkpfSxsZW5ndGg6ZnVuY3Rpb24ocil7cmV0dXJuIG4odyh0LGZ1bmN0aW9uKG4pe3JldHVybiBTKGZ1bmN0aW9uKHQpe3JldHVybiBBKHQpJiZ0Lmxlbmd0aD09PW59KX0ocikpKX0sbWF4TGVuZ3RoOmZ1bmN0aW9uKHIpe3JldHVybiBuKHcodCxmdW5jdGlvbihuKXtyZXR1cm4gUyhmdW5jdGlvbih0KXtyZXR1cm4gQSh0KSYmdC5sZW5ndGg8PW59KX0ocikpKX0saW5jbHVkZXM6ZnVuY3Rpb24ocil7cmV0dXJuIG4odyh0LChlPXIsUyhmdW5jdGlvbihuKXtyZXR1cm4gQShuKSYmbi5pbmNsdWRlcyhlKX0pKSkpO3ZhciBlfSxyZWdleDpmdW5jdGlvbihyKXtyZXR1cm4gbih3KHQsKGU9cixTKGZ1bmN0aW9uKG4pe3JldHVybiBBKG4pJiZCb29sZWFuKG4ubWF0Y2goZSkpfSkpKSk7dmFyIGV9fSl9KFMoQSkpLFQ9ZnVuY3Rpb24gbih0KXtyZXR1cm4gT2JqZWN0LmFzc2lnbihnKHQpLHtiZXR3ZWVuOmZ1bmN0aW9uKHIsZSl7cmV0dXJuIG4odyh0LGZ1bmN0aW9uKG4sdCl7cmV0dXJuIFMoZnVuY3Rpb24ocil7cmV0dXJuIHgocikmJm48PXImJnQ+PXJ9KX0ocixlKSkpfSxsdDpmdW5jdGlvbihyKXtyZXR1cm4gbih3KHQsZnVuY3Rpb24obil7cmV0dXJuIFMoZnVuY3Rpb24odCl7cmV0dXJuIHgodCkmJnQ8bn0pfShyKSkpfSxndDpmdW5jdGlvbihyKXtyZXR1cm4gbih3KHQsZnVuY3Rpb24obil7cmV0dXJuIFMoZnVuY3Rpb24odCl7cmV0dXJuIHgodCkmJnQ+bn0pfShyKSkpfSxsdGU6ZnVuY3Rpb24ocil7cmV0dXJuIG4odyh0LGZ1bmN0aW9uKG4pe3JldHVybiBTKGZ1bmN0aW9uKHQpe3JldHVybiB4KHQpJiZ0PD1ufSl9KHIpKSl9LGd0ZTpmdW5jdGlvbihyKXtyZXR1cm4gbih3KHQsZnVuY3Rpb24obil7cmV0dXJuIFMoZnVuY3Rpb24odCl7cmV0dXJuIHgodCkmJnQ+PW59KX0ocikpKX0saW50OmZ1bmN0aW9uKCl7cmV0dXJuIG4odyh0LFMoZnVuY3Rpb24obil7cmV0dXJuIHgobikmJk51bWJlci5pc0ludGVnZXIobil9KSkpfSxmaW5pdGU6ZnVuY3Rpb24oKXtyZXR1cm4gbih3KHQsUyhmdW5jdGlvbihuKXtyZXR1cm4geChuKSYmTnVtYmVyLmlzRmluaXRlKG4pfSkpKX0scG9zaXRpdmU6ZnVuY3Rpb24oKXtyZXR1cm4gbih3KHQsUyhmdW5jdGlvbihuKXtyZXR1cm4geChuKSYmbj4wfSkpKX0sbmVnYXRpdmU6ZnVuY3Rpb24oKXtyZXR1cm4gbih3KHQsUyhmdW5jdGlvbihuKXtyZXR1cm4geChuKSYmbjwwfSkpKX19KX0oUyh4KSksQj1mdW5jdGlvbiBuKHQpe3JldHVybiBPYmplY3QuYXNzaWduKGcodCkse2JldHdlZW46ZnVuY3Rpb24ocixlKXtyZXR1cm4gbih3KHQsZnVuY3Rpb24obix0KXtyZXR1cm4gUyhmdW5jdGlvbihyKXtyZXR1cm4gRShyKSYmbjw9ciYmdD49cn0pfShyLGUpKSl9LGx0OmZ1bmN0aW9uKHIpe3JldHVybiBuKHcodCxmdW5jdGlvbihuKXtyZXR1cm4gUyhmdW5jdGlvbih0KXtyZXR1cm4gRSh0KSYmdDxufSl9KHIpKSl9LGd0OmZ1bmN0aW9uKHIpe3JldHVybiBuKHcodCxmdW5jdGlvbihuKXtyZXR1cm4gUyhmdW5jdGlvbih0KXtyZXR1cm4gRSh0KSYmdD5ufSl9KHIpKSl9LGx0ZTpmdW5jdGlvbihyKXtyZXR1cm4gbih3KHQsZnVuY3Rpb24obil7cmV0dXJuIFMoZnVuY3Rpb24odCl7cmV0dXJuIEUodCkmJnQ8PW59KX0ocikpKX0sZ3RlOmZ1bmN0aW9uKHIpe3JldHVybiBuKHcodCxmdW5jdGlvbihuKXtyZXR1cm4gUyhmdW5jdGlvbih0KXtyZXR1cm4gRSh0KSYmdD49bn0pfShyKSkpfSxwb3NpdGl2ZTpmdW5jdGlvbigpe3JldHVybiBuKHcodCxTKGZ1bmN0aW9uKG4pe3JldHVybiBFKG4pJiZuPjB9KSkpfSxuZWdhdGl2ZTpmdW5jdGlvbigpe3JldHVybiBuKHcodCxTKGZ1bmN0aW9uKG4pe3JldHVybiBFKG4pJiZuPDB9KSkpfX0pfShTKEUpKSxNPWcoUyhmdW5jdGlvbihuKXtyZXR1cm5cImJvb2xlYW5cIj09dHlwZW9mIG59KSksUj1nKFMoZnVuY3Rpb24obil7cmV0dXJuXCJzeW1ib2xcIj09dHlwZW9mIG59KSksST1nKFMoZnVuY3Rpb24obil7cmV0dXJuIG51bGw9PW59KSksTj1nKFMoZnVuY3Rpb24obil7cmV0dXJuIG51bGwhPW59KSksaz17X19wcm90b19fOm51bGwsbWF0Y2hlcjpvLG9wdGlvbmFsOm0sYXJyYXk6ZnVuY3Rpb24oKXt2YXIgbix0PVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtyZXR1cm4geSgoKG49e30pW29dPWZ1bmN0aW9uKCl7cmV0dXJue21hdGNoOmZ1bmN0aW9uKG4pe2lmKCFBcnJheS5pc0FycmF5KG4pKXJldHVybnttYXRjaGVkOiExfTtpZigwPT09dC5sZW5ndGgpcmV0dXJue21hdGNoZWQ6ITB9O3ZhciByPXRbMF0sZT17fTtpZigwPT09bi5sZW5ndGgpcmV0dXJuIGgocikuZm9yRWFjaChmdW5jdGlvbihuKXtlW25dPVtdfSkse21hdGNoZWQ6ITAsc2VsZWN0aW9uczplfTt2YXIgdT1mdW5jdGlvbihuLHQpe2Vbbl09KGVbbl18fFtdKS5jb25jYXQoW3RdKX07cmV0dXJue21hdGNoZWQ6bi5ldmVyeShmdW5jdGlvbihuKXtyZXR1cm4gcyhyLG4sdSl9KSxzZWxlY3Rpb25zOmV9fSxnZXRTZWxlY3Rpb25LZXlzOmZ1bmN0aW9uKCl7cmV0dXJuIDA9PT10Lmxlbmd0aD9bXTpoKHRbMF0pfX19LG4pKX0sc2V0OmZ1bmN0aW9uKCl7dmFyIG4sdD1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIGcoKChuPXt9KVtvXT1mdW5jdGlvbigpe3JldHVybnttYXRjaDpmdW5jdGlvbihuKXtpZighKG4gaW5zdGFuY2VvZiBTZXQpKXJldHVybnttYXRjaGVkOiExfTt2YXIgcj17fTtpZigwPT09bi5zaXplKXJldHVybnttYXRjaGVkOiEwLHNlbGVjdGlvbnM6cn07aWYoMD09PXQubGVuZ3RoKXJldHVybnttYXRjaGVkOiEwfTt2YXIgZT1mdW5jdGlvbihuLHQpe3Jbbl09KHJbbl18fFtdKS5jb25jYXQoW3RdKX0sdT10WzBdO3JldHVybnttYXRjaGVkOmQobixmdW5jdGlvbihuKXtyZXR1cm4gcyh1LG4sZSl9KSxzZWxlY3Rpb25zOnJ9fSxnZXRTZWxlY3Rpb25LZXlzOmZ1bmN0aW9uKCl7cmV0dXJuIDA9PT10Lmxlbmd0aD9bXTpoKHRbMF0pfX19LG4pKX0sbWFwOmZ1bmN0aW9uKCl7dmFyIG4sdD1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIGcoKChuPXt9KVtvXT1mdW5jdGlvbigpe3JldHVybnttYXRjaDpmdW5jdGlvbihuKXtpZighKG4gaW5zdGFuY2VvZiBNYXApKXJldHVybnttYXRjaGVkOiExfTt2YXIgcj17fTtpZigwPT09bi5zaXplKXJldHVybnttYXRjaGVkOiEwLHNlbGVjdGlvbnM6cn07dmFyIGUsdT1mdW5jdGlvbihuLHQpe3Jbbl09KHJbbl18fFtdKS5jb25jYXQoW3RdKX07aWYoMD09PXQubGVuZ3RoKXJldHVybnttYXRjaGVkOiEwfTtpZigxPT09dC5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKFwiYFAubWFwYCB3YXNuJ3QgZ2l2ZW4gZW5vdWdoIGFyZ3VtZW50cy4gRXhwZWN0ZWQgKGtleSwgdmFsdWUpLCByZWNlaXZlZCBcIisobnVsbD09KGU9dFswXSk/dm9pZCAwOmUudG9TdHJpbmcoKSkpO3ZhciBpPXRbMF0sbz10WzFdO3JldHVybnttYXRjaGVkOmIobixmdW5jdGlvbihuLHQpe3ZhciByPXMoaSx0LHUpLGU9cyhvLG4sdSk7cmV0dXJuIHImJmV9KSxzZWxlY3Rpb25zOnJ9fSxnZXRTZWxlY3Rpb25LZXlzOmZ1bmN0aW9uKCl7cmV0dXJuIDA9PT10Lmxlbmd0aD9bXTpbXS5jb25jYXQoaCh0WzBdKSxoKHRbMV0pKX19fSxuKSl9LGludGVyc2VjdGlvbjp3LHVuaW9uOk8sbm90OmZ1bmN0aW9uKG4pe3ZhciB0O3JldHVybiBnKCgodD17fSlbb109ZnVuY3Rpb24oKXtyZXR1cm57bWF0Y2g6ZnVuY3Rpb24odCl7cmV0dXJue21hdGNoZWQ6IXMobix0LGZ1bmN0aW9uKCl7fSl9fSxnZXRTZWxlY3Rpb25LZXlzOmZ1bmN0aW9uKCl7cmV0dXJuW119LG1hdGNoZXJUeXBlOlwibm90XCJ9fSx0KSl9LHdoZW46UyxzZWxlY3Q6aixhbnk6XyxfOlAsc3RyaW5nOkssbnVtYmVyOlQsYmlnaW50OkIsYm9vbGVhbjpNLHN5bWJvbDpSLG51bGxpc2g6SSxub25OdWxsYWJsZTpOLGluc3RhbmNlT2Y6ZnVuY3Rpb24obil7cmV0dXJuIGcoUyhmdW5jdGlvbihuKXtyZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHQgaW5zdGFuY2VvZiBufX0obikpKX0sc2hhcGU6ZnVuY3Rpb24obil7cmV0dXJuIGcoUyhwKG4pKSl9fSxXPS8qI19fUFVSRV9fKi9mdW5jdGlvbihuKXt2YXIgcixlO2Z1bmN0aW9uIHUodCl7dmFyIHIsZTt0cnl7ZT1KU09OLnN0cmluZ2lmeSh0KX1jYXRjaChuKXtlPXR9cmV0dXJuKHI9bi5jYWxsKHRoaXMsXCJQYXR0ZXJuIG1hdGNoaW5nIGVycm9yOiBubyBwYXR0ZXJuIG1hdGNoZXMgdmFsdWUgXCIrZSl8fHRoaXMpLmlucHV0PXZvaWQgMCxyLmlucHV0PXQscn1yZXR1cm4gZT1uLChyPXUpLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1yLHQocixlKSx1fSgvKiNfX1BVUkVfXyovZShFcnJvcikpLEY9e21hdGNoZWQ6ITEsdmFsdWU6dm9pZCAwfSx6PS8qI19fUFVSRV9fKi9mdW5jdGlvbigpe2Z1bmN0aW9uIG4obix0KXt0aGlzLmlucHV0PXZvaWQgMCx0aGlzLnN0YXRlPXZvaWQgMCx0aGlzLmlucHV0PW4sdGhpcy5zdGF0ZT10fXZhciB0PW4ucHJvdG90eXBlO3JldHVybiB0LndpdGg9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLHI9W10uc2xpY2UuY2FsbChhcmd1bWVudHMpO2lmKHRoaXMuc3RhdGUubWF0Y2hlZClyZXR1cm4gdGhpczt2YXIgZT1yW3IubGVuZ3RoLTFdLHU9W3JbMF1dLGk9dm9pZCAwOzM9PT1yLmxlbmd0aCYmXCJmdW5jdGlvblwiPT10eXBlb2YgclsxXT9pPXJbMV06ci5sZW5ndGg+MiYmdS5wdXNoLmFwcGx5KHUsci5zbGljZSgxLHIubGVuZ3RoLTEpKTt2YXIgbz0hMSxjPXt9LGE9ZnVuY3Rpb24obix0KXtvPSEwLGNbbl09dH0sbD0hdS5zb21lKGZ1bmN0aW9uKG4pe3JldHVybiBzKG4sdC5pbnB1dCxhKX0pfHxpJiYhQm9vbGVhbihpKHRoaXMuaW5wdXQpKT9GOnttYXRjaGVkOiEwLHZhbHVlOmUobz9mIGluIGM/Y1tmXTpjOnRoaXMuaW5wdXQsdGhpcy5pbnB1dCl9O3JldHVybiBuZXcgbih0aGlzLmlucHV0LGwpfSx0LndoZW49ZnVuY3Rpb24odCxyKXtpZih0aGlzLnN0YXRlLm1hdGNoZWQpcmV0dXJuIHRoaXM7dmFyIGU9Qm9vbGVhbih0KHRoaXMuaW5wdXQpKTtyZXR1cm4gbmV3IG4odGhpcy5pbnB1dCxlP3ttYXRjaGVkOiEwLHZhbHVlOnIodGhpcy5pbnB1dCx0aGlzLmlucHV0KX06Ril9LHQub3RoZXJ3aXNlPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLnN0YXRlLm1hdGNoZWQ/dGhpcy5zdGF0ZS52YWx1ZTpuKHRoaXMuaW5wdXQpfSx0LmV4aGF1c3RpdmU9ZnVuY3Rpb24oKXtpZih0aGlzLnN0YXRlLm1hdGNoZWQpcmV0dXJuIHRoaXMuc3RhdGUudmFsdWU7dGhyb3cgbmV3IFcodGhpcy5pbnB1dCl9LHQucnVuPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZXhoYXVzdGl2ZSgpfSx0LnJldHVyblR5cGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30sbn0oKTtleHBvcnRzLk5vbkV4aGF1c3RpdmVFcnJvcj1XLGV4cG9ydHMuUD1rLGV4cG9ydHMuUGF0dGVybj1rLGV4cG9ydHMuaXNNYXRjaGluZz1wLGV4cG9ydHMubWF0Y2g9ZnVuY3Rpb24obil7cmV0dXJuIG5ldyB6KG4sRil9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguY2pzLm1hcFxuIiwiaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IFlBTUxNYXAgfSBmcm9tICcuLi9ub2Rlcy9ZQU1MTWFwLmpzJztcbmltcG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuLi9ub2Rlcy9ZQU1MU2VxLmpzJztcbmltcG9ydCB7IHJlc29sdmVCbG9ja01hcCB9IGZyb20gJy4vcmVzb2x2ZS1ibG9jay1tYXAuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUJsb2NrU2VxIH0gZnJvbSAnLi9yZXNvbHZlLWJsb2NrLXNlcS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRmxvd0NvbGxlY3Rpb24gfSBmcm9tICcuL3Jlc29sdmUtZmxvdy1jb2xsZWN0aW9uLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUsIHRhZykge1xuICAgIGNvbnN0IGNvbGwgPSB0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJ1xuICAgICAgICA/IHJlc29sdmVCbG9ja01hcChDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKVxuICAgICAgICA6IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnXG4gICAgICAgICAgICA/IHJlc29sdmVCbG9ja1NlcShDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKVxuICAgICAgICAgICAgOiByZXNvbHZlRmxvd0NvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZyk7XG4gICAgY29uc3QgQ29sbCA9IGNvbGwuY29uc3RydWN0b3I7XG4gICAgLy8gSWYgd2UgZ290IGEgdGFnTmFtZSBtYXRjaGluZyB0aGUgY2xhc3MsIG9yIHRoZSB0YWcgbmFtZSBpcyAnIScsXG4gICAgLy8gdGhlbiB1c2UgdGhlIHRhZ05hbWUgZnJvbSB0aGUgbm9kZSBjbGFzcyB1c2VkIHRvIGNyZWF0ZSBpdC5cbiAgICBpZiAodGFnTmFtZSA9PT0gJyEnIHx8IHRhZ05hbWUgPT09IENvbGwudGFnTmFtZSkge1xuICAgICAgICBjb2xsLnRhZyA9IENvbGwudGFnTmFtZTtcbiAgICAgICAgcmV0dXJuIGNvbGw7XG4gICAgfVxuICAgIGlmICh0YWdOYW1lKVxuICAgICAgICBjb2xsLnRhZyA9IHRhZ05hbWU7XG4gICAgcmV0dXJuIGNvbGw7XG59XG5mdW5jdGlvbiBjb21wb3NlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgcHJvcHMsIG9uRXJyb3IpIHtcbiAgICBjb25zdCB0YWdUb2tlbiA9IHByb3BzLnRhZztcbiAgICBjb25zdCB0YWdOYW1lID0gIXRhZ1Rva2VuXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IGN0eC5kaXJlY3RpdmVzLnRhZ05hbWUodGFnVG9rZW4uc291cmNlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZykpO1xuICAgIGlmICh0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJykge1xuICAgICAgICBjb25zdCB7IGFuY2hvciwgbmV3bGluZUFmdGVyUHJvcDogbmwgfSA9IHByb3BzO1xuICAgICAgICBjb25zdCBsYXN0UHJvcCA9IGFuY2hvciAmJiB0YWdUb2tlblxuICAgICAgICAgICAgPyBhbmNob3Iub2Zmc2V0ID4gdGFnVG9rZW4ub2Zmc2V0XG4gICAgICAgICAgICAgICAgPyBhbmNob3JcbiAgICAgICAgICAgICAgICA6IHRhZ1Rva2VuXG4gICAgICAgICAgICA6IChhbmNob3IgPz8gdGFnVG9rZW4pO1xuICAgICAgICBpZiAobGFzdFByb3AgJiYgKCFubCB8fCBubC5vZmZzZXQgPCBsYXN0UHJvcC5vZmZzZXQpKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ01pc3NpbmcgbmV3bGluZSBhZnRlciBibG9jayBzZXF1ZW5jZSBwcm9wcyc7XG4gICAgICAgICAgICBvbkVycm9yKGxhc3RQcm9wLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZXhwVHlwZSA9IHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnXG4gICAgICAgID8gJ21hcCdcbiAgICAgICAgOiB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJ1xuICAgICAgICAgICAgPyAnc2VxJ1xuICAgICAgICAgICAgOiB0b2tlbi5zdGFydC5zb3VyY2UgPT09ICd7J1xuICAgICAgICAgICAgICAgID8gJ21hcCdcbiAgICAgICAgICAgICAgICA6ICdzZXEnO1xuICAgIC8vIHNob3J0Y3V0OiBjaGVjayBpZiBpdCdzIGEgZ2VuZXJpYyBZQU1MTWFwIG9yIFlBTUxTZXFcbiAgICAvLyBiZWZvcmUganVtcGluZyBpbnRvIHRoZSBjdXN0b20gdGFnIGxvZ2ljLlxuICAgIGlmICghdGFnVG9rZW4gfHxcbiAgICAgICAgIXRhZ05hbWUgfHxcbiAgICAgICAgdGFnTmFtZSA9PT0gJyEnIHx8XG4gICAgICAgICh0YWdOYW1lID09PSBZQU1MTWFwLnRhZ05hbWUgJiYgZXhwVHlwZSA9PT0gJ21hcCcpIHx8XG4gICAgICAgICh0YWdOYW1lID09PSBZQU1MU2VxLnRhZ05hbWUgJiYgZXhwVHlwZSA9PT0gJ3NlcScpKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSk7XG4gICAgfVxuICAgIGxldCB0YWcgPSBjdHguc2NoZW1hLnRhZ3MuZmluZCh0ID0+IHQudGFnID09PSB0YWdOYW1lICYmIHQuY29sbGVjdGlvbiA9PT0gZXhwVHlwZSk7XG4gICAgaWYgKCF0YWcpIHtcbiAgICAgICAgY29uc3Qga3QgPSBjdHguc2NoZW1hLmtub3duVGFnc1t0YWdOYW1lXTtcbiAgICAgICAgaWYgKGt0ICYmIGt0LmNvbGxlY3Rpb24gPT09IGV4cFR5cGUpIHtcbiAgICAgICAgICAgIGN0eC5zY2hlbWEudGFncy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIGt0LCB7IGRlZmF1bHQ6IGZhbHNlIH0pKTtcbiAgICAgICAgICAgIHRhZyA9IGt0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGt0Py5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWdUb2tlbiwgJ0JBRF9DT0xMRUNUSU9OX1RZUEUnLCBgJHtrdC50YWd9IHVzZWQgZm9yICR7ZXhwVHlwZX0gY29sbGVjdGlvbiwgYnV0IGV4cGVjdHMgJHtrdC5jb2xsZWN0aW9ufWAsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIGBVbnJlc29sdmVkIHRhZzogJHt0YWdOYW1lfWAsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjb2xsID0gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUsIHRhZyk7XG4gICAgY29uc3QgcmVzID0gdGFnLnJlc29sdmU/Lihjb2xsLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyksIGN0eC5vcHRpb25zKSA/PyBjb2xsO1xuICAgIGNvbnN0IG5vZGUgPSBpc05vZGUocmVzKVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IG5ldyBTY2FsYXIocmVzKTtcbiAgICBub2RlLnJhbmdlID0gY29sbC5yYW5nZTtcbiAgICBub2RlLnRhZyA9IHRhZ05hbWU7XG4gICAgaWYgKHRhZz8uZm9ybWF0KVxuICAgICAgICBub2RlLmZvcm1hdCA9IHRhZy5mb3JtYXQ7XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydCB7IGNvbXBvc2VDb2xsZWN0aW9uIH07XG4iLCJpbXBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4uL2RvYy9Eb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9IGZyb20gJy4vY29tcG9zZS1ub2RlLmpzJztcbmltcG9ydCB7IHJlc29sdmVFbmQgfSBmcm9tICcuL3Jlc29sdmUtZW5kLmpzJztcbmltcG9ydCB7IHJlc29sdmVQcm9wcyB9IGZyb20gJy4vcmVzb2x2ZS1wcm9wcy5qcyc7XG5cbmZ1bmN0aW9uIGNvbXBvc2VEb2Mob3B0aW9ucywgZGlyZWN0aXZlcywgeyBvZmZzZXQsIHN0YXJ0LCB2YWx1ZSwgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7IF9kaXJlY3RpdmVzOiBkaXJlY3RpdmVzIH0sIG9wdGlvbnMpO1xuICAgIGNvbnN0IGRvYyA9IG5ldyBEb2N1bWVudCh1bmRlZmluZWQsIG9wdHMpO1xuICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgYXRSb290OiB0cnVlLFxuICAgICAgICBkaXJlY3RpdmVzOiBkb2MuZGlyZWN0aXZlcyxcbiAgICAgICAgb3B0aW9uczogZG9jLm9wdGlvbnMsXG4gICAgICAgIHNjaGVtYTogZG9jLnNjaGVtYVxuICAgIH07XG4gICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgaW5kaWNhdG9yOiAnZG9jLXN0YXJ0JyxcbiAgICAgICAgbmV4dDogdmFsdWUgPz8gZW5kPy5bMF0sXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgb25FcnJvcixcbiAgICAgICAgcGFyZW50SW5kZW50OiAwLFxuICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgIH0pO1xuICAgIGlmIChwcm9wcy5mb3VuZCkge1xuICAgICAgICBkb2MuZGlyZWN0aXZlcy5kb2NTdGFydCA9IHRydWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgKHZhbHVlLnR5cGUgPT09ICdibG9jay1tYXAnIHx8IHZhbHVlLnR5cGUgPT09ICdibG9jay1zZXEnKSAmJlxuICAgICAgICAgICAgIXByb3BzLmhhc05ld2xpbmUpXG4gICAgICAgICAgICBvbkVycm9yKHByb3BzLmVuZCwgJ01JU1NJTkdfQ0hBUicsICdCbG9jayBjb2xsZWN0aW9uIGNhbm5vdCBzdGFydCBvbiBzYW1lIGxpbmUgd2l0aCBkaXJlY3RpdmVzLWVuZCBtYXJrZXInKTtcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJZiBDb250ZW50cyBpcyBzZXQsIGxldCdzIHRydXN0IHRoZSB1c2VyXG4gICAgZG9jLmNvbnRlbnRzID0gdmFsdWVcbiAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgIGNvbnN0IGNvbnRlbnRFbmQgPSBkb2MuY29udGVudHMucmFuZ2VbMl07XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kKGVuZCwgY29udGVudEVuZCwgZmFsc2UsIG9uRXJyb3IpO1xuICAgIGlmIChyZS5jb21tZW50KVxuICAgICAgICBkb2MuY29tbWVudCA9IHJlLmNvbW1lbnQ7XG4gICAgZG9jLnJhbmdlID0gW29mZnNldCwgY29udGVudEVuZCwgcmUub2Zmc2V0XTtcbiAgICByZXR1cm4gZG9jO1xufVxuXG5leHBvcnQgeyBjb21wb3NlRG9jIH07XG4iLCJpbXBvcnQgeyBBbGlhcyB9IGZyb20gJy4uL25vZGVzL0FsaWFzLmpzJztcbmltcG9ydCB7IGNvbXBvc2VDb2xsZWN0aW9uIH0gZnJvbSAnLi9jb21wb3NlLWNvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgY29tcG9zZVNjYWxhciB9IGZyb20gJy4vY29tcG9zZS1zY2FsYXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUVuZCB9IGZyb20gJy4vcmVzb2x2ZS1lbmQuanMnO1xuaW1wb3J0IHsgZW1wdHlTY2FsYXJQb3NpdGlvbiB9IGZyb20gJy4vdXRpbC1lbXB0eS1zY2FsYXItcG9zaXRpb24uanMnO1xuXG5jb25zdCBDTiA9IHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfTtcbmZ1bmN0aW9uIGNvbXBvc2VOb2RlKGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKSB7XG4gICAgY29uc3QgeyBzcGFjZUJlZm9yZSwgY29tbWVudCwgYW5jaG9yLCB0YWcgfSA9IHByb3BzO1xuICAgIGxldCBub2RlO1xuICAgIGxldCBpc1NyY1Rva2VuID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VBbGlhcyhjdHgsIHRva2VuLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdBTElBU19QUk9QUycsICdBbiBhbGlhcyBub2RlIG11c3Qgbm90IHNwZWNpZnkgYW55IHByb3BlcnRpZXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICBub2RlLmFuY2hvciA9IGFuY2hvci5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0b2tlbi50eXBlID09PSAnZXJyb3InXG4gICAgICAgICAgICAgICAgPyB0b2tlbi5tZXNzYWdlXG4gICAgICAgICAgICAgICAgOiBgVW5zdXBwb3J0ZWQgdG9rZW4gKHR5cGU6ICR7dG9rZW4udHlwZX0pYDtcbiAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgbWVzc2FnZSk7XG4gICAgICAgICAgICBub2RlID0gY29tcG9zZUVtcHR5Tm9kZShjdHgsIHRva2VuLm9mZnNldCwgdW5kZWZpbmVkLCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBpc1NyY1Rva2VuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFuY2hvciAmJiBub2RlLmFuY2hvciA9PT0gJycpXG4gICAgICAgIG9uRXJyb3IoYW5jaG9yLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgaWYgKHNwYWNlQmVmb3JlKVxuICAgICAgICBub2RlLnNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3NjYWxhcicgJiYgdG9rZW4uc291cmNlID09PSAnJylcbiAgICAgICAgICAgIG5vZGUuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuY29tbWVudEJlZm9yZSA9IGNvbW1lbnQ7XG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVHlwZSBjaGVja2luZyBtaXNzZXMgbWVhbmluZyBvZiBpc1NyY1Rva2VuXG4gICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMgJiYgaXNTcmNUb2tlbilcbiAgICAgICAgbm9kZS5zcmNUb2tlbiA9IHRva2VuO1xuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gY29tcG9zZUVtcHR5Tm9kZShjdHgsIG9mZnNldCwgYmVmb3JlLCBwb3MsIHsgc3BhY2VCZWZvcmUsIGNvbW1lbnQsIGFuY2hvciwgdGFnLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICB0eXBlOiAnc2NhbGFyJyxcbiAgICAgICAgb2Zmc2V0OiBlbXB0eVNjYWxhclBvc2l0aW9uKG9mZnNldCwgYmVmb3JlLCBwb3MpLFxuICAgICAgICBpbmRlbnQ6IC0xLFxuICAgICAgICBzb3VyY2U6ICcnXG4gICAgfTtcbiAgICBjb25zdCBub2RlID0gY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWcsIG9uRXJyb3IpO1xuICAgIGlmIChhbmNob3IpIHtcbiAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgaWYgKG5vZGUuYW5jaG9yID09PSAnJylcbiAgICAgICAgICAgIG9uRXJyb3IoYW5jaG9yLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmIChzcGFjZUJlZm9yZSlcbiAgICAgICAgbm9kZS5zcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgbm9kZS5jb21tZW50ID0gY29tbWVudDtcbiAgICAgICAgbm9kZS5yYW5nZVsyXSA9IGVuZDtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59XG5mdW5jdGlvbiBjb21wb3NlQWxpYXMoeyBvcHRpb25zIH0sIHsgb2Zmc2V0LCBzb3VyY2UsIGVuZCB9LCBvbkVycm9yKSB7XG4gICAgY29uc3QgYWxpYXMgPSBuZXcgQWxpYXMoc291cmNlLnN1YnN0cmluZygxKSk7XG4gICAgaWYgKGFsaWFzLnNvdXJjZSA9PT0gJycpXG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0FMSUFTJywgJ0FsaWFzIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICBpZiAoYWxpYXMuc291cmNlLmVuZHNXaXRoKCc6JykpXG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0ICsgc291cmNlLmxlbmd0aCAtIDEsICdCQURfQUxJQVMnLCAnQWxpYXMgZW5kaW5nIGluIDogaXMgYW1iaWd1b3VzJywgdHJ1ZSk7XG4gICAgY29uc3QgdmFsdWVFbmQgPSBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgIGNvbnN0IHJlID0gcmVzb2x2ZUVuZChlbmQsIHZhbHVlRW5kLCBvcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgYWxpYXMucmFuZ2UgPSBbb2Zmc2V0LCB2YWx1ZUVuZCwgcmUub2Zmc2V0XTtcbiAgICBpZiAocmUuY29tbWVudClcbiAgICAgICAgYWxpYXMuY29tbWVudCA9IHJlLmNvbW1lbnQ7XG4gICAgcmV0dXJuIGFsaWFzO1xufVxuXG5leHBvcnQgeyBjb21wb3NlRW1wdHlOb2RlLCBjb21wb3NlTm9kZSB9O1xuIiwiaW1wb3J0IHsgU0NBTEFSLCBpc1NjYWxhciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlQmxvY2tTY2FsYXIgfSBmcm9tICcuL3Jlc29sdmUtYmxvY2stc2NhbGFyLmpzJztcbmltcG9ydCB7IHJlc29sdmVGbG93U2NhbGFyIH0gZnJvbSAnLi9yZXNvbHZlLWZsb3ctc2NhbGFyLmpzJztcblxuZnVuY3Rpb24gY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWdUb2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQsIHJhbmdlIH0gPSB0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJ1xuICAgICAgICA/IHJlc29sdmVCbG9ja1NjYWxhcihjdHgsIHRva2VuLCBvbkVycm9yKVxuICAgICAgICA6IHJlc29sdmVGbG93U2NhbGFyKHRva2VuLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGNvbnN0IHRhZ05hbWUgPSB0YWdUb2tlblxuICAgICAgICA/IGN0eC5kaXJlY3RpdmVzLnRhZ05hbWUodGFnVG9rZW4uc291cmNlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZykpXG4gICAgICAgIDogbnVsbDtcbiAgICBjb25zdCB0YWcgPSB0YWdUb2tlbiAmJiB0YWdOYW1lXG4gICAgICAgID8gZmluZFNjYWxhclRhZ0J5TmFtZShjdHguc2NoZW1hLCB2YWx1ZSwgdGFnTmFtZSwgdGFnVG9rZW4sIG9uRXJyb3IpXG4gICAgICAgIDogdG9rZW4udHlwZSA9PT0gJ3NjYWxhcidcbiAgICAgICAgICAgID8gZmluZFNjYWxhclRhZ0J5VGVzdChjdHgsIHZhbHVlLCB0b2tlbiwgb25FcnJvcilcbiAgICAgICAgICAgIDogY3R4LnNjaGVtYVtTQ0FMQVJdO1xuICAgIGxldCBzY2FsYXI7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gdGFnLnJlc29sdmUodmFsdWUsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuID8/IHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSwgY3R4Lm9wdGlvbnMpO1xuICAgICAgICBzY2FsYXIgPSBpc1NjYWxhcihyZXMpID8gcmVzIDogbmV3IFNjYWxhcihyZXMpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBvbkVycm9yKHRhZ1Rva2VuID8/IHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKTtcbiAgICAgICAgc2NhbGFyID0gbmV3IFNjYWxhcih2YWx1ZSk7XG4gICAgfVxuICAgIHNjYWxhci5yYW5nZSA9IHJhbmdlO1xuICAgIHNjYWxhci5zb3VyY2UgPSB2YWx1ZTtcbiAgICBpZiAodHlwZSlcbiAgICAgICAgc2NhbGFyLnR5cGUgPSB0eXBlO1xuICAgIGlmICh0YWdOYW1lKVxuICAgICAgICBzY2FsYXIudGFnID0gdGFnTmFtZTtcbiAgICBpZiAodGFnLmZvcm1hdClcbiAgICAgICAgc2NhbGFyLmZvcm1hdCA9IHRhZy5mb3JtYXQ7XG4gICAgaWYgKGNvbW1lbnQpXG4gICAgICAgIHNjYWxhci5jb21tZW50ID0gY29tbWVudDtcbiAgICByZXR1cm4gc2NhbGFyO1xufVxuZnVuY3Rpb24gZmluZFNjYWxhclRhZ0J5TmFtZShzY2hlbWEsIHZhbHVlLCB0YWdOYW1lLCB0YWdUb2tlbiwgb25FcnJvcikge1xuICAgIGlmICh0YWdOYW1lID09PSAnIScpXG4gICAgICAgIHJldHVybiBzY2hlbWFbU0NBTEFSXTsgLy8gbm9uLXNwZWNpZmljIHRhZ1xuICAgIGNvbnN0IG1hdGNoV2l0aFRlc3QgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBzY2hlbWEudGFncykge1xuICAgICAgICBpZiAoIXRhZy5jb2xsZWN0aW9uICYmIHRhZy50YWcgPT09IHRhZ05hbWUpIHtcbiAgICAgICAgICAgIGlmICh0YWcuZGVmYXVsdCAmJiB0YWcudGVzdClcbiAgICAgICAgICAgICAgICBtYXRjaFdpdGhUZXN0LnB1c2godGFnKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFnO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgdGFnIG9mIG1hdGNoV2l0aFRlc3QpXG4gICAgICAgIGlmICh0YWcudGVzdD8udGVzdCh2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdGFnO1xuICAgIGNvbnN0IGt0ID0gc2NoZW1hLmtub3duVGFnc1t0YWdOYW1lXTtcbiAgICBpZiAoa3QgJiYgIWt0LmNvbGxlY3Rpb24pIHtcbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIGtub3duIHRhZyBpcyBhdmFpbGFibGUgZm9yIHN0cmluZ2lmeWluZyxcbiAgICAgICAgLy8gYnV0IGRvZXMgbm90IGdldCB1c2VkIGJ5IGRlZmF1bHQuXG4gICAgICAgIHNjaGVtYS50YWdzLnB1c2goT2JqZWN0LmFzc2lnbih7fSwga3QsIHsgZGVmYXVsdDogZmFsc2UsIHRlc3Q6IHVuZGVmaW5lZCB9KSk7XG4gICAgICAgIHJldHVybiBrdDtcbiAgICB9XG4gICAgb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIGBVbnJlc29sdmVkIHRhZzogJHt0YWdOYW1lfWAsIHRhZ05hbWUgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInKTtcbiAgICByZXR1cm4gc2NoZW1hW1NDQUxBUl07XG59XG5mdW5jdGlvbiBmaW5kU2NhbGFyVGFnQnlUZXN0KHsgZGlyZWN0aXZlcywgc2NoZW1hIH0sIHZhbHVlLCB0b2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHRhZyA9IHNjaGVtYS50YWdzLmZpbmQodGFnID0+IHRhZy5kZWZhdWx0ICYmIHRhZy50ZXN0Py50ZXN0KHZhbHVlKSkgfHwgc2NoZW1hW1NDQUxBUl07XG4gICAgaWYgKHNjaGVtYS5jb21wYXQpIHtcbiAgICAgICAgY29uc3QgY29tcGF0ID0gc2NoZW1hLmNvbXBhdC5maW5kKHRhZyA9PiB0YWcuZGVmYXVsdCAmJiB0YWcudGVzdD8udGVzdCh2YWx1ZSkpID8/XG4gICAgICAgICAgICBzY2hlbWFbU0NBTEFSXTtcbiAgICAgICAgaWYgKHRhZy50YWcgIT09IGNvbXBhdC50YWcpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gZGlyZWN0aXZlcy50YWdTdHJpbmcodGFnLnRhZyk7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGRpcmVjdGl2ZXMudGFnU3RyaW5nKGNvbXBhdC50YWcpO1xuICAgICAgICAgICAgY29uc3QgbXNnID0gYFZhbHVlIG1heSBiZSBwYXJzZWQgYXMgZWl0aGVyICR7dHN9IG9yICR7Y3N9YDtcbiAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2csIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWc7XG59XG5cbmV4cG9ydCB7IGNvbXBvc2VTY2FsYXIgfTtcbiIsImltcG9ydCB7IERpcmVjdGl2ZXMgfSBmcm9tICcuLi9kb2MvZGlyZWN0aXZlcy5qcyc7XG5pbXBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4uL2RvYy9Eb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBZQU1MV2FybmluZywgWUFNTFBhcnNlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMuanMnO1xuaW1wb3J0IHsgaXNDb2xsZWN0aW9uLCBpc1BhaXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBjb21wb3NlRG9jIH0gZnJvbSAnLi9jb21wb3NlLWRvYy5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5cbmZ1bmN0aW9uIGdldEVycm9yUG9zKHNyYykge1xuICAgIGlmICh0eXBlb2Ygc3JjID09PSAnbnVtYmVyJylcbiAgICAgICAgcmV0dXJuIFtzcmMsIHNyYyArIDFdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNyYykpXG4gICAgICAgIHJldHVybiBzcmMubGVuZ3RoID09PSAyID8gc3JjIDogW3NyY1swXSwgc3JjWzFdXTtcbiAgICBjb25zdCB7IG9mZnNldCwgc291cmNlIH0gPSBzcmM7XG4gICAgcmV0dXJuIFtvZmZzZXQsIG9mZnNldCArICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyA/IHNvdXJjZS5sZW5ndGggOiAxKV07XG59XG5mdW5jdGlvbiBwYXJzZVByZWx1ZGUocHJlbHVkZSkge1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGF0Q29tbWVudCA9IGZhbHNlO1xuICAgIGxldCBhZnRlckVtcHR5TGluZSA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlbHVkZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBwcmVsdWRlW2ldO1xuICAgICAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgY29tbWVudCArPVxuICAgICAgICAgICAgICAgICAgICAoY29tbWVudCA9PT0gJycgPyAnJyA6IGFmdGVyRW1wdHlMaW5lID8gJ1xcblxcbicgOiAnXFxuJykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnKTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFmdGVyRW1wdHlMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgICBpZiAocHJlbHVkZVtpICsgMV0/LlswXSAhPT0gJyMnKVxuICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIFRoaXMgbWF5IGJlIHdyb25nIGFmdGVyIGRvYy1lbmQsIGJ1dCBpbiB0aGF0IGNhc2UgaXQgZG9lc24ndCBtYXR0ZXJcbiAgICAgICAgICAgICAgICBpZiAoIWF0Q29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgYWZ0ZXJFbXB0eUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGNvbW1lbnQsIGFmdGVyRW1wdHlMaW5lIH07XG59XG4vKipcbiAqIENvbXBvc2UgYSBzdHJlYW0gb2YgQ1NUIG5vZGVzIGludG8gYSBzdHJlYW0gb2YgWUFNTCBEb2N1bWVudHMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IENvbXBvc2VyLCBQYXJzZXIgfSBmcm9tICd5YW1sJ1xuICpcbiAqIGNvbnN0IHNyYzogc3RyaW5nID0gLi4uXG4gKiBjb25zdCB0b2tlbnMgPSBuZXcgUGFyc2VyKCkucGFyc2Uoc3JjKVxuICogY29uc3QgZG9jcyA9IG5ldyBDb21wb3NlcigpLmNvbXBvc2UodG9rZW5zKVxuICogYGBgXG4gKi9cbmNsYXNzIENvbXBvc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5kb2MgPSBudWxsO1xuICAgICAgICB0aGlzLmF0RGlyZWN0aXZlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnByZWx1ZGUgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgICAgICB0aGlzLm9uRXJyb3IgPSAoc291cmNlLCBjb2RlLCBtZXNzYWdlLCB3YXJuaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSBnZXRFcnJvclBvcyhzb3VyY2UpO1xuICAgICAgICAgICAgaWYgKHdhcm5pbmcpXG4gICAgICAgICAgICAgICAgdGhpcy53YXJuaW5ncy5wdXNoKG5ldyBZQU1MV2FybmluZyhwb3MsIGNvZGUsIG1lc3NhZ2UpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBZQU1MUGFyc2VFcnJvcihwb3MsIGNvZGUsIG1lc3NhZ2UpKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBEaXJlY3RpdmVzKHsgdmVyc2lvbjogb3B0aW9ucy52ZXJzaW9uIHx8ICcxLjInIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICBkZWNvcmF0ZShkb2MsIGFmdGVyRG9jKSB7XG4gICAgICAgIGNvbnN0IHsgY29tbWVudCwgYWZ0ZXJFbXB0eUxpbmUgfSA9IHBhcnNlUHJlbHVkZSh0aGlzLnByZWx1ZGUpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHsgZGM6IGRvYy5jb21tZW50LCBwcmVsdWRlLCBjb21tZW50IH0pXG4gICAgICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYyA9IGRvYy5jb250ZW50cztcbiAgICAgICAgICAgIGlmIChhZnRlckRvYykge1xuICAgICAgICAgICAgICAgIGRvYy5jb21tZW50ID0gZG9jLmNvbW1lbnQgPyBgJHtkb2MuY29tbWVudH1cXG4ke2NvbW1lbnR9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhZnRlckVtcHR5TGluZSB8fCBkb2MuZGlyZWN0aXZlcy5kb2NTdGFydCB8fCAhZGMpIHtcbiAgICAgICAgICAgICAgICBkb2MuY29tbWVudEJlZm9yZSA9IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0NvbGxlY3Rpb24oZGMpICYmICFkYy5mbG93ICYmIGRjLml0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgaXQgPSBkYy5pdGVtc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoaXNQYWlyKGl0KSlcbiAgICAgICAgICAgICAgICAgICAgaXQgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSBpdC5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGl0LmNvbW1lbnRCZWZvcmUgPSBjYiA/IGAke2NvbW1lbnR9XFxuJHtjYn1gIDogY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gZGMuY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBkYy5jb21tZW50QmVmb3JlID0gY2IgPyBgJHtjb21tZW50fVxcbiR7Y2J9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFmdGVyRG9jKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShkb2MuZXJyb3JzLCB0aGlzLmVycm9ycyk7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShkb2Mud2FybmluZ3MsIHRoaXMud2FybmluZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jLmVycm9ycyA9IHRoaXMuZXJyb3JzO1xuICAgICAgICAgICAgZG9jLndhcm5pbmdzID0gdGhpcy53YXJuaW5ncztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZWx1ZGUgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHN0cmVhbSBzdGF0dXMgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBNb3N0bHkgdXNlZnVsIGF0IHRoZSBlbmQgb2YgaW5wdXQgZm9yIGFuIGVtcHR5IHN0cmVhbS5cbiAgICAgKi9cbiAgICBzdHJlYW1JbmZvKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tbWVudDogcGFyc2VQcmVsdWRlKHRoaXMucHJlbHVkZSkuY29tbWVudCxcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IHRoaXMuZGlyZWN0aXZlcyxcbiAgICAgICAgICAgIGVycm9yczogdGhpcy5lcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5nczogdGhpcy53YXJuaW5nc1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wb3NlIHRva2VucyBpbnRvIGRvY3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZURvYyAtIElmIHRoZSBzdHJlYW0gY29udGFpbnMgbm8gZG9jdW1lbnQsIHN0aWxsIGVtaXQgYSBmaW5hbCBkb2N1bWVudCBpbmNsdWRpbmcgYW55IGNvbW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHN1YnNlcXVlbnQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIGVuZE9mZnNldCAtIFNob3VsZCBiZSBzZXQgaWYgYGZvcmNlRG9jYCBpcyBhbHNvIHNldCwgdG8gc2V0IHRoZSBkb2N1bWVudCByYW5nZSBlbmQgYW5kIHRvIGluZGljYXRlIGVycm9ycyBjb3JyZWN0bHkuXG4gICAgICovXG4gICAgKmNvbXBvc2UodG9rZW5zLCBmb3JjZURvYyA9IGZhbHNlLCBlbmRPZmZzZXQgPSAtMSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2VucylcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLm5leHQodG9rZW4pO1xuICAgICAgICB5aWVsZCogdGhpcy5lbmQoZm9yY2VEb2MsIGVuZE9mZnNldCk7XG4gICAgfVxuICAgIC8qKiBBZHZhbmNlIHRoZSBjb21wb3NlciBieSBvbmUgQ1NUIHRva2VuLiAqL1xuICAgICpuZXh0KHRva2VuKSB7XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMuYWRkKHRva2VuLnNvdXJjZSwgKG9mZnNldCwgbWVzc2FnZSwgd2FybmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSBnZXRFcnJvclBvcyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHBvc1swXSArPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihwb3MsICdCQURfRElSRUNUSVZFJywgbWVzc2FnZSwgd2FybmluZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVsdWRlLnB1c2godG9rZW4uc291cmNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmF0RGlyZWN0aXZlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSBjb21wb3NlRG9jKHRoaXMub3B0aW9ucywgdGhpcy5kaXJlY3RpdmVzLCB0b2tlbiwgdGhpcy5vbkVycm9yKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMgJiYgIWRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBkaXJlY3RpdmVzLWVuZC9kb2Mtc3RhcnQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRvYylcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5kb2M7XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MgPSBkb2M7XG4gICAgICAgICAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2J5dGUtb3JkZXItbWFyayc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMucHJlbHVkZS5wdXNoKHRva2VuLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSB0b2tlbi5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgPyBgJHt0b2tlbi5tZXNzYWdlfTogJHtKU09OLnN0cmluZ2lmeSh0b2tlbi5zb3VyY2UpfWBcbiAgICAgICAgICAgICAgICAgICAgOiB0b2tlbi5tZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IFlBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBtc2cpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcyB8fCAhdGhpcy5kb2MpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb2MuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdVbmV4cGVjdGVkIGRvYy1lbmQgd2l0aG91dCBwcmVjZWRpbmcgZG9jdW1lbnQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgbXNnKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5kaXJlY3RpdmVzLmRvY0VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZCh0b2tlbi5lbmQsIHRva2VuLm9mZnNldCArIHRva2VuLnNvdXJjZS5sZW5ndGgsIHRoaXMuZG9jLm9wdGlvbnMuc3RyaWN0LCB0aGlzLm9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUodGhpcy5kb2MsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmIChlbmQuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYyA9IHRoaXMuZG9jLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9jLmNvbW1lbnQgPSBkYyA/IGAke2RjfVxcbiR7ZW5kLmNvbW1lbnR9YCA6IGVuZC5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5yYW5nZVsyXSA9IGVuZC5vZmZzZXQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFlBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5zdXBwb3J0ZWQgdG9rZW4gJHt0b2tlbi50eXBlfWApKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsIGF0IGVuZCBvZiBpbnB1dCB0byB5aWVsZCBhbnkgcmVtYWluaW5nIGRvY3VtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGZvcmNlRG9jIC0gSWYgdGhlIHN0cmVhbSBjb250YWlucyBubyBkb2N1bWVudCwgc3RpbGwgZW1pdCBhIGZpbmFsIGRvY3VtZW50IGluY2x1ZGluZyBhbnkgY29tbWVudHMgYW5kIGRpcmVjdGl2ZXMgdGhhdCB3b3VsZCBiZSBhcHBsaWVkIHRvIGEgc3Vic2VxdWVudCBkb2N1bWVudC5cbiAgICAgKiBAcGFyYW0gZW5kT2Zmc2V0IC0gU2hvdWxkIGJlIHNldCBpZiBgZm9yY2VEb2NgIGlzIGFsc28gc2V0LCB0byBzZXQgdGhlIGRvY3VtZW50IHJhbmdlIGVuZCBhbmQgdG8gaW5kaWNhdGUgZXJyb3JzIGNvcnJlY3RseS5cbiAgICAgKi9cbiAgICAqZW5kKGZvcmNlRG9jID0gZmFsc2UsIGVuZE9mZnNldCA9IC0xKSB7XG4gICAgICAgIGlmICh0aGlzLmRvYykge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZSh0aGlzLmRvYywgdHJ1ZSk7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmRvYztcbiAgICAgICAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmb3JjZURvYykge1xuICAgICAgICAgICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyBfZGlyZWN0aXZlczogdGhpcy5kaXJlY3RpdmVzIH0sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBkb2MgPSBuZXcgRG9jdW1lbnQodW5kZWZpbmVkLCBvcHRzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZW5kT2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgIGRvYy5yYW5nZSA9IFswLCBlbmRPZmZzZXQsIGVuZE9mZnNldF07XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgeWllbGQgZG9jO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBDb21wb3NlciB9O1xuIiwiaW1wb3J0IHsgUGFpciB9IGZyb20gJy4uL25vZGVzL1BhaXIuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uL25vZGVzL1lBTUxNYXAuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZVByb3BzIH0gZnJvbSAnLi9yZXNvbHZlLXByb3BzLmpzJztcbmltcG9ydCB7IGNvbnRhaW5zTmV3bGluZSB9IGZyb20gJy4vdXRpbC1jb250YWlucy1uZXdsaW5lLmpzJztcbmltcG9ydCB7IGZsb3dJbmRlbnRDaGVjayB9IGZyb20gJy4vdXRpbC1mbG93LWluZGVudC1jaGVjay5qcyc7XG5pbXBvcnQgeyBtYXBJbmNsdWRlcyB9IGZyb20gJy4vdXRpbC1tYXAtaW5jbHVkZXMuanMnO1xuXG5jb25zdCBzdGFydENvbE1zZyA9ICdBbGwgbWFwcGluZyBpdGVtcyBtdXN0IHN0YXJ0IGF0IHRoZSBzYW1lIGNvbHVtbic7XG5mdW5jdGlvbiByZXNvbHZlQmxvY2tNYXAoeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGJtLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSB0YWc/Lm5vZGVDbGFzcyA/PyBZQU1MTWFwO1xuICAgIGNvbnN0IG1hcCA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgaWYgKGN0eC5hdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gYm0ub2Zmc2V0O1xuICAgIGxldCBjb21tZW50RW5kID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGNvbGxJdGVtIG9mIGJtLml0ZW1zKSB7XG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9ID0gY29sbEl0ZW07XG4gICAgICAgIC8vIGtleSBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IGtleVByb3BzID0gcmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdleHBsaWNpdC1rZXktaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IGtleSA/PyBzZXA/LlswXSxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJtLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBpbXBsaWNpdEtleSA9ICFrZXlQcm9wcy5mb3VuZDtcbiAgICAgICAgaWYgKGltcGxpY2l0S2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleS50eXBlID09PSAnYmxvY2stc2VxJylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCTE9DS19BU19JTVBMSUNJVF9LRVknLCAnQSBibG9jayBzZXF1ZW5jZSBtYXkgbm90IGJlIHVzZWQgYXMgYW4gaW1wbGljaXQgbWFwIGtleScpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCdpbmRlbnQnIGluIGtleSAmJiBrZXkuaW5kZW50ICE9PSBibS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIHN0YXJ0Q29sTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgha2V5UHJvcHMuYW5jaG9yICYmICFrZXlQcm9wcy50YWcgJiYgIXNlcCkge1xuICAgICAgICAgICAgICAgIGNvbW1lbnRFbmQgPSBrZXlQcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgaWYgKGtleVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcC5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLmNvbW1lbnQgKz0gJ1xcbicgKyBrZXlQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuY29tbWVudCA9IGtleVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleVByb3BzLm5ld2xpbmVBZnRlclByb3AgfHwgY29udGFpbnNOZXdsaW5lKGtleSkpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleSA/PyBzdGFydFtzdGFydC5sZW5ndGggLSAxXSwgJ01VTFRJTElORV9JTVBMSUNJVF9LRVknLCAnSW1wbGljaXQga2V5cyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXlQcm9wcy5mb3VuZD8uaW5kZW50ICE9PSBibS5pbmRlbnQpIHtcbiAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIHN0YXJ0Q29sTXNnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBrZXkgdmFsdWVcbiAgICAgICAgY29uc3Qga2V5U3RhcnQgPSBrZXlQcm9wcy5lbmQ7XG4gICAgICAgIGNvbnN0IGtleU5vZGUgPSBrZXlcbiAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCBrZXksIGtleVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwga2V5U3RhcnQsIHN0YXJ0LCBudWxsLCBrZXlQcm9wcywgb25FcnJvcik7XG4gICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgIGZsb3dJbmRlbnRDaGVjayhibS5pbmRlbnQsIGtleSwgb25FcnJvcik7XG4gICAgICAgIGlmIChtYXBJbmNsdWRlcyhjdHgsIG1hcC5pdGVtcywga2V5Tm9kZSkpXG4gICAgICAgICAgICBvbkVycm9yKGtleVN0YXJ0LCAnRFVQTElDQVRFX0tFWScsICdNYXAga2V5cyBtdXN0IGJlIHVuaXF1ZScpO1xuICAgICAgICAvLyB2YWx1ZSBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHZhbHVlUHJvcHMgPSByZXNvbHZlUHJvcHMoc2VwID8/IFtdLCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdtYXAtdmFsdWUtaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgb2Zmc2V0OiBrZXlOb2RlLnJhbmdlWzJdLFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYm0uaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6ICFrZXkgfHwga2V5LnR5cGUgPT09ICdibG9jay1zY2FsYXInXG4gICAgICAgIH0pO1xuICAgICAgICBvZmZzZXQgPSB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgaWYgKHZhbHVlUHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZT8udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgJiYgIXZhbHVlUHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCTE9DS19BU19JTVBMSUNJVF9LRVknLCAnTmVzdGVkIG1hcHBpbmdzIGFyZSBub3QgYWxsb3dlZCBpbiBjb21wYWN0IG1hcHBpbmdzJyk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLnN0cmljdCAmJlxuICAgICAgICAgICAgICAgICAgICBrZXlQcm9wcy5zdGFydCA8IHZhbHVlUHJvcHMuZm91bmQub2Zmc2V0IC0gMTAyNClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihrZXlOb2RlLnJhbmdlLCAnS0VZX09WRVJfMTAyNF9DSEFSUycsICdUaGUgOiBpbmRpY2F0b3IgbXVzdCBiZSBhdCBtb3N0IDEwMjQgY2hhcnMgYWZ0ZXIgdGhlIHN0YXJ0IG9mIGFuIGltcGxpY2l0IGJsb2NrIG1hcHBpbmcga2V5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSB2YWx1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgb2Zmc2V0LCBzZXAsIG51bGwsIHZhbHVlUHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgICAgIGZsb3dJbmRlbnRDaGVjayhibS5pbmRlbnQsIHZhbHVlLCBvbkVycm9yKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZS5yYW5nZVsyXTtcbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBuZXcgUGFpcihrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBrZXkgd2l0aCBubyB2YWx1ZVxuICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ01JU1NJTkdfQ0hBUicsICdJbXBsaWNpdCBtYXAga2V5cyBuZWVkIHRvIGJlIGZvbGxvd2VkIGJ5IG1hcCB2YWx1ZXMnKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5Tm9kZS5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgKz0gJ1xcbicgKyB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgPSB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIoa2V5Tm9kZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucylcbiAgICAgICAgICAgICAgICBwYWlyLnNyY1Rva2VuID0gY29sbEl0ZW07XG4gICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudEVuZCAmJiBjb21tZW50RW5kIDwgb2Zmc2V0KVxuICAgICAgICBvbkVycm9yKGNvbW1lbnRFbmQsICdJTVBPU1NJQkxFJywgJ01hcCBjb21tZW50IHdpdGggdHJhaWxpbmcgY29udGVudCcpO1xuICAgIG1hcC5yYW5nZSA9IFtibS5vZmZzZXQsIG9mZnNldCwgY29tbWVudEVuZCA/PyBvZmZzZXRdO1xuICAgIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVCbG9ja01hcCB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrU2NhbGFyKGN0eCwgc2NhbGFyLCBvbkVycm9yKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBzY2FsYXIub2Zmc2V0O1xuICAgIGNvbnN0IGhlYWRlciA9IHBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoc2NhbGFyLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGlmICghaGVhZGVyKVxuICAgICAgICByZXR1cm4geyB2YWx1ZTogJycsIHR5cGU6IG51bGwsIGNvbW1lbnQ6ICcnLCByYW5nZTogW3N0YXJ0LCBzdGFydCwgc3RhcnRdIH07XG4gICAgY29uc3QgdHlwZSA9IGhlYWRlci5tb2RlID09PSAnPicgPyBTY2FsYXIuQkxPQ0tfRk9MREVEIDogU2NhbGFyLkJMT0NLX0xJVEVSQUw7XG4gICAgY29uc3QgbGluZXMgPSBzY2FsYXIuc291cmNlID8gc3BsaXRMaW5lcyhzY2FsYXIuc291cmNlKSA6IFtdO1xuICAgIC8vIGRldGVybWluZSB0aGUgZW5kIG9mIGNvbnRlbnQgJiBzdGFydCBvZiBjaG9tcGluZ1xuICAgIGxldCBjaG9tcFN0YXJ0ID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gbGluZXNbaV1bMV07XG4gICAgICAgIGlmIChjb250ZW50ID09PSAnJyB8fCBjb250ZW50ID09PSAnXFxyJylcbiAgICAgICAgICAgIGNob21wU3RhcnQgPSBpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gc2hvcnRjdXQgZm9yIGVtcHR5IGNvbnRlbnRzXG4gICAgaWYgKGNob21wU3RhcnQgPT09IDApIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBoZWFkZXIuY2hvbXAgPT09ICcrJyAmJiBsaW5lcy5sZW5ndGggPiAwXG4gICAgICAgICAgICA/ICdcXG4nLnJlcGVhdChNYXRoLm1heCgxLCBsaW5lcy5sZW5ndGggLSAxKSlcbiAgICAgICAgICAgIDogJyc7XG4gICAgICAgIGxldCBlbmQgPSBzdGFydCArIGhlYWRlci5sZW5ndGg7XG4gICAgICAgIGlmIChzY2FsYXIuc291cmNlKVxuICAgICAgICAgICAgZW5kICs9IHNjYWxhci5zb3VyY2UubGVuZ3RoO1xuICAgICAgICByZXR1cm4geyB2YWx1ZSwgdHlwZSwgY29tbWVudDogaGVhZGVyLmNvbW1lbnQsIHJhbmdlOiBbc3RhcnQsIGVuZCwgZW5kXSB9O1xuICAgIH1cbiAgICAvLyBmaW5kIHRoZSBpbmRlbnRhdGlvbiBsZXZlbCB0byB0cmltIGZyb20gc3RhcnRcbiAgICBsZXQgdHJpbUluZGVudCA9IHNjYWxhci5pbmRlbnQgKyBoZWFkZXIuaW5kZW50O1xuICAgIGxldCBvZmZzZXQgPSBzY2FsYXIub2Zmc2V0ICsgaGVhZGVyLmxlbmd0aDtcbiAgICBsZXQgY29udGVudFN0YXJ0ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNob21wU3RhcnQ7ICsraSkge1xuICAgICAgICBjb25zdCBbaW5kZW50LCBjb250ZW50XSA9IGxpbmVzW2ldO1xuICAgICAgICBpZiAoY29udGVudCA9PT0gJycgfHwgY29udGVudCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgIGlmIChoZWFkZXIuaW5kZW50ID09PSAwICYmIGluZGVudC5sZW5ndGggPiB0cmltSW5kZW50KVxuICAgICAgICAgICAgICAgIHRyaW1JbmRlbnQgPSBpbmRlbnQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGVudC5sZW5ndGggPCB0cmltSW5kZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdCbG9jayBzY2FsYXJzIHdpdGggbW9yZS1pbmRlbnRlZCBsZWFkaW5nIGVtcHR5IGxpbmVzIG11c3QgdXNlIGFuIGV4cGxpY2l0IGluZGVudGF0aW9uIGluZGljYXRvcic7XG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQgKyBpbmRlbnQubGVuZ3RoLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGVhZGVyLmluZGVudCA9PT0gMClcbiAgICAgICAgICAgICAgICB0cmltSW5kZW50ID0gaW5kZW50Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnRlbnRTdGFydCA9IGk7XG4gICAgICAgICAgICBpZiAodHJpbUluZGVudCA9PT0gMCAmJiAhY3R4LmF0Um9vdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQmxvY2sgc2NhbGFyIHZhbHVlcyBpbiBjb2xsZWN0aW9ucyBtdXN0IGJlIGluZGVudGVkJztcbiAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9JTkRFTlQnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCArPSBpbmRlbnQubGVuZ3RoICsgY29udGVudC5sZW5ndGggKyAxO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlIHRyYWlsaW5nIG1vcmUtaW5kZW50ZWQgZW1wdHkgbGluZXMgaW4gY29udGVudFxuICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IGNob21wU3RhcnQ7IC0taSkge1xuICAgICAgICBpZiAobGluZXNbaV1bMF0ubGVuZ3RoID4gdHJpbUluZGVudClcbiAgICAgICAgICAgIGNob21wU3RhcnQgPSBpICsgMTtcbiAgICB9XG4gICAgbGV0IHZhbHVlID0gJyc7XG4gICAgbGV0IHNlcCA9ICcnO1xuICAgIGxldCBwcmV2TW9yZUluZGVudGVkID0gZmFsc2U7XG4gICAgLy8gbGVhZGluZyB3aGl0ZXNwYWNlIGlzIGtlcHQgaW50YWN0XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50U3RhcnQ7ICsraSlcbiAgICAgICAgdmFsdWUgKz0gbGluZXNbaV1bMF0uc2xpY2UodHJpbUluZGVudCkgKyAnXFxuJztcbiAgICBmb3IgKGxldCBpID0gY29udGVudFN0YXJ0OyBpIDwgY2hvbXBTdGFydDsgKytpKSB7XG4gICAgICAgIGxldCBbaW5kZW50LCBjb250ZW50XSA9IGxpbmVzW2ldO1xuICAgICAgICBvZmZzZXQgKz0gaW5kZW50Lmxlbmd0aCArIGNvbnRlbnQubGVuZ3RoICsgMTtcbiAgICAgICAgY29uc3QgY3JsZiA9IGNvbnRlbnRbY29udGVudC5sZW5ndGggLSAxXSA9PT0gJ1xccic7XG4gICAgICAgIGlmIChjcmxmKVxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgYWxyZWFkeSBjYXVnaHQgaW4gbGV4ZXIgKi9cbiAgICAgICAgaWYgKGNvbnRlbnQgJiYgaW5kZW50Lmxlbmd0aCA8IHRyaW1JbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNyYyA9IGhlYWRlci5pbmRlbnRcbiAgICAgICAgICAgICAgICA/ICdleHBsaWNpdCBpbmRlbnRhdGlvbiBpbmRpY2F0b3InXG4gICAgICAgICAgICAgICAgOiAnZmlyc3QgbGluZSc7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYEJsb2NrIHNjYWxhciBsaW5lcyBtdXN0IG5vdCBiZSBsZXNzIGluZGVudGVkIHRoYW4gdGhlaXIgJHtzcmN9YDtcbiAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0IC0gY29udGVudC5sZW5ndGggLSAoY3JsZiA/IDIgOiAxKSwgJ0JBRF9JTkRFTlQnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGluZGVudCA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSBTY2FsYXIuQkxPQ0tfTElURVJBTCkge1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgaW5kZW50LnNsaWNlKHRyaW1JbmRlbnQpICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGVudC5sZW5ndGggPiB0cmltSW5kZW50IHx8IGNvbnRlbnRbMF0gPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAvLyBtb3JlLWluZGVudGVkIGNvbnRlbnQgd2l0aGluIGEgZm9sZGVkIGJsb2NrXG4gICAgICAgICAgICBpZiAoc2VwID09PSAnICcpXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgICAgICBlbHNlIGlmICghcHJldk1vcmVJbmRlbnRlZCAmJiBzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG5cXG4nO1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgaW5kZW50LnNsaWNlKHRyaW1JbmRlbnQpICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICAgICAgcHJldk1vcmVJbmRlbnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29udGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgIC8vIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICcgJztcbiAgICAgICAgICAgIHByZXZNb3JlSW5kZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzd2l0Y2ggKGhlYWRlci5jaG9tcCkge1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaG9tcFN0YXJ0OyBpIDwgbGluZXMubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbicgKyBsaW5lc1tpXVswXS5zbGljZSh0cmltSW5kZW50KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVt2YWx1ZS5sZW5ndGggLSAxXSAhPT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgIH1cbiAgICBjb25zdCBlbmQgPSBzdGFydCArIGhlYWRlci5sZW5ndGggKyBzY2FsYXIuc291cmNlLmxlbmd0aDtcbiAgICByZXR1cm4geyB2YWx1ZSwgdHlwZSwgY29tbWVudDogaGVhZGVyLmNvbW1lbnQsIHJhbmdlOiBbc3RhcnQsIGVuZCwgZW5kXSB9O1xufVxuZnVuY3Rpb24gcGFyc2VCbG9ja1NjYWxhckhlYWRlcih7IG9mZnNldCwgcHJvcHMgfSwgc3RyaWN0LCBvbkVycm9yKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgaWYgKHByb3BzWzBdLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJykge1xuICAgICAgICBvbkVycm9yKHByb3BzWzBdLCAnSU1QT1NTSUJMRScsICdCbG9jayBzY2FsYXIgaGVhZGVyIG5vdCBmb3VuZCcpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeyBzb3VyY2UgfSA9IHByb3BzWzBdO1xuICAgIGNvbnN0IG1vZGUgPSBzb3VyY2VbMF07XG4gICAgbGV0IGluZGVudCA9IDA7XG4gICAgbGV0IGNob21wID0gJyc7XG4gICAgbGV0IGVycm9yID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzb3VyY2UubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgY2ggPSBzb3VyY2VbaV07XG4gICAgICAgIGlmICghY2hvbXAgJiYgKGNoID09PSAnLScgfHwgY2ggPT09ICcrJykpXG4gICAgICAgICAgICBjaG9tcCA9IGNoO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBOdW1iZXIoY2gpO1xuICAgICAgICAgICAgaWYgKCFpbmRlbnQgJiYgbilcbiAgICAgICAgICAgICAgICBpbmRlbnQgPSBuO1xuICAgICAgICAgICAgZWxzZSBpZiAoZXJyb3IgPT09IC0xKVxuICAgICAgICAgICAgICAgIGVycm9yID0gb2Zmc2V0ICsgaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXJyb3IgIT09IC0xKVxuICAgICAgICBvbkVycm9yKGVycm9yLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBCbG9jayBzY2FsYXIgaGVhZGVyIGluY2x1ZGVzIGV4dHJhIGNoYXJhY3RlcnM6ICR7c291cmNlfWApO1xuICAgIGxldCBoYXNTcGFjZSA9IGZhbHNlO1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHByb3BzW2ldO1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoc3RyaWN0ICYmICFoYXNTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0b2tlbi5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSB0b2tlbi5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgdG9rZW4ubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgVW5leHBlY3RlZCB0b2tlbiBpbiBibG9jayBzY2FsYXIgaGVhZGVyOiAke3Rva2VuLnR5cGV9YDtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRzID0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgIGlmICh0cyAmJiB0eXBlb2YgdHMgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICBsZW5ndGggKz0gdHMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IG1vZGUsIGluZGVudCwgY2hvbXAsIGNvbW1lbnQsIGxlbmd0aCB9O1xufVxuLyoqIEByZXR1cm5zIEFycmF5IG9mIGxpbmVzIHNwbGl0IHVwIGFzIGBbaW5kZW50LCBjb250ZW50XWAgKi9cbmZ1bmN0aW9uIHNwbGl0TGluZXMoc291cmNlKSB7XG4gICAgY29uc3Qgc3BsaXQgPSBzb3VyY2Uuc3BsaXQoL1xcbiggKikvKTtcbiAgICBjb25zdCBmaXJzdCA9IHNwbGl0WzBdO1xuICAgIGNvbnN0IG0gPSBmaXJzdC5tYXRjaCgvXiggKikvKTtcbiAgICBjb25zdCBsaW5lMCA9IG0/LlsxXVxuICAgICAgICA/IFttWzFdLCBmaXJzdC5zbGljZShtWzFdLmxlbmd0aCldXG4gICAgICAgIDogWycnLCBmaXJzdF07XG4gICAgY29uc3QgbGluZXMgPSBbbGluZTBdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc3BsaXQubGVuZ3RoOyBpICs9IDIpXG4gICAgICAgIGxpbmVzLnB1c2goW3NwbGl0W2ldLCBzcGxpdFtpICsgMV1dKTtcbiAgICByZXR1cm4gbGluZXM7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVCbG9ja1NjYWxhciB9O1xuIiwiaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZVByb3BzIH0gZnJvbSAnLi9yZXNvbHZlLXByb3BzLmpzJztcbmltcG9ydCB7IGZsb3dJbmRlbnRDaGVjayB9IGZyb20gJy4vdXRpbC1mbG93LWluZGVudC1jaGVjay5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVCbG9ja1NlcSh7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH0sIGN0eCwgYnMsIG9uRXJyb3IsIHRhZykge1xuICAgIGNvbnN0IE5vZGVDbGFzcyA9IHRhZz8ubm9kZUNsYXNzID8/IFlBTUxTZXE7XG4gICAgY29uc3Qgc2VxID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBpZiAoY3R4LmF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBicy5vZmZzZXQ7XG4gICAgbGV0IGNvbW1lbnRFbmQgPSBudWxsO1xuICAgIGZvciAoY29uc3QgeyBzdGFydCwgdmFsdWUgfSBvZiBicy5pdGVtcykge1xuICAgICAgICBjb25zdCBwcm9wcyA9IHJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnc2VxLWl0ZW0taW5kJyxcbiAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYnMuaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5hbmNob3IgfHwgcHJvcHMudGFnIHx8IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLnR5cGUgPT09ICdibG9jay1zZXEnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmVuZCwgJ0JBRF9JTkRFTlQnLCAnQWxsIHNlcXVlbmNlIGl0ZW1zIG11c3Qgc3RhcnQgYXQgdGhlIHNhbWUgY29sdW1uJyk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdTZXF1ZW5jZSBpdGVtIHdpdGhvdXQgLSBpbmRpY2F0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbW1lbnRFbmQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5jb21tZW50ID0gcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBub2RlID0gdmFsdWVcbiAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgIGZsb3dJbmRlbnRDaGVjayhicy5pbmRlbnQsIHZhbHVlLCBvbkVycm9yKTtcbiAgICAgICAgb2Zmc2V0ID0gbm9kZS5yYW5nZVsyXTtcbiAgICAgICAgc2VxLml0ZW1zLnB1c2gobm9kZSk7XG4gICAgfVxuICAgIHNlcS5yYW5nZSA9IFticy5vZmZzZXQsIG9mZnNldCwgY29tbWVudEVuZCA/PyBvZmZzZXRdO1xuICAgIHJldHVybiBzZXE7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVCbG9ja1NlcSB9O1xuIiwiZnVuY3Rpb24gcmVzb2x2ZUVuZChlbmQsIG9mZnNldCwgcmVxU3BhY2UsIG9uRXJyb3IpIHtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGlmIChlbmQpIHtcbiAgICAgICAgbGV0IGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgIGxldCBzZXAgPSAnJztcbiAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiBlbmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgc291cmNlLCB0eXBlIH0gPSB0b2tlbjtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50Jzoge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVxU3BhY2UgJiYgIWhhc1NwYWNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gc291cmNlLnN1YnN0cmluZygxKSB8fCAnICc7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjYjtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSBzZXAgKyBjYjtcbiAgICAgICAgICAgICAgICAgICAgc2VwID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXAgKz0gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0eXBlfSBhdCBub2RlIGVuZGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgY29tbWVudCwgb2Zmc2V0IH07XG59XG5cbmV4cG9ydCB7IHJlc29sdmVFbmQgfTtcbiIsImltcG9ydCB7IGlzUGFpciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIgfSBmcm9tICcuLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IFlBTUxNYXAgfSBmcm9tICcuLi9ub2Rlcy9ZQU1MTWFwLmpzJztcbmltcG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuLi9ub2Rlcy9ZQU1MU2VxLmpzJztcbmltcG9ydCB7IHJlc29sdmVFbmQgfSBmcm9tICcuL3Jlc29sdmUtZW5kLmpzJztcbmltcG9ydCB7IHJlc29sdmVQcm9wcyB9IGZyb20gJy4vcmVzb2x2ZS1wcm9wcy5qcyc7XG5pbXBvcnQgeyBjb250YWluc05ld2xpbmUgfSBmcm9tICcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcyc7XG5pbXBvcnQgeyBtYXBJbmNsdWRlcyB9IGZyb20gJy4vdXRpbC1tYXAtaW5jbHVkZXMuanMnO1xuXG5jb25zdCBibG9ja01zZyA9ICdCbG9jayBjb2xsZWN0aW9ucyBhcmUgbm90IGFsbG93ZWQgd2l0aGluIGZsb3cgY29sbGVjdGlvbnMnO1xuY29uc3QgaXNCbG9jayA9ICh0b2tlbikgPT4gdG9rZW4gJiYgKHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnIHx8IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnKTtcbmZ1bmN0aW9uIHJlc29sdmVGbG93Q29sbGVjdGlvbih7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH0sIGN0eCwgZmMsIG9uRXJyb3IsIHRhZykge1xuICAgIGNvbnN0IGlzTWFwID0gZmMuc3RhcnQuc291cmNlID09PSAneyc7XG4gICAgY29uc3QgZmNOYW1lID0gaXNNYXAgPyAnZmxvdyBtYXAnIDogJ2Zsb3cgc2VxdWVuY2UnO1xuICAgIGNvbnN0IE5vZGVDbGFzcyA9ICh0YWc/Lm5vZGVDbGFzcyA/PyAoaXNNYXAgPyBZQU1MTWFwIDogWUFNTFNlcSkpO1xuICAgIGNvbnN0IGNvbGwgPSBuZXcgTm9kZUNsYXNzKGN0eC5zY2hlbWEpO1xuICAgIGNvbGwuZmxvdyA9IHRydWU7XG4gICAgY29uc3QgYXRSb290ID0gY3R4LmF0Um9vdDtcbiAgICBpZiAoYXRSb290KVxuICAgICAgICBjdHguYXRSb290ID0gZmFsc2U7XG4gICAgbGV0IG9mZnNldCA9IGZjLm9mZnNldCArIGZjLnN0YXJ0LnNvdXJjZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYy5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjb2xsSXRlbSA9IGZjLml0ZW1zW2ldO1xuICAgICAgICBjb25zdCB7IHN0YXJ0LCBrZXksIHNlcCwgdmFsdWUgfSA9IGNvbGxJdGVtO1xuICAgICAgICBjb25zdCBwcm9wcyA9IHJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgZmxvdzogZmNOYW1lLFxuICAgICAgICAgICAgaW5kaWNhdG9yOiAnZXhwbGljaXQta2V5LWluZCcsXG4gICAgICAgICAgICBuZXh0OiBrZXkgPz8gc2VwPy5bMF0sXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmICghcHJvcHMuYW5jaG9yICYmICFwcm9wcy50YWcgJiYgIXNlcCAmJiAhdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5jb21tYSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGkgPCBmYy5pdGVtcy5sZW5ndGggLSAxKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLnN0YXJ0LCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkIGVtcHR5IGl0ZW0gaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGwuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCArPSAnXFxuJyArIHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCA9IHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNNYXAgJiYgY3R4Lm9wdGlvbnMuc3RyaWN0ICYmIGNvbnRhaW5zTmV3bGluZShrZXkpKVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5LCAvLyBjaGVja2VkIGJ5IGNvbnRhaW5zTmV3bGluZSgpXG4gICAgICAgICAgICAgICAgJ01VTFRJTElORV9JTVBMSUNJVF9LRVknLCAnSW1wbGljaXQga2V5cyBvZiBmbG93IHNlcXVlbmNlIHBhaXJzIG5lZWQgdG8gYmUgb24gYSBzaW5nbGUgbGluZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMuY29tbWEpXG4gICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5jb21tYSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7ZmNOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLnN0YXJ0LCAnTUlTU0lOR19DSEFSJywgYE1pc3NpbmcgLCBiZXR3ZWVuICR7ZmNOYW1lfSBpdGVtc2ApO1xuICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJldkl0ZW1Db21tZW50ID0gJyc7XG4gICAgICAgICAgICAgICAgbG9vcDogZm9yIChjb25zdCBzdCBvZiBzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZJdGVtQ29tbWVudCA9IHN0LnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHJldkl0ZW1Db21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcmV2ID0gY29sbC5pdGVtc1tjb2xsLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQYWlyKHByZXYpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IHByZXYudmFsdWUgPz8gcHJldi5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2LmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2LmNvbW1lbnQgKz0gJ1xcbicgKyBwcmV2SXRlbUNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYuY29tbWVudCA9IHByZXZJdGVtQ29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuY29tbWVudCA9IHByb3BzLmNvbW1lbnQuc3Vic3RyaW5nKHByZXZJdGVtQ29tbWVudC5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc01hcCAmJiAhc2VwICYmICFwcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgLy8gaXRlbSBpcyBhIHZhbHVlIGluIGEgc2VxXG4gICAgICAgICAgICAvLyDihpIga2V5ICYgc2VwIGFyZSBlbXB0eSwgc3RhcnQgZG9lcyBub3QgaW5jbHVkZSA/IG9yIDpcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlTm9kZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHNlcCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgY29sbC5pdGVtcy5wdXNoKHZhbHVlTm9kZSk7XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUucmFuZ2VbMl07XG4gICAgICAgICAgICBpZiAoaXNCbG9jayh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gaXRlbSBpcyBhIGtleSt2YWx1ZSBwYWlyXG4gICAgICAgICAgICAvLyBrZXkgdmFsdWVcbiAgICAgICAgICAgIGNvbnN0IGtleVN0YXJ0ID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgY29uc3Qga2V5Tm9kZSA9IGtleVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCBrZXksIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIGtleVN0YXJ0LCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGlzQmxvY2soa2V5KSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICAgICAgLy8gdmFsdWUgcHJvcGVydGllc1xuICAgICAgICAgICAgY29uc3QgdmFsdWVQcm9wcyA9IHJlc29sdmVQcm9wcyhzZXAgPz8gW10sIHtcbiAgICAgICAgICAgICAgICBmbG93OiBmY05hbWUsXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAnbWFwLXZhbHVlLWluZCcsXG4gICAgICAgICAgICAgICAgbmV4dDogdmFsdWUsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBrZXlOb2RlLnJhbmdlWzJdLFxuICAgICAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgcGFyZW50SW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc01hcCAmJiAhcHJvcHMuZm91bmQgJiYgY3R4Lm9wdGlvbnMuc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdCA9PT0gdmFsdWVQcm9wcy5mb3VuZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHN0LCAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG9mIGZsb3cgc2VxdWVuY2UgcGFpcnMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BzLnN0YXJ0IDwgdmFsdWVQcm9wcy5mb3VuZC5vZmZzZXQgLSAxMDI0KVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZVByb3BzLmZvdW5kLCAnS0VZX09WRVJfMTAyNF9DSEFSUycsICdUaGUgOiBpbmRpY2F0b3IgbXVzdCBiZSBhdCBtb3N0IDEwMjQgY2hhcnMgYWZ0ZXIgdGhlIHN0YXJ0IG9mIGFuIGltcGxpY2l0IGZsb3cgc2VxdWVuY2Uga2V5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3NvdXJjZScgaW4gdmFsdWUgJiYgdmFsdWUuc291cmNlICYmIHZhbHVlLnNvdXJjZVswXSA9PT0gJzonKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlLCAnTUlTU0lOR19DSEFSJywgYE1pc3Npbmcgc3BhY2UgYWZ0ZXIgOiBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVQcm9wcy5zdGFydCwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nICwgb3IgOiBiZXR3ZWVuICR7ZmNOYW1lfSBpdGVtc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdmFsdWUgdmFsdWVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlTm9kZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogdmFsdWVQcm9wcy5mb3VuZFxuICAgICAgICAgICAgICAgICAgICA/IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCB2YWx1ZVByb3BzLmVuZCwgc2VwLCBudWxsLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgICAgICBpZiAodmFsdWVOb2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQmxvY2sodmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlTm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5Tm9kZS5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgKz0gJ1xcbicgKyB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgPSB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIoa2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIGlmIChpc01hcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IGNvbGw7XG4gICAgICAgICAgICAgICAgaWYgKG1hcEluY2x1ZGVzKGN0eCwgbWFwLml0ZW1zLCBrZXlOb2RlKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihrZXlTdGFydCwgJ0RVUExJQ0FURV9LRVknLCAnTWFwIGtleXMgbXVzdCBiZSB1bmlxdWUnKTtcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IG5ldyBZQU1MTWFwKGN0eC5zY2hlbWEpO1xuICAgICAgICAgICAgICAgIG1hcC5mbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgICAgICAgICBjb2xsLml0ZW1zLnB1c2gobWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZSA/IHZhbHVlTm9kZS5yYW5nZVsyXSA6IHZhbHVlUHJvcHMuZW5kO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGV4cGVjdGVkRW5kID0gaXNNYXAgPyAnfScgOiAnXSc7XG4gICAgY29uc3QgW2NlLCAuLi5lZV0gPSBmYy5lbmQ7XG4gICAgbGV0IGNlUG9zID0gb2Zmc2V0O1xuICAgIGlmIChjZSAmJiBjZS5zb3VyY2UgPT09IGV4cGVjdGVkRW5kKVxuICAgICAgICBjZVBvcyA9IGNlLm9mZnNldCArIGNlLnNvdXJjZS5sZW5ndGg7XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBmY05hbWVbMF0udG9VcHBlckNhc2UoKSArIGZjTmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGNvbnN0IG1zZyA9IGF0Um9vdFxuICAgICAgICAgICAgPyBgJHtuYW1lfSBtdXN0IGVuZCB3aXRoIGEgJHtleHBlY3RlZEVuZH1gXG4gICAgICAgICAgICA6IGAke25hbWV9IGluIGJsb2NrIGNvbGxlY3Rpb24gbXVzdCBiZSBzdWZmaWNpZW50bHkgaW5kZW50ZWQgYW5kIGVuZCB3aXRoIGEgJHtleHBlY3RlZEVuZH1gO1xuICAgICAgICBvbkVycm9yKG9mZnNldCwgYXRSb290ID8gJ01JU1NJTkdfQ0hBUicgOiAnQkFEX0lOREVOVCcsIG1zZyk7XG4gICAgICAgIGlmIChjZSAmJiBjZS5zb3VyY2UubGVuZ3RoICE9PSAxKVxuICAgICAgICAgICAgZWUudW5zaGlmdChjZSk7XG4gICAgfVxuICAgIGlmIChlZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IHJlc29sdmVFbmQoZWUsIGNlUG9zLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoZW5kLmNvbW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChjb2xsLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29sbC5jb21tZW50ICs9ICdcXG4nICsgZW5kLmNvbW1lbnQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29sbC5jb21tZW50ID0gZW5kLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29sbC5yYW5nZSA9IFtmYy5vZmZzZXQsIGNlUG9zLCBlbmQub2Zmc2V0XTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbGwucmFuZ2UgPSBbZmMub2Zmc2V0LCBjZVBvcywgY2VQb3NdO1xuICAgIH1cbiAgICByZXR1cm4gY29sbDtcbn1cblxuZXhwb3J0IHsgcmVzb2x2ZUZsb3dDb2xsZWN0aW9uIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUVuZCB9IGZyb20gJy4vcmVzb2x2ZS1lbmQuanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlRmxvd1NjYWxhcihzY2FsYXIsIHN0cmljdCwgb25FcnJvcikge1xuICAgIGNvbnN0IHsgb2Zmc2V0LCB0eXBlLCBzb3VyY2UsIGVuZCB9ID0gc2NhbGFyO1xuICAgIGxldCBfdHlwZTtcbiAgICBsZXQgdmFsdWU7XG4gICAgY29uc3QgX29uRXJyb3IgPSAocmVsLCBjb2RlLCBtc2cpID0+IG9uRXJyb3Iob2Zmc2V0ICsgcmVsLCBjb2RlLCBtc2cpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuUExBSU47XG4gICAgICAgICAgICB2YWx1ZSA9IHBsYWluVmFsdWUoc291cmNlLCBfb25FcnJvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuUVVPVEVfU0lOR0xFO1xuICAgICAgICAgICAgdmFsdWUgPSBzaW5nbGVRdW90ZWRWYWx1ZShzb3VyY2UsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBfdHlwZSA9IFNjYWxhci5RVU9URV9ET1VCTEU7XG4gICAgICAgICAgICB2YWx1ZSA9IGRvdWJsZVF1b3RlZFZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBvbkVycm9yKHNjYWxhciwgJ1VORVhQRUNURURfVE9LRU4nLCBgRXhwZWN0ZWQgYSBmbG93IHNjYWxhciB2YWx1ZSwgYnV0IGZvdW5kOiAke3R5cGV9YCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvbW1lbnQ6ICcnLFxuICAgICAgICAgICAgICAgIHJhbmdlOiBbb2Zmc2V0LCBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoLCBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoXVxuICAgICAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWVFbmQgPSBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgIGNvbnN0IHJlID0gcmVzb2x2ZUVuZChlbmQsIHZhbHVlRW5kLCBzdHJpY3QsIG9uRXJyb3IpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlLFxuICAgICAgICB0eXBlOiBfdHlwZSxcbiAgICAgICAgY29tbWVudDogcmUuY29tbWVudCxcbiAgICAgICAgcmFuZ2U6IFtvZmZzZXQsIHZhbHVlRW5kLCByZS5vZmZzZXRdXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHBsYWluVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgbGV0IGJhZENoYXIgPSAnJztcbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdhIHRhYiBjaGFyYWN0ZXInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdmbG93IGluZGljYXRvciBjaGFyYWN0ZXIgLCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2RpcmVjdGl2ZSBpbmRpY2F0b3IgY2hhcmFjdGVyICUnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+Jzoge1xuICAgICAgICAgICAgYmFkQ2hhciA9IGBibG9jayBzY2FsYXIgaW5kaWNhdG9yICR7c291cmNlWzBdfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgY2FzZSAnYCc6IHtcbiAgICAgICAgICAgIGJhZENoYXIgPSBgcmVzZXJ2ZWQgY2hhcmFjdGVyICR7c291cmNlWzBdfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmFkQ2hhcilcbiAgICAgICAgb25FcnJvcigwLCAnQkFEX1NDQUxBUl9TVEFSVCcsIGBQbGFpbiB2YWx1ZSBjYW5ub3Qgc3RhcnQgd2l0aCAke2JhZENoYXJ9YCk7XG4gICAgcmV0dXJuIGZvbGRMaW5lcyhzb3VyY2UpO1xufVxuZnVuY3Rpb24gc2luZ2xlUXVvdGVkVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09IFwiJ1wiIHx8IHNvdXJjZS5sZW5ndGggPT09IDEpXG4gICAgICAgIG9uRXJyb3Ioc291cmNlLmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsIFwiTWlzc2luZyBjbG9zaW5nICdxdW90ZVwiKTtcbiAgICByZXR1cm4gZm9sZExpbmVzKHNvdXJjZS5zbGljZSgxLCAtMSkpLnJlcGxhY2UoLycnL2csIFwiJ1wiKTtcbn1cbmZ1bmN0aW9uIGZvbGRMaW5lcyhzb3VyY2UpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgbmVnYXRpdmUgbG9va2JlaGluZCBoZXJlIGFuZCBpbiB0aGUgYHJlYCBSZWdFeHAgaXMgdG9cbiAgICAgKiBwcmV2ZW50IGNhdXNpbmcgYSBwb2x5bm9taWFsIHNlYXJjaCB0aW1lIGluIGNlcnRhaW4gY2FzZXMuXG4gICAgICpcbiAgICAgKiBUaGUgdHJ5LWNhdGNoIGlzIGZvciBTYWZhcmksIHdoaWNoIGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHlldDpcbiAgICAgKiBodHRwczovL2Nhbml1c2UuY29tL2pzLXJlZ2V4cC1sb29rYmVoaW5kXG4gICAgICovXG4gICAgbGV0IGZpcnN0LCBsaW5lO1xuICAgIHRyeSB7XG4gICAgICAgIGZpcnN0ID0gbmV3IFJlZ0V4cCgnKC4qPykoPzwhWyBcXHRdKVsgXFx0XSpcXHI/XFxuJywgJ3N5Jyk7XG4gICAgICAgIGxpbmUgPSBuZXcgUmVnRXhwKCdbIFxcdF0qKC4qPykoPzooPzwhWyBcXHRdKVsgXFx0XSopP1xccj9cXG4nLCAnc3knKTtcbiAgICB9XG4gICAgY2F0Y2ggKF8pIHtcbiAgICAgICAgZmlyc3QgPSAvKC4qPylbIFxcdF0qXFxyP1xcbi9zeTtcbiAgICAgICAgbGluZSA9IC9bIFxcdF0qKC4qPylbIFxcdF0qXFxyP1xcbi9zeTtcbiAgICB9XG4gICAgbGV0IG1hdGNoID0gZmlyc3QuZXhlYyhzb3VyY2UpO1xuICAgIGlmICghbWF0Y2gpXG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgbGV0IHJlcyA9IG1hdGNoWzFdO1xuICAgIGxldCBzZXAgPSAnICc7XG4gICAgbGV0IHBvcyA9IGZpcnN0Lmxhc3RJbmRleDtcbiAgICBsaW5lLmxhc3RJbmRleCA9IHBvcztcbiAgICB3aGlsZSAoKG1hdGNoID0gbGluZS5leGVjKHNvdXJjZSkpKSB7XG4gICAgICAgIGlmIChtYXRjaFsxXSA9PT0gJycpIHtcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzZXA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXMgKz0gc2VwICsgbWF0Y2hbMV07XG4gICAgICAgICAgICBzZXAgPSAnICc7XG4gICAgICAgIH1cbiAgICAgICAgcG9zID0gbGluZS5sYXN0SW5kZXg7XG4gICAgfVxuICAgIGNvbnN0IGxhc3QgPSAvWyBcXHRdKiguKikvc3k7XG4gICAgbGFzdC5sYXN0SW5kZXggPSBwb3M7XG4gICAgbWF0Y2ggPSBsYXN0LmV4ZWMoc291cmNlKTtcbiAgICByZXR1cm4gcmVzICsgc2VwICsgKG1hdGNoPy5bMV0gPz8gJycpO1xufVxuZnVuY3Rpb24gZG91YmxlUXVvdGVkVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgbGV0IHJlcyA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc291cmNlLmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgICBjb25zdCBjaCA9IHNvdXJjZVtpXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDFdID09PSAnXFxuJylcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZvbGQsIG9mZnNldCB9ID0gZm9sZE5ld2xpbmUoc291cmNlLCBpKTtcbiAgICAgICAgICAgIHJlcyArPSBmb2xkO1xuICAgICAgICAgICAgaSA9IG9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNvdXJjZVsrK2ldO1xuICAgICAgICAgICAgY29uc3QgY2MgPSBlc2NhcGVDb2Rlc1tuZXh0XTtcbiAgICAgICAgICAgIGlmIChjYylcbiAgICAgICAgICAgICAgICByZXMgKz0gY2M7XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlZCBuZXdsaW5lcywgYnV0IHN0aWxsIHRyaW0gdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVtpICsgMV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICdcXHInICYmIHNvdXJjZVtpICsgMV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgLy8gc2tpcCBlc2NhcGVkIENSTEYgbmV3bGluZXMsIGJ1dCBzdGlsbCB0cmltIHRoZSBmb2xsb3dpbmcgbGluZVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICd4JyB8fCBuZXh0ID09PSAndScgfHwgbmV4dCA9PT0gJ1UnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0geyB4OiAyLCB1OiA0LCBVOiA4IH1bbmV4dF07XG4gICAgICAgICAgICAgICAgcmVzICs9IHBhcnNlQ2hhckNvZGUoc291cmNlLCBpICsgMSwgbGVuZ3RoLCBvbkVycm9yKTtcbiAgICAgICAgICAgICAgICBpICs9IGxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IHNvdXJjZS5zdWJzdHIoaSAtIDEsIDIpO1xuICAgICAgICAgICAgICAgIG9uRXJyb3IoaSAtIDEsICdCQURfRFFfRVNDQVBFJywgYEludmFsaWQgZXNjYXBlIHNlcXVlbmNlICR7cmF3fWApO1xuICAgICAgICAgICAgICAgIHJlcyArPSByYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIC8vIHRyaW0gdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAgICAgY29uc3Qgd3NTdGFydCA9IGk7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNvdXJjZVtpICsgMV07XG4gICAgICAgICAgICB3aGlsZSAobmV4dCA9PT0gJyAnIHx8IG5leHQgPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICBpZiAobmV4dCAhPT0gJ1xcbicgJiYgIShuZXh0ID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDJdID09PSAnXFxuJykpXG4gICAgICAgICAgICAgICAgcmVzICs9IGkgPiB3c1N0YXJ0ID8gc291cmNlLnNsaWNlKHdzU3RhcnQsIGkgKyAxKSA6IGNoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzICs9IGNoO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzb3VyY2Vbc291cmNlLmxlbmd0aCAtIDFdICE9PSAnXCInIHx8IHNvdXJjZS5sZW5ndGggPT09IDEpXG4gICAgICAgIG9uRXJyb3Ioc291cmNlLmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsICdNaXNzaW5nIGNsb3NpbmcgXCJxdW90ZScpO1xuICAgIHJldHVybiByZXM7XG59XG4vKipcbiAqIEZvbGQgYSBzaW5nbGUgbmV3bGluZSBpbnRvIGEgc3BhY2UsIG11bHRpcGxlIG5ld2xpbmVzIHRvIE4gLSAxIG5ld2xpbmVzLlxuICogUHJlc3VtZXMgYHNvdXJjZVtvZmZzZXRdID09PSAnXFxuJ2BcbiAqL1xuZnVuY3Rpb24gZm9sZE5ld2xpbmUoc291cmNlLCBvZmZzZXQpIHtcbiAgICBsZXQgZm9sZCA9ICcnO1xuICAgIGxldCBjaCA9IHNvdXJjZVtvZmZzZXQgKyAxXTtcbiAgICB3aGlsZSAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcgfHwgY2ggPT09ICdcXG4nIHx8IGNoID09PSAnXFxyJykge1xuICAgICAgICBpZiAoY2ggPT09ICdcXHInICYmIHNvdXJjZVtvZmZzZXQgKyAyXSAhPT0gJ1xcbicpXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIGZvbGQgKz0gJ1xcbic7XG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgICAgICBjaCA9IHNvdXJjZVtvZmZzZXQgKyAxXTtcbiAgICB9XG4gICAgaWYgKCFmb2xkKVxuICAgICAgICBmb2xkID0gJyAnO1xuICAgIHJldHVybiB7IGZvbGQsIG9mZnNldCB9O1xufVxuY29uc3QgZXNjYXBlQ29kZXMgPSB7XG4gICAgJzAnOiAnXFwwJywgLy8gbnVsbCBjaGFyYWN0ZXJcbiAgICBhOiAnXFx4MDcnLCAvLyBiZWxsIGNoYXJhY3RlclxuICAgIGI6ICdcXGInLCAvLyBiYWNrc3BhY2VcbiAgICBlOiAnXFx4MWInLCAvLyBlc2NhcGUgY2hhcmFjdGVyXG4gICAgZjogJ1xcZicsIC8vIGZvcm0gZmVlZFxuICAgIG46ICdcXG4nLCAvLyBsaW5lIGZlZWRcbiAgICByOiAnXFxyJywgLy8gY2FycmlhZ2UgcmV0dXJuXG4gICAgdDogJ1xcdCcsIC8vIGhvcml6b250YWwgdGFiXG4gICAgdjogJ1xcdicsIC8vIHZlcnRpY2FsIHRhYlxuICAgIE46ICdcXHUwMDg1JywgLy8gVW5pY29kZSBuZXh0IGxpbmVcbiAgICBfOiAnXFx1MDBhMCcsIC8vIFVuaWNvZGUgbm9uLWJyZWFraW5nIHNwYWNlXG4gICAgTDogJ1xcdTIwMjgnLCAvLyBVbmljb2RlIGxpbmUgc2VwYXJhdG9yXG4gICAgUDogJ1xcdTIwMjknLCAvLyBVbmljb2RlIHBhcmFncmFwaCBzZXBhcmF0b3JcbiAgICAnICc6ICcgJyxcbiAgICAnXCInOiAnXCInLFxuICAgICcvJzogJy8nLFxuICAgICdcXFxcJzogJ1xcXFwnLFxuICAgICdcXHQnOiAnXFx0J1xufTtcbmZ1bmN0aW9uIHBhcnNlQ2hhckNvZGUoc291cmNlLCBvZmZzZXQsIGxlbmd0aCwgb25FcnJvcikge1xuICAgIGNvbnN0IGNjID0gc291cmNlLnN1YnN0cihvZmZzZXQsIGxlbmd0aCk7XG4gICAgY29uc3Qgb2sgPSBjYy5sZW5ndGggPT09IGxlbmd0aCAmJiAvXlswLTlhLWZBLUZdKyQvLnRlc3QoY2MpO1xuICAgIGNvbnN0IGNvZGUgPSBvayA/IHBhcnNlSW50KGNjLCAxNikgOiBOYU47XG4gICAgaWYgKGlzTmFOKGNvZGUpKSB7XG4gICAgICAgIGNvbnN0IHJhdyA9IHNvdXJjZS5zdWJzdHIob2Zmc2V0IC0gMiwgbGVuZ3RoICsgMik7XG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0IC0gMiwgJ0JBRF9EUV9FU0NBUEUnLCBgSW52YWxpZCBlc2NhcGUgc2VxdWVuY2UgJHtyYXd9YCk7XG4gICAgICAgIHJldHVybiByYXc7XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNvZGVQb2ludChjb2RlKTtcbn1cblxuZXhwb3J0IHsgcmVzb2x2ZUZsb3dTY2FsYXIgfTtcbiIsImZ1bmN0aW9uIHJlc29sdmVQcm9wcyh0b2tlbnMsIHsgZmxvdywgaW5kaWNhdG9yLCBuZXh0LCBvZmZzZXQsIG9uRXJyb3IsIHBhcmVudEluZGVudCwgc3RhcnRPbk5ld2xpbmUgfSkge1xuICAgIGxldCBzcGFjZUJlZm9yZSA9IGZhbHNlO1xuICAgIGxldCBhdE5ld2xpbmUgPSBzdGFydE9uTmV3bGluZTtcbiAgICBsZXQgaGFzU3BhY2UgPSBzdGFydE9uTmV3bGluZTtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGxldCBjb21tZW50U2VwID0gJyc7XG4gICAgbGV0IGhhc05ld2xpbmUgPSBmYWxzZTtcbiAgICBsZXQgcmVxU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgdGFiID0gbnVsbDtcbiAgICBsZXQgYW5jaG9yID0gbnVsbDtcbiAgICBsZXQgdGFnID0gbnVsbDtcbiAgICBsZXQgbmV3bGluZUFmdGVyUHJvcCA9IG51bGw7XG4gICAgbGV0IGNvbW1hID0gbnVsbDtcbiAgICBsZXQgZm91bmQgPSBudWxsO1xuICAgIGxldCBzdGFydCA9IG51bGw7XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgICAgaWYgKHJlcVNwYWNlKSB7XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ3NwYWNlJyAmJlxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgIT09ICduZXdsaW5lJyAmJlxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgIT09ICdjb21tYScpXG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbi5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgICAgICAgICByZXFTcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWIpIHtcbiAgICAgICAgICAgIGlmIChhdE5ld2xpbmUgJiYgdG9rZW4udHlwZSAhPT0gJ2NvbW1lbnQnICYmIHRva2VuLnR5cGUgIT09ICduZXdsaW5lJykge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodGFiLCAnVEFCX0FTX0lOREVOVCcsICdUYWJzIGFyZSBub3QgYWxsb3dlZCBhcyBpbmRlbnRhdGlvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFiID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAvLyBBdCB0aGUgZG9jIGxldmVsLCB0YWJzIGF0IGxpbmUgc3RhcnQgbWF5IGJlIHBhcnNlZFxuICAgICAgICAgICAgICAgIC8vIGFzIGxlYWRpbmcgd2hpdGUgc3BhY2UgcmF0aGVyIHRoYW4gaW5kZW50YXRpb24uXG4gICAgICAgICAgICAgICAgLy8gSW4gYSBmbG93IGNvbGxlY3Rpb24sIG9ubHkgdGhlIHBhcnNlciBoYW5kbGVzIGluZGVudC5cbiAgICAgICAgICAgICAgICBpZiAoIWZsb3cgJiZcbiAgICAgICAgICAgICAgICAgICAgKGluZGljYXRvciAhPT0gJ2RvYy1zdGFydCcgfHwgbmV4dD8udHlwZSAhPT0gJ2Zsb3ctY29sbGVjdGlvbicpICYmXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLnNvdXJjZS5pbmNsdWRlcygnXFx0JykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFiID0gdG9rZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSB0b2tlbi5zb3VyY2Uuc3Vic3RyaW5nKDEpIHx8ICcgJztcbiAgICAgICAgICAgICAgICBpZiAoIWNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjYjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gY29tbWVudFNlcCArIGNiO1xuICAgICAgICAgICAgICAgIGNvbW1lbnRTZXAgPSAnJztcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGlmIChhdE5ld2xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ICs9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhY2VCZWZvcmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnRTZXAgKz0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaGFzTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgICAgIG5ld2xpbmVBZnRlclByb3AgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGlmIChhbmNob3IpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNVUxUSVBMRV9BTkNIT1JTJywgJ0Egbm9kZSBjYW4gaGF2ZSBhdCBtb3N0IG9uZSBhbmNob3InKTtcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uc291cmNlLmVuZHNXaXRoKCc6JykpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4ub2Zmc2V0ICsgdG9rZW4uc291cmNlLmxlbmd0aCAtIDEsICdCQURfQUxJQVMnLCAnQW5jaG9yIGVuZGluZyBpbiA6IGlzIGFtYmlndW91cycsIHRydWUpO1xuICAgICAgICAgICAgICAgIGFuY2hvciA9IHRva2VuO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydCA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSB0b2tlbi5vZmZzZXQ7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXFTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0YWcnOiB7XG4gICAgICAgICAgICAgICAgaWYgKHRhZylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01VTFRJUExFX1RBR1MnLCAnQSBub2RlIGNhbiBoYXZlIGF0IG1vc3Qgb25lIHRhZycpO1xuICAgICAgICAgICAgICAgIHRhZyA9IHRva2VuO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydCA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSB0b2tlbi5vZmZzZXQ7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXFTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGluZGljYXRvcjpcbiAgICAgICAgICAgICAgICAvLyBDb3VsZCBoZXJlIGhhbmRsZSBwcmVjZWRpbmcgY29tbWVudHMgZGlmZmVyZW50bHlcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yIHx8IHRhZylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ0JBRF9QUk9QX09SREVSJywgYEFuY2hvcnMgYW5kIHRhZ3MgbXVzdCBiZSBhZnRlciB0aGUgJHt0b2tlbi5zb3VyY2V9IGluZGljYXRvcmApO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAke3Rva2VuLnNvdXJjZX0gaW4gJHtmbG93ID8/ICdjb2xsZWN0aW9uJ31gKTtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRva2VuO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9XG4gICAgICAgICAgICAgICAgICAgIGluZGljYXRvciA9PT0gJ3NlcS1pdGVtLWluZCcgfHwgaW5kaWNhdG9yID09PSAnZXhwbGljaXQta2V5LWluZCc7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgICAgICBpZiAoZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWEpXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmbG93fWApO1xuICAgICAgICAgICAgICAgICAgICBjb21tYSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZWxzZSBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dG9rZW4udHlwZX0gdG9rZW5gKTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxhc3QgPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGVuZCA9IGxhc3QgPyBsYXN0Lm9mZnNldCArIGxhc3Quc291cmNlLmxlbmd0aCA6IG9mZnNldDtcbiAgICBpZiAocmVxU3BhY2UgJiZcbiAgICAgICAgbmV4dCAmJlxuICAgICAgICBuZXh0LnR5cGUgIT09ICdzcGFjZScgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnbmV3bGluZScgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnY29tbWEnICYmXG4gICAgICAgIChuZXh0LnR5cGUgIT09ICdzY2FsYXInIHx8IG5leHQuc291cmNlICE9PSAnJykpIHtcbiAgICAgICAgb25FcnJvcihuZXh0Lm9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdUYWdzIGFuZCBhbmNob3JzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gdGhlIG5leHQgdG9rZW4gYnkgd2hpdGUgc3BhY2UnKTtcbiAgICB9XG4gICAgaWYgKHRhYiAmJlxuICAgICAgICAoKGF0TmV3bGluZSAmJiB0YWIuaW5kZW50IDw9IHBhcmVudEluZGVudCkgfHxcbiAgICAgICAgICAgIG5leHQ/LnR5cGUgPT09ICdibG9jay1tYXAnIHx8XG4gICAgICAgICAgICBuZXh0Py50eXBlID09PSAnYmxvY2stc2VxJykpXG4gICAgICAgIG9uRXJyb3IodGFiLCAnVEFCX0FTX0lOREVOVCcsICdUYWJzIGFyZSBub3QgYWxsb3dlZCBhcyBpbmRlbnRhdGlvbicpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1hLFxuICAgICAgICBmb3VuZCxcbiAgICAgICAgc3BhY2VCZWZvcmUsXG4gICAgICAgIGNvbW1lbnQsXG4gICAgICAgIGhhc05ld2xpbmUsXG4gICAgICAgIGFuY2hvcixcbiAgICAgICAgdGFnLFxuICAgICAgICBuZXdsaW5lQWZ0ZXJQcm9wLFxuICAgICAgICBlbmQsXG4gICAgICAgIHN0YXJ0OiBzdGFydCA/PyBlbmRcbiAgICB9O1xufVxuXG5leHBvcnQgeyByZXNvbHZlUHJvcHMgfTtcbiIsImZ1bmN0aW9uIGNvbnRhaW5zTmV3bGluZShrZXkpIHtcbiAgICBpZiAoIWtleSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgc3dpdGNoIChrZXkudHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgaWYgKGtleS5zb3VyY2UuaW5jbHVkZXMoJ1xcbicpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgaWYgKGtleS5lbmQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBrZXkuZW5kKVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIGtleS5pdGVtcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgaXQuc3RhcnQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5zTmV3bGluZShpdC5rZXkpIHx8IGNvbnRhaW5zTmV3bGluZShpdC52YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5leHBvcnQgeyBjb250YWluc05ld2xpbmUgfTtcbiIsImZ1bmN0aW9uIGVtcHR5U2NhbGFyUG9zaXRpb24ob2Zmc2V0LCBiZWZvcmUsIHBvcykge1xuICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgaWYgKHBvcyA9PT0gbnVsbClcbiAgICAgICAgICAgIHBvcyA9IGJlZm9yZS5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSBwb3MgLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgbGV0IHN0ID0gYmVmb3JlW2ldO1xuICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gc3Quc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUZWNobmljYWxseSwgYW4gZW1wdHkgc2NhbGFyIGlzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBsYXN0IG5vbi1lbXB0eVxuICAgICAgICAgICAgLy8gbm9kZSwgYnV0IGl0J3MgbW9yZSB1c2VmdWwgdG8gcGxhY2UgaXQgYWZ0ZXIgYW55IHdoaXRlc3BhY2UuXG4gICAgICAgICAgICBzdCA9IGJlZm9yZVsrK2ldO1xuICAgICAgICAgICAgd2hpbGUgKHN0Py50eXBlID09PSAnc3BhY2UnKSB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHN0LnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgc3QgPSBiZWZvcmVbKytpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG59XG5cbmV4cG9ydCB7IGVtcHR5U2NhbGFyUG9zaXRpb24gfTtcbiIsImltcG9ydCB7IGNvbnRhaW5zTmV3bGluZSB9IGZyb20gJy4vdXRpbC1jb250YWlucy1uZXdsaW5lLmpzJztcblxuZnVuY3Rpb24gZmxvd0luZGVudENoZWNrKGluZGVudCwgZmMsIG9uRXJyb3IpIHtcbiAgICBpZiAoZmM/LnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IGZjLmVuZFswXTtcbiAgICAgICAgaWYgKGVuZC5pbmRlbnQgPT09IGluZGVudCAmJlxuICAgICAgICAgICAgKGVuZC5zb3VyY2UgPT09ICddJyB8fCBlbmQuc291cmNlID09PSAnfScpICYmXG4gICAgICAgICAgICBjb250YWluc05ld2xpbmUoZmMpKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnRmxvdyBlbmQgaW5kaWNhdG9yIHNob3VsZCBiZSBtb3JlIGluZGVudGVkIHRoYW4gcGFyZW50JztcbiAgICAgICAgICAgIG9uRXJyb3IoZW5kLCAnQkFEX0lOREVOVCcsIG1zZywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IGZsb3dJbmRlbnRDaGVjayB9O1xuIiwiaW1wb3J0IHsgaXNTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5cbmZ1bmN0aW9uIG1hcEluY2x1ZGVzKGN0eCwgaXRlbXMsIHNlYXJjaCkge1xuICAgIGNvbnN0IHsgdW5pcXVlS2V5cyB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgaWYgKHVuaXF1ZUtleXMgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaXNFcXVhbCA9IHR5cGVvZiB1bmlxdWVLZXlzID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gdW5pcXVlS2V5c1xuICAgICAgICA6IChhLCBiKSA9PiBhID09PSBiIHx8XG4gICAgICAgICAgICAoaXNTY2FsYXIoYSkgJiZcbiAgICAgICAgICAgICAgICBpc1NjYWxhcihiKSAmJlxuICAgICAgICAgICAgICAgIGEudmFsdWUgPT09IGIudmFsdWUgJiZcbiAgICAgICAgICAgICAgICAhKGEudmFsdWUgPT09ICc8PCcgJiYgY3R4LnNjaGVtYS5tZXJnZSkpO1xuICAgIHJldHVybiBpdGVtcy5zb21lKHBhaXIgPT4gaXNFcXVhbChwYWlyLmtleSwgc2VhcmNoKSk7XG59XG5cbmV4cG9ydCB7IG1hcEluY2x1ZGVzIH07XG4iLCJpbXBvcnQgeyBBbGlhcyB9IGZyb20gJy4uL25vZGVzL0FsaWFzLmpzJztcbmltcG9ydCB7IGlzRW1wdHlQYXRoLCBjb2xsZWN0aW9uRnJvbVBhdGggfSBmcm9tICcuLi9ub2Rlcy9Db2xsZWN0aW9uLmpzJztcbmltcG9ydCB7IE5PREVfVFlQRSwgRE9DLCBpc05vZGUsIGlzQ29sbGVjdGlvbiwgaXNTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyIH0gZnJvbSAnLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi4vbm9kZXMvdG9KUy5qcyc7XG5pbXBvcnQgeyBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEvU2NoZW1hLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeURvY3VtZW50IH0gZnJvbSAnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeURvY3VtZW50LmpzJztcbmltcG9ydCB7IGFuY2hvck5hbWVzLCBmaW5kTmV3QW5jaG9yLCBjcmVhdGVOb2RlQW5jaG9ycyB9IGZyb20gJy4vYW5jaG9ycy5qcyc7XG5pbXBvcnQgeyBhcHBseVJldml2ZXIgfSBmcm9tICcuL2FwcGx5UmV2aXZlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi9jcmVhdGVOb2RlLmpzJztcbmltcG9ydCB7IERpcmVjdGl2ZXMgfSBmcm9tICcuL2RpcmVjdGl2ZXMuanMnO1xuXG5jbGFzcyBEb2N1bWVudCB7XG4gICAgY29uc3RydWN0b3IodmFsdWUsIHJlcGxhY2VyLCBvcHRpb25zKSB7XG4gICAgICAgIC8qKiBBIGNvbW1lbnQgYmVmb3JlIHRoaXMgRG9jdW1lbnQgKi9cbiAgICAgICAgdGhpcy5jb21tZW50QmVmb3JlID0gbnVsbDtcbiAgICAgICAgLyoqIEEgY29tbWVudCBpbW1lZGlhdGVseSBhZnRlciB0aGlzIERvY3VtZW50ICovXG4gICAgICAgIHRoaXMuY29tbWVudCA9IG51bGw7XG4gICAgICAgIC8qKiBFcnJvcnMgZW5jb3VudGVyZWQgZHVyaW5nIHBhcnNpbmcuICovXG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIC8qKiBXYXJuaW5ncyBlbmNvdW50ZXJlZCBkdXJpbmcgcGFyc2luZy4gKi9cbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgTk9ERV9UWVBFLCB7IHZhbHVlOiBET0MgfSk7XG4gICAgICAgIGxldCBfcmVwbGFjZXIgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nIHx8IEFycmF5LmlzQXJyYXkocmVwbGFjZXIpKSB7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIHJlcGxhY2VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wdCA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgaW50QXNCaWdJbnQ6IGZhbHNlLFxuICAgICAgICAgICAga2VlcFNvdXJjZVRva2VuczogZmFsc2UsXG4gICAgICAgICAgICBsb2dMZXZlbDogJ3dhcm4nLFxuICAgICAgICAgICAgcHJldHR5RXJyb3JzOiB0cnVlLFxuICAgICAgICAgICAgc3RyaWN0OiB0cnVlLFxuICAgICAgICAgICAgdW5pcXVlS2V5czogdHJ1ZSxcbiAgICAgICAgICAgIHZlcnNpb246ICcxLjInXG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHQ7XG4gICAgICAgIGxldCB7IHZlcnNpb24gfSA9IG9wdDtcbiAgICAgICAgaWYgKG9wdGlvbnM/Ll9kaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBvcHRpb25zLl9kaXJlY3RpdmVzLmF0RG9jdW1lbnQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMueWFtbC5leHBsaWNpdClcbiAgICAgICAgICAgICAgICB2ZXJzaW9uID0gdGhpcy5kaXJlY3RpdmVzLnlhbWwudmVyc2lvbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgRGlyZWN0aXZlcyh7IHZlcnNpb24gfSk7XG4gICAgICAgIHRoaXMuc2V0U2NoZW1hKHZlcnNpb24sIG9wdGlvbnMpO1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICB0aGlzLmNvbnRlbnRzID1cbiAgICAgICAgICAgIHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogdGhpcy5jcmVhdGVOb2RlKHZhbHVlLCBfcmVwbGFjZXIsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBkZWVwIGNvcHkgb2YgdGhpcyBEb2N1bWVudCBhbmQgaXRzIGNvbnRlbnRzLlxuICAgICAqXG4gICAgICogQ3VzdG9tIE5vZGUgdmFsdWVzIHRoYXQgaW5oZXJpdCBmcm9tIGBPYmplY3RgIHN0aWxsIHJlZmVyIHRvIHRoZWlyIG9yaWdpbmFsIGluc3RhbmNlcy5cbiAgICAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoRG9jdW1lbnQucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbTk9ERV9UWVBFXTogeyB2YWx1ZTogRE9DIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvcHkuY29tbWVudEJlZm9yZSA9IHRoaXMuY29tbWVudEJlZm9yZTtcbiAgICAgICAgY29weS5jb21tZW50ID0gdGhpcy5jb21tZW50O1xuICAgICAgICBjb3B5LmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKCk7XG4gICAgICAgIGNvcHkud2FybmluZ3MgPSB0aGlzLndhcm5pbmdzLnNsaWNlKCk7XG4gICAgICAgIGNvcHkub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICBjb3B5LmRpcmVjdGl2ZXMgPSB0aGlzLmRpcmVjdGl2ZXMuY2xvbmUoKTtcbiAgICAgICAgY29weS5zY2hlbWEgPSB0aGlzLnNjaGVtYS5jbG9uZSgpO1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICBjb3B5LmNvbnRlbnRzID0gaXNOb2RlKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuY2xvbmUoY29weS5zY2hlbWEpXG4gICAgICAgICAgICA6IHRoaXMuY29udGVudHM7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGRvY3VtZW50LiAqL1xuICAgIGFkZCh2YWx1ZSkge1xuICAgICAgICBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSlcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuYWRkKHZhbHVlKTtcbiAgICB9XG4gICAgLyoqIEFkZHMgYSB2YWx1ZSB0byB0aGUgZG9jdW1lbnQuICovXG4gICAgYWRkSW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLmFkZEluKHBhdGgsIHZhbHVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGBBbGlhc2Agbm9kZSwgZW5zdXJpbmcgdGhhdCB0aGUgdGFyZ2V0IGBub2RlYCBoYXMgdGhlIHJlcXVpcmVkIGFuY2hvci5cbiAgICAgKlxuICAgICAqIElmIGBub2RlYCBhbHJlYWR5IGhhcyBhbiBhbmNob3IsIGBuYW1lYCBpcyBpZ25vcmVkLlxuICAgICAqIE90aGVyd2lzZSwgdGhlIGBub2RlLmFuY2hvcmAgdmFsdWUgd2lsbCBiZSBzZXQgdG8gYG5hbWVgLFxuICAgICAqIG9yIGlmIGFuIGFuY2hvciB3aXRoIHRoYXQgbmFtZSBpcyBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIGRvY3VtZW50LFxuICAgICAqIGBuYW1lYCB3aWxsIGJlIHVzZWQgYXMgYSBwcmVmaXggZm9yIGEgbmV3IHVuaXF1ZSBhbmNob3IuXG4gICAgICogSWYgYG5hbWVgIGlzIHVuZGVmaW5lZCwgdGhlIGdlbmVyYXRlZCBhbmNob3Igd2lsbCB1c2UgJ2EnIGFzIGEgcHJlZml4LlxuICAgICAqL1xuICAgIGNyZWF0ZUFsaWFzKG5vZGUsIG5hbWUpIHtcbiAgICAgICAgaWYgKCFub2RlLmFuY2hvcikge1xuICAgICAgICAgICAgY29uc3QgcHJldiA9IGFuY2hvck5hbWVzKHRoaXMpO1xuICAgICAgICAgICAgbm9kZS5hbmNob3IgPVxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICAgICAgICAgICFuYW1lIHx8IHByZXYuaGFzKG5hbWUpID8gZmluZE5ld0FuY2hvcihuYW1lIHx8ICdhJywgcHJldikgOiBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQWxpYXMobm9kZS5hbmNob3IpO1xuICAgIH1cbiAgICBjcmVhdGVOb2RlKHZhbHVlLCByZXBsYWNlciwgb3B0aW9ucykge1xuICAgICAgICBsZXQgX3JlcGxhY2VyID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJlcGxhY2VyLmNhbGwoeyAnJzogdmFsdWUgfSwgJycsIHZhbHVlKTtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVwbGFjZXIpKSB7XG4gICAgICAgICAgICBjb25zdCBrZXlUb1N0ciA9ICh2KSA9PiB0eXBlb2YgdiA9PT0gJ251bWJlcicgfHwgdiBpbnN0YW5jZW9mIFN0cmluZyB8fCB2IGluc3RhbmNlb2YgTnVtYmVyO1xuICAgICAgICAgICAgY29uc3QgYXNTdHIgPSByZXBsYWNlci5maWx0ZXIoa2V5VG9TdHIpLm1hcChTdHJpbmcpO1xuICAgICAgICAgICAgaWYgKGFzU3RyLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmVwbGFjZXIgPSByZXBsYWNlci5jb25jYXQoYXNTdHIpO1xuICAgICAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkICYmIHJlcGxhY2VyKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gcmVwbGFjZXI7XG4gICAgICAgICAgICByZXBsYWNlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGFsaWFzRHVwbGljYXRlT2JqZWN0cywgYW5jaG9yUHJlZml4LCBmbG93LCBrZWVwVW5kZWZpbmVkLCBvblRhZ09iaiwgdGFnIH0gPSBvcHRpb25zID8/IHt9O1xuICAgICAgICBjb25zdCB7IG9uQW5jaG9yLCBzZXRBbmNob3JzLCBzb3VyY2VPYmplY3RzIH0gPSBjcmVhdGVOb2RlQW5jaG9ycyh0aGlzLCBcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgIGFuY2hvclByZWZpeCB8fCAnYScpO1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbGlhc0R1cGxpY2F0ZU9iamVjdHM6IGFsaWFzRHVwbGljYXRlT2JqZWN0cyA/PyB0cnVlLFxuICAgICAgICAgICAga2VlcFVuZGVmaW5lZDoga2VlcFVuZGVmaW5lZCA/PyBmYWxzZSxcbiAgICAgICAgICAgIG9uQW5jaG9yLFxuICAgICAgICAgICAgb25UYWdPYmosXG4gICAgICAgICAgICByZXBsYWNlcjogX3JlcGxhY2VyLFxuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLnNjaGVtYSxcbiAgICAgICAgICAgIHNvdXJjZU9iamVjdHNcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNyZWF0ZU5vZGUodmFsdWUsIHRhZywgY3R4KTtcbiAgICAgICAgaWYgKGZsb3cgJiYgaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgbm9kZS5mbG93ID0gdHJ1ZTtcbiAgICAgICAgc2V0QW5jaG9ycygpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydCBhIGtleSBhbmQgYSB2YWx1ZSBpbnRvIGEgYFBhaXJgIHVzaW5nIHRoZSBjdXJyZW50IHNjaGVtYSxcbiAgICAgKiByZWN1cnNpdmVseSB3cmFwcGluZyBhbGwgdmFsdWVzIGFzIGBTY2FsYXJgIG9yIGBDb2xsZWN0aW9uYCBub2Rlcy5cbiAgICAgKi9cbiAgICBjcmVhdGVQYWlyKGtleSwgdmFsdWUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBjb25zdCBrID0gdGhpcy5jcmVhdGVOb2RlKGtleSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmNyZWF0ZU5vZGUodmFsdWUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gbmV3IFBhaXIoaywgdik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBkb2N1bWVudC5cbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmRlbGV0ZShrZXkpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBkb2N1bWVudC5cbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZUluKHBhdGgpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgUHJlc3VtZWQgaW1wb3NzaWJsZSBpZiBTdHJpY3QgZXh0ZW5kcyBmYWxzZVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmRlbGV0ZUluKHBhdGgpXG4gICAgICAgICAgICA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYGtleWAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIGlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmdldChrZXksIGtlZXBTY2FsYXIpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBwYXRoYCwgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLiBCeSBkZWZhdWx0IHVud3JhcHNcbiAgICAgKiBzY2FsYXIgdmFsdWVzIGZyb20gdGhlaXIgc3Vycm91bmRpbmcgbm9kZTsgdG8gZGlzYWJsZSBzZXQgYGtlZXBTY2FsYXJgIHRvXG4gICAgICogYHRydWVgIChjb2xsZWN0aW9ucyBhcmUgYWx3YXlzIHJldHVybmVkIGludGFjdCkuXG4gICAgICovXG4gICAgZ2V0SW4ocGF0aCwga2VlcFNjYWxhcikge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICByZXR1cm4gIWtlZXBTY2FsYXIgJiYgaXNTY2FsYXIodGhpcy5jb250ZW50cylcbiAgICAgICAgICAgICAgICA/IHRoaXMuY29udGVudHMudmFsdWVcbiAgICAgICAgICAgICAgICA6IHRoaXMuY29udGVudHM7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5nZXRJbihwYXRoLCBrZWVwU2NhbGFyKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZG9jdW1lbnQgaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICovXG4gICAgaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5oYXMoa2V5KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGRvY3VtZW50IGluY2x1ZGVzIGEgdmFsdWUgYXQgYHBhdGhgLlxuICAgICAqL1xuICAgIGhhc0luKHBhdGgpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudHMgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIGlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSA/IHRoaXMuY29udGVudHMuaGFzSW4ocGF0aCkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgZG9jdW1lbnQuIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCBba2V5XSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGRvY3VtZW50LiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgQXJyYXkuZnJvbShwYXRoKSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuc2V0SW4ocGF0aCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0aGUgWUFNTCB2ZXJzaW9uIGFuZCBzY2hlbWEgdXNlZCBieSB0aGUgZG9jdW1lbnQuXG4gICAgICogQSBgbnVsbGAgdmVyc2lvbiBkaXNhYmxlcyBzdXBwb3J0IGZvciBkaXJlY3RpdmVzLCBleHBsaWNpdCB0YWdzLCBhbmNob3JzLCBhbmQgYWxpYXNlcy5cbiAgICAgKiBJdCBhbHNvIHJlcXVpcmVzIHRoZSBgc2NoZW1hYCBvcHRpb24gdG8gYmUgZ2l2ZW4gYXMgYSBgU2NoZW1hYCBpbnN0YW5jZSB2YWx1ZS5cbiAgICAgKlxuICAgICAqIE92ZXJyaWRlcyBhbGwgcHJldmlvdXNseSBzZXQgc2NoZW1hIG9wdGlvbnMuXG4gICAgICovXG4gICAgc2V0U2NoZW1hKHZlcnNpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdudW1iZXInKVxuICAgICAgICAgICAgdmVyc2lvbiA9IFN0cmluZyh2ZXJzaW9uKTtcbiAgICAgICAgbGV0IG9wdDtcbiAgICAgICAgc3dpdGNoICh2ZXJzaW9uKSB7XG4gICAgICAgICAgICBjYXNlICcxLjEnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb24gPSAnMS4xJztcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBEaXJlY3RpdmVzKHsgdmVyc2lvbjogJzEuMScgfSk7XG4gICAgICAgICAgICAgICAgb3B0ID0geyBtZXJnZTogdHJ1ZSwgcmVzb2x2ZUtub3duVGFnczogZmFsc2UsIHNjaGVtYTogJ3lhbWwtMS4xJyB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMS4yJzpcbiAgICAgICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IERpcmVjdGl2ZXMoeyB2ZXJzaW9uIH0pO1xuICAgICAgICAgICAgICAgIG9wdCA9IHsgbWVyZ2U6IGZhbHNlLCByZXNvbHZlS25vd25UYWdzOiB0cnVlLCBzY2hlbWE6ICdjb3JlJyB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBudWxsOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRpcmVjdGl2ZXM7XG4gICAgICAgICAgICAgICAgb3B0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdiA9IEpTT04uc3RyaW5naWZ5KHZlcnNpb24pO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgJzEuMScsICcxLjInIG9yIG51bGwgYXMgZmlyc3QgYXJndW1lbnQsIGJ1dCBmb3VuZDogJHtzdn1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBOb3QgdXNpbmcgYGluc3RhbmNlb2YgU2NoZW1hYCB0byBhbGxvdyBmb3IgZHVjayB0eXBpbmdcbiAgICAgICAgaWYgKG9wdGlvbnMuc2NoZW1hIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgICAgICAgICAgdGhpcy5zY2hlbWEgPSBvcHRpb25zLnNjaGVtYTtcbiAgICAgICAgZWxzZSBpZiAob3B0KVxuICAgICAgICAgICAgdGhpcy5zY2hlbWEgPSBuZXcgU2NoZW1hKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV2l0aCBhIG51bGwgWUFNTCB2ZXJzaW9uLCB0aGUgeyBzY2hlbWE6IFNjaGVtYSB9IG9wdGlvbiBpcyByZXF1aXJlZGApO1xuICAgIH1cbiAgICAvLyBqc29uICYganNvbkFyZyBhcmUgb25seSB1c2VkIGZyb20gdG9KU09OKClcbiAgICB0b0pTKHsganNvbiwganNvbkFyZywgbWFwQXNNYXAsIG1heEFsaWFzQ291bnQsIG9uQW5jaG9yLCByZXZpdmVyIH0gPSB7fSkge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbmNob3JzOiBuZXcgTWFwKCksXG4gICAgICAgICAgICBkb2M6IHRoaXMsXG4gICAgICAgICAgICBrZWVwOiAhanNvbixcbiAgICAgICAgICAgIG1hcEFzTWFwOiBtYXBBc01hcCA9PT0gdHJ1ZSxcbiAgICAgICAgICAgIG1hcEtleVdhcm5lZDogZmFsc2UsXG4gICAgICAgICAgICBtYXhBbGlhc0NvdW50OiB0eXBlb2YgbWF4QWxpYXNDb3VudCA9PT0gJ251bWJlcicgPyBtYXhBbGlhc0NvdW50IDogMTAwXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHRvSlModGhpcy5jb250ZW50cywganNvbkFyZyA/PyAnJywgY3R4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBvbkFuY2hvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjb3VudCwgcmVzIH0gb2YgY3R4LmFuY2hvcnMudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgb25BbmNob3IocmVzLCBjb3VudCk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBhcHBseVJldml2ZXIocmV2aXZlciwgeyAnJzogcmVzIH0sICcnLCByZXMpXG4gICAgICAgICAgICA6IHJlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkb2N1bWVudCBgY29udGVudHNgLlxuICAgICAqXG4gICAgICogQHBhcmFtIGpzb25BcmcgVXNlZCBieSBgSlNPTi5zdHJpbmdpZnlgIHRvIGluZGljYXRlIHRoZSBhcnJheSBpbmRleCBvclxuICAgICAqICAgcHJvcGVydHkgbmFtZS5cbiAgICAgKi9cbiAgICB0b0pTT04oanNvbkFyZywgb25BbmNob3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9KUyh7IGpzb246IHRydWUsIGpzb25BcmcsIG1hcEFzTWFwOiBmYWxzZSwgb25BbmNob3IgfSk7XG4gICAgfVxuICAgIC8qKiBBIFlBTUwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRvY3VtZW50LiAqL1xuICAgIHRvU3RyaW5nKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBpZiAodGhpcy5lcnJvcnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRG9jdW1lbnQgd2l0aCBlcnJvcnMgY2Fubm90IGJlIHN0cmluZ2lmaWVkJyk7XG4gICAgICAgIGlmICgnaW5kZW50JyBpbiBvcHRpb25zICYmXG4gICAgICAgICAgICAoIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5pbmRlbnQpIHx8IE51bWJlcihvcHRpb25zLmluZGVudCkgPD0gMCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmluZGVudCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiaW5kZW50XCIgb3B0aW9uIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLCBub3QgJHtzfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlEb2N1bWVudCh0aGlzLCBvcHRpb25zKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhc3NlcnRDb2xsZWN0aW9uKGNvbnRlbnRzKSB7XG4gICAgaWYgKGlzQ29sbGVjdGlvbihjb250ZW50cykpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgYSBZQU1MIGNvbGxlY3Rpb24gYXMgZG9jdW1lbnQgY29udGVudHMnKTtcbn1cblxuZXhwb3J0IHsgRG9jdW1lbnQgfTtcbiIsImltcG9ydCB7IGlzU2NhbGFyLCBpc0NvbGxlY3Rpb24gfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyB2aXNpdCB9IGZyb20gJy4uL3Zpc2l0LmpzJztcblxuLyoqXG4gKiBWZXJpZnkgdGhhdCB0aGUgaW5wdXQgc3RyaW5nIGlzIGEgdmFsaWQgYW5jaG9yLlxuICpcbiAqIFdpbGwgdGhyb3cgb24gZXJyb3JzLlxuICovXG5mdW5jdGlvbiBhbmNob3JJc1ZhbGlkKGFuY2hvcikge1xuICAgIGlmICgvW1xceDAwLVxceDE5XFxzLFtcXF17fV0vLnRlc3QoYW5jaG9yKSkge1xuICAgICAgICBjb25zdCBzYSA9IEpTT04uc3RyaW5naWZ5KGFuY2hvcik7XG4gICAgICAgIGNvbnN0IG1zZyA9IGBBbmNob3IgbXVzdCBub3QgY29udGFpbiB3aGl0ZXNwYWNlIG9yIGNvbnRyb2wgY2hhcmFjdGVyczogJHtzYX1gO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBhbmNob3JOYW1lcyhyb290KSB7XG4gICAgY29uc3QgYW5jaG9ycyA9IG5ldyBTZXQoKTtcbiAgICB2aXNpdChyb290LCB7XG4gICAgICAgIFZhbHVlKF9rZXksIG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLmFuY2hvcilcbiAgICAgICAgICAgICAgICBhbmNob3JzLmFkZChub2RlLmFuY2hvcik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYW5jaG9ycztcbn1cbi8qKiBGaW5kIGEgbmV3IGFuY2hvciBuYW1lIHdpdGggdGhlIGdpdmVuIGBwcmVmaXhgIGFuZCBhIG9uZS1pbmRleGVkIHN1ZmZpeC4gKi9cbmZ1bmN0aW9uIGZpbmROZXdBbmNob3IocHJlZml4LCBleGNsdWRlKSB7XG4gICAgZm9yIChsZXQgaSA9IDE7IHRydWU7ICsraSkge1xuICAgICAgICBjb25zdCBuYW1lID0gYCR7cHJlZml4fSR7aX1gO1xuICAgICAgICBpZiAoIWV4Y2x1ZGUuaGFzKG5hbWUpKVxuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlTm9kZUFuY2hvcnMoZG9jLCBwcmVmaXgpIHtcbiAgICBjb25zdCBhbGlhc09iamVjdHMgPSBbXTtcbiAgICBjb25zdCBzb3VyY2VPYmplY3RzID0gbmV3IE1hcCgpO1xuICAgIGxldCBwcmV2QW5jaG9ycyA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25BbmNob3I6IChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgIGFsaWFzT2JqZWN0cy5wdXNoKHNvdXJjZSk7XG4gICAgICAgICAgICBpZiAoIXByZXZBbmNob3JzKVxuICAgICAgICAgICAgICAgIHByZXZBbmNob3JzID0gYW5jaG9yTmFtZXMoZG9jKTtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvciA9IGZpbmROZXdBbmNob3IocHJlZml4LCBwcmV2QW5jaG9ycyk7XG4gICAgICAgICAgICBwcmV2QW5jaG9ycy5hZGQoYW5jaG9yKTtcbiAgICAgICAgICAgIHJldHVybiBhbmNob3I7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaXRoIGNpcmN1bGFyIHJlZmVyZW5jZXMsIHRoZSBzb3VyY2Ugbm9kZSBpcyBvbmx5IHJlc29sdmVkIGFmdGVyIGFsbFxuICAgICAgICAgKiBvZiBpdHMgY2hpbGQgbm9kZXMgYXJlLiBUaGlzIGlzIHdoeSBhbmNob3JzIGFyZSBzZXQgb25seSBhZnRlciBhbGwgb2ZcbiAgICAgICAgICogdGhlIG5vZGVzIGhhdmUgYmVlbiBjcmVhdGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QW5jaG9yczogKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgYWxpYXNPYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gc291cmNlT2JqZWN0cy5nZXQoc291cmNlKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlZiA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVmLmFuY2hvciAmJlxuICAgICAgICAgICAgICAgICAgICAoaXNTY2FsYXIocmVmLm5vZGUpIHx8IGlzQ29sbGVjdGlvbihyZWYubm9kZSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZi5ub2RlLmFuY2hvciA9IHJlZi5hbmNob3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignRmFpbGVkIHRvIHJlc29sdmUgcmVwZWF0ZWQgb2JqZWN0ICh0aGlzIHNob3VsZCBub3QgaGFwcGVuKScpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvci5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc291cmNlT2JqZWN0c1xuICAgIH07XG59XG5cbmV4cG9ydCB7IGFuY2hvcklzVmFsaWQsIGFuY2hvck5hbWVzLCBjcmVhdGVOb2RlQW5jaG9ycywgZmluZE5ld0FuY2hvciB9O1xuIiwiLyoqXG4gKiBBcHBsaWVzIHRoZSBKU09OLnBhcnNlIHJldml2ZXIgYWxnb3JpdGhtIGFzIGRlZmluZWQgaW4gdGhlIEVDTUEtMjYyIHNwZWMsXG4gKiBpbiBzZWN0aW9uIDI0LjUuMS4xIFwiUnVudGltZSBTZW1hbnRpY3M6IEludGVybmFsaXplSlNPTlByb3BlcnR5XCIgb2YgdGhlXG4gKiAyMDIxIGVkaXRpb246IGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtanNvbi5wYXJzZVxuICpcbiAqIEluY2x1ZGVzIGV4dGVuc2lvbnMgZm9yIGhhbmRsaW5nIE1hcCBhbmQgU2V0IG9iamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5UmV2aXZlcihyZXZpdmVyLCBvYmosIGtleSwgdmFsKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdmFsLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWxbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBTdHJpbmcoaSksIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbFtpXTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApXG4gICAgICAgICAgICAgICAgICAgIHZhbFtpXSA9IHYxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrIG9mIEFycmF5LmZyb20odmFsLmtleXMoKSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MCA9IHZhbC5nZXQoayk7XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBrLCB2MCk7XG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUoayk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKVxuICAgICAgICAgICAgICAgICAgICB2YWwuc2V0KGssIHYxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdjAgb2YgQXJyYXkuZnJvbSh2YWwpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCB2MCwgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKHYwKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZSh2MCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5hZGQodjEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHYwXSBvZiBPYmplY3QuZW50cmllcyh2YWwpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBrLCB2MCk7XG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWxba107XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKVxuICAgICAgICAgICAgICAgICAgICB2YWxba10gPSB2MTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV2aXZlci5jYWxsKG9iaiwga2V5LCB2YWwpO1xufVxuXG5leHBvcnQgeyBhcHBseVJldml2ZXIgfTtcbiIsImltcG9ydCB7IEFsaWFzIH0gZnJvbSAnLi4vbm9kZXMvQWxpYXMuanMnO1xuaW1wb3J0IHsgaXNOb2RlLCBpc1BhaXIsIE1BUCwgU0VRLCBpc0RvY3VtZW50IH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcblxuY29uc3QgZGVmYXVsdFRhZ1ByZWZpeCA9ICd0YWc6eWFtbC5vcmcsMjAwMjonO1xuZnVuY3Rpb24gZmluZFRhZ09iamVjdCh2YWx1ZSwgdGFnTmFtZSwgdGFncykge1xuICAgIGlmICh0YWdOYW1lKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnTmFtZSk7XG4gICAgICAgIGNvbnN0IHRhZ09iaiA9IG1hdGNoLmZpbmQodCA9PiAhdC5mb3JtYXQpID8/IG1hdGNoWzBdO1xuICAgICAgICBpZiAoIXRhZ09iailcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFnICR7dGFnTmFtZX0gbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybiB0YWdPYmo7XG4gICAgfVxuICAgIHJldHVybiB0YWdzLmZpbmQodCA9PiB0LmlkZW50aWZ5Py4odmFsdWUpICYmICF0LmZvcm1hdCk7XG59XG5mdW5jdGlvbiBjcmVhdGVOb2RlKHZhbHVlLCB0YWdOYW1lLCBjdHgpIHtcbiAgICBpZiAoaXNEb2N1bWVudCh2YWx1ZSkpXG4gICAgICAgIHZhbHVlID0gdmFsdWUuY29udGVudHM7XG4gICAgaWYgKGlzTm9kZSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoaXNQYWlyKHZhbHVlKSkge1xuICAgICAgICBjb25zdCBtYXAgPSBjdHguc2NoZW1hW01BUF0uY3JlYXRlTm9kZT8uKGN0eC5zY2hlbWEsIG51bGwsIGN0eCk7XG4gICAgICAgIG1hcC5pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nIHx8XG4gICAgICAgIHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyIHx8XG4gICAgICAgIHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbiB8fFxuICAgICAgICAodHlwZW9mIEJpZ0ludCAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBCaWdJbnQpIC8vIG5vdCBzdXBwb3J0ZWQgZXZlcnl3aGVyZVxuICAgICkge1xuICAgICAgICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLXNlcmlhbGl6ZWpzb25wcm9wZXJ0eVxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgY29uc3QgeyBhbGlhc0R1cGxpY2F0ZU9iamVjdHMsIG9uQW5jaG9yLCBvblRhZ09iaiwgc2NoZW1hLCBzb3VyY2VPYmplY3RzIH0gPSBjdHg7XG4gICAgLy8gRGV0ZWN0IGR1cGxpY2F0ZSByZWZlcmVuY2VzIHRvIHRoZSBzYW1lIG9iamVjdCAmIHVzZSBBbGlhcyBub2RlcyBmb3IgYWxsXG4gICAgLy8gYWZ0ZXIgZmlyc3QuIFRoZSBgcmVmYCB3cmFwcGVyIGFsbG93cyBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcyB0byByZXNvbHZlLlxuICAgIGxldCByZWYgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGFsaWFzRHVwbGljYXRlT2JqZWN0cyAmJiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJlZiA9IHNvdXJjZU9iamVjdHMuZ2V0KHZhbHVlKTtcbiAgICAgICAgaWYgKHJlZikge1xuICAgICAgICAgICAgaWYgKCFyZWYuYW5jaG9yKVxuICAgICAgICAgICAgICAgIHJlZi5hbmNob3IgPSBvbkFuY2hvcih2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFsaWFzKHJlZi5hbmNob3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVmID0geyBhbmNob3I6IG51bGwsIG5vZGU6IG51bGwgfTtcbiAgICAgICAgICAgIHNvdXJjZU9iamVjdHMuc2V0KHZhbHVlLCByZWYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0YWdOYW1lPy5zdGFydHNXaXRoKCchIScpKVxuICAgICAgICB0YWdOYW1lID0gZGVmYXVsdFRhZ1ByZWZpeCArIHRhZ05hbWUuc2xpY2UoMik7XG4gICAgbGV0IHRhZ09iaiA9IGZpbmRUYWdPYmplY3QodmFsdWUsIHRhZ05hbWUsIHNjaGVtYS50YWdzKTtcbiAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtY2FsbFxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04oKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChyZWYpXG4gICAgICAgICAgICAgICAgcmVmLm5vZGUgPSBub2RlO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdGFnT2JqID1cbiAgICAgICAgICAgIHZhbHVlIGluc3RhbmNlb2YgTWFwXG4gICAgICAgICAgICAgICAgPyBzY2hlbWFbTUFQXVxuICAgICAgICAgICAgICAgIDogU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgPyBzY2hlbWFbU0VRXVxuICAgICAgICAgICAgICAgICAgICA6IHNjaGVtYVtNQVBdO1xuICAgIH1cbiAgICBpZiAob25UYWdPYmopIHtcbiAgICAgICAgb25UYWdPYmoodGFnT2JqKTtcbiAgICAgICAgZGVsZXRlIGN0eC5vblRhZ09iajtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHRhZ09iaj8uY3JlYXRlTm9kZVxuICAgICAgICA/IHRhZ09iai5jcmVhdGVOb2RlKGN0eC5zY2hlbWEsIHZhbHVlLCBjdHgpXG4gICAgICAgIDogdHlwZW9mIHRhZ09iaj8ubm9kZUNsYXNzPy5mcm9tID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IHRhZ09iai5ub2RlQ2xhc3MuZnJvbShjdHguc2NoZW1hLCB2YWx1ZSwgY3R4KVxuICAgICAgICAgICAgOiBuZXcgU2NhbGFyKHZhbHVlKTtcbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgbm9kZS50YWcgPSB0YWdOYW1lO1xuICAgIGVsc2UgaWYgKCF0YWdPYmouZGVmYXVsdClcbiAgICAgICAgbm9kZS50YWcgPSB0YWdPYmoudGFnO1xuICAgIGlmIChyZWYpXG4gICAgICAgIHJlZi5ub2RlID0gbm9kZTtcbiAgICByZXR1cm4gbm9kZTtcbn1cblxuZXhwb3J0IHsgY3JlYXRlTm9kZSB9O1xuIiwiaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdmlzaXQgfSBmcm9tICcuLi92aXNpdC5qcyc7XG5cbmNvbnN0IGVzY2FwZUNoYXJzID0ge1xuICAgICchJzogJyUyMScsXG4gICAgJywnOiAnJTJDJyxcbiAgICAnWyc6ICclNUInLFxuICAgICddJzogJyU1RCcsXG4gICAgJ3snOiAnJTdCJyxcbiAgICAnfSc6ICclN0QnXG59O1xuY29uc3QgZXNjYXBlVGFnTmFtZSA9ICh0bikgPT4gdG4ucmVwbGFjZSgvWyEsW1xcXXt9XS9nLCBjaCA9PiBlc2NhcGVDaGFyc1tjaF0pO1xuY2xhc3MgRGlyZWN0aXZlcyB7XG4gICAgY29uc3RydWN0b3IoeWFtbCwgdGFncykge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRpcmVjdGl2ZXMtZW5kL2RvYy1zdGFydCBtYXJrZXIgYC0tLWAuIElmIGBudWxsYCwgYSBtYXJrZXIgbWF5IHN0aWxsIGJlXG4gICAgICAgICAqIGluY2x1ZGVkIGluIHRoZSBkb2N1bWVudCdzIHN0cmluZ2lmaWVkIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kb2NTdGFydCA9IG51bGw7XG4gICAgICAgIC8qKiBUaGUgZG9jLWVuZCBtYXJrZXIgYC4uLmAuICAqL1xuICAgICAgICB0aGlzLmRvY0VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnlhbWwgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLCB5YW1sKTtcbiAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncywgdGFncyk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBjb3B5LmRvY1N0YXJ0ID0gdGhpcy5kb2NTdGFydDtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIER1cmluZyBwYXJzaW5nLCBnZXQgYSBEaXJlY3RpdmVzIGluc3RhbmNlIGZvciB0aGUgY3VycmVudCBkb2N1bWVudCBhbmRcbiAgICAgKiB1cGRhdGUgdGhlIHN0cmVhbSBzdGF0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgdmVyc2lvbidzIHNwZWMuXG4gICAgICovXG4gICAgYXREb2N1bWVudCgpIHtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMueWFtbC52ZXJzaW9uKSB7XG4gICAgICAgICAgICBjYXNlICcxLjEnOlxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXh0RG9jdW1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMS4yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy55YW1sID0ge1xuICAgICAgICAgICAgICAgICAgICBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCxcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbkVycm9yIC0gTWF5IGJlIGNhbGxlZCBldmVuIGlmIHRoZSBhY3Rpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgb24gc3VjY2Vzc1xuICAgICAqL1xuICAgIGFkZChsaW5lLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmF0TmV4dERvY3VtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnlhbWwgPSB7IGV4cGxpY2l0OiBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLmV4cGxpY2l0LCB2ZXJzaW9uOiAnMS4xJyB9O1xuICAgICAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncyk7XG4gICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnRyaW0oKS5zcGxpdCgvWyBcXHRdKy8pO1xuICAgICAgICBjb25zdCBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlICclVEFHJzoge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVRBRyBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSB0d28gcGFydHMnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3NbaGFuZGxlXSA9IHByZWZpeDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJyVZQU1MJzoge1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbC5leHBsaWNpdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDAsICclWUFNTCBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgcGFydCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFt2ZXJzaW9uXSA9IHBhcnRzO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJzaW9uID09PSAnMS4xJyB8fCB2ZXJzaW9uID09PSAnMS4yJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnlhbWwudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IC9eXFxkK1xcLlxcZCskLy50ZXN0KHZlcnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDYsIGBVbnN1cHBvcnRlZCBZQU1MIHZlcnNpb24gJHt2ZXJzaW9ufWAsIGlzVmFsaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvbkVycm9yKDAsIGBVbmtub3duIGRpcmVjdGl2ZSAke25hbWV9YCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIGEgdGFnLCBtYXRjaGluZyBoYW5kbGVzIHRvIHRob3NlIGRlZmluZWQgaW4gJVRBRyBkaXJlY3RpdmVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmVzb2x2ZWQgdGFnLCB3aGljaCBtYXkgYWxzbyBiZSB0aGUgbm9uLXNwZWNpZmljIHRhZyBgJyEnYCBvciBhXG4gICAgICogICBgJyFsb2NhbCdgIHRhZywgb3IgYG51bGxgIGlmIHVucmVzb2x2YWJsZS5cbiAgICAgKi9cbiAgICB0YWdOYW1lKHNvdXJjZSwgb25FcnJvcikge1xuICAgICAgICBpZiAoc291cmNlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gJyEnOyAvLyBub24tc3BlY2lmaWMgdGFnXG4gICAgICAgIGlmIChzb3VyY2VbMF0gIT09ICchJykge1xuICAgICAgICAgICAgb25FcnJvcihgTm90IGEgdmFsaWQgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzb3VyY2VbMV0gPT09ICc8Jykge1xuICAgICAgICAgICAgY29uc3QgdmVyYmF0aW0gPSBzb3VyY2Uuc2xpY2UoMiwgLTEpO1xuICAgICAgICAgICAgaWYgKHZlcmJhdGltID09PSAnIScgfHwgdmVyYmF0aW0gPT09ICchIScpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGBWZXJiYXRpbSB0YWdzIGFyZW4ndCByZXNvbHZlZCwgc28gJHtzb3VyY2V9IGlzIGludmFsaWQuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJz4nKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IoJ1ZlcmJhdGltIHRhZ3MgbXVzdCBlbmQgd2l0aCBhID4nKTtcbiAgICAgICAgICAgIHJldHVybiB2ZXJiYXRpbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbLCBoYW5kbGUsIHN1ZmZpeF0gPSBzb3VyY2UubWF0Y2goL14oLiohKShbXiFdKikkL3MpO1xuICAgICAgICBpZiAoIXN1ZmZpeClcbiAgICAgICAgICAgIG9uRXJyb3IoYFRoZSAke3NvdXJjZX0gdGFnIGhhcyBubyBzdWZmaXhgKTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy50YWdzW2hhbmRsZV07XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIGRlY29kZVVSSUNvbXBvbmVudChzdWZmaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gc291cmNlOyAvLyBsb2NhbCB0YWdcbiAgICAgICAgb25FcnJvcihgQ291bGQgbm90IHJlc29sdmUgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgZnVsbHkgcmVzb2x2ZWQgdGFnLCByZXR1cm5zIGl0cyBwcmludGFibGUgc3RyaW5nIGZvcm0sXG4gICAgICogdGFraW5nIGludG8gYWNjb3VudCBjdXJyZW50IHRhZyBwcmVmaXhlcyBhbmQgZGVmYXVsdHMuXG4gICAgICovXG4gICAgdGFnU3RyaW5nKHRhZykge1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgT2JqZWN0LmVudHJpZXModGhpcy50YWdzKSkge1xuICAgICAgICAgICAgaWYgKHRhZy5zdGFydHNXaXRoKHByZWZpeCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZSArIGVzY2FwZVRhZ05hbWUodGFnLnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZ1swXSA9PT0gJyEnID8gdGFnIDogYCE8JHt0YWd9PmA7XG4gICAgfVxuICAgIHRvU3RyaW5nKGRvYykge1xuICAgICAgICBjb25zdCBsaW5lcyA9IHRoaXMueWFtbC5leHBsaWNpdFxuICAgICAgICAgICAgPyBbYCVZQU1MICR7dGhpcy55YW1sLnZlcnNpb24gfHwgJzEuMid9YF1cbiAgICAgICAgICAgIDogW107XG4gICAgICAgIGNvbnN0IHRhZ0VudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzLnRhZ3MpO1xuICAgICAgICBsZXQgdGFnTmFtZXM7XG4gICAgICAgIGlmIChkb2MgJiYgdGFnRW50cmllcy5sZW5ndGggPiAwICYmIGlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0ge307XG4gICAgICAgICAgICB2aXNpdChkb2MuY29udGVudHMsIChfa2V5LCBub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTm9kZShub2RlKSAmJiBub2RlLnRhZylcbiAgICAgICAgICAgICAgICAgICAgdGFnc1tub2RlLnRhZ10gPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhZ05hbWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgW2hhbmRsZSwgcHJlZml4XSBvZiB0YWdFbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlID09PSAnISEnICYmIHByZWZpeCA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOicpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIWRvYyB8fCB0YWdOYW1lcy5zb21lKHRuID0+IHRuLnN0YXJ0c1dpdGgocHJlZml4KSkpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgJVRBRyAke2hhbmRsZX0gJHtwcmVmaXh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgIH1cbn1cbkRpcmVjdGl2ZXMuZGVmYXVsdFlhbWwgPSB7IGV4cGxpY2l0OiBmYWxzZSwgdmVyc2lvbjogJzEuMicgfTtcbkRpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MgPSB7ICchISc6ICd0YWc6eWFtbC5vcmcsMjAwMjonIH07XG5cbmV4cG9ydCB7IERpcmVjdGl2ZXMgfTtcbiIsImNsYXNzIFlBTUxFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb2RlID0gY29kZTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgfVxufVxuY2xhc3MgWUFNTFBhcnNlRXJyb3IgZXh0ZW5kcyBZQU1MRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcignWUFNTFBhcnNlRXJyb3InLCBwb3MsIGNvZGUsIG1lc3NhZ2UpO1xuICAgIH1cbn1cbmNsYXNzIFlBTUxXYXJuaW5nIGV4dGVuZHMgWUFNTEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoJ1lBTUxXYXJuaW5nJywgcG9zLCBjb2RlLCBtZXNzYWdlKTtcbiAgICB9XG59XG5jb25zdCBwcmV0dGlmeUVycm9yID0gKHNyYywgbGMpID0+IChlcnJvcikgPT4ge1xuICAgIGlmIChlcnJvci5wb3NbMF0gPT09IC0xKVxuICAgICAgICByZXR1cm47XG4gICAgZXJyb3IubGluZVBvcyA9IGVycm9yLnBvcy5tYXAocG9zID0+IGxjLmxpbmVQb3MocG9zKSk7XG4gICAgY29uc3QgeyBsaW5lLCBjb2wgfSA9IGVycm9yLmxpbmVQb3NbMF07XG4gICAgZXJyb3IubWVzc2FnZSArPSBgIGF0IGxpbmUgJHtsaW5lfSwgY29sdW1uICR7Y29sfWA7XG4gICAgbGV0IGNpID0gY29sIC0gMTtcbiAgICBsZXQgbGluZVN0ciA9IHNyY1xuICAgICAgICAuc3Vic3RyaW5nKGxjLmxpbmVTdGFydHNbbGluZSAtIDFdLCBsYy5saW5lU3RhcnRzW2xpbmVdKVxuICAgICAgICAucmVwbGFjZSgvW1xcblxccl0rJC8sICcnKTtcbiAgICAvLyBUcmltIHRvIG1heCA4MCBjaGFycywga2VlcGluZyBjb2wgcG9zaXRpb24gbmVhciB0aGUgbWlkZGxlXG4gICAgaWYgKGNpID49IDYwICYmIGxpbmVTdHIubGVuZ3RoID4gODApIHtcbiAgICAgICAgY29uc3QgdHJpbVN0YXJ0ID0gTWF0aC5taW4oY2kgLSAzOSwgbGluZVN0ci5sZW5ndGggLSA3OSk7XG4gICAgICAgIGxpbmVTdHIgPSAn4oCmJyArIGxpbmVTdHIuc3Vic3RyaW5nKHRyaW1TdGFydCk7XG4gICAgICAgIGNpIC09IHRyaW1TdGFydCAtIDE7XG4gICAgfVxuICAgIGlmIChsaW5lU3RyLmxlbmd0aCA+IDgwKVxuICAgICAgICBsaW5lU3RyID0gbGluZVN0ci5zdWJzdHJpbmcoMCwgNzkpICsgJ+KApic7XG4gICAgLy8gSW5jbHVkZSBwcmV2aW91cyBsaW5lIGluIGNvbnRleHQgaWYgcG9pbnRpbmcgYXQgbGluZSBzdGFydFxuICAgIGlmIChsaW5lID4gMSAmJiAvXiAqJC8udGVzdChsaW5lU3RyLnN1YnN0cmluZygwLCBjaSkpKSB7XG4gICAgICAgIC8vIFJlZ2V4cCB3b24ndCBtYXRjaCBpZiBzdGFydCBpcyB0cmltbWVkXG4gICAgICAgIGxldCBwcmV2ID0gc3JjLnN1YnN0cmluZyhsYy5saW5lU3RhcnRzW2xpbmUgLSAyXSwgbGMubGluZVN0YXJ0c1tsaW5lIC0gMV0pO1xuICAgICAgICBpZiAocHJldi5sZW5ndGggPiA4MClcbiAgICAgICAgICAgIHByZXYgPSBwcmV2LnN1YnN0cmluZygwLCA3OSkgKyAn4oCmXFxuJztcbiAgICAgICAgbGluZVN0ciA9IHByZXYgKyBsaW5lU3RyO1xuICAgIH1cbiAgICBpZiAoL1teIF0vLnRlc3QobGluZVN0cikpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMTtcbiAgICAgICAgY29uc3QgZW5kID0gZXJyb3IubGluZVBvc1sxXTtcbiAgICAgICAgaWYgKGVuZCAmJiBlbmQubGluZSA9PT0gbGluZSAmJiBlbmQuY29sID4gY29sKSB7XG4gICAgICAgICAgICBjb3VudCA9IE1hdGgubWF4KDEsIE1hdGgubWluKGVuZC5jb2wgLSBjb2wsIDgwIC0gY2kpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb2ludGVyID0gJyAnLnJlcGVhdChjaSkgKyAnXicucmVwZWF0KGNvdW50KTtcbiAgICAgICAgZXJyb3IubWVzc2FnZSArPSBgOlxcblxcbiR7bGluZVN0cn1cXG4ke3BvaW50ZXJ9XFxuYDtcbiAgICB9XG59O1xuXG5leHBvcnQgeyBZQU1MRXJyb3IsIFlBTUxQYXJzZUVycm9yLCBZQU1MV2FybmluZywgcHJldHRpZnlFcnJvciB9O1xuIiwiZXhwb3J0IHsgQ29tcG9zZXIgfSBmcm9tICcuL2NvbXBvc2UvY29tcG9zZXIuanMnO1xuZXhwb3J0IHsgRG9jdW1lbnQgfSBmcm9tICcuL2RvYy9Eb2N1bWVudC5qcyc7XG5leHBvcnQgeyBTY2hlbWEgfSBmcm9tICcuL3NjaGVtYS9TY2hlbWEuanMnO1xuZXhwb3J0IHsgWUFNTEVycm9yLCBZQU1MUGFyc2VFcnJvciwgWUFNTFdhcm5pbmcgfSBmcm9tICcuL2Vycm9ycy5qcyc7XG5leHBvcnQgeyBBbGlhcyB9IGZyb20gJy4vbm9kZXMvQWxpYXMuanMnO1xuZXhwb3J0IHsgaXNBbGlhcywgaXNDb2xsZWN0aW9uLCBpc0RvY3VtZW50LCBpc01hcCwgaXNOb2RlLCBpc1BhaXIsIGlzU2NhbGFyLCBpc1NlcSB9IGZyb20gJy4vbm9kZXMvaWRlbnRpdHkuanMnO1xuZXhwb3J0IHsgUGFpciB9IGZyb20gJy4vbm9kZXMvUGFpci5qcyc7XG5leHBvcnQgeyBTY2FsYXIgfSBmcm9tICcuL25vZGVzL1NjYWxhci5qcyc7XG5leHBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi9ub2Rlcy9ZQU1MTWFwLmpzJztcbmV4cG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0ICogYXMgY3N0IGZyb20gJy4vcGFyc2UvY3N0LmpzJztcbmV4cG9ydCB7IGNzdCBhcyBDU1QgfTtcbmV4cG9ydCB7IExleGVyIH0gZnJvbSAnLi9wYXJzZS9sZXhlci5qcyc7XG5leHBvcnQgeyBMaW5lQ291bnRlciB9IGZyb20gJy4vcGFyc2UvbGluZS1jb3VudGVyLmpzJztcbmV4cG9ydCB7IFBhcnNlciB9IGZyb20gJy4vcGFyc2UvcGFyc2VyLmpzJztcbmV4cG9ydCB7IHBhcnNlLCBwYXJzZUFsbERvY3VtZW50cywgcGFyc2VEb2N1bWVudCwgc3RyaW5naWZ5IH0gZnJvbSAnLi9wdWJsaWMtYXBpLmpzJztcbmV4cG9ydCB7IHZpc2l0LCB2aXNpdEFzeW5jIH0gZnJvbSAnLi92aXNpdC5qcyc7XG4iLCJmdW5jdGlvbiBkZWJ1Zyhsb2dMZXZlbCwgLi4ubWVzc2FnZXMpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycpXG4gICAgICAgIGNvbnNvbGUubG9nKC4uLm1lc3NhZ2VzKTtcbn1cbmZ1bmN0aW9uIHdhcm4obG9nTGV2ZWwsIHdhcm5pbmcpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycgfHwgbG9nTGV2ZWwgPT09ICd3YXJuJykge1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdHlwZXNjcmlwdC1lc2xpbnQvdHlwZXNjcmlwdC1lc2xpbnQvaXNzdWVzLzc0NzhcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItb3B0aW9uYWwtY2hhaW5cbiAgICAgICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVtaXRXYXJuaW5nKVxuICAgICAgICAgICAgcHJvY2Vzcy5lbWl0V2FybmluZyh3YXJuaW5nKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgZGVidWcsIHdhcm4gfTtcbiIsImltcG9ydCB7IGFuY2hvcklzVmFsaWQgfSBmcm9tICcuLi9kb2MvYW5jaG9ycy5qcyc7XG5pbXBvcnQgeyB2aXNpdCB9IGZyb20gJy4uL3Zpc2l0LmpzJztcbmltcG9ydCB7IEFMSUFTLCBpc0FsaWFzLCBpc0NvbGxlY3Rpb24sIGlzUGFpciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgTm9kZUJhc2UgfSBmcm9tICcuL05vZGUuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4vdG9KUy5qcyc7XG5cbmNsYXNzIEFsaWFzIGV4dGVuZHMgTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHNvdXJjZSkge1xuICAgICAgICBzdXBlcihBTElBUyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3RhZycsIHtcbiAgICAgICAgICAgIHNldCgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FsaWFzIG5vZGVzIGNhbm5vdCBoYXZlIHRhZ3MnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgdGhlIHZhbHVlIG9mIHRoaXMgYWxpYXMgd2l0aGluIGBkb2NgLCBmaW5kaW5nIHRoZSBsYXN0XG4gICAgICogaW5zdGFuY2Ugb2YgdGhlIGBzb3VyY2VgIGFuY2hvciBiZWZvcmUgdGhpcyBub2RlLlxuICAgICAqL1xuICAgIHJlc29sdmUoZG9jKSB7XG4gICAgICAgIGxldCBmb3VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmlzaXQoZG9jLCB7XG4gICAgICAgICAgICBOb2RlOiAoX2tleSwgbm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChub2RlID09PSB0aGlzKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmlzaXQuQlJFQUs7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuYW5jaG9yID09PSB0aGlzLnNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cbiAgICB0b0pTT04oX2FyZywgY3R4KSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIHsgc291cmNlOiB0aGlzLnNvdXJjZSB9O1xuICAgICAgICBjb25zdCB7IGFuY2hvcnMsIGRvYywgbWF4QWxpYXNDb3VudCB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzb3VyY2UgPSB0aGlzLnJlc29sdmUoZG9jKTtcbiAgICAgICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IGFuY2hvcnMuZ2V0KHNvdXJjZSk7XG4gICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgLy8gUmVzb2x2ZSBhbmNob3JzIGZvciBOb2RlLnByb3RvdHlwZS50b0pTKClcbiAgICAgICAgICAgIHRvSlMoc291cmNlLCBudWxsLCBjdHgpO1xuICAgICAgICAgICAgZGF0YSA9IGFuY2hvcnMuZ2V0KHNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICghZGF0YSB8fCBkYXRhLnJlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnVGhpcyBzaG91bGQgbm90IGhhcHBlbjogQWxpYXMgYW5jaG9yIHdhcyBub3QgcmVzb2x2ZWQ/JztcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXhBbGlhc0NvdW50ID49IDApIHtcbiAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLmFsaWFzQ291bnQgPT09IDApXG4gICAgICAgICAgICAgICAgZGF0YS5hbGlhc0NvdW50ID0gZ2V0QWxpYXNDb3VudChkb2MsIHNvdXJjZSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoZGF0YS5jb3VudCAqIGRhdGEuYWxpYXNDb3VudCA+IG1heEFsaWFzQ291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSAnRXhjZXNzaXZlIGFsaWFzIGNvdW50IGluZGljYXRlcyBhIHJlc291cmNlIGV4aGF1c3Rpb24gYXR0YWNrJztcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YS5yZXM7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgX29uQ29tbWVudCwgX29uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGAqJHt0aGlzLnNvdXJjZX1gO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBhbmNob3JJc1ZhbGlkKHRoaXMuc291cmNlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy52ZXJpZnlBbGlhc09yZGVyICYmICFjdHguYW5jaG9ycy5oYXModGhpcy5zb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYFVucmVzb2x2ZWQgYWxpYXMgKHRoZSBhbmNob3IgbXVzdCBiZSBzZXQgYmVmb3JlIHRoZSBhbGlhcyk6ICR7dGhpcy5zb3VyY2V9YDtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdHguaW1wbGljaXRLZXkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3NyY30gYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3JjO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldEFsaWFzQ291bnQoZG9jLCBub2RlLCBhbmNob3JzKSB7XG4gICAgaWYgKGlzQWxpYXMobm9kZSkpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gbm9kZS5yZXNvbHZlKGRvYyk7XG4gICAgICAgIGNvbnN0IGFuY2hvciA9IGFuY2hvcnMgJiYgc291cmNlICYmIGFuY2hvcnMuZ2V0KHNvdXJjZSk7XG4gICAgICAgIHJldHVybiBhbmNob3IgPyBhbmNob3IuY291bnQgKiBhbmNob3IuYWxpYXNDb3VudCA6IDA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygbm9kZS5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgYyA9IGdldEFsaWFzQ291bnQoZG9jLCBpdGVtLCBhbmNob3JzKTtcbiAgICAgICAgICAgIGlmIChjID4gY291bnQpXG4gICAgICAgICAgICAgICAgY291bnQgPSBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGtjID0gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUua2V5LCBhbmNob3JzKTtcbiAgICAgICAgY29uc3QgdmMgPSBnZXRBbGlhc0NvdW50KGRvYywgbm9kZS52YWx1ZSwgYW5jaG9ycyk7XG4gICAgICAgIHJldHVybiBNYXRoLm1heChrYywgdmMpO1xuICAgIH1cbiAgICByZXR1cm4gMTtcbn1cblxuZXhwb3J0IHsgQWxpYXMgfTtcbiIsImltcG9ydCB7IGNyZWF0ZU5vZGUgfSBmcm9tICcuLi9kb2MvY3JlYXRlTm9kZS5qcyc7XG5pbXBvcnQgeyBpc05vZGUsIGlzUGFpciwgaXNDb2xsZWN0aW9uLCBpc1NjYWxhciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgTm9kZUJhc2UgfSBmcm9tICcuL05vZGUuanMnO1xuXG5mdW5jdGlvbiBjb2xsZWN0aW9uRnJvbVBhdGgoc2NoZW1hLCBwYXRoLCB2YWx1ZSkge1xuICAgIGxldCB2ID0gdmFsdWU7XG4gICAgZm9yIChsZXQgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgY29uc3QgayA9IHBhdGhbaV07XG4gICAgICAgIGlmICh0eXBlb2YgayA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzSW50ZWdlcihrKSAmJiBrID49IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGEgPSBbXTtcbiAgICAgICAgICAgIGFba10gPSB2O1xuICAgICAgICAgICAgdiA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2ID0gbmV3IE1hcChbW2ssIHZdXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZU5vZGUodiwgdW5kZWZpbmVkLCB7XG4gICAgICAgIGFsaWFzRHVwbGljYXRlT2JqZWN0czogZmFsc2UsXG4gICAgICAgIGtlZXBVbmRlZmluZWQ6IGZhbHNlLFxuICAgICAgICBvbkFuY2hvcjogKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBwbGVhc2UgcmVwb3J0IGEgYnVnLicpO1xuICAgICAgICB9LFxuICAgICAgICBzY2hlbWEsXG4gICAgICAgIHNvdXJjZU9iamVjdHM6IG5ldyBNYXAoKVxuICAgIH0pO1xufVxuLy8gVHlwZSBndWFyZCBpcyBpbnRlbnRpb25hbGx5IGEgbGl0dGxlIHdyb25nIHNvIGFzIHRvIGJlIG1vcmUgdXNlZnVsLFxuLy8gYXMgaXQgZG9lcyBub3QgY292ZXIgdW50eXBhYmxlIGVtcHR5IG5vbi1zdHJpbmcgaXRlcmFibGVzIChlLmcuIFtdKS5cbmNvbnN0IGlzRW1wdHlQYXRoID0gKHBhdGgpID0+IHBhdGggPT0gbnVsbCB8fFxuICAgICh0eXBlb2YgcGF0aCA9PT0gJ29iamVjdCcgJiYgISFwYXRoW1N5bWJvbC5pdGVyYXRvcl0oKS5uZXh0KCkuZG9uZSk7XG5jbGFzcyBDb2xsZWN0aW9uIGV4dGVuZHMgTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHR5cGUsIHNjaGVtYSkge1xuICAgICAgICBzdXBlcih0eXBlKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzY2hlbWEnLCB7XG4gICAgICAgICAgICB2YWx1ZTogc2NoZW1hLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgY29weSBvZiB0aGlzIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2NoZW1hIC0gSWYgZGVmaW5lZCwgb3ZlcndyaXRlcyB0aGUgb3JpZ2luYWwncyBzY2hlbWFcbiAgICAgKi9cbiAgICBjbG9uZShzY2hlbWEpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGlmIChzY2hlbWEpXG4gICAgICAgICAgICBjb3B5LnNjaGVtYSA9IHNjaGVtYTtcbiAgICAgICAgY29weS5pdGVtcyA9IGNvcHkuaXRlbXMubWFwKGl0ID0+IGlzTm9kZShpdCkgfHwgaXNQYWlyKGl0KSA/IGl0LmNsb25lKHNjaGVtYSkgOiBpdCk7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSB2YWx1ZSB0byB0aGUgY29sbGVjdGlvbi4gRm9yIGAhIW1hcGAgYW5kIGAhIW9tYXBgIHRoZSB2YWx1ZSBtdXN0XG4gICAgICogYmUgYSBQYWlyIGluc3RhbmNlIG9yIGEgYHsga2V5LCB2YWx1ZSB9YCBvYmplY3QsIHdoaWNoIG1heSBub3QgaGF2ZSBhIGtleVxuICAgICAqIHRoYXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIG1hcC5cbiAgICAgKi9cbiAgICBhZGRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgICAgIG5vZGUuYWRkSW4ocmVzdCwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAobm9kZSA9PT0gdW5kZWZpbmVkICYmIHRoaXMuc2NoZW1hKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCByZXN0LCB2YWx1ZSkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZUluKHBhdGgpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWxldGUoa2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5kZWxldGVJbihyZXN0KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYGtleWAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldEluKHBhdGgsIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlzU2NhbGFyKG5vZGUpID8gbm9kZS52YWx1ZSA6IG5vZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24obm9kZSkgPyBub2RlLmdldEluKHJlc3QsIGtlZXBTY2FsYXIpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBoYXNBbGxOdWxsVmFsdWVzKGFsbG93U2NhbGFyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLmV2ZXJ5KG5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFpc1BhaXIobm9kZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgbiA9IG5vZGUudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gKG4gPT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgIChhbGxvd1NjYWxhciAmJlxuICAgICAgICAgICAgICAgICAgICBpc1NjYWxhcihuKSAmJlxuICAgICAgICAgICAgICAgICAgICBuLnZhbHVlID09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4uY29tbWVudEJlZm9yZSAmJlxuICAgICAgICAgICAgICAgICAgICAhbi5jb21tZW50ICYmXG4gICAgICAgICAgICAgICAgICAgICFuLnRhZykpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjb2xsZWN0aW9uIGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqL1xuICAgIGhhc0luKHBhdGgpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYXMoa2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24obm9kZSkgPyBub2RlLmhhc0luKHJlc3QpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGNvbGxlY3Rpb24uIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgICAgICBub2RlLnNldEluKHJlc3QsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCAmJiB0aGlzLnNjaGVtYSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgcmVzdCwgdmFsdWUpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IENvbGxlY3Rpb24sIGNvbGxlY3Rpb25Gcm9tUGF0aCwgaXNFbXB0eVBhdGggfTtcbiIsImltcG9ydCB7IGFwcGx5UmV2aXZlciB9IGZyb20gJy4uL2RvYy9hcHBseVJldml2ZXIuanMnO1xuaW1wb3J0IHsgTk9ERV9UWVBFLCBpc0RvY3VtZW50IH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi90b0pTLmpzJztcblxuY2xhc3MgTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHR5cGUpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIE5PREVfVFlQRSwgeyB2YWx1ZTogdHlwZSB9KTtcbiAgICB9XG4gICAgLyoqIENyZWF0ZSBhIGNvcHkgb2YgdGhpcyBub2RlLiAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKiBBIHBsYWluIEphdmFTY3JpcHQgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBub2RlLiAqL1xuICAgIHRvSlMoZG9jLCB7IG1hcEFzTWFwLCBtYXhBbGlhc0NvdW50LCBvbkFuY2hvciwgcmV2aXZlciB9ID0ge30pIHtcbiAgICAgICAgaWYgKCFpc0RvY3VtZW50KGRvYykpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIGRvY3VtZW50IGFyZ3VtZW50IGlzIHJlcXVpcmVkJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFuY2hvcnM6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGRvYyxcbiAgICAgICAgICAgIGtlZXA6IHRydWUsXG4gICAgICAgICAgICBtYXBBc01hcDogbWFwQXNNYXAgPT09IHRydWUsXG4gICAgICAgICAgICBtYXBLZXlXYXJuZWQ6IGZhbHNlLFxuICAgICAgICAgICAgbWF4QWxpYXNDb3VudDogdHlwZW9mIG1heEFsaWFzQ291bnQgPT09ICdudW1iZXInID8gbWF4QWxpYXNDb3VudCA6IDEwMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB0b0pTKHRoaXMsICcnLCBjdHgpO1xuICAgICAgICBpZiAodHlwZW9mIG9uQW5jaG9yID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgZm9yIChjb25zdCB7IGNvdW50LCByZXMgfSBvZiBjdHguYW5jaG9ycy52YWx1ZXMoKSlcbiAgICAgICAgICAgICAgICBvbkFuY2hvcihyZXMsIGNvdW50KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB7ICcnOiByZXMgfSwgJycsIHJlcylcbiAgICAgICAgICAgIDogcmVzO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgTm9kZUJhc2UgfTtcbiIsImltcG9ydCB7IGNyZWF0ZU5vZGUgfSBmcm9tICcuLi9kb2MvY3JlYXRlTm9kZS5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlQYWlyIH0gZnJvbSAnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVBhaXIuanMnO1xuaW1wb3J0IHsgYWRkUGFpclRvSlNNYXAgfSBmcm9tICcuL2FkZFBhaXJUb0pTTWFwLmpzJztcbmltcG9ydCB7IE5PREVfVFlQRSwgUEFJUiwgaXNOb2RlIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbmZ1bmN0aW9uIGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QgayA9IGNyZWF0ZU5vZGUoa2V5LCB1bmRlZmluZWQsIGN0eCk7XG4gICAgY29uc3QgdiA9IGNyZWF0ZU5vZGUodmFsdWUsIHVuZGVmaW5lZCwgY3R4KTtcbiAgICByZXR1cm4gbmV3IFBhaXIoaywgdik7XG59XG5jbGFzcyBQYWlyIHtcbiAgICBjb25zdHJ1Y3RvcihrZXksIHZhbHVlID0gbnVsbCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgTk9ERV9UWVBFLCB7IHZhbHVlOiBQQUlSIH0pO1xuICAgICAgICB0aGlzLmtleSA9IGtleTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjbG9uZShzY2hlbWEpIHtcbiAgICAgICAgbGV0IHsga2V5LCB2YWx1ZSB9ID0gdGhpcztcbiAgICAgICAgaWYgKGlzTm9kZShrZXkpKVxuICAgICAgICAgICAga2V5ID0ga2V5LmNsb25lKHNjaGVtYSk7XG4gICAgICAgIGlmIChpc05vZGUodmFsdWUpKVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5jbG9uZShzY2hlbWEpO1xuICAgICAgICByZXR1cm4gbmV3IFBhaXIoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgY29uc3QgcGFpciA9IGN0eD8ubWFwQXNNYXAgPyBuZXcgTWFwKCkgOiB7fTtcbiAgICAgICAgcmV0dXJuIGFkZFBhaXJUb0pTTWFwKGN0eCwgcGFpciwgdGhpcyk7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICByZXR1cm4gY3R4Py5kb2NcbiAgICAgICAgICAgID8gc3RyaW5naWZ5UGFpcih0aGlzLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgUGFpciwgY3JlYXRlUGFpciB9O1xuIiwiaW1wb3J0IHsgU0NBTEFSIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBOb2RlQmFzZSB9IGZyb20gJy4vTm9kZS5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi90b0pTLmpzJztcblxuY29uc3QgaXNTY2FsYXJWYWx1ZSA9ICh2YWx1ZSkgPT4gIXZhbHVlIHx8ICh0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jyk7XG5jbGFzcyBTY2FsYXIgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICAgICAgc3VwZXIoU0NBTEFSKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oYXJnLCBjdHgpIHtcbiAgICAgICAgcmV0dXJuIGN0eD8ua2VlcCA/IHRoaXMudmFsdWUgOiB0b0pTKHRoaXMudmFsdWUsIGFyZywgY3R4KTtcbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcodGhpcy52YWx1ZSk7XG4gICAgfVxufVxuU2NhbGFyLkJMT0NLX0ZPTERFRCA9ICdCTE9DS19GT0xERUQnO1xuU2NhbGFyLkJMT0NLX0xJVEVSQUwgPSAnQkxPQ0tfTElURVJBTCc7XG5TY2FsYXIuUExBSU4gPSAnUExBSU4nO1xuU2NhbGFyLlFVT1RFX0RPVUJMRSA9ICdRVU9URV9ET1VCTEUnO1xuU2NhbGFyLlFVT1RFX1NJTkdMRSA9ICdRVU9URV9TSU5HTEUnO1xuXG5leHBvcnQgeyBTY2FsYXIsIGlzU2NhbGFyVmFsdWUgfTtcbiIsImltcG9ydCB7IHN0cmluZ2lmeUNvbGxlY3Rpb24gfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBhZGRQYWlyVG9KU01hcCB9IGZyb20gJy4vYWRkUGFpclRvSlNNYXAuanMnO1xuaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gJy4vQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBpc1BhaXIsIGlzU2NhbGFyLCBNQVAgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIsIGNyZWF0ZVBhaXIgfSBmcm9tICcuL1BhaXIuanMnO1xuaW1wb3J0IHsgaXNTY2FsYXJWYWx1ZSB9IGZyb20gJy4vU2NhbGFyLmpzJztcblxuZnVuY3Rpb24gZmluZFBhaXIoaXRlbXMsIGtleSkge1xuICAgIGNvbnN0IGsgPSBpc1NjYWxhcihrZXkpID8ga2V5LnZhbHVlIDoga2V5O1xuICAgIGZvciAoY29uc3QgaXQgb2YgaXRlbXMpIHtcbiAgICAgICAgaWYgKGlzUGFpcihpdCkpIHtcbiAgICAgICAgICAgIGlmIChpdC5rZXkgPT09IGtleSB8fCBpdC5rZXkgPT09IGspXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0O1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKGl0LmtleSkgJiYgaXQua2V5LnZhbHVlID09PSBrKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuY2xhc3MgWUFNTE1hcCBleHRlbmRzIENvbGxlY3Rpb24ge1xuICAgIHN0YXRpYyBnZXQgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoTUFQLCBzY2hlbWEpO1xuICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgZ2VuZXJpYyBjb2xsZWN0aW9uIHBhcnNpbmcgbWV0aG9kIHRoYXQgY2FuIGJlIGV4dGVuZGVkXG4gICAgICogdG8gb3RoZXIgbm9kZSBjbGFzc2VzIHRoYXQgaW5oZXJpdCBmcm9tIFlBTUxNYXBcbiAgICAgKi9cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIG9iaiwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsga2VlcFVuZGVmaW5lZCwgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgY29uc3QgYWRkID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKG9iaiwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcGxhY2VyKSAmJiAhcmVwbGFjZXIuaW5jbHVkZXMoa2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCB8fCBrZWVwVW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIG9iailcbiAgICAgICAgICAgICAgICBhZGQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKVxuICAgICAgICAgICAgICAgIGFkZChrZXksIG9ialtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHNjaGVtYS5zb3J0TWFwRW50cmllcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbWFwLml0ZW1zLnNvcnQoc2NoZW1hLnNvcnRNYXBFbnRyaWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3ZlcndyaXRlIC0gSWYgbm90IHNldCBgdHJ1ZWAsIHVzaW5nIGEga2V5IHRoYXQgaXMgYWxyZWFkeSBpbiB0aGVcbiAgICAgKiAgIGNvbGxlY3Rpb24gd2lsbCB0aHJvdy4gT3RoZXJ3aXNlLCBvdmVyd3JpdGVzIHRoZSBwcmV2aW91cyB2YWx1ZS5cbiAgICAgKi9cbiAgICBhZGQocGFpciwgb3ZlcndyaXRlKSB7XG4gICAgICAgIGxldCBfcGFpcjtcbiAgICAgICAgaWYgKGlzUGFpcihwYWlyKSlcbiAgICAgICAgICAgIF9wYWlyID0gcGFpcjtcbiAgICAgICAgZWxzZSBpZiAoIXBhaXIgfHwgdHlwZW9mIHBhaXIgIT09ICdvYmplY3QnIHx8ICEoJ2tleScgaW4gcGFpcikpIHtcbiAgICAgICAgICAgIC8vIEluIFR5cGVTY3JpcHQsIHRoaXMgbmV2ZXIgaGFwcGVucy5cbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIocGFpciwgcGFpcj8udmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIocGFpci5rZXksIHBhaXIudmFsdWUpO1xuICAgICAgICBjb25zdCBwcmV2ID0gZmluZFBhaXIodGhpcy5pdGVtcywgX3BhaXIua2V5KTtcbiAgICAgICAgY29uc3Qgc29ydEVudHJpZXMgPSB0aGlzLnNjaGVtYT8uc29ydE1hcEVudHJpZXM7XG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICBpZiAoIW92ZXJ3cml0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEtleSAke19wYWlyLmtleX0gYWxyZWFkeSBzZXRgKTtcbiAgICAgICAgICAgIC8vIEZvciBzY2FsYXJzLCBrZWVwIHRoZSBvbGQgbm9kZSAmIGl0cyBjb21tZW50cyBhbmQgYW5jaG9yc1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKHByZXYudmFsdWUpICYmIGlzU2NhbGFyVmFsdWUoX3BhaXIudmFsdWUpKVxuICAgICAgICAgICAgICAgIHByZXYudmFsdWUudmFsdWUgPSBfcGFpci52YWx1ZTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlID0gX3BhaXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc29ydEVudHJpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLml0ZW1zLmZpbmRJbmRleChpdGVtID0+IHNvcnRFbnRyaWVzKF9wYWlyLCBpdGVtKSA8IDApO1xuICAgICAgICAgICAgaWYgKGkgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChfcGFpcik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UoaSwgMCwgX3BhaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKF9wYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgaWYgKCFpdClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgZGVsID0gdGhpcy5pdGVtcy5zcGxpY2UodGhpcy5pdGVtcy5pbmRleE9mKGl0KSwgMSk7XG4gICAgICAgIHJldHVybiBkZWwubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICBjb25zdCBpdCA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBpdD8udmFsdWU7XG4gICAgICAgIHJldHVybiAoIWtlZXBTY2FsYXIgJiYgaXNTY2FsYXIobm9kZSkgPyBub2RlLnZhbHVlIDogbm9kZSkgPz8gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiAhIWZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgfVxuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYWRkKG5ldyBQYWlyKGtleSwgdmFsdWUpLCB0cnVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpXG4gICAgICogQHBhcmFtIHtDbGFzc30gVHlwZSAtIElmIHNldCwgZm9yY2VzIHRoZSByZXR1cm5lZCBjb2xsZWN0aW9uIHR5cGVcbiAgICAgKiBAcmV0dXJucyBJbnN0YW5jZSBvZiBUeXBlLCBNYXAsIG9yIE9iamVjdFxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgsIFR5cGUpIHtcbiAgICAgICAgY29uc3QgbWFwID0gVHlwZSA/IG5ldyBUeXBlKCkgOiBjdHg/Lm1hcEFzTWFwID8gbmV3IE1hcCgpIDoge307XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKVxuICAgICAgICAgICAgYWRkUGFpclRvSlNNYXAoY3R4LCBtYXAsIGl0ZW0pO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoIWlzUGFpcihpdGVtKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1hcCBpdGVtcyBtdXN0IGFsbCBiZSBwYWlyczsgZm91bmQgJHtKU09OLnN0cmluZ2lmeShpdGVtKX0gaW5zdGVhZGApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY3R4LmFsbE51bGxWYWx1ZXMgJiYgdGhpcy5oYXNBbGxOdWxsVmFsdWVzKGZhbHNlKSlcbiAgICAgICAgICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBhbGxOdWxsVmFsdWVzOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5Q29sbGVjdGlvbih0aGlzLCBjdHgsIHtcbiAgICAgICAgICAgIGJsb2NrSXRlbVByZWZpeDogJycsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICd7JywgZW5kOiAnfScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IGN0eC5pbmRlbnQgfHwgJycsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFlBTUxNYXAsIGZpbmRQYWlyIH07XG4iLCJpbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi4vZG9jL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5Q29sbGVjdGlvbiB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlDb2xsZWN0aW9uLmpzJztcbmltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tICcuL0NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgU0VRLCBpc1NjYWxhciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgaXNTY2FsYXJWYWx1ZSB9IGZyb20gJy4vU2NhbGFyLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jbGFzcyBZQU1MU2VxIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gICAgc3RhdGljIGdldCB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3RhZzp5YW1sLm9yZywyMDAyOnNlcSc7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihTRVEsIHNjaGVtYSk7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICB9XG4gICAgYWRkKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogYGtleWAgbXVzdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciBmb3IgdGhpcyB0byBzdWNjZWVkLlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBkZWwgPSB0aGlzLml0ZW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgICByZXR1cm4gZGVsLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgaXQgPSB0aGlzLml0ZW1zW2lkeF07XG4gICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpc1NjYWxhcihpdCkgPyBpdC52YWx1ZSA6IGl0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGNvbGxlY3Rpb24gaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICpcbiAgICAgKiBga2V5YCBtdXN0IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyIGZvciB0aGlzIHRvIHN1Y2NlZWQuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgaWR4ID09PSAnbnVtYmVyJyAmJiBpZHggPCB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgY29sbGVjdGlvbi4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICpcbiAgICAgKiBJZiBga2V5YCBkb2VzIG5vdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciwgdGhpcyB3aWxsIHRocm93LlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhIHZhbGlkIGluZGV4LCBub3QgJHtrZXl9LmApO1xuICAgICAgICBjb25zdCBwcmV2ID0gdGhpcy5pdGVtc1tpZHhdO1xuICAgICAgICBpZiAoaXNTY2FsYXIocHJldikgJiYgaXNTY2FsYXJWYWx1ZSh2YWx1ZSkpXG4gICAgICAgICAgICBwcmV2LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaWR4XSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGNvbnN0IHNlcSA9IFtdO1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShzZXEpO1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKVxuICAgICAgICAgICAgc2VxLnB1c2godG9KUyhpdGVtLCBTdHJpbmcoaSsrKSwgY3R4KSk7XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24odGhpcywgY3R4LCB7XG4gICAgICAgICAgICBibG9ja0l0ZW1QcmVmaXg6ICctICcsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICdbJywgZW5kOiAnXScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IChjdHguaW5kZW50IHx8ICcnKSArICcgICcsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBvYmosIGN0eCkge1xuICAgICAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IHNlcSA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGlmIChvYmogJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChvYmopKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBpdCBvZiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IG9iaiBpbnN0YW5jZW9mIFNldCA/IGl0IDogU3RyaW5nKGkrKyk7XG4gICAgICAgICAgICAgICAgICAgIGl0ID0gcmVwbGFjZXIuY2FsbChvYmosIGtleSwgaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaChjcmVhdGVOb2RlKGl0LCB1bmRlZmluZWQsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNJdGVtSW5kZXgoa2V5KSB7XG4gICAgbGV0IGlkeCA9IGlzU2NhbGFyKGtleSkgPyBrZXkudmFsdWUgOiBrZXk7XG4gICAgaWYgKGlkeCAmJiB0eXBlb2YgaWR4ID09PSAnc3RyaW5nJylcbiAgICAgICAgaWR4ID0gTnVtYmVyKGlkeCk7XG4gICAgcmV0dXJuIHR5cGVvZiBpZHggPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaWR4KSAmJiBpZHggPj0gMFxuICAgICAgICA/IGlkeFxuICAgICAgICA6IG51bGw7XG59XG5cbmV4cG9ydCB7IFlBTUxTZXEgfTtcbiIsImltcG9ydCB7IHdhcm4gfSBmcm9tICcuLi9sb2cuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RyaW5naWZ5Q29udGV4dCB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnkuanMnO1xuaW1wb3J0IHsgaXNBbGlhcywgaXNTZXEsIGlzU2NhbGFyLCBpc01hcCwgaXNOb2RlIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuL1NjYWxhci5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi90b0pTLmpzJztcblxuY29uc3QgTUVSR0VfS0VZID0gJzw8JztcbmZ1bmN0aW9uIGFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCB7IGtleSwgdmFsdWUgfSkge1xuICAgIGlmIChjdHg/LmRvYy5zY2hlbWEubWVyZ2UgJiYgaXNNZXJnZUtleShrZXkpKSB7XG4gICAgICAgIHZhbHVlID0gaXNBbGlhcyh2YWx1ZSkgPyB2YWx1ZS5yZXNvbHZlKGN0eC5kb2MpIDogdmFsdWU7XG4gICAgICAgIGlmIChpc1NlcSh2YWx1ZSkpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIHZhbHVlLml0ZW1zKVxuICAgICAgICAgICAgICAgIG1lcmdlVG9KU01hcChjdHgsIG1hcCwgaXQpO1xuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXQgb2YgdmFsdWUpXG4gICAgICAgICAgICAgICAgbWVyZ2VUb0pTTWFwKGN0eCwgbWFwLCBpdCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1lcmdlVG9KU01hcChjdHgsIG1hcCwgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QganNLZXkgPSB0b0pTKGtleSwgJycsIGN0eCk7XG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIG1hcC5zZXQoanNLZXksIHRvSlModmFsdWUsIGpzS2V5LCBjdHgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtYXAgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIG1hcC5hZGQoanNLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RyaW5nS2V5ID0gc3RyaW5naWZ5S2V5KGtleSwganNLZXksIGN0eCk7XG4gICAgICAgICAgICBjb25zdCBqc1ZhbHVlID0gdG9KUyh2YWx1ZSwgc3RyaW5nS2V5LCBjdHgpO1xuICAgICAgICAgICAgaWYgKHN0cmluZ0tleSBpbiBtYXApXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwgc3RyaW5nS2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBqc1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWFwW3N0cmluZ0tleV0gPSBqc1ZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5jb25zdCBpc01lcmdlS2V5ID0gKGtleSkgPT4ga2V5ID09PSBNRVJHRV9LRVkgfHxcbiAgICAoaXNTY2FsYXIoa2V5KSAmJlxuICAgICAgICBrZXkudmFsdWUgPT09IE1FUkdFX0tFWSAmJlxuICAgICAgICAoIWtleS50eXBlIHx8IGtleS50eXBlID09PSBTY2FsYXIuUExBSU4pKTtcbi8vIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYSBtZXJnZSBrZXkgaXMgYSBzaW5nbGUgbWFwcGluZyBub2RlLCBlYWNoIG9mXG4vLyBpdHMga2V5L3ZhbHVlIHBhaXJzIGlzIGluc2VydGVkIGludG8gdGhlIGN1cnJlbnQgbWFwcGluZywgdW5sZXNzIHRoZSBrZXlcbi8vIGFscmVhZHkgZXhpc3RzIGluIGl0LiBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBtZXJnZSBrZXkgaXMgYVxuLy8gc2VxdWVuY2UsIHRoZW4gdGhpcyBzZXF1ZW5jZSBpcyBleHBlY3RlZCB0byBjb250YWluIG1hcHBpbmcgbm9kZXMgYW5kIGVhY2hcbi8vIG9mIHRoZXNlIG5vZGVzIGlzIG1lcmdlZCBpbiB0dXJuIGFjY29yZGluZyB0byBpdHMgb3JkZXIgaW4gdGhlIHNlcXVlbmNlLlxuLy8gS2V5cyBpbiBtYXBwaW5nIG5vZGVzIGVhcmxpZXIgaW4gdGhlIHNlcXVlbmNlIG92ZXJyaWRlIGtleXMgc3BlY2lmaWVkIGluXG4vLyBsYXRlciBtYXBwaW5nIG5vZGVzLiAtLSBodHRwOi8veWFtbC5vcmcvdHlwZS9tZXJnZS5odG1sXG5mdW5jdGlvbiBtZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKSB7XG4gICAgY29uc3Qgc291cmNlID0gY3R4ICYmIGlzQWxpYXModmFsdWUpID8gdmFsdWUucmVzb2x2ZShjdHguZG9jKSA6IHZhbHVlO1xuICAgIGlmICghaXNNYXAoc291cmNlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXJnZSBzb3VyY2VzIG11c3QgYmUgbWFwcyBvciBtYXAgYWxpYXNlcycpO1xuICAgIGNvbnN0IHNyY01hcCA9IHNvdXJjZS50b0pTT04obnVsbCwgY3R4LCBNYXApO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHNyY01hcCkge1xuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBpZiAoIW1hcC5oYXMoa2V5KSlcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1hcCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgbWFwLmFkZChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWFwLCBrZXkpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobWFwLCBrZXksIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUtleShrZXksIGpzS2V5LCBjdHgpIHtcbiAgICBpZiAoanNLZXkgPT09IG51bGwpXG4gICAgICAgIHJldHVybiAnJztcbiAgICBpZiAodHlwZW9mIGpzS2V5ICE9PSAnb2JqZWN0JylcbiAgICAgICAgcmV0dXJuIFN0cmluZyhqc0tleSk7XG4gICAgaWYgKGlzTm9kZShrZXkpICYmIGN0eD8uZG9jKSB7XG4gICAgICAgIGNvbnN0IHN0ckN0eCA9IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoY3R4LmRvYywge30pO1xuICAgICAgICBzdHJDdHguYW5jaG9ycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIGN0eC5hbmNob3JzLmtleXMoKSlcbiAgICAgICAgICAgIHN0ckN0eC5hbmNob3JzLmFkZChub2RlLmFuY2hvcik7XG4gICAgICAgIHN0ckN0eC5pbkZsb3cgPSB0cnVlO1xuICAgICAgICBzdHJDdHguaW5TdHJpbmdpZnlLZXkgPSB0cnVlO1xuICAgICAgICBjb25zdCBzdHJLZXkgPSBrZXkudG9TdHJpbmcoc3RyQ3R4KTtcbiAgICAgICAgaWYgKCFjdHgubWFwS2V5V2FybmVkKSB7XG4gICAgICAgICAgICBsZXQganNvblN0ciA9IEpTT04uc3RyaW5naWZ5KHN0cktleSk7XG4gICAgICAgICAgICBpZiAoanNvblN0ci5sZW5ndGggPiA0MClcbiAgICAgICAgICAgICAgICBqc29uU3RyID0ganNvblN0ci5zdWJzdHJpbmcoMCwgMzYpICsgJy4uLlwiJztcbiAgICAgICAgICAgIHdhcm4oY3R4LmRvYy5vcHRpb25zLmxvZ0xldmVsLCBgS2V5cyB3aXRoIGNvbGxlY3Rpb24gdmFsdWVzIHdpbGwgYmUgc3RyaW5naWZpZWQgZHVlIHRvIEpTIE9iamVjdCByZXN0cmljdGlvbnM6ICR7anNvblN0cn0uIFNldCBtYXBBc01hcDogdHJ1ZSB0byB1c2Ugb2JqZWN0IGtleXMuYCk7XG4gICAgICAgICAgICBjdHgubWFwS2V5V2FybmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyS2V5O1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoanNLZXkpO1xufVxuXG5leHBvcnQgeyBhZGRQYWlyVG9KU01hcCB9O1xuIiwiY29uc3QgQUxJQVMgPSBTeW1ib2wuZm9yKCd5YW1sLmFsaWFzJyk7XG5jb25zdCBET0MgPSBTeW1ib2wuZm9yKCd5YW1sLmRvY3VtZW50Jyk7XG5jb25zdCBNQVAgPSBTeW1ib2wuZm9yKCd5YW1sLm1hcCcpO1xuY29uc3QgUEFJUiA9IFN5bWJvbC5mb3IoJ3lhbWwucGFpcicpO1xuY29uc3QgU0NBTEFSID0gU3ltYm9sLmZvcigneWFtbC5zY2FsYXInKTtcbmNvbnN0IFNFUSA9IFN5bWJvbC5mb3IoJ3lhbWwuc2VxJyk7XG5jb25zdCBOT0RFX1RZUEUgPSBTeW1ib2wuZm9yKCd5YW1sLm5vZGUudHlwZScpO1xuY29uc3QgaXNBbGlhcyA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gQUxJQVM7XG5jb25zdCBpc0RvY3VtZW50ID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBET0M7XG5jb25zdCBpc01hcCA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gTUFQO1xuY29uc3QgaXNQYWlyID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBQQUlSO1xuY29uc3QgaXNTY2FsYXIgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IFNDQUxBUjtcbmNvbnN0IGlzU2VxID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBTRVE7XG5mdW5jdGlvbiBpc0NvbGxlY3Rpb24obm9kZSkge1xuICAgIGlmIChub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JylcbiAgICAgICAgc3dpdGNoIChub2RlW05PREVfVFlQRV0pIHtcbiAgICAgICAgICAgIGNhc2UgTUFQOlxuICAgICAgICAgICAgY2FzZSBTRVE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBpc05vZGUobm9kZSkge1xuICAgIGlmIChub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JylcbiAgICAgICAgc3dpdGNoIChub2RlW05PREVfVFlQRV0pIHtcbiAgICAgICAgICAgIGNhc2UgQUxJQVM6XG4gICAgICAgICAgICBjYXNlIE1BUDpcbiAgICAgICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgY2FzZSBTRVE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5jb25zdCBoYXNBbmNob3IgPSAobm9kZSkgPT4gKGlzU2NhbGFyKG5vZGUpIHx8IGlzQ29sbGVjdGlvbihub2RlKSkgJiYgISFub2RlLmFuY2hvcjtcblxuZXhwb3J0IHsgQUxJQVMsIERPQywgTUFQLCBOT0RFX1RZUEUsIFBBSVIsIFNDQUxBUiwgU0VRLCBoYXNBbmNob3IsIGlzQWxpYXMsIGlzQ29sbGVjdGlvbiwgaXNEb2N1bWVudCwgaXNNYXAsIGlzTm9kZSwgaXNQYWlyLCBpc1NjYWxhciwgaXNTZXEgfTtcbiIsImltcG9ydCB7IGhhc0FuY2hvciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgYW55IG5vZGUgb3IgaXRzIGNvbnRlbnRzIHRvIG5hdGl2ZSBKYXZhU2NyaXB0XG4gKlxuICogQHBhcmFtIHZhbHVlIC0gVGhlIGlucHV0IHZhbHVlXG4gKiBAcGFyYW0gYXJnIC0gSWYgYHZhbHVlYCBkZWZpbmVzIGEgYHRvSlNPTigpYCBtZXRob2QsIHVzZSB0aGlzXG4gKiAgIGFzIGl0cyBmaXJzdCBhcmd1bWVudFxuICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpLiBJZlxuICogICBgeyBrZWVwOiB0cnVlIH1gIGlzIG5vdCBzZXQsIG91dHB1dCBzaG91bGQgYmUgc3VpdGFibGUgZm9yIEpTT05cbiAqICAgc3RyaW5naWZpY2F0aW9uLlxuICovXG5mdW5jdGlvbiB0b0pTKHZhbHVlLCBhcmcsIGN0eCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVyblxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlLm1hcCgodiwgaSkgPT4gdG9KUyh2LCBTdHJpbmcoaSksIGN0eCkpO1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGxcbiAgICAgICAgaWYgKCFjdHggfHwgIWhhc0FuY2hvcih2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9KU09OKGFyZywgY3R4KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHsgYWxpYXNDb3VudDogMCwgY291bnQ6IDEsIHJlczogdW5kZWZpbmVkIH07XG4gICAgICAgIGN0eC5hbmNob3JzLnNldCh2YWx1ZSwgZGF0YSk7XG4gICAgICAgIGN0eC5vbkNyZWF0ZSA9IHJlcyA9PiB7XG4gICAgICAgICAgICBkYXRhLnJlcyA9IHJlcztcbiAgICAgICAgICAgIGRlbGV0ZSBjdHgub25DcmVhdGU7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHZhbHVlLnRvSlNPTihhcmcsIGN0eCk7XG4gICAgICAgIGlmIChjdHgub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUocmVzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgJiYgIWN0eD8ua2VlcClcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgeyB0b0pTIH07XG4iLCJpbXBvcnQgeyByZXNvbHZlQmxvY2tTY2FsYXIgfSBmcm9tICcuLi9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2NhbGFyLmpzJztcbmltcG9ydCB7IHJlc29sdmVGbG93U2NhbGFyIH0gZnJvbSAnLi4vY29tcG9zZS9yZXNvbHZlLWZsb3ctc2NhbGFyLmpzJztcbmltcG9ydCB7IFlBTUxQYXJzZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeVN0cmluZyB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlQXNTY2FsYXIodG9rZW4sIHN0cmljdCA9IHRydWUsIG9uRXJyb3IpIHtcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgY29uc3QgX29uRXJyb3IgPSAocG9zLCBjb2RlLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB0eXBlb2YgcG9zID09PSAnbnVtYmVyJyA/IHBvcyA6IEFycmF5LmlzQXJyYXkocG9zKSA/IHBvc1swXSA6IHBvcy5vZmZzZXQ7XG4gICAgICAgICAgICBpZiAob25FcnJvcilcbiAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgY29kZSwgbWVzc2FnZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFlBTUxQYXJzZUVycm9yKFtvZmZzZXQsIG9mZnNldCArIDFdLCBjb2RlLCBtZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlRmxvd1NjYWxhcih0b2tlbiwgc3RyaWN0LCBfb25FcnJvcik7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlQmxvY2tTY2FsYXIoeyBvcHRpb25zOiB7IHN0cmljdCB9IH0sIHRva2VuLCBfb25FcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzY2FsYXIgdG9rZW4gd2l0aCBgdmFsdWVgXG4gKlxuICogVmFsdWVzIHRoYXQgcmVwcmVzZW50IGFuIGFjdHVhbCBzdHJpbmcgYnV0IG1heSBiZSBwYXJzZWQgYXMgYSBkaWZmZXJlbnQgdHlwZSBzaG91bGQgdXNlIGEgYHR5cGVgIG90aGVyIHRoYW4gYCdQTEFJTidgLFxuICogYXMgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGFueSBzY2hlbWEgb3BlcmF0aW9ucyBhbmQgd29uJ3QgY2hlY2sgZm9yIHN1Y2ggY29uZmxpY3RzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZSwgd2hpY2ggd2lsbCBoYXZlIGl0cyBjb250ZW50IHByb3Blcmx5IGluZGVudGVkLlxuICogQHBhcmFtIGNvbnRleHQuZW5kIENvbW1lbnRzIGFuZCB3aGl0ZXNwYWNlIGFmdGVyIHRoZSBlbmQgb2YgdGhlIHZhbHVlLCBvciBhZnRlciB0aGUgYmxvY2sgc2NhbGFyIGhlYWRlci4gSWYgdW5kZWZpbmVkLCBhIG5ld2xpbmUgd2lsbCBiZSBhZGRlZC5cbiAqIEBwYXJhbSBjb250ZXh0LmltcGxpY2l0S2V5IEJlaW5nIHdpdGhpbiBhbiBpbXBsaWNpdCBrZXkgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LmluZGVudCBUaGUgaW5kZW50IGxldmVsIG9mIHRoZSB0b2tlbi5cbiAqIEBwYXJhbSBjb250ZXh0LmluRmxvdyBJcyB0aGlzIHNjYWxhciB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24/IFRoaXMgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0Lm9mZnNldCBUaGUgb2Zmc2V0IHBvc2l0aW9uIG9mIHRoZSB0b2tlbi5cbiAqIEBwYXJhbSBjb250ZXh0LnR5cGUgVGhlIHByZWZlcnJlZCB0eXBlIG9mIHRoZSBzY2FsYXIgdG9rZW4uIElmIHVuZGVmaW5lZCwgdGhlIHByZXZpb3VzIHR5cGUgb2YgdGhlIGB0b2tlbmAgd2lsbCBiZSB1c2VkLCBkZWZhdWx0aW5nIHRvIGAnUExBSU4nYC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2NhbGFyVG9rZW4odmFsdWUsIGNvbnRleHQpIHtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5ID0gZmFsc2UsIGluZGVudCwgaW5GbG93ID0gZmFsc2UsIG9mZnNldCA9IC0xLCB0eXBlID0gJ1BMQUlOJyB9ID0gY29udGV4dDtcbiAgICBjb25zdCBzb3VyY2UgPSBzdHJpbmdpZnlTdHJpbmcoeyB0eXBlLCB2YWx1ZSB9LCB7XG4gICAgICAgIGltcGxpY2l0S2V5LFxuICAgICAgICBpbmRlbnQ6IGluZGVudCA+IDAgPyAnICcucmVwZWF0KGluZGVudCkgOiAnJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiB7IGJsb2NrUXVvdGU6IHRydWUsIGxpbmVXaWR0aDogLTEgfVxuICAgIH0pO1xuICAgIGNvbnN0IGVuZCA9IGNvbnRleHQuZW5kID8/IFtcbiAgICAgICAgeyB0eXBlOiAnbmV3bGluZScsIG9mZnNldDogLTEsIGluZGVudCwgc291cmNlOiAnXFxuJyB9XG4gICAgXTtcbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6IHtcbiAgICAgICAgICAgIGNvbnN0IGhlID0gc291cmNlLmluZGV4T2YoJ1xcbicpO1xuICAgICAgICAgICAgY29uc3QgaGVhZCA9IHNvdXJjZS5zdWJzdHJpbmcoMCwgaGUpO1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IHNvdXJjZS5zdWJzdHJpbmcoaGUgKyAxKSArICdcXG4nO1xuICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBbXG4gICAgICAgICAgICAgICAgeyB0eXBlOiAnYmxvY2stc2NhbGFyLWhlYWRlcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2U6IGhlYWQgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmICghYWRkRW5kdG9CbG9ja1Byb3BzKHByb3BzLCBlbmQpKVxuICAgICAgICAgICAgICAgIHByb3BzLnB1c2goeyB0eXBlOiAnbmV3bGluZScsIG9mZnNldDogLTEsIGluZGVudCwgc291cmNlOiAnXFxuJyB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdibG9jay1zY2FsYXInLCBvZmZzZXQsIGluZGVudCwgcHJvcHMsIHNvdXJjZTogYm9keSB9O1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdkb3VibGUtcXVvdGVkLXNjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZSwgZW5kIH07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZSwgZW5kIH07XG4gICAgfVxufVxuLyoqXG4gKiBTZXQgdGhlIHZhbHVlIG9mIGB0b2tlbmAgdG8gdGhlIGdpdmVuIHN0cmluZyBgdmFsdWVgLCBvdmVyd3JpdGluZyBhbnkgcHJldmlvdXMgY29udGVudHMgYW5kIHR5cGUgdGhhdCBpdCBtYXkgaGF2ZS5cbiAqXG4gKiBCZXN0IGVmZm9ydHMgYXJlIG1hZGUgdG8gcmV0YWluIGFueSBjb21tZW50cyBwcmV2aW91c2x5IGFzc29jaWF0ZWQgd2l0aCB0aGUgYHRva2VuYCxcbiAqIHRob3VnaCBhbGwgY29udGVudHMgd2l0aGluIGEgY29sbGVjdGlvbidzIGBpdGVtc2Agd2lsbCBiZSBvdmVyd3JpdHRlbi5cbiAqXG4gKiBWYWx1ZXMgdGhhdCByZXByZXNlbnQgYW4gYWN0dWFsIHN0cmluZyBidXQgbWF5IGJlIHBhcnNlZCBhcyBhIGRpZmZlcmVudCB0eXBlIHNob3VsZCB1c2UgYSBgdHlwZWAgb3RoZXIgdGhhbiBgJ1BMQUlOJ2AsXG4gKiBhcyB0aGlzIGZ1bmN0aW9uIGRvZXMgbm90IHN1cHBvcnQgYW55IHNjaGVtYSBvcGVyYXRpb25zIGFuZCB3b24ndCBjaGVjayBmb3Igc3VjaCBjb25mbGljdHMuXG4gKlxuICogQHBhcmFtIHRva2VuIEFueSB0b2tlbi4gSWYgaXQgZG9lcyBub3QgaW5jbHVkZSBhbiBgaW5kZW50YCB2YWx1ZSwgdGhlIHZhbHVlIHdpbGwgYmUgc3RyaW5naWZpZWQgYXMgaWYgaXQgd2VyZSBhbiBpbXBsaWNpdCBrZXkuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmFsdWUsIHdoaWNoIHdpbGwgaGF2ZSBpdHMgY29udGVudCBwcm9wZXJseSBpbmRlbnRlZC5cbiAqIEBwYXJhbSBjb250ZXh0LmFmdGVyS2V5IEluIG1vc3QgY2FzZXMsIHZhbHVlcyBhZnRlciBhIGtleSBzaG91bGQgaGF2ZSBhbiBhZGRpdGlvbmFsIGxldmVsIG9mIGluZGVudGF0aW9uLlxuICogQHBhcmFtIGNvbnRleHQuaW1wbGljaXRLZXkgQmVpbmcgd2l0aGluIGFuIGltcGxpY2l0IGtleSBtYXkgYWZmZWN0IHRoZSByZXNvbHZlZCB0eXBlIG9mIHRoZSB0b2tlbidzIHZhbHVlLlxuICogQHBhcmFtIGNvbnRleHQuaW5GbG93IEJlaW5nIHdpdGhpbiBhIGZsb3cgY29sbGVjdGlvbiBtYXkgYWZmZWN0IHRoZSByZXNvbHZlZCB0eXBlIG9mIHRoZSB0b2tlbidzIHZhbHVlLlxuICogQHBhcmFtIGNvbnRleHQudHlwZSBUaGUgcHJlZmVycmVkIHR5cGUgb2YgdGhlIHNjYWxhciB0b2tlbi4gSWYgdW5kZWZpbmVkLCB0aGUgcHJldmlvdXMgdHlwZSBvZiB0aGUgYHRva2VuYCB3aWxsIGJlIHVzZWQsIGRlZmF1bHRpbmcgdG8gYCdQTEFJTidgLlxuICovXG5mdW5jdGlvbiBzZXRTY2FsYXJWYWx1ZSh0b2tlbiwgdmFsdWUsIGNvbnRleHQgPSB7fSkge1xuICAgIGxldCB7IGFmdGVyS2V5ID0gZmFsc2UsIGltcGxpY2l0S2V5ID0gZmFsc2UsIGluRmxvdyA9IGZhbHNlLCB0eXBlIH0gPSBjb250ZXh0O1xuICAgIGxldCBpbmRlbnQgPSAnaW5kZW50JyBpbiB0b2tlbiA/IHRva2VuLmluZGVudCA6IG51bGw7XG4gICAgaWYgKGFmdGVyS2V5ICYmIHR5cGVvZiBpbmRlbnQgPT09ICdudW1iZXInKVxuICAgICAgICBpbmRlbnQgKz0gMjtcbiAgICBpZiAoIXR5cGUpXG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHR5cGUgPSAnUVVPVEVfU0lOR0xFJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICB0eXBlID0gJ1FVT1RFX0RPVUJMRSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gdG9rZW4ucHJvcHNbMF07XG4gICAgICAgICAgICAgICAgaWYgKGhlYWRlci50eXBlICE9PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBibG9jayBzY2FsYXIgaGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgdHlwZSA9IGhlYWRlci5zb3VyY2VbMF0gPT09ICc+JyA/ICdCTE9DS19GT0xERUQnIDogJ0JMT0NLX0xJVEVSQUwnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0eXBlID0gJ1BMQUlOJztcbiAgICAgICAgfVxuICAgIGNvbnN0IHNvdXJjZSA9IHN0cmluZ2lmeVN0cmluZyh7IHR5cGUsIHZhbHVlIH0sIHtcbiAgICAgICAgaW1wbGljaXRLZXk6IGltcGxpY2l0S2V5IHx8IGluZGVudCA9PT0gbnVsbCxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgIT09IG51bGwgJiYgaW5kZW50ID4gMCA/ICcgJy5yZXBlYXQoaW5kZW50KSA6ICcnLFxuICAgICAgICBpbkZsb3csXG4gICAgICAgIG9wdGlvbnM6IHsgYmxvY2tRdW90ZTogdHJ1ZSwgbGluZVdpZHRoOiAtMSB9XG4gICAgfSk7XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgc2V0QmxvY2tTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCAnc2luZ2xlLXF1b3RlZC1zY2FsYXInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsICdzY2FsYXInKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRCbG9ja1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UpIHtcbiAgICBjb25zdCBoZSA9IHNvdXJjZS5pbmRleE9mKCdcXG4nKTtcbiAgICBjb25zdCBoZWFkID0gc291cmNlLnN1YnN0cmluZygwLCBoZSk7XG4gICAgY29uc3QgYm9keSA9IHNvdXJjZS5zdWJzdHJpbmcoaGUgKyAxKSArICdcXG4nO1xuICAgIGlmICh0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJykge1xuICAgICAgICBjb25zdCBoZWFkZXIgPSB0b2tlbi5wcm9wc1swXTtcbiAgICAgICAgaWYgKGhlYWRlci50eXBlICE9PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmxvY2sgc2NhbGFyIGhlYWRlcicpO1xuICAgICAgICBoZWFkZXIuc291cmNlID0gaGVhZDtcbiAgICAgICAgdG9rZW4uc291cmNlID0gYm9keTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0IH0gPSB0b2tlbjtcbiAgICAgICAgY29uc3QgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiAtMTtcbiAgICAgICAgY29uc3QgcHJvcHMgPSBbXG4gICAgICAgICAgICB7IHR5cGU6ICdibG9jay1zY2FsYXItaGVhZGVyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZTogaGVhZCB9XG4gICAgICAgIF07XG4gICAgICAgIGlmICghYWRkRW5kdG9CbG9ja1Byb3BzKHByb3BzLCAnZW5kJyBpbiB0b2tlbiA/IHRva2VuLmVuZCA6IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICBwcm9wcy5wdXNoKHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfSk7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRva2VuKSlcbiAgICAgICAgICAgIGlmIChrZXkgIT09ICd0eXBlJyAmJiBrZXkgIT09ICdvZmZzZXQnKVxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0b2tlbltrZXldO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGU6ICdibG9jay1zY2FsYXInLCBpbmRlbnQsIHByb3BzLCBzb3VyY2U6IGJvZHkgfSk7XG4gICAgfVxufVxuLyoqIEByZXR1cm5zIGB0cnVlYCBpZiBsYXN0IHRva2VuIGlzIGEgbmV3bGluZSAqL1xuZnVuY3Rpb24gYWRkRW5kdG9CbG9ja1Byb3BzKHByb3BzLCBlbmQpIHtcbiAgICBpZiAoZW5kKVxuICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGVuZClcbiAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChzdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHN0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsIHR5cGUpIHtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICB0b2tlbi50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIHRva2VuLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOiB7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSB0b2tlbi5wcm9wcy5zbGljZSgxKTtcbiAgICAgICAgICAgIGxldCBvYSA9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICBpZiAodG9rZW4ucHJvcHNbMF0udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgICAgIG9hIC09IHRva2VuLnByb3BzWzBdLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRvayBvZiBlbmQpXG4gICAgICAgICAgICAgICAgdG9rLm9mZnNldCArPSBvYTtcbiAgICAgICAgICAgIGRlbGV0ZSB0b2tlbi5wcm9wcztcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZSwgc291cmNlLCBlbmQgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB0b2tlbi5vZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgbmwgPSB7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0LCBpbmRlbnQ6IHRva2VuLmluZGVudCwgc291cmNlOiAnXFxuJyB9O1xuICAgICAgICAgICAgZGVsZXRlIHRva2VuLml0ZW1zO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlLCBzb3VyY2UsIGVuZDogW25sXSB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGNvbnN0IGluZGVudCA9ICdpbmRlbnQnIGluIHRva2VuID8gdG9rZW4uaW5kZW50IDogLTE7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiB0b2tlbiAmJiBBcnJheS5pc0FycmF5KHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICA/IHRva2VuLmVuZC5maWx0ZXIoc3QgPT4gc3QudHlwZSA9PT0gJ3NwYWNlJyB8fFxuICAgICAgICAgICAgICAgICAgICBzdC50eXBlID09PSAnY29tbWVudCcgfHxcbiAgICAgICAgICAgICAgICAgICAgc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgIDogW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0b2tlbikpXG4gICAgICAgICAgICAgICAgaWYgKGtleSAhPT0gJ3R5cGUnICYmIGtleSAhPT0gJ29mZnNldCcpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0b2tlbltrZXldO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlLCBpbmRlbnQsIHNvdXJjZSwgZW5kIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBjcmVhdGVTY2FsYXJUb2tlbiwgcmVzb2x2ZUFzU2NhbGFyLCBzZXRTY2FsYXJWYWx1ZSB9O1xuIiwiLyoqXG4gKiBTdHJpbmdpZnkgYSBDU1QgZG9jdW1lbnQsIHRva2VuLCBvciBjb2xsZWN0aW9uIGl0ZW1cbiAqXG4gKiBGYWlyIHdhcm5pbmc6IFRoaXMgYXBwbGllcyBubyB2YWxpZGF0aW9uIHdoYXRzb2V2ZXIsIGFuZFxuICogc2ltcGx5IGNvbmNhdGVuYXRlcyB0aGUgc291cmNlcyBpbiB0aGVpciBsb2dpY2FsIG9yZGVyLlxuICovXG5jb25zdCBzdHJpbmdpZnkgPSAoY3N0KSA9PiAndHlwZScgaW4gY3N0ID8gc3RyaW5naWZ5VG9rZW4oY3N0KSA6IHN0cmluZ2lmeUl0ZW0oY3N0KTtcbmZ1bmN0aW9uIHN0cmluZ2lmeVRva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSAnJztcbiAgICAgICAgICAgIGZvciAoY29uc3QgdG9rIG9mIHRva2VuLnByb3BzKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlUb2tlbih0b2spO1xuICAgICAgICAgICAgcmV0dXJuIHJlcyArIHRva2VuLnNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdG9rZW4uaXRlbXMpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0cmluZ2lmeUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSB0b2tlbi5zdGFydC5zb3VyY2U7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdG9rZW4uaXRlbXMpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0cmluZ2lmeUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdkb2N1bWVudCc6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSBzdHJpbmdpZnlJdGVtKHRva2VuKTtcbiAgICAgICAgICAgIGlmICh0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoJ2VuZCcgaW4gdG9rZW4gJiYgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUl0ZW0oeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0pIHtcbiAgICBsZXQgcmVzID0gJyc7XG4gICAgZm9yIChjb25zdCBzdCBvZiBzdGFydClcbiAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICBpZiAoa2V5KVxuICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4oa2V5KTtcbiAgICBpZiAoc2VwKVxuICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHNlcClcbiAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgaWYgKHZhbHVlKVxuICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4odmFsdWUpO1xuICAgIHJldHVybiByZXM7XG59XG5cbmV4cG9ydCB7IHN0cmluZ2lmeSB9O1xuIiwiY29uc3QgQlJFQUsgPSBTeW1ib2woJ2JyZWFrIHZpc2l0Jyk7XG5jb25zdCBTS0lQID0gU3ltYm9sKCdza2lwIGNoaWxkcmVuJyk7XG5jb25zdCBSRU1PVkUgPSBTeW1ib2woJ3JlbW92ZSBpdGVtJyk7XG4vKipcbiAqIEFwcGx5IGEgdmlzaXRvciB0byBhIENTVCBkb2N1bWVudCBvciBpdGVtLlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIHRoZSByb290LCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHR3byBhcmd1bWVudHMgd2hlbiBlbnRlcmluZyBlYWNoIGl0ZW06XG4gKiAgIC0gYGl0ZW1gOiBUaGUgY3VycmVudCBpdGVtLCB3aGljaCBpbmNsdWRlZCB0aGUgZm9sbG93aW5nIG1lbWJlcnM6XG4gKiAgICAgLSBgc3RhcnQ6IFNvdXJjZVRva2VuW11gIOKAkyBTb3VyY2UgdG9rZW5zIGJlZm9yZSB0aGUga2V5IG9yIHZhbHVlLFxuICogICAgICAgcG9zc2libHkgaW5jbHVkaW5nIGl0cyBhbmNob3Igb3IgdGFnLlxuICogICAgIC0gYGtleT86IFRva2VuIHwgbnVsbGAg4oCTIFNldCBmb3IgcGFpciB2YWx1ZXMuIE1heSB0aGVuIGJlIGBudWxsYCwgaWZcbiAqICAgICAgIHRoZSBrZXkgYmVmb3JlIHRoZSBgOmAgc2VwYXJhdG9yIGlzIGVtcHR5LlxuICogICAgIC0gYHNlcD86IFNvdXJjZVRva2VuW11gIOKAkyBTb3VyY2UgdG9rZW5zIGJldHdlZW4gdGhlIGtleSBhbmQgdGhlIHZhbHVlLFxuICogICAgICAgd2hpY2ggc2hvdWxkIGluY2x1ZGUgdGhlIGA6YCBtYXAgdmFsdWUgaW5kaWNhdG9yIGlmIGB2YWx1ZWAgaXMgc2V0LlxuICogICAgIC0gYHZhbHVlPzogVG9rZW5gIOKAkyBUaGUgdmFsdWUgb2YgYSBzZXF1ZW5jZSBpdGVtLCBvciBvZiBhIG1hcCBwYWlyLlxuICogICAtIGBwYXRoYDogVGhlIHN0ZXBzIGZyb20gdGhlIHJvb3QgdG8gdGhlIGN1cnJlbnQgbm9kZSwgYXMgYW4gYXJyYXkgb2ZcbiAqICAgICBgWydrZXknIHwgJ3ZhbHVlJywgbnVtYmVyXWAgdHVwbGVzLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyB0b2tlbiwgY29udGludWUgd2l0aFxuICogICAgICBuZXh0IHNpYmxpbmdcbiAqICAgLSBgdmlzaXQuQlJFQUtgOiBUZXJtaW5hdGUgdHJhdmVyc2FsIGNvbXBsZXRlbHlcbiAqICAgLSBgdmlzaXQuUkVNT1ZFYDogUmVtb3ZlIHRoZSBjdXJyZW50IGl0ZW0sIHRoZW4gY29udGludWUgd2l0aCB0aGUgbmV4dCBvbmVcbiAqICAgLSBgbnVtYmVyYDogU2V0IHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmXG4gKiAgICAgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IHRva2VuIGhhcyBjaGFuZ2VkLlxuICogICAtIGBmdW5jdGlvbmA6IERlZmluZSB0aGUgbmV4dCB2aXNpdG9yIGZvciB0aGlzIGl0ZW0uIEFmdGVyIHRoZSBvcmlnaW5hbFxuICogICAgIHZpc2l0b3IgaXMgY2FsbGVkIG9uIGl0ZW0gZW50cnksIG5leHQgdmlzaXRvcnMgYXJlIGNhbGxlZCBhZnRlciBoYW5kbGluZ1xuICogICAgIGEgbm9uLWVtcHR5IGBrZXlgIGFuZCB3aGVuIGV4aXRpbmcgdGhlIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHZpc2l0KGNzdCwgdmlzaXRvcikge1xuICAgIGlmICgndHlwZScgaW4gY3N0ICYmIGNzdC50eXBlID09PSAnZG9jdW1lbnQnKVxuICAgICAgICBjc3QgPSB7IHN0YXJ0OiBjc3Quc3RhcnQsIHZhbHVlOiBjc3QudmFsdWUgfTtcbiAgICBfdmlzaXQoT2JqZWN0LmZyZWV6ZShbXSksIGNzdCwgdmlzaXRvcik7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0LkJSRUFLID0gQlJFQUs7XG4vKiogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCBpdGVtICovXG52aXNpdC5TS0lQID0gU0tJUDtcbi8qKiBSZW1vdmUgdGhlIGN1cnJlbnQgaXRlbSAqL1xudmlzaXQuUkVNT1ZFID0gUkVNT1ZFO1xuLyoqIEZpbmQgdGhlIGl0ZW0gYXQgYHBhdGhgIGZyb20gYGNzdGAgYXMgdGhlIHJvb3QgKi9cbnZpc2l0Lml0ZW1BdFBhdGggPSAoY3N0LCBwYXRoKSA9PiB7XG4gICAgbGV0IGl0ZW0gPSBjc3Q7XG4gICAgZm9yIChjb25zdCBbZmllbGQsIGluZGV4XSBvZiBwYXRoKSB7XG4gICAgICAgIGNvbnN0IHRvayA9IGl0ZW0/LltmaWVsZF07XG4gICAgICAgIGlmICh0b2sgJiYgJ2l0ZW1zJyBpbiB0b2spIHtcbiAgICAgICAgICAgIGl0ZW0gPSB0b2suaXRlbXNbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBpdGVtO1xufTtcbi8qKlxuICogR2V0IHRoZSBpbW1lZGlhdGUgcGFyZW50IGNvbGxlY3Rpb24gb2YgdGhlIGl0ZW0gYXQgYHBhdGhgIGZyb20gYGNzdGAgYXMgdGhlIHJvb3QuXG4gKlxuICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBjb2xsZWN0aW9uIGlzIG5vdCBmb3VuZCwgd2hpY2ggc2hvdWxkIG5ldmVyIGhhcHBlbiBpZiB0aGUgaXRlbSBpdHNlbGYgZXhpc3RzLlxuICovXG52aXNpdC5wYXJlbnRDb2xsZWN0aW9uID0gKGNzdCwgcGF0aCkgPT4ge1xuICAgIGNvbnN0IHBhcmVudCA9IHZpc2l0Lml0ZW1BdFBhdGgoY3N0LCBwYXRoLnNsaWNlKDAsIC0xKSk7XG4gICAgY29uc3QgZmllbGQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV1bMF07XG4gICAgY29uc3QgY29sbCA9IHBhcmVudD8uW2ZpZWxkXTtcbiAgICBpZiAoY29sbCAmJiAnaXRlbXMnIGluIGNvbGwpXG4gICAgICAgIHJldHVybiBjb2xsO1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyZW50IGNvbGxlY3Rpb24gbm90IGZvdW5kJyk7XG59O1xuZnVuY3Rpb24gX3Zpc2l0KHBhdGgsIGl0ZW0sIHZpc2l0b3IpIHtcbiAgICBsZXQgY3RybCA9IHZpc2l0b3IoaXRlbSwgcGF0aCk7XG4gICAgaWYgKHR5cGVvZiBjdHJsID09PSAnc3ltYm9sJylcbiAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBbJ2tleScsICd2YWx1ZSddKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gaXRlbVtmaWVsZF07XG4gICAgICAgIGlmICh0b2tlbiAmJiAnaXRlbXMnIGluIHRva2VuKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2VuLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBfdmlzaXQoT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChbW2ZpZWxkLCBpXV0pKSwgdG9rZW4uaXRlbXNbaV0sIHZpc2l0b3IpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdHJsID09PSAnZnVuY3Rpb24nICYmIGZpZWxkID09PSAna2V5JylcbiAgICAgICAgICAgICAgICBjdHJsID0gY3RybChpdGVtLCBwYXRoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIGN0cmwgPT09ICdmdW5jdGlvbicgPyBjdHJsKGl0ZW0sIHBhdGgpIDogY3RybDtcbn1cblxuZXhwb3J0IHsgdmlzaXQgfTtcbiIsImV4cG9ydCB7IGNyZWF0ZVNjYWxhclRva2VuLCByZXNvbHZlQXNTY2FsYXIsIHNldFNjYWxhclZhbHVlIH0gZnJvbSAnLi9jc3Qtc2NhbGFyLmpzJztcbmV4cG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gJy4vY3N0LXN0cmluZ2lmeS5qcyc7XG5leHBvcnQgeyB2aXNpdCB9IGZyb20gJy4vY3N0LXZpc2l0LmpzJztcblxuLyoqIFRoZSBieXRlIG9yZGVyIG1hcmsgKi9cbmNvbnN0IEJPTSA9ICdcXHV7RkVGRn0nO1xuLyoqIFN0YXJ0IG9mIGRvYy1tb2RlICovXG5jb25zdCBET0NVTUVOVCA9ICdcXHgwMic7IC8vIEMwOiBTdGFydCBvZiBUZXh0XG4vKiogVW5leHBlY3RlZCBlbmQgb2YgZmxvdy1tb2RlICovXG5jb25zdCBGTE9XX0VORCA9ICdcXHgxOCc7IC8vIEMwOiBDYW5jZWxcbi8qKiBOZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlICovXG5jb25zdCBTQ0FMQVIgPSAnXFx4MWYnOyAvLyBDMDogVW5pdCBTZXBhcmF0b3Jcbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBhIGZsb3cgb3IgYmxvY2sgY29sbGVjdGlvbiAqL1xuY29uc3QgaXNDb2xsZWN0aW9uID0gKHRva2VuKSA9PiAhIXRva2VuICYmICdpdGVtcycgaW4gdG9rZW47XG4vKiogQHJldHVybnMgYHRydWVgIGlmIGB0b2tlbmAgaXMgYSBmbG93IG9yIGJsb2NrIHNjYWxhcjsgbm90IGFuIGFsaWFzICovXG5jb25zdCBpc1NjYWxhciA9ICh0b2tlbikgPT4gISF0b2tlbiAmJlxuICAgICh0b2tlbi50eXBlID09PSAnc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdkb3VibGUtcXVvdGVkLXNjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpO1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbi8qKiBHZXQgYSBwcmludGFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsZXhlciB0b2tlbiAqL1xuZnVuY3Rpb24gcHJldHR5VG9rZW4odG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAgIGNhc2UgQk9NOlxuICAgICAgICAgICAgcmV0dXJuICc8Qk9NPic7XG4gICAgICAgIGNhc2UgRE9DVU1FTlQ6XG4gICAgICAgICAgICByZXR1cm4gJzxET0M+JztcbiAgICAgICAgY2FzZSBGTE9XX0VORDpcbiAgICAgICAgICAgIHJldHVybiAnPEZMT1dfRU5EPic7XG4gICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgcmV0dXJuICc8U0NBTEFSPic7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodG9rZW4pO1xuICAgIH1cbn1cbi8qKiBJZGVudGlmeSB0aGUgdHlwZSBvZiBhIGxleGVyIHRva2VuLiBNYXkgcmV0dXJuIGBudWxsYCBmb3IgdW5rbm93biB0b2tlbnMuICovXG5mdW5jdGlvbiB0b2tlblR5cGUoc291cmNlKSB7XG4gICAgc3dpdGNoIChzb3VyY2UpIHtcbiAgICAgICAgY2FzZSBCT006XG4gICAgICAgICAgICByZXR1cm4gJ2J5dGUtb3JkZXItbWFyayc7XG4gICAgICAgIGNhc2UgRE9DVU1FTlQ6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1tb2RlJztcbiAgICAgICAgY2FzZSBGTE9XX0VORDpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1lcnJvci1lbmQnO1xuICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIHJldHVybiAnc2NhbGFyJztcbiAgICAgICAgY2FzZSAnLS0tJzpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnLi4uJzpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLWVuZCc7XG4gICAgICAgIGNhc2UgJyc6XG4gICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgIGNhc2UgJ1xcclxcbic6XG4gICAgICAgICAgICByZXR1cm4gJ25ld2xpbmUnO1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIHJldHVybiAnc2VxLWl0ZW0taW5kJztcbiAgICAgICAgY2FzZSAnPyc6XG4gICAgICAgICAgICByZXR1cm4gJ2V4cGxpY2l0LWtleS1pbmQnO1xuICAgICAgICBjYXNlICc6JzpcbiAgICAgICAgICAgIHJldHVybiAnbWFwLXZhbHVlLWluZCc7XG4gICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LW1hcC1zdGFydCc7XG4gICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LW1hcC1lbmQnO1xuICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1zZXEtc3RhcnQnO1xuICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1zZXEtZW5kJztcbiAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgICByZXR1cm4gJ2NvbW1hJztcbiAgICB9XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICByZXR1cm4gJ3NwYWNlJztcbiAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICByZXR1cm4gJ2NvbW1lbnQnO1xuICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgIHJldHVybiAnZGlyZWN0aXZlLWxpbmUnO1xuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgIHJldHVybiAnYWxpYXMnO1xuICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIHJldHVybiAnYW5jaG9yJztcbiAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICByZXR1cm4gJ3RhZyc7XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICByZXR1cm4gJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJztcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgcmV0dXJuICdkb3VibGUtcXVvdGVkLXNjYWxhcic7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHJldHVybiAnYmxvY2stc2NhbGFyLWhlYWRlcic7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgeyBCT00sIERPQ1VNRU5ULCBGTE9XX0VORCwgU0NBTEFSLCBpc0NvbGxlY3Rpb24sIGlzU2NhbGFyLCBwcmV0dHlUb2tlbiwgdG9rZW5UeXBlIH07XG4iLCJpbXBvcnQgeyBCT00sIERPQ1VNRU5ULCBGTE9XX0VORCwgU0NBTEFSIH0gZnJvbSAnLi9jc3QuanMnO1xuXG4vKlxuU1RBUlQgLT4gc3RyZWFtXG5cbnN0cmVhbVxuICBkaXJlY3RpdmUgLT4gbGluZS1lbmQgLT4gc3RyZWFtXG4gIGluZGVudCArIGxpbmUtZW5kIC0+IHN0cmVhbVxuICBbZWxzZV0gLT4gbGluZS1zdGFydFxuXG5saW5lLWVuZFxuICBjb21tZW50IC0+IGxpbmUtZW5kXG4gIG5ld2xpbmUgLT4gLlxuICBpbnB1dC1lbmQgLT4gRU5EXG5cbmxpbmUtc3RhcnRcbiAgZG9jLXN0YXJ0IC0+IGRvY1xuICBkb2MtZW5kIC0+IHN0cmVhbVxuICBbZWxzZV0gLT4gaW5kZW50IC0+IGJsb2NrLXN0YXJ0XG5cbmJsb2NrLXN0YXJ0XG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBibG9jay1zdGFydFxuICBtYXAtdmFsdWUtc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgW2Vsc2VdIC0+IGRvY1xuXG5kb2NcbiAgbGluZS1lbmQgLT4gbGluZS1zdGFydFxuICBzcGFjZXMgLT4gZG9jXG4gIGFuY2hvciAtPiBkb2NcbiAgdGFnIC0+IGRvY1xuICBmbG93LXN0YXJ0IC0+IGZsb3cgLT4gZG9jXG4gIGZsb3ctZW5kIC0+IGVycm9yIC0+IGRvY1xuICBzZXEtaXRlbS1zdGFydCAtPiBlcnJvciAtPiBkb2NcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGVycm9yIC0+IGRvY1xuICBtYXAtdmFsdWUtc3RhcnQgLT4gZG9jXG4gIGFsaWFzIC0+IGRvY1xuICBxdW90ZS1zdGFydCAtPiBxdW90ZWQtc2NhbGFyIC0+IGRvY1xuICBibG9jay1zY2FsYXItaGVhZGVyIC0+IGxpbmUtZW5kIC0+IGJsb2NrLXNjYWxhcihtaW4pIC0+IGxpbmUtc3RhcnRcbiAgW2Vsc2VdIC0+IHBsYWluLXNjYWxhcihmYWxzZSwgbWluKSAtPiBkb2NcblxuZmxvd1xuICBsaW5lLWVuZCAtPiBmbG93XG4gIHNwYWNlcyAtPiBmbG93XG4gIGFuY2hvciAtPiBmbG93XG4gIHRhZyAtPiBmbG93XG4gIGZsb3ctc3RhcnQgLT4gZmxvdyAtPiBmbG93XG4gIGZsb3ctZW5kIC0+IC5cbiAgc2VxLWl0ZW0tc3RhcnQgLT4gZXJyb3IgLT4gZmxvd1xuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gZmxvd1xuICBtYXAtdmFsdWUtc3RhcnQgLT4gZmxvd1xuICBhbGlhcyAtPiBmbG93XG4gIHF1b3RlLXN0YXJ0IC0+IHF1b3RlZC1zY2FsYXIgLT4gZmxvd1xuICBjb21tYSAtPiBmbG93XG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIodHJ1ZSwgMCkgLT4gZmxvd1xuXG5xdW90ZWQtc2NhbGFyXG4gIHF1b3RlLWVuZCAtPiAuXG4gIFtlbHNlXSAtPiBxdW90ZWQtc2NhbGFyXG5cbmJsb2NrLXNjYWxhcihtaW4pXG4gIG5ld2xpbmUgKyBwZWVrKGluZGVudCA8IG1pbikgLT4gLlxuICBbZWxzZV0gLT4gYmxvY2stc2NhbGFyKG1pbilcblxucGxhaW4tc2NhbGFyKGlzLWZsb3csIG1pbilcbiAgc2NhbGFyLWVuZChpcy1mbG93KSAtPiAuXG4gIHBlZWsobmV3bGluZSArIChpbmRlbnQgPCBtaW4pKSAtPiAuXG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIobWluKVxuKi9cbmZ1bmN0aW9uIGlzRW1wdHkoY2gpIHtcbiAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgY2FzZSAnXFxyJzpcbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmNvbnN0IGhleERpZ2l0cyA9IG5ldyBTZXQoJzAxMjM0NTY3ODlBQkNERUZhYmNkZWYnKTtcbmNvbnN0IHRhZ0NoYXJzID0gbmV3IFNldChcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6LSM7Lz86QCY9KyRfLiF+KicoKVwiKTtcbmNvbnN0IGZsb3dJbmRpY2F0b3JDaGFycyA9IG5ldyBTZXQoJyxbXXt9Jyk7XG5jb25zdCBpbnZhbGlkQW5jaG9yQ2hhcnMgPSBuZXcgU2V0KCcgLFtde31cXG5cXHJcXHQnKTtcbmNvbnN0IGlzTm90QW5jaG9yQ2hhciA9IChjaCkgPT4gIWNoIHx8IGludmFsaWRBbmNob3JDaGFycy5oYXMoY2gpO1xuLyoqXG4gKiBTcGxpdHMgYW4gaW5wdXQgc3RyaW5nIGludG8gbGV4aWNhbCB0b2tlbnMsIGkuZS4gc21hbGxlciBzdHJpbmdzIHRoYXQgYXJlXG4gKiBlYXNpbHkgaWRlbnRpZmlhYmxlIGJ5IGB0b2tlbnMudG9rZW5UeXBlKClgLlxuICpcbiAqIExleGluZyBzdGFydHMgYWx3YXlzIGluIGEgXCJzdHJlYW1cIiBjb250ZXh0LiBJbmNvbXBsZXRlIGlucHV0IG1heSBiZSBidWZmZXJlZFxuICogdW50aWwgYSBjb21wbGV0ZSB0b2tlbiBjYW4gYmUgZW1pdHRlZC5cbiAqXG4gKiBJbiBhZGRpdGlvbiB0byBzbGljZXMgb2YgdGhlIG9yaWdpbmFsIGlucHV0LCB0aGUgZm9sbG93aW5nIGNvbnRyb2wgY2hhcmFjdGVyc1xuICogbWF5IGFsc28gYmUgZW1pdHRlZDpcbiAqXG4gKiAtIGBcXHgwMmAgKFN0YXJ0IG9mIFRleHQpOiBBIGRvY3VtZW50IHN0YXJ0cyB3aXRoIHRoZSBuZXh0IHRva2VuXG4gKiAtIGBcXHgxOGAgKENhbmNlbCk6IFVuZXhwZWN0ZWQgZW5kIG9mIGZsb3ctbW9kZSAoaW5kaWNhdGVzIGFuIGVycm9yKVxuICogLSBgXFx4MWZgIChVbml0IFNlcGFyYXRvcik6IE5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWVcbiAqIC0gYFxcdXtGRUZGfWAgKEJ5dGUgb3JkZXIgbWFyayk6IEVtaXR0ZWQgc2VwYXJhdGVseSBvdXRzaWRlIGRvY3VtZW50c1xuICovXG5jbGFzcyBMZXhlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGJ1ZmZlciBtYXJrcyB0aGUgZW5kIG9mXG4gICAgICAgICAqIGFsbCBpbnB1dFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hdEVuZCA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogRXhwbGljaXQgaW5kZW50IHNldCBpbiBibG9jayBzY2FsYXIgaGVhZGVyLCBhcyBhbiBvZmZzZXQgZnJvbSB0aGUgY3VycmVudFxuICAgICAgICAgKiBtaW5pbXVtIGluZGVudCwgc28gZS5nLiBzZXQgdG8gMSBmcm9tIGEgaGVhZGVyIGB8MitgLiBTZXQgdG8gLTEgaWYgbm90XG4gICAgICAgICAqIGV4cGxpY2l0bHkgc2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IC0xO1xuICAgICAgICAvKipcbiAgICAgICAgICogQmxvY2sgc2NhbGFycyB0aGF0IGluY2x1ZGUgYSArIChrZWVwKSBjaG9tcGluZyBpbmRpY2F0b3IgaW4gdGhlaXIgaGVhZGVyXG4gICAgICAgICAqIGluY2x1ZGUgdHJhaWxpbmcgZW1wdHkgbGluZXMsIHdoaWNoIGFyZSBvdGhlcndpc2UgZXhjbHVkZWQgZnJvbSB0aGVcbiAgICAgICAgICogc2NhbGFyJ3MgY29udGVudHMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbnB1dCAqL1xuICAgICAgICB0aGlzLmJ1ZmZlciA9ICcnO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyBub3Rpbmcgd2hldGhlciB0aGUgbWFwIHZhbHVlIGluZGljYXRvciA6IGNhbiBpbW1lZGlhdGVseSBmb2xsb3cgdGhpc1xuICAgICAgICAgKiBub2RlIHdpdGhpbiBhIGZsb3cgY29udGV4dC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAvKiogQ291bnQgb2Ygc3Vycm91bmRpbmcgZmxvdyBjb2xsZWN0aW9uIGxldmVscy4gKi9cbiAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAwO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWluaW11bSBsZXZlbCBvZiBpbmRlbnRhdGlvbiByZXF1aXJlZCBmb3IgbmV4dCBsaW5lcyB0byBiZSBwYXJzZWQgYXMgYVxuICAgICAgICAgKiBwYXJ0IG9mIHRoZSBjdXJyZW50IHNjYWxhciB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IDA7XG4gICAgICAgIC8qKiBJbmRlbnRhdGlvbiBsZXZlbCBvZiB0aGUgY3VycmVudCBsaW5lLiAqL1xuICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gMDtcbiAgICAgICAgLyoqIFBvc2l0aW9uIG9mIHRoZSBuZXh0IFxcbiBjaGFyYWN0ZXIuICovXG4gICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIC8qKiBTdG9yZXMgdGhlIHN0YXRlIG9mIHRoZSBsZXhlciBpZiByZWFjaGluZyB0aGUgZW5kIG9mIGluY3BvbXBsZXRlIGlucHV0ICovXG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgIC8qKiBBIHBvaW50ZXIgdG8gYGJ1ZmZlcmA7IHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBsZXhlci4gKi9cbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBZQU1MIHRva2VucyBmcm9tIHRoZSBgc291cmNlYCBzdHJpbmcuIElmIGBpbmNvbXBsZXRlYCxcbiAgICAgKiBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgZ2VuZXJhdG9yIG9mIGxleGljYWwgdG9rZW5zXG4gICAgICovXG4gICAgKmxleChzb3VyY2UsIGluY29tcGxldGUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdzb3VyY2UgaXMgbm90IGEgc3RyaW5nJyk7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyID8gdGhpcy5idWZmZXIgKyBzb3VyY2UgOiBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXRFbmQgPSAhaW5jb21wbGV0ZTtcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLm5leHQgPz8gJ3N0cmVhbSc7XG4gICAgICAgIHdoaWxlIChuZXh0ICYmIChpbmNvbXBsZXRlIHx8IHRoaXMuaGFzQ2hhcnMoMSkpKVxuICAgICAgICAgICAgbmV4dCA9IHlpZWxkKiB0aGlzLnBhcnNlTmV4dChuZXh0KTtcbiAgICB9XG4gICAgYXRMaW5lRW5kKCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoIWNoIHx8IGNoID09PSAnIycgfHwgY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbaSArIDFdID09PSAnXFxuJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjaGFyQXQobikge1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbdGhpcy5wb3MgKyBuXTtcbiAgICB9XG4gICAgY29udGludWVTY2FsYXIob2Zmc2V0KSB7XG4gICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW29mZnNldF07XG4gICAgICAgIGlmICh0aGlzLmluZGVudE5leHQgPiAwKSB7XG4gICAgICAgICAgICBsZXQgaW5kZW50ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpbmRlbnQgKyBvZmZzZXRdO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpbmRlbnQgKyBvZmZzZXQgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicgfHwgKCFuZXh0ICYmICF0aGlzLmF0RW5kKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldCArIGluZGVudCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2ggPT09ICdcXG4nIHx8IGluZGVudCA+PSB0aGlzLmluZGVudE5leHQgfHwgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICA/IG9mZnNldCArIGluZGVudFxuICAgICAgICAgICAgICAgIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgZHQgPSB0aGlzLmJ1ZmZlci5zdWJzdHIob2Zmc2V0LCAzKTtcbiAgICAgICAgICAgIGlmICgoZHQgPT09ICctLS0nIHx8IGR0ID09PSAnLi4uJykgJiYgaXNFbXB0eSh0aGlzLmJ1ZmZlcltvZmZzZXQgKyAzXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuICAgIGdldExpbmUoKSB7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLmxpbmVFbmRQb3M7XG4gICAgICAgIGlmICh0eXBlb2YgZW5kICE9PSAnbnVtYmVyJyB8fCAoZW5kICE9PSAtMSAmJiBlbmQgPCB0aGlzLnBvcykpIHtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIHRoaXMucG9zKTtcbiAgICAgICAgICAgIHRoaXMubGluZUVuZFBvcyA9IGVuZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID09PSAtMSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0RW5kID8gdGhpcy5idWZmZXIuc3Vic3RyaW5nKHRoaXMucG9zKSA6IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlcltlbmQgLSAxXSA9PT0gJ1xccicpXG4gICAgICAgICAgICBlbmQgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcywgZW5kKTtcbiAgICB9XG4gICAgaGFzQ2hhcnMobikge1xuICAgICAgICByZXR1cm4gdGhpcy5wb3MgKyBuIDw9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICB9XG4gICAgc2V0TmV4dChzdGF0ZSkge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgdGhpcy5uZXh0ID0gc3RhdGU7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwZWVrKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgfVxuICAgICpwYXJzZU5leHQobmV4dCkge1xuICAgICAgICBzd2l0Y2ggKG5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0cmVhbSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlU3RyZWFtKCk7XG4gICAgICAgICAgICBjYXNlICdsaW5lLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICdkb2MnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZURvY3VtZW50KCk7XG4gICAgICAgICAgICBjYXNlICdmbG93JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VGbG93Q29sbGVjdGlvbigpO1xuICAgICAgICAgICAgY2FzZSAncXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdwbGFpbi1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlU3RyZWFtKCkge1xuICAgICAgICBsZXQgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3N0cmVhbScpO1xuICAgICAgICBpZiAobGluZVswXSA9PT0gQk9NKSB7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVbMF0gPT09ICclJykge1xuICAgICAgICAgICAgbGV0IGRpckVuZCA9IGxpbmUubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGNzID0gbGluZS5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgICB3aGlsZSAoY3MgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ggPSBsaW5lW2NzIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpckVuZCA9IGNzIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjcyA9IGxpbmUuaW5kZXhPZignIycsIGNzICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaCA9IGxpbmVbZGlyRW5kIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBkaXJFbmQgLT0gMTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbiA9ICh5aWVsZCogdGhpcy5wdXNoQ291bnQoZGlyRW5kKSkgKyAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTsgLy8gcG9zc2libGUgY29tbWVudFxuICAgICAgICAgICAgdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgcmV0dXJuICdzdHJlYW0nO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF0TGluZUVuZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBzcCA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBzcCk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgcmV0dXJuICdzdHJlYW0nO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkIERPQ1VNRU5UO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlTGluZVN0YXJ0KCkge1xuICAgICAgICBjb25zdCBjaCA9IHRoaXMuY2hhckF0KDApO1xuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnbGluZS1zdGFydCcpO1xuICAgICAgICBpZiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQgJiYgIXRoaXMuaGFzQ2hhcnMoNCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnbGluZS1zdGFydCcpO1xuICAgICAgICAgICAgY29uc3QgcyA9IHRoaXMucGVlaygzKTtcbiAgICAgICAgICAgIGlmICgocyA9PT0gJy0tLScgfHwgcyA9PT0gJy4uLicpICYmIGlzRW1wdHkodGhpcy5jaGFyQXQoMykpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDMpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgPT09ICctLS0nID8gJ2RvYycgOiAnc3RyZWFtJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGVudFZhbHVlID0geWllbGQqIHRoaXMucHVzaFNwYWNlcyhmYWxzZSk7XG4gICAgICAgIGlmICh0aGlzLmluZGVudE5leHQgPiB0aGlzLmluZGVudFZhbHVlICYmICFpc0VtcHR5KHRoaXMuY2hhckF0KDEpKSlcbiAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWU7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlQmxvY2tTdGFydCgpIHtcbiAgICAgICAgY29uc3QgW2NoMCwgY2gxXSA9IHRoaXMucGVlaygyKTtcbiAgICAgICAgaWYgKCFjaDEgJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zdGFydCcpO1xuICAgICAgICBpZiAoKGNoMCA9PT0gJy0nIHx8IGNoMCA9PT0gJz8nIHx8IGNoMCA9PT0gJzonKSAmJiBpc0VtcHR5KGNoMSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSAoeWllbGQqIHRoaXMucHVzaENvdW50KDEpKSArICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWUgKyAxO1xuICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSArPSBuO1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTdGFydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnZG9jJztcbiAgICB9XG4gICAgKnBhcnNlRG9jdW1lbnQoKSB7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdkb2MnKTtcbiAgICAgICAgbGV0IG4gPSB5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpO1xuICAgICAgICBzd2l0Y2ggKGxpbmVbbl0pIHtcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvclxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVF1b3RlZFNjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoKTtcbiAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhcigpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZUZsb3dDb2xsZWN0aW9uKCkge1xuICAgICAgICBsZXQgbmwsIHNwO1xuICAgICAgICBsZXQgaW5kZW50ID0gLTE7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIG5sID0geWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIGlmIChubCA+IDApIHtcbiAgICAgICAgICAgICAgICBzcCA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXMoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSBpbmRlbnQgPSBzcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNwID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNwICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgIH0gd2hpbGUgKG5sICsgc3AgPiAwKTtcbiAgICAgICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Zsb3cnKTtcbiAgICAgICAgaWYgKChpbmRlbnQgIT09IC0xICYmIGluZGVudCA8IHRoaXMuaW5kZW50TmV4dCAmJiBsaW5lWzBdICE9PSAnIycpIHx8XG4gICAgICAgICAgICAoaW5kZW50ID09PSAwICYmXG4gICAgICAgICAgICAgICAgKGxpbmUuc3RhcnRzV2l0aCgnLS0tJykgfHwgbGluZS5zdGFydHNXaXRoKCcuLi4nKSkgJiZcbiAgICAgICAgICAgICAgICBpc0VtcHR5KGxpbmVbM10pKSkge1xuICAgICAgICAgICAgLy8gQWxsb3dpbmcgZm9yIHRoZSB0ZXJtaW5hbCBdIG9yIH0gYXQgdGhlIHNhbWUgKHJhdGhlciB0aGFuIGdyZWF0ZXIpXG4gICAgICAgICAgICAvLyBpbmRlbnQgbGV2ZWwgYXMgdGhlIGluaXRpYWwgWyBvciB7IGlzIHRlY2huaWNhbGx5IGludmFsaWQsIGJ1dFxuICAgICAgICAgICAgLy8gZmFpbGluZyBoZXJlIHdvdWxkIGJlIHN1cnByaXNpbmcgdG8gdXNlcnMuXG4gICAgICAgICAgICBjb25zdCBhdEZsb3dFbmRNYXJrZXIgPSBpbmRlbnQgPT09IHRoaXMuaW5kZW50TmV4dCAtIDEgJiZcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9PT0gMSAmJlxuICAgICAgICAgICAgICAgIChsaW5lWzBdID09PSAnXScgfHwgbGluZVswXSA9PT0gJ30nKTtcbiAgICAgICAgICAgIGlmICghYXRGbG93RW5kTWFya2VyKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvclxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID0gMDtcbiAgICAgICAgICAgICAgICB5aWVsZCBGTE9XX0VORDtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgIHdoaWxlIChsaW5lW25dID09PSAnLCcpIHtcbiAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpO1xuICAgICAgICBzd2l0Y2ggKGxpbmVbbl0pIHtcbiAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgKz0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCAtPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZsb3dMZXZlbCA/ICdmbG93JyA6ICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VRdW90ZWRTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJzonOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuY2hhckF0KDEpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsb3dLZXkgfHwgaXNFbXB0eShuZXh0KSB8fCBuZXh0ID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZVF1b3RlZFNjYWxhcigpIHtcbiAgICAgICAgY29uc3QgcXVvdGUgPSB0aGlzLmNoYXJBdCgwKTtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YocXVvdGUsIHRoaXMucG9zICsgMSk7XG4gICAgICAgIGlmIChxdW90ZSA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgIHdoaWxlIChlbmQgIT09IC0xICYmIHRoaXMuYnVmZmVyW2VuZCArIDFdID09PSBcIidcIilcbiAgICAgICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKFwiJ1wiLCBlbmQgKyAyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGRvdWJsZS1xdW90ZVxuICAgICAgICAgICAgd2hpbGUgKGVuZCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuYnVmZmVyW2VuZCAtIDEgLSBuXSA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgICAgICAgICBuICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKG4gJSAyID09PSAwKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcIicsIGVuZCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgbG9va2luZyBmb3IgbmV3bGluZXMgd2l0aGluIHRoZSBxdW90ZXNcbiAgICAgICAgY29uc3QgcWIgPSB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcoMCwgZW5kKTtcbiAgICAgICAgbGV0IG5sID0gcWIuaW5kZXhPZignXFxuJywgdGhpcy5wb3MpO1xuICAgICAgICBpZiAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICB3aGlsZSAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKG5sICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgbmwgPSBxYi5pbmRleE9mKCdcXG4nLCBjcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvciBjYXVzZWQgYnkgYW4gdW5leHBlY3RlZCB1bmluZGVudFxuICAgICAgICAgICAgICAgIGVuZCA9IG5sIC0gKHFiW25sIC0gMV0gPT09ICdcXHInID8gMiA6IDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgncXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGVuZCArIDEsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvd0xldmVsID8gJ2Zsb3cnIDogJ2RvYyc7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU2NhbGFySGVhZGVyKCkge1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ID0gLTE7XG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJLZWVwID0gZmFsc2U7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3M7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICBpZiAoY2ggPT09ICcrJylcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IHRydWU7XG4gICAgICAgICAgICBlbHNlIGlmIChjaCA+ICcwJyAmJiBjaCA8PSAnOScpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IE51bWJlcihjaCkgLSAxO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2ggIT09ICctJylcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFVudGlsKGNoID0+IGlzRW1wdHkoY2gpIHx8IGNoID09PSAnIycpO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1NjYWxhcigpIHtcbiAgICAgICAgbGV0IG5sID0gdGhpcy5wb3MgLSAxOyAvLyBtYXkgYmUgLTEgaWYgdGhpcy5wb3MgPT09IDBcbiAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgbG9vcDogZm9yIChsZXQgaSA9IHRoaXMucG9zOyAoY2ggPSB0aGlzLmJ1ZmZlcltpXSk7ICsraSkge1xuICAgICAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdcXHInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghbmV4dCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc2NhbGFyJyk7XG4gICAgICAgIGlmIChpbmRlbnQgPj0gdGhpcy5pbmRlbnROZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja1NjYWxhckluZGVudCA9PT0gLTEpXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gaW5kZW50O1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCArICh0aGlzLmluZGVudE5leHQgPT09IDAgPyAxIDogdGhpcy5pbmRlbnROZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIobmwgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIGNzKTtcbiAgICAgICAgICAgIH0gd2hpbGUgKG5sICE9PSAtMSk7XG4gICAgICAgICAgICBpZiAobmwgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUcmFpbGluZyBpbnN1ZmZpY2llbnRseSBpbmRlbnRlZCB0YWJzIGFyZSBpbnZhbGlkLlxuICAgICAgICAvLyBUbyBjYXRjaCB0aGF0IGR1cmluZyBwYXJzaW5nLCB3ZSBpbmNsdWRlIHRoZW0gaW4gdGhlIGJsb2NrIHNjYWxhciB2YWx1ZS5cbiAgICAgICAgbGV0IGkgPSBubCArIDE7XG4gICAgICAgIGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICB3aGlsZSAoY2ggPT09ICdcXHQnIHx8IGNoID09PSAnICcgfHwgY2ggPT09ICdcXHInIHx8IGNoID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICBubCA9IGkgLSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLmJsb2NrU2NhbGFyS2VlcCkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGxldCBpID0gbmwgLSAxO1xuICAgICAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0Q2hhciA9IGk7IC8vIERyb3AgdGhlIGxpbmUgaWYgbGFzdCBjaGFyIG5vdCBtb3JlIGluZGVudGVkXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNoID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nICYmIGkgPj0gdGhpcy5wb3MgJiYgaSArIDEgKyBpbmRlbnQgPiBsYXN0Q2hhcilcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IHdoaWxlICh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBTQ0FMQVI7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KG5sICsgMSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgIH1cbiAgICAqcGFyc2VQbGFpblNjYWxhcigpIHtcbiAgICAgICAgY29uc3QgaW5GbG93ID0gdGhpcy5mbG93TGV2ZWwgPiAwO1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICB3aGlsZSAoKGNoID0gdGhpcy5idWZmZXJbKytpXSkpIHtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJzonKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShuZXh0KSB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMobmV4dCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNFbXB0eShjaCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXHInKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2ggPSAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICcjJyB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMobmV4dCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gdGhpcy5jb250aW51ZVNjYWxhcihpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjcyA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgaSA9IE1hdGgubWF4KGksIGNzIC0gMik7IC8vIHRvIGFkdmFuY2UsIGJ1dCBzdGlsbCBhY2NvdW50IGZvciAnICMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKGNoKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgncGxhaW4tc2NhbGFyJyk7XG4gICAgICAgIHlpZWxkIFNDQUxBUjtcbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFRvSW5kZXgoZW5kICsgMSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBpbkZsb3cgPyAnZmxvdycgOiAnZG9jJztcbiAgICB9XG4gICAgKnB1c2hDb3VudChuKSB7XG4gICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgICAgeWllbGQgdGhpcy5idWZmZXIuc3Vic3RyKHRoaXMucG9zLCBuKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IG47XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hUb0luZGV4KGksIGFsbG93RW1wdHkpIHtcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuYnVmZmVyLnNsaWNlKHRoaXMucG9zLCBpKTtcbiAgICAgICAgaWYgKHMpIHtcbiAgICAgICAgICAgIHlpZWxkIHM7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSBzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhbGxvd0VtcHR5KVxuICAgICAgICAgICAgeWllbGQgJyc7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaEluZGljYXRvcnMoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5jaGFyQXQoMCkpIHtcbiAgICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgICAgIHJldHVybiAoKHlpZWxkKiB0aGlzLnB1c2hUYWcoKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKSkpO1xuICAgICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICAgICAgcmV0dXJuICgoeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcikpICtcbiAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpICtcbiAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCkpKTtcbiAgICAgICAgICAgIGNhc2UgJy0nOiAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICBjYXNlICc/JzogLy8gdGhpcyBpcyBhbiBlcnJvciBvdXRzaWRlIGZsb3cgY29sbGVjdGlvbnNcbiAgICAgICAgICAgIGNhc2UgJzonOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5GbG93ID0gdGhpcy5mbG93TGV2ZWwgPiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoMSA9IHRoaXMuY2hhckF0KDEpO1xuICAgICAgICAgICAgICAgIGlmIChpc0VtcHR5KGNoMSkgfHwgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKGNoMSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5GbG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gdGhpcy5pbmRlbnRWYWx1ZSArIDE7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZmxvd0tleSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCh5aWVsZCogdGhpcy5wdXNoQ291bnQoMSkpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hUYWcoKSB7XG4gICAgICAgIGlmICh0aGlzLmNoYXJBdCgxKSA9PT0gJzwnKSB7XG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMucG9zICsgMjtcbiAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgd2hpbGUgKCFpc0VtcHR5KGNoKSAmJiBjaCAhPT0gJz4nKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChjaCA9PT0gJz4nID8gaSArIDEgOiBpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMucG9zICsgMTtcbiAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgd2hpbGUgKGNoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhZ0NoYXJzLmhhcyhjaCkpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaCA9PT0gJyUnICYmXG4gICAgICAgICAgICAgICAgICAgIGhleERpZ2l0cy5oYXModGhpcy5idWZmZXJbaSArIDFdKSAmJlxuICAgICAgICAgICAgICAgICAgICBoZXhEaWdpdHMuaGFzKHRoaXMuYnVmZmVyW2kgKyAyXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsoaSArPSAzKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFRvSW5kZXgoaSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwdXNoTmV3bGluZSgpIHtcbiAgICAgICAgY29uc3QgY2ggPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc107XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xccicgJiYgdGhpcy5jaGFyQXQoMSkgPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoU3BhY2VzKGFsbG93VGFicykge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIH0gd2hpbGUgKGNoID09PSAnICcgfHwgKGFsbG93VGFicyAmJiBjaCA9PT0gJ1xcdCcpKTtcbiAgICAgICAgY29uc3QgbiA9IGkgLSB0aGlzLnBvcztcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgICAgICAgICAgdGhpcy5wb3MgPSBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiAgICAqcHVzaFVudGlsKHRlc3QpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcztcbiAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlICghdGVzdChjaCkpXG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChpLCBmYWxzZSk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBMZXhlciB9O1xuIiwiLyoqXG4gKiBUcmFja3MgbmV3bGluZXMgZHVyaW5nIHBhcnNpbmcgaW4gb3JkZXIgdG8gcHJvdmlkZSBhbiBlZmZpY2llbnQgQVBJIGZvclxuICogZGV0ZXJtaW5pbmcgdGhlIG9uZS1pbmRleGVkIGB7IGxpbmUsIGNvbCB9YCBwb3NpdGlvbiBmb3IgYW55IG9mZnNldFxuICogd2l0aGluIHRoZSBpbnB1dC5cbiAqL1xuY2xhc3MgTGluZUNvdW50ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmxpbmVTdGFydHMgPSBbXTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNob3VsZCBiZSBjYWxsZWQgaW4gYXNjZW5kaW5nIG9yZGVyLiBPdGhlcndpc2UsIGNhbGxcbiAgICAgICAgICogYGxpbmVDb3VudGVyLmxpbmVTdGFydHMuc29ydCgpYCBiZWZvcmUgY2FsbGluZyBgbGluZVBvcygpYC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkTmV3TGluZSA9IChvZmZzZXQpID0+IHRoaXMubGluZVN0YXJ0cy5wdXNoKG9mZnNldCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQZXJmb3JtcyBhIGJpbmFyeSBzZWFyY2ggYW5kIHJldHVybnMgdGhlIDEtaW5kZXhlZCB7IGxpbmUsIGNvbCB9XG4gICAgICAgICAqIHBvc2l0aW9uIG9mIGBvZmZzZXRgLiBJZiBgbGluZSA9PT0gMGAsIGBhZGROZXdMaW5lYCBoYXMgbmV2ZXIgYmVlblxuICAgICAgICAgKiBjYWxsZWQgb3IgYG9mZnNldGAgaXMgYmVmb3JlIHRoZSBmaXJzdCBrbm93biBuZXdsaW5lLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5saW5lUG9zID0gKG9mZnNldCkgPT4ge1xuICAgICAgICAgICAgbGV0IGxvdyA9IDA7XG4gICAgICAgICAgICBsZXQgaGlnaCA9IHRoaXMubGluZVN0YXJ0cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pZCA9IChsb3cgKyBoaWdoKSA+PiAxOyAvLyBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGluZVN0YXJ0c1ttaWRdIDwgb2Zmc2V0KVxuICAgICAgICAgICAgICAgICAgICBsb3cgPSBtaWQgKyAxO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaGlnaCA9IG1pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmVTdGFydHNbbG93XSA9PT0gb2Zmc2V0KVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IGxvdyArIDEsIGNvbDogMSB9O1xuICAgICAgICAgICAgaWYgKGxvdyA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4geyBsaW5lOiAwLCBjb2w6IG9mZnNldCB9O1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmxpbmVTdGFydHNbbG93IC0gMV07XG4gICAgICAgICAgICByZXR1cm4geyBsaW5lOiBsb3csIGNvbDogb2Zmc2V0IC0gc3RhcnQgKyAxIH07XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5leHBvcnQgeyBMaW5lQ291bnRlciB9O1xuIiwiaW1wb3J0IHsgdG9rZW5UeXBlIH0gZnJvbSAnLi9jc3QuanMnO1xuaW1wb3J0IHsgTGV4ZXIgfSBmcm9tICcuL2xleGVyLmpzJztcblxuZnVuY3Rpb24gaW5jbHVkZXNUb2tlbihsaXN0LCB0eXBlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKVxuICAgICAgICBpZiAobGlzdFtpXS50eXBlID09PSB0eXBlKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gZmluZE5vbkVtcHR5SW5kZXgobGlzdCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICBzd2l0Y2ggKGxpc3RbaV0udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZnVuY3Rpb24gaXNGbG93VG9rZW4odG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuPy50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRQcmV2UHJvcHMocGFyZW50KSB7XG4gICAgc3dpdGNoIChwYXJlbnQudHlwZSkge1xuICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50LnN0YXJ0O1xuICAgICAgICBjYXNlICdibG9jay1tYXAnOiB7XG4gICAgICAgICAgICBjb25zdCBpdCA9IHBhcmVudC5pdGVtc1twYXJlbnQuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICByZXR1cm4gaXQuc2VwID8/IGl0LnN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50Lml0ZW1zW3BhcmVudC5pdGVtcy5sZW5ndGggLSAxXS5zdGFydDtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICB9XG59XG4vKiogTm90ZTogTWF5IG1vZGlmeSBpbnB1dCBhcnJheSAqL1xuZnVuY3Rpb24gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpIHtcbiAgICBpZiAocHJldi5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybiBbXTtcbiAgICBsZXQgaSA9IHByZXYubGVuZ3RoO1xuICAgIGxvb3A6IHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICBzd2l0Y2ggKHByZXZbaV0udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAocHJldlsrK2ldPy50eXBlID09PSAnc3BhY2UnKSB7XG4gICAgICAgIC8qIGxvb3AgKi9cbiAgICB9XG4gICAgcmV0dXJuIHByZXYuc3BsaWNlKGksIHByZXYubGVuZ3RoKTtcbn1cbmZ1bmN0aW9uIGZpeEZsb3dTZXFJdGVtcyhmYykge1xuICAgIGlmIChmYy5zdGFydC50eXBlID09PSAnZmxvdy1zZXEtc3RhcnQnKSB7XG4gICAgICAgIGZvciAoY29uc3QgaXQgb2YgZmMuaXRlbXMpIHtcbiAgICAgICAgICAgIGlmIChpdC5zZXAgJiZcbiAgICAgICAgICAgICAgICAhaXQudmFsdWUgJiZcbiAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zdGFydCwgJ2V4cGxpY2l0LWtleS1pbmQnKSAmJlxuICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgIGlmIChpdC5rZXkpXG4gICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gaXQua2V5O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRmxvd1Rva2VuKGl0LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUuZW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoaXQudmFsdWUuZW5kLCBpdC5zZXApO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZS5lbmQgPSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoaXQuc3RhcnQsIGl0LnNlcCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0LnNlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogQSBZQU1MIGNvbmNyZXRlIHN5bnRheCB0cmVlIChDU1QpIHBhcnNlclxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogZm9yIChjb25zdCB0b2tlbiBvZiBuZXcgUGFyc2VyKCkucGFyc2Uoc3JjKSkge1xuICogICAvLyB0b2tlbjogVG9rZW5cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRvIHVzZSB0aGUgcGFyc2VyIHdpdGggYSB1c2VyLXByb3ZpZGVkIGxleGVyOlxuICpcbiAqIGBgYHRzXG4gKiBmdW5jdGlvbiogcGFyc2Uoc291cmNlOiBzdHJpbmcsIGxleGVyOiBMZXhlcikge1xuICogICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKClcbiAqICAgZm9yIChjb25zdCBsZXhlbWUgb2YgbGV4ZXIubGV4KHNvdXJjZSkpXG4gKiAgICAgeWllbGQqIHBhcnNlci5uZXh0KGxleGVtZSlcbiAqICAgeWllbGQqIHBhcnNlci5lbmQoKVxuICogfVxuICpcbiAqIGNvbnN0IHNyYzogc3RyaW5nID0gLi4uXG4gKiBjb25zdCBsZXhlciA9IG5ldyBMZXhlcigpXG4gKiBmb3IgKGNvbnN0IHRva2VuIG9mIHBhcnNlKHNyYywgbGV4ZXIpKSB7XG4gKiAgIC8vIHRva2VuOiBUb2tlblxuICogfVxuICogYGBgXG4gKi9cbmNsYXNzIFBhcnNlciB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIG9uTmV3TGluZSAtIElmIGRlZmluZWQsIGNhbGxlZCBzZXBhcmF0ZWx5IHdpdGggdGhlIHN0YXJ0IHBvc2l0aW9uIG9mXG4gICAgICogICBlYWNoIG5ldyBsaW5lIChpbiBgcGFyc2UoKWAsIGluY2x1ZGluZyB0aGUgc3RhcnQgb2YgaW5wdXQpLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9uTmV3TGluZSkge1xuICAgICAgICAvKiogSWYgdHJ1ZSwgc3BhY2UgYW5kIHNlcXVlbmNlIGluZGljYXRvcnMgY291bnQgYXMgaW5kZW50YXRpb24gKi9cbiAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSB0cnVlO1xuICAgICAgICAvKiogSWYgdHJ1ZSwgbmV4dCB0b2tlbiBpcyBhIHNjYWxhciB2YWx1ZSAqL1xuICAgICAgICB0aGlzLmF0U2NhbGFyID0gZmFsc2U7XG4gICAgICAgIC8qKiBDdXJyZW50IGluZGVudGF0aW9uIGxldmVsICovXG4gICAgICAgIHRoaXMuaW5kZW50ID0gMDtcbiAgICAgICAgLyoqIEN1cnJlbnQgb2Zmc2V0IHNpbmNlIHRoZSBzdGFydCBvZiBwYXJzaW5nICovXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgICAgICAgLyoqIE9uIHRoZSBzYW1lIGxpbmUgd2l0aCBhIGJsb2NrIG1hcCBrZXkgKi9cbiAgICAgICAgdGhpcy5vbktleUxpbmUgPSBmYWxzZTtcbiAgICAgICAgLyoqIFRvcCBpbmRpY2F0ZXMgdGhlIG5vZGUgdGhhdCdzIGN1cnJlbnRseSBiZWluZyBidWlsdCAqL1xuICAgICAgICB0aGlzLnN0YWNrID0gW107XG4gICAgICAgIC8qKiBUaGUgc291cmNlIG9mIHRoZSBjdXJyZW50IHRva2VuLCBzZXQgaW4gcGFyc2UoKSAqL1xuICAgICAgICB0aGlzLnNvdXJjZSA9ICcnO1xuICAgICAgICAvKiogVGhlIHR5cGUgb2YgdGhlIGN1cnJlbnQgdG9rZW4sIHNldCBpbiBwYXJzZSgpICovXG4gICAgICAgIHRoaXMudHlwZSA9ICcnO1xuICAgICAgICAvLyBNdXN0IGJlIGRlZmluZWQgYWZ0ZXIgYG5leHQoKWBcbiAgICAgICAgdGhpcy5sZXhlciA9IG5ldyBMZXhlcigpO1xuICAgICAgICB0aGlzLm9uTmV3TGluZSA9IG9uTmV3TGluZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFyc2UgYHNvdXJjZWAgYXMgYSBZQU1MIHN0cmVhbS5cbiAgICAgKiBJZiBgaW5jb21wbGV0ZWAsIGEgcGFydCBvZiB0aGUgbGFzdCBsaW5lIG1heSBiZSBsZWZ0IGFzIGEgYnVmZmVyIGZvciB0aGUgbmV4dCBjYWxsLlxuICAgICAqXG4gICAgICogRXJyb3JzIGFyZSBub3QgdGhyb3duLCBidXQgeWllbGRlZCBhcyBgeyB0eXBlOiAnZXJyb3InLCBtZXNzYWdlIH1gIHRva2Vucy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgZ2VuZXJhdG9yIG9mIHRva2VucyByZXByZXNlbnRpbmcgZWFjaCBkaXJlY3RpdmUsIGRvY3VtZW50LCBhbmQgb3RoZXIgc3RydWN0dXJlLlxuICAgICAqL1xuICAgICpwYXJzZShzb3VyY2UsIGluY29tcGxldGUgPSBmYWxzZSkge1xuICAgICAgICBpZiAodGhpcy5vbk5ld0xpbmUgJiYgdGhpcy5vZmZzZXQgPT09IDApXG4gICAgICAgICAgICB0aGlzLm9uTmV3TGluZSgwKTtcbiAgICAgICAgZm9yIChjb25zdCBsZXhlbWUgb2YgdGhpcy5sZXhlci5sZXgoc291cmNlLCBpbmNvbXBsZXRlKSlcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLm5leHQobGV4ZW1lKTtcbiAgICAgICAgaWYgKCFpbmNvbXBsZXRlKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMuZW5kKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkdmFuY2UgdGhlIHBhcnNlciBieSB0aGUgYHNvdXJjZWAgb2Ygb25lIGxleGljYWwgdG9rZW4uXG4gICAgICovXG4gICAgKm5leHQoc291cmNlKSB7XG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICBpZiAodGhpcy5hdFNjYWxhcikge1xuICAgICAgICAgICAgdGhpcy5hdFNjYWxhciA9IGZhbHNlO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gdG9rZW5UeXBlKHNvdXJjZSk7XG4gICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBOb3QgYSBZQU1MIHRva2VuOiAke3NvdXJjZX1gO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKHsgdHlwZTogJ2Vycm9yJywgb2Zmc2V0OiB0aGlzLm9mZnNldCwgbWVzc2FnZSwgc291cmNlIH0pO1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnc2NhbGFyJykge1xuICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYXRTY2FsYXIgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy50eXBlID0gJ3NjYWxhcic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbk5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIHNvdXJjZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0TmV3TGluZSAmJiBzb3VyY2VbMF0gPT09ICcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0TmV3TGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RvYy1tb2RlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LWVycm9yLWVuZCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKiogQ2FsbCBhdCBlbmQgb2YgaW5wdXQgdG8gcHVzaCBvdXQgYW55IHJlbWFpbmluZyBjb25zdHJ1Y3Rpb25zICovXG4gICAgKmVuZCgpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoID4gMClcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgIH1cbiAgICBnZXQgc291cmNlVG9rZW4oKSB7XG4gICAgICAgIGNvbnN0IHN0ID0ge1xuICAgICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzdDtcbiAgICB9XG4gICAgKnN0ZXAoKSB7XG4gICAgICAgIGNvbnN0IHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RvYy1lbmQnICYmICghdG9wIHx8IHRvcC50eXBlICE9PSAnZG9jLWVuZCcpKSB7XG4gICAgICAgICAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZG9jLWVuZCcsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRvcClcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5zdHJlYW0oKTtcbiAgICAgICAgc3dpdGNoICh0b3AudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5kb2N1bWVudCh0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuc2NhbGFyKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja1NjYWxhcih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tNYXAodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrU2VxdWVuY2UodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmZsb3dDb2xsZWN0aW9uKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdkb2MtZW5kJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZG9jdW1lbnRFbmQodG9wKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICB9XG4gICAgcGVlayhuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gbl07XG4gICAgfVxuICAgICpwb3AoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBlcnJvciA/PyB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdUcmllZCB0byBwb3AgYW4gZW1wdHkgc3RhY2snO1xuICAgICAgICAgICAgeWllbGQgeyB0eXBlOiAnZXJyb3InLCBvZmZzZXQ6IHRoaXMub2Zmc2V0LCBzb3VyY2U6ICcnLCBtZXNzYWdlIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5zdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHlpZWxkIHRva2VuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInKSB7XG4gICAgICAgICAgICAgICAgLy8gQmxvY2sgc2NhbGFycyB1c2UgdGhlaXIgcGFyZW50IHJhdGhlciB0aGFuIGhlYWRlciBpbmRlbnRcbiAgICAgICAgICAgICAgICB0b2tlbi5pbmRlbnQgPSAnaW5kZW50JyBpbiB0b3AgPyB0b3AuaW5kZW50IDogMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRva2VuLnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nICYmIHRvcC50eXBlID09PSAnZG9jdW1lbnQnKSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGFsbCBpbmRlbnQgZm9yIHRvcC1sZXZlbCBmbG93IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICAgICAgdG9rZW4uaW5kZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJylcbiAgICAgICAgICAgICAgICBmaXhGbG93U2VxSXRlbXModG9rZW4pO1xuICAgICAgICAgICAgc3dpdGNoICh0b3AudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgICAgICAgICAgdG9wLnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgICAgIHRvcC5wcm9wcy5wdXNoKHRva2VuKTsgLy8gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmxvY2stbWFwJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdCA9IHRvcC5pdGVtc1t0b3AuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSAhaXQuZXhwbGljaXRLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwgdmFsdWU6IHRva2VuIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdCA9IHRvcC5pdGVtc1t0b3AuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh0b2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHRvcC50eXBlID09PSAnZG9jdW1lbnQnIHx8XG4gICAgICAgICAgICAgICAgdG9wLnR5cGUgPT09ICdibG9jay1tYXAnIHx8XG4gICAgICAgICAgICAgICAgdG9wLnR5cGUgPT09ICdibG9jay1zZXEnKSAmJlxuICAgICAgICAgICAgICAgICh0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJyB8fCB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gdG9rZW4uaXRlbXNbdG9rZW4uaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGxhc3QgJiZcbiAgICAgICAgICAgICAgICAgICAgIWxhc3Quc2VwICYmXG4gICAgICAgICAgICAgICAgICAgICFsYXN0LnZhbHVlICYmXG4gICAgICAgICAgICAgICAgICAgIGxhc3Quc3RhcnQubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICBmaW5kTm9uRW1wdHlJbmRleChsYXN0LnN0YXJ0KSA9PT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgICAgKHRva2VuLmluZGVudCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdC5zdGFydC5ldmVyeShzdCA9PiBzdC50eXBlICE9PSAnY29tbWVudCcgfHwgc3QuaW5kZW50IDwgdG9rZW4uaW5kZW50KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvcC50eXBlID09PSAnZG9jdW1lbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLmVuZCA9IGxhc3Quc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IGxhc3Quc3RhcnQgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRva2VuLml0ZW1zLnNwbGljZSgtMSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgICpzdHJlYW0oKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkaXJlY3RpdmUtbGluZSc6XG4gICAgICAgICAgICAgICAgeWllbGQgeyB0eXBlOiAnZGlyZWN0aXZlJywgb2Zmc2V0OiB0aGlzLm9mZnNldCwgc291cmNlOiB0aGlzLnNvdXJjZSB9O1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2J5dGUtb3JkZXItbWFyayc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuc291cmNlVG9rZW47XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnZG9jLW1vZGUnOlxuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRvYyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RvY3VtZW50JyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZG9jLXN0YXJ0JylcbiAgICAgICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGRvYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkIHtcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgbWVzc2FnZTogYFVuZXhwZWN0ZWQgJHt0aGlzLnR5cGV9IHRva2VuIGluIFlBTUwgc3RyZWFtYCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgKmRvY3VtZW50KGRvYykge1xuICAgICAgICBpZiAoZG9jLnZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmxpbmVFbmQoZG9jKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoZmluZE5vbkVtcHR5SW5kZXgoZG9jLnN0YXJ0KSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBkb2Muc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoZG9jKTtcbiAgICAgICAgaWYgKGJ2KVxuICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkICR7dGhpcy50eXBlfSB0b2tlbiBpbiBZQU1MIGRvY3VtZW50YCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgICpzY2FsYXIoc2NhbGFyKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdtYXAtdmFsdWUtaW5kJykge1xuICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyh0aGlzLnBlZWsoMikpO1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICBsZXQgc2VwO1xuICAgICAgICAgICAgaWYgKHNjYWxhci5lbmQpIHtcbiAgICAgICAgICAgICAgICBzZXAgPSBzY2FsYXIuZW5kO1xuICAgICAgICAgICAgICAgIHNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzY2FsYXIuZW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IHNjYWxhci5vZmZzZXQsXG4gICAgICAgICAgICAgICAgaW5kZW50OiBzY2FsYXIuaW5kZW50LFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBzY2FsYXIsIHNlcCB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXSA9IG1hcDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5saW5lRW5kKHNjYWxhcik7XG4gICAgfVxuICAgICpibG9ja1NjYWxhcihzY2FsYXIpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgc2NhbGFyLnByb3BzLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBzY2FsYXIuc291cmNlID0gdGhpcy5zb3VyY2U7XG4gICAgICAgICAgICAgICAgLy8gYmxvY2stc2NhbGFyIHNvdXJjZSBpbmNsdWRlcyB0cmFpbGluZyBuZXdsaW5lXG4gICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbk5ld0xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJykgKyAxO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAobmwgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKHRoaXMub2Zmc2V0ICsgbmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nLCBubCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpibG9ja01hcChtYXApIHtcbiAgICAgICAgY29uc3QgaXQgPSBtYXAuaXRlbXNbbWFwLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAvLyBpdC5zZXAgaXMgdHJ1ZS1pc2ggaWYgcGFpciBhbHJlYWR5IGhhcyBrZXkgb3IgOiBzZXBhcmF0b3JcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9ICdlbmQnIGluIGl0LnZhbHVlID8gaXQudmFsdWUuZW5kIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gQXJyYXkuaXNBcnJheShlbmQpID8gZW5kW2VuZC5sZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3Q/LnR5cGUgPT09ICdjb21tZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZD8ucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdEluZGVudGVkQ29tbWVudChpdC5zdGFydCwgbWFwLmluZGVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBtYXAuaXRlbXNbbWFwLml0ZW1zLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcHJldj8udmFsdWU/LmVuZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVuZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShlbmQsIGl0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pbmRlbnQgPj0gbWFwLmluZGVudCkge1xuICAgICAgICAgICAgY29uc3QgYXRNYXBJbmRlbnQgPSAhdGhpcy5vbktleUxpbmUgJiYgdGhpcy5pbmRlbnQgPT09IG1hcC5pbmRlbnQ7XG4gICAgICAgICAgICBjb25zdCBhdE5leHRJdGVtID0gYXRNYXBJbmRlbnQgJiZcbiAgICAgICAgICAgICAgICAoaXQuc2VwIHx8IGl0LmV4cGxpY2l0S2V5KSAmJlxuICAgICAgICAgICAgICAgIHRoaXMudHlwZSAhPT0gJ3NlcS1pdGVtLWluZCc7XG4gICAgICAgICAgICAvLyBGb3IgZW1wdHkgbm9kZXMsIGFzc2lnbiBuZXdsaW5lLXNlcGFyYXRlZCBub3QgaW5kZW50ZWQgZW1wdHkgdG9rZW5zIHRvIGZvbGxvd2luZyBub2RlXG4gICAgICAgICAgICBsZXQgc3RhcnQgPSBbXTtcbiAgICAgICAgICAgIGlmIChhdE5leHRJdGVtICYmIGl0LnNlcCAmJiAhaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBubCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQuc2VwLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0ID0gaXQuc2VwW2ldO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QuaW5kZW50ID4gbWFwLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmwubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmwubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmwubGVuZ3RoID49IDIpXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaXQuc2VwLnNwbGljZShubFsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0TmV4dEl0ZW0gfHwgaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5zZXAgJiYgIWl0LmV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuZXhwbGljaXRLZXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGF0TmV4dEl0ZW0gfHwgaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0LCBleHBsaWNpdEtleTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dLCBleHBsaWNpdEtleTogdHJ1ZSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC5leHBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZXNUb2tlbihpdC5zdGFydCwgJ25ld2xpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzRmxvd1Rva2VuKGl0LmtleSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zZXAsICduZXdsaW5lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gaXQua2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcCA9IGl0LnNlcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGUgZ3VhcmQgaXMgd3JvbmcgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5rZXksIGRlbGV0ZSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5LCBzZXAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXJ0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3QgYWN0dWFsbHkgYXQgbmV4dCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwID0gaXQuc2VwLmNvbmNhdChzdGFydCwgdGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQudmFsdWUgfHwgYXROZXh0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0LCBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGZzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShtYXApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdE1hcEluZGVudCAmJiBidi50eXBlICE9PSAnYmxvY2stc2VxJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgICpibG9ja1NlcXVlbmNlKHNlcSkge1xuICAgICAgICBjb25zdCBpdCA9IHNlcS5pdGVtc1tzZXEuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gaXQudmFsdWUgPyBpdC52YWx1ZS5lbmQgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBBcnJheS5pc0FycmF5KGVuZCkgPyBlbmRbZW5kLmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdD8udHlwZSA9PT0gJ2NvbW1lbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kPy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIHNlcS5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gc2VxLml0ZW1zW3NlcS5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUgfHwgdGhpcy5pbmRlbnQgPD0gc2VxLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluZGVudCAhPT0gc2VxLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlIHx8IGluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICdzZXEtaXRlbS1pbmQnKSlcbiAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID4gc2VxLmluZGVudCkge1xuICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShzZXEpO1xuICAgICAgICAgICAgaWYgKGJ2KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICB9XG4gICAgKmZsb3dDb2xsZWN0aW9uKGZjKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmMuaXRlbXNbZmMuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdmbG93LWVycm9yLWVuZCcpIHtcbiAgICAgICAgICAgIGxldCB0b3A7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICAgICAgfSB3aGlsZSAodG9wICYmIHRvcC50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmMuZW5kLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcyA9IHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGZzKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLWVuZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgZmMuZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoZmMpO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2Ugc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgIGlmIChidilcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5wZWVrKDIpO1xuICAgICAgICAgICAgaWYgKHBhcmVudC50eXBlID09PSAnYmxvY2stbWFwJyAmJlxuICAgICAgICAgICAgICAgICgodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcgJiYgcGFyZW50LmluZGVudCA9PT0gZmMuaW5kZW50KSB8fFxuICAgICAgICAgICAgICAgICAgICAodGhpcy50eXBlID09PSAnbmV3bGluZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdLnNlcCkpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQudHlwZSAhPT0gJ2Zsb3ctY29sbGVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICAgICAgZml4Rmxvd1NlcUl0ZW1zKGZjKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXAgPSBmYy5lbmQuc3BsaWNlKDEsIGZjLmVuZC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogZmMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IGZjLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IGZjLCBzZXAgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5saW5lRW5kKGZjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmbG93U2NhbGFyKHR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICBsZXQgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nKSArIDE7XG4gICAgICAgICAgICB3aGlsZSAobmwgIT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicsIG5sKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgc3RhcnRCbG9ja1ZhbHVlKHBhcmVudCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXItaGVhZGVyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stc2NhbGFyJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFt0aGlzLnNvdXJjZVRva2VuXSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdmbG93LW1hcC1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LXNlcS1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Zsb3ctY29sbGVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLnNvdXJjZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgICAgICAgICAgIGVuZDogW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stc2VxJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwgZXhwbGljaXRLZXk6IHRydWUgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhdEluZGVudGVkQ29tbWVudChzdGFydCwgaW5kZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09ICdjb21tZW50JylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuaW5kZW50IDw9IGluZGVudClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHN0YXJ0LmV2ZXJ5KHN0ID0+IHN0LnR5cGUgPT09ICduZXdsaW5lJyB8fCBzdC50eXBlID09PSAnc3BhY2UnKTtcbiAgICB9XG4gICAgKmRvY3VtZW50RW5kKGRvY0VuZCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnZG9jLW1vZGUnKSB7XG4gICAgICAgICAgICBpZiAoZG9jRW5kLmVuZClcbiAgICAgICAgICAgICAgICBkb2NFbmQuZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZG9jRW5kLmVuZCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqbGluZUVuZCh0b2tlbikge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBhbGwgb3RoZXIgdmFsdWVzIGFyZSBlcnJvcnNcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLmVuZCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBQYXJzZXIgfTtcbiIsImltcG9ydCB7IENvbXBvc2VyIH0gZnJvbSAnLi9jb21wb3NlL2NvbXBvc2VyLmpzJztcbmltcG9ydCB7IERvY3VtZW50IH0gZnJvbSAnLi9kb2MvRG9jdW1lbnQuanMnO1xuaW1wb3J0IHsgcHJldHRpZnlFcnJvciwgWUFNTFBhcnNlRXJyb3IgfSBmcm9tICcuL2Vycm9ycy5qcyc7XG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnLi9sb2cuanMnO1xuaW1wb3J0IHsgTGluZUNvdW50ZXIgfSBmcm9tICcuL3BhcnNlL2xpbmUtY291bnRlci5qcyc7XG5pbXBvcnQgeyBQYXJzZXIgfSBmcm9tICcuL3BhcnNlL3BhcnNlci5qcyc7XG5cbmZ1bmN0aW9uIHBhcnNlT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgY29uc3QgcHJldHR5RXJyb3JzID0gb3B0aW9ucy5wcmV0dHlFcnJvcnMgIT09IGZhbHNlO1xuICAgIGNvbnN0IGxpbmVDb3VudGVyID0gb3B0aW9ucy5saW5lQ291bnRlciB8fCAocHJldHR5RXJyb3JzICYmIG5ldyBMaW5lQ291bnRlcigpKSB8fCBudWxsO1xuICAgIHJldHVybiB7IGxpbmVDb3VudGVyLCBwcmV0dHlFcnJvcnMgfTtcbn1cbi8qKlxuICogUGFyc2UgdGhlIGlucHV0IGFzIGEgc3RyZWFtIG9mIFlBTUwgZG9jdW1lbnRzLlxuICpcbiAqIERvY3VtZW50cyBzaG91bGQgYmUgc2VwYXJhdGVkIGZyb20gZWFjaCBvdGhlciBieSBgLi4uYCBvciBgLS0tYCBtYXJrZXIgbGluZXMuXG4gKlxuICogQHJldHVybnMgSWYgYW4gZW1wdHkgYGRvY3NgIGFycmF5IGlzIHJldHVybmVkLCBpdCB3aWxsIGJlIG9mIHR5cGVcbiAqICAgRW1wdHlTdHJlYW0gYW5kIGNvbnRhaW4gYWRkaXRpb25hbCBzdHJlYW0gaW5mb3JtYXRpb24uIEluXG4gKiAgIFR5cGVTY3JpcHQsIHlvdSBzaG91bGQgdXNlIGAnZW1wdHknIGluIGRvY3NgIGFzIGEgdHlwZSBndWFyZCBmb3IgaXQuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQWxsRG9jdW1lbnRzKHNvdXJjZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyBsaW5lQ291bnRlciwgcHJldHR5RXJyb3JzIH0gPSBwYXJzZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcihsaW5lQ291bnRlcj8uYWRkTmV3TGluZSk7XG4gICAgY29uc3QgY29tcG9zZXIgPSBuZXcgQ29tcG9zZXIob3B0aW9ucyk7XG4gICAgY29uc3QgZG9jcyA9IEFycmF5LmZyb20oY29tcG9zZXIuY29tcG9zZShwYXJzZXIucGFyc2Uoc291cmNlKSkpO1xuICAgIGlmIChwcmV0dHlFcnJvcnMgJiYgbGluZUNvdW50ZXIpXG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIGRvYy5lcnJvcnMuZm9yRWFjaChwcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgICAgIGRvYy53YXJuaW5ncy5mb3JFYWNoKHByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgICAgICB9XG4gICAgaWYgKGRvY3MubGVuZ3RoID4gMClcbiAgICAgICAgcmV0dXJuIGRvY3M7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oW10sIHsgZW1wdHk6IHRydWUgfSwgY29tcG9zZXIuc3RyZWFtSW5mbygpKTtcbn1cbi8qKiBQYXJzZSBhbiBpbnB1dCBzdHJpbmcgaW50byBhIHNpbmdsZSBZQU1MLkRvY3VtZW50ICovXG5mdW5jdGlvbiBwYXJzZURvY3VtZW50KHNvdXJjZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyBsaW5lQ291bnRlciwgcHJldHR5RXJyb3JzIH0gPSBwYXJzZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcihsaW5lQ291bnRlcj8uYWRkTmV3TGluZSk7XG4gICAgY29uc3QgY29tcG9zZXIgPSBuZXcgQ29tcG9zZXIob3B0aW9ucyk7XG4gICAgLy8gYGRvY2AgaXMgYWx3YXlzIHNldCBieSBjb21wb3NlLmVuZCh0cnVlKSBhdCB0aGUgdmVyeSBsYXRlc3RcbiAgICBsZXQgZG9jID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IF9kb2Mgb2YgY29tcG9zZXIuY29tcG9zZShwYXJzZXIucGFyc2Uoc291cmNlKSwgdHJ1ZSwgc291cmNlLmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKCFkb2MpXG4gICAgICAgICAgICBkb2MgPSBfZG9jO1xuICAgICAgICBlbHNlIGlmIChkb2Mub3B0aW9ucy5sb2dMZXZlbCAhPT0gJ3NpbGVudCcpIHtcbiAgICAgICAgICAgIGRvYy5lcnJvcnMucHVzaChuZXcgWUFNTFBhcnNlRXJyb3IoX2RvYy5yYW5nZS5zbGljZSgwLCAyKSwgJ01VTFRJUExFX0RPQ1MnLCAnU291cmNlIGNvbnRhaW5zIG11bHRpcGxlIGRvY3VtZW50czsgcGxlYXNlIHVzZSBZQU1MLnBhcnNlQWxsRG9jdW1lbnRzKCknKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJldHR5RXJyb3JzICYmIGxpbmVDb3VudGVyKSB7XG4gICAgICAgIGRvYy5lcnJvcnMuZm9yRWFjaChwcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgZG9jLndhcm5pbmdzLmZvckVhY2gocHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgfVxuICAgIHJldHVybiBkb2M7XG59XG5mdW5jdGlvbiBwYXJzZShzcmMsIHJldml2ZXIsIG9wdGlvbnMpIHtcbiAgICBsZXQgX3Jldml2ZXIgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIF9yZXZpdmVyID0gcmV2aXZlcjtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkICYmIHJldml2ZXIgJiYgdHlwZW9mIHJldml2ZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG9wdGlvbnMgPSByZXZpdmVyO1xuICAgIH1cbiAgICBjb25zdCBkb2MgPSBwYXJzZURvY3VtZW50KHNyYywgb3B0aW9ucyk7XG4gICAgaWYgKCFkb2MpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGRvYy53YXJuaW5ncy5mb3JFYWNoKHdhcm5pbmcgPT4gd2Fybihkb2Mub3B0aW9ucy5sb2dMZXZlbCwgd2FybmluZykpO1xuICAgIGlmIChkb2MuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGRvYy5vcHRpb25zLmxvZ0xldmVsICE9PSAnc2lsZW50JylcbiAgICAgICAgICAgIHRocm93IGRvYy5lcnJvcnNbMF07XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRvYy5lcnJvcnMgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIGRvYy50b0pTKE9iamVjdC5hc3NpZ24oeyByZXZpdmVyOiBfcmV2aXZlciB9LCBvcHRpb25zKSk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnkodmFsdWUsIHJlcGxhY2VyLCBvcHRpb25zKSB7XG4gICAgbGV0IF9yZXBsYWNlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJyB8fCBBcnJheS5pc0FycmF5KHJlcGxhY2VyKSkge1xuICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkICYmIHJlcGxhY2VyKSB7XG4gICAgICAgIG9wdGlvbnMgPSByZXBsYWNlcjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJylcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMubGVuZ3RoO1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgaW5kZW50ID0gTWF0aC5yb3VuZChvcHRpb25zKTtcbiAgICAgICAgb3B0aW9ucyA9IGluZGVudCA8IDEgPyB1bmRlZmluZWQgOiBpbmRlbnQgPiA4ID8geyBpbmRlbnQ6IDggfSA6IHsgaW5kZW50IH07XG4gICAgfVxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHsga2VlcFVuZGVmaW5lZCB9ID0gb3B0aW9ucyA/PyByZXBsYWNlciA/PyB7fTtcbiAgICAgICAgaWYgKCFrZWVwVW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEb2N1bWVudCh2YWx1ZSwgX3JlcGxhY2VyLCBvcHRpb25zKS50b1N0cmluZyhvcHRpb25zKTtcbn1cblxuZXhwb3J0IHsgcGFyc2UsIHBhcnNlQWxsRG9jdW1lbnRzLCBwYXJzZURvY3VtZW50LCBzdHJpbmdpZnkgfTtcbiIsImltcG9ydCB7IE1BUCwgU0NBTEFSLCBTRVEgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICcuL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi9jb21tb24vc2VxLmpzJztcbmltcG9ydCB7IHN0cmluZyB9IGZyb20gJy4vY29tbW9uL3N0cmluZy5qcyc7XG5pbXBvcnQgeyBnZXRUYWdzLCBjb3JlS25vd25UYWdzIH0gZnJvbSAnLi90YWdzLmpzJztcblxuY29uc3Qgc29ydE1hcEVudHJpZXNCeUtleSA9IChhLCBiKSA9PiBhLmtleSA8IGIua2V5ID8gLTEgOiBhLmtleSA+IGIua2V5ID8gMSA6IDA7XG5jbGFzcyBTY2hlbWEge1xuICAgIGNvbnN0cnVjdG9yKHsgY29tcGF0LCBjdXN0b21UYWdzLCBtZXJnZSwgcmVzb2x2ZUtub3duVGFncywgc2NoZW1hLCBzb3J0TWFwRW50cmllcywgdG9TdHJpbmdEZWZhdWx0cyB9KSB7XG4gICAgICAgIHRoaXMuY29tcGF0ID0gQXJyYXkuaXNBcnJheShjb21wYXQpXG4gICAgICAgICAgICA/IGdldFRhZ3MoY29tcGF0LCAnY29tcGF0JylcbiAgICAgICAgICAgIDogY29tcGF0XG4gICAgICAgICAgICAgICAgPyBnZXRUYWdzKG51bGwsIGNvbXBhdClcbiAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIHRoaXMubWVyZ2UgPSAhIW1lcmdlO1xuICAgICAgICB0aGlzLm5hbWUgPSAodHlwZW9mIHNjaGVtYSA9PT0gJ3N0cmluZycgJiYgc2NoZW1hKSB8fCAnY29yZSc7XG4gICAgICAgIHRoaXMua25vd25UYWdzID0gcmVzb2x2ZUtub3duVGFncyA/IGNvcmVLbm93blRhZ3MgOiB7fTtcbiAgICAgICAgdGhpcy50YWdzID0gZ2V0VGFncyhjdXN0b21UYWdzLCB0aGlzLm5hbWUpO1xuICAgICAgICB0aGlzLnRvU3RyaW5nT3B0aW9ucyA9IHRvU3RyaW5nRGVmYXVsdHMgPz8gbnVsbDtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIE1BUCwgeyB2YWx1ZTogbWFwIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgU0NBTEFSLCB7IHZhbHVlOiBzdHJpbmcgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBTRVEsIHsgdmFsdWU6IHNlcSB9KTtcbiAgICAgICAgLy8gVXNlZCBieSBjcmVhdGVNYXAoKVxuICAgICAgICB0aGlzLnNvcnRNYXBFbnRyaWVzID1cbiAgICAgICAgICAgIHR5cGVvZiBzb3J0TWFwRW50cmllcyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgID8gc29ydE1hcEVudHJpZXNcbiAgICAgICAgICAgICAgICA6IHNvcnRNYXBFbnRyaWVzID09PSB0cnVlXG4gICAgICAgICAgICAgICAgICAgID8gc29ydE1hcEVudHJpZXNCeUtleVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShTY2hlbWEucHJvdG90eXBlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGNvcHkudGFncyA9IHRoaXMudGFncy5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFNjaGVtYSB9O1xuIiwiaW1wb3J0IHsgaXNNYXAgfSBmcm9tICcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5cbmNvbnN0IG1hcCA9IHtcbiAgICBjb2xsZWN0aW9uOiAnbWFwJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG5vZGVDbGFzczogWUFNTE1hcCxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLFxuICAgIHJlc29sdmUobWFwLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICghaXNNYXAobWFwKSlcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgbWFwcGluZyBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIG9iaiwgY3R4KSA9PiBZQU1MTWFwLmZyb20oc2NoZW1hLCBvYmosIGN0eClcbn07XG5cbmV4cG9ydCB7IG1hcCB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcblxuY29uc3QgbnVsbFRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT0gbnVsbCxcbiAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgU2NhbGFyKG51bGwpLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bnVsbCcsXG4gICAgdGVzdDogL14oPzp+fFtObl11bGx8TlVMTCk/JC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhcihudWxsKSxcbiAgICBzdHJpbmdpZnk6ICh7IHNvdXJjZSB9LCBjdHgpID0+IHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnICYmIG51bGxUYWcudGVzdC50ZXN0KHNvdXJjZSlcbiAgICAgICAgPyBzb3VyY2VcbiAgICAgICAgOiBjdHgub3B0aW9ucy5udWxsU3RyXG59O1xuXG5leHBvcnQgeyBudWxsVGFnIH07XG4iLCJpbXBvcnQgeyBpc1NlcSB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuLi8uLi9ub2Rlcy9ZQU1MU2VxLmpzJztcblxuY29uc3Qgc2VxID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgbm9kZUNsYXNzOiBZQU1MU2VxLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnNlcScsXG4gICAgcmVzb2x2ZShzZXEsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKCFpc1NlcShzZXEpKVxuICAgICAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBzZXF1ZW5jZSBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIHNlcTtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIG9iaiwgY3R4KSA9PiBZQU1MU2VxLmZyb20oc2NoZW1hLCBvYmosIGN0eClcbn07XG5cbmV4cG9ydCB7IHNlcSB9O1xuIiwiaW1wb3J0IHsgc3RyaW5naWZ5U3RyaW5nIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcyc7XG5cbmNvbnN0IHN0cmluZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicsXG4gICAgcmVzb2x2ZTogc3RyID0+IHN0cixcbiAgICBzdHJpbmdpZnkoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oeyBhY3R1YWxTdHJpbmc6IHRydWUgfSwgY3R4KTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IHN0cmluZyB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcblxuY29uc3QgYm9vbFRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpib29sJyxcbiAgICB0ZXN0OiAvXig/OltUdF1ydWV8VFJVRXxbRmZdYWxzZXxGQUxTRSkkLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gbmV3IFNjYWxhcihzdHJbMF0gPT09ICd0JyB8fCBzdHJbMF0gPT09ICdUJyksXG4gICAgc3RyaW5naWZ5KHsgc291cmNlLCB2YWx1ZSB9LCBjdHgpIHtcbiAgICAgICAgaWYgKHNvdXJjZSAmJiBib29sVGFnLnRlc3QudGVzdChzb3VyY2UpKSB7XG4gICAgICAgICAgICBjb25zdCBzdiA9IHNvdXJjZVswXSA9PT0gJ3QnIHx8IHNvdXJjZVswXSA9PT0gJ1QnO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBzdilcbiAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZSA/IGN0eC5vcHRpb25zLnRydWVTdHIgOiBjdHgub3B0aW9ucy5mYWxzZVN0cjtcbiAgICB9XG59O1xuXG5leHBvcnQgeyBib29sVGFnIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGZsb2F0TmFOID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eKD86Wy0rXT9cXC4oPzppbmZ8SW5mfElORil8XFwubmFufFxcLk5hTnxcXC5OQU4pJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IHN0ci5zbGljZSgtMykudG9Mb3dlckNhc2UoKSA9PT0gJ25hbidcbiAgICAgICAgPyBOYU5cbiAgICAgICAgOiBzdHJbMF0gPT09ICctJ1xuICAgICAgICAgICAgPyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFlcbiAgICAgICAgICAgIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgZmxvYXRFeHAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnRVhQJyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldKyg/OlxcLlswLTldKik/KVtlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgc3RyaW5naWZ5KG5vZGUpIHtcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKG5vZGUudmFsdWUpO1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobnVtKSA/IG51bS50b0V4cG9uZW50aWFsKCkgOiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgfVxufTtcbmNvbnN0IGZsb2F0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpcXC5bMC05XSt8WzAtOV0rXFwuWzAtOV0qKSQvLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyKHBhcnNlRmxvYXQoc3RyKSk7XG4gICAgICAgIGNvbnN0IGRvdCA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChkb3QgIT09IC0xICYmIHN0cltzdHIubGVuZ3RoIC0gMV0gPT09ICcwJylcbiAgICAgICAgICAgIG5vZGUubWluRnJhY3Rpb25EaWdpdHMgPSBzdHIubGVuZ3RoIC0gZG90IC0gMTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0IHsgZmxvYXQsIGZsb2F0RXhwLCBmbG9hdE5hTiB9O1xuIiwiaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuY29uc3QgaW50UmVzb2x2ZSA9IChzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkgPT4gKGludEFzQmlnSW50ID8gQmlnSW50KHN0cikgOiBwYXJzZUludChzdHIuc3Vic3RyaW5nKG9mZnNldCksIHJhZGl4KSk7XG5mdW5jdGlvbiBpbnRTdHJpbmdpZnkobm9kZSwgcmFkaXgsIHByZWZpeCkge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgaWYgKGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwKVxuICAgICAgICByZXR1cm4gcHJlZml4ICsgdmFsdWUudG9TdHJpbmcocmFkaXgpO1xuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG59XG5jb25zdCBpbnRPY3QgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdPQ1QnLFxuICAgIHRlc3Q6IC9eMG9bMC03XSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgOCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDgsICcwbycpXG59O1xuY29uc3QgaW50ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgdGVzdDogL15bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAwLCAxMCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGludEhleCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gaW50SWRlbnRpZnkodmFsdWUpICYmIHZhbHVlID49IDAsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ0hFWCcsXG4gICAgdGVzdDogL14weFswLTlhLWZBLUZdKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCAxNiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDE2LCAnMHgnKVxufTtcblxuZXhwb3J0IHsgaW50LCBpbnRIZXgsIGludE9jdCB9O1xuIiwiaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBudWxsVGFnIH0gZnJvbSAnLi4vY29tbW9uL251bGwuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi4vY29tbW9uL3NlcS5qcyc7XG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tICcuLi9jb21tb24vc3RyaW5nLmpzJztcbmltcG9ydCB7IGJvb2xUYWcgfSBmcm9tICcuL2Jvb2wuanMnO1xuaW1wb3J0IHsgZmxvYXROYU4sIGZsb2F0RXhwLCBmbG9hdCB9IGZyb20gJy4vZmxvYXQuanMnO1xuaW1wb3J0IHsgaW50T2N0LCBpbnQsIGludEhleCB9IGZyb20gJy4vaW50LmpzJztcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcCxcbiAgICBzZXEsXG4gICAgc3RyaW5nLFxuICAgIG51bGxUYWcsXG4gICAgYm9vbFRhZyxcbiAgICBpbnRPY3QsXG4gICAgaW50LFxuICAgIGludEhleCxcbiAgICBmbG9hdE5hTixcbiAgICBmbG9hdEV4cCxcbiAgICBmbG9hdFxuXTtcblxuZXhwb3J0IHsgc2NoZW1hIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBzZXEgfSBmcm9tICcuLi9jb21tb24vc2VxLmpzJztcblxuZnVuY3Rpb24gaW50SWRlbnRpZnkodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbn1cbmNvbnN0IHN0cmluZ2lmeUpTT04gPSAoeyB2YWx1ZSB9KSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5jb25zdCBqc29uU2NhbGFycyA9IFtcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09IG51bGwsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIobnVsbCksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLFxuICAgICAgICB0ZXN0OiAvXm51bGwkLyxcbiAgICAgICAgcmVzb2x2ZTogKCkgPT4gbnVsbCxcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgICAgIHRlc3Q6IC9edHJ1ZXxmYWxzZSQvLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyID09PSAndHJ1ZScsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgICAgIHRlc3Q6IC9eLT8oPzowfFsxLTldWzAtOV0qKSQvLFxuICAgICAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgeyBpbnRBc0JpZ0ludCB9KSA9PiBpbnRBc0JpZ0ludCA/IEJpZ0ludChzdHIpIDogcGFyc2VJbnQoc3RyLCAxMCksXG4gICAgICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gaW50SWRlbnRpZnkodmFsdWUpID8gdmFsdWUudG9TdHJpbmcoKSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgICAgICB0ZXN0OiAvXi0/KD86MHxbMS05XVswLTldKikoPzpcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JC8sXG4gICAgICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH1cbl07XG5jb25zdCBqc29uRXJyb3IgPSB7XG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICcnLFxuICAgIHRlc3Q6IC9eLyxcbiAgICByZXNvbHZlKHN0ciwgb25FcnJvcikge1xuICAgICAgICBvbkVycm9yKGBVbnJlc29sdmVkIHBsYWluIHNjYWxhciAke0pTT04uc3RyaW5naWZ5KHN0cil9YCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxufTtcbmNvbnN0IHNjaGVtYSA9IFttYXAsIHNlcV0uY29uY2F0KGpzb25TY2FsYXJzLCBqc29uRXJyb3IpO1xuXG5leHBvcnQgeyBzY2hlbWEgfTtcbiIsImltcG9ydCB7IG1hcCB9IGZyb20gJy4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBudWxsVGFnIH0gZnJvbSAnLi9jb21tb24vbnVsbC5qcyc7XG5pbXBvcnQgeyBzZXEgfSBmcm9tICcuL2NvbW1vbi9zZXEuanMnO1xuaW1wb3J0IHsgc3RyaW5nIH0gZnJvbSAnLi9jb21tb24vc3RyaW5nLmpzJztcbmltcG9ydCB7IGJvb2xUYWcgfSBmcm9tICcuL2NvcmUvYm9vbC5qcyc7XG5pbXBvcnQgeyBmbG9hdCwgZmxvYXRFeHAsIGZsb2F0TmFOIH0gZnJvbSAnLi9jb3JlL2Zsb2F0LmpzJztcbmltcG9ydCB7IGludCwgaW50SGV4LCBpbnRPY3QgfSBmcm9tICcuL2NvcmUvaW50LmpzJztcbmltcG9ydCB7IHNjaGVtYSB9IGZyb20gJy4vY29yZS9zY2hlbWEuanMnO1xuaW1wb3J0IHsgc2NoZW1hIGFzIHNjaGVtYSQxIH0gZnJvbSAnLi9qc29uL3NjaGVtYS5qcyc7XG5pbXBvcnQgeyBiaW5hcnkgfSBmcm9tICcuL3lhbWwtMS4xL2JpbmFyeS5qcyc7XG5pbXBvcnQgeyBvbWFwIH0gZnJvbSAnLi95YW1sLTEuMS9vbWFwLmpzJztcbmltcG9ydCB7IHBhaXJzIH0gZnJvbSAnLi95YW1sLTEuMS9wYWlycy5qcyc7XG5pbXBvcnQgeyBzY2hlbWEgYXMgc2NoZW1hJDIgfSBmcm9tICcuL3lhbWwtMS4xL3NjaGVtYS5qcyc7XG5pbXBvcnQgeyBzZXQgfSBmcm9tICcuL3lhbWwtMS4xL3NldC5qcyc7XG5pbXBvcnQgeyB0aW1lc3RhbXAsIGZsb2F0VGltZSwgaW50VGltZSB9IGZyb20gJy4veWFtbC0xLjEvdGltZXN0YW1wLmpzJztcblxuY29uc3Qgc2NoZW1hcyA9IG5ldyBNYXAoW1xuICAgIFsnY29yZScsIHNjaGVtYV0sXG4gICAgWydmYWlsc2FmZScsIFttYXAsIHNlcSwgc3RyaW5nXV0sXG4gICAgWydqc29uJywgc2NoZW1hJDFdLFxuICAgIFsneWFtbDExJywgc2NoZW1hJDJdLFxuICAgIFsneWFtbC0xLjEnLCBzY2hlbWEkMl1cbl0pO1xuY29uc3QgdGFnc0J5TmFtZSA9IHtcbiAgICBiaW5hcnksXG4gICAgYm9vbDogYm9vbFRhZyxcbiAgICBmbG9hdCxcbiAgICBmbG9hdEV4cCxcbiAgICBmbG9hdE5hTixcbiAgICBmbG9hdFRpbWUsXG4gICAgaW50LFxuICAgIGludEhleCxcbiAgICBpbnRPY3QsXG4gICAgaW50VGltZSxcbiAgICBtYXAsXG4gICAgbnVsbDogbnVsbFRhZyxcbiAgICBvbWFwLFxuICAgIHBhaXJzLFxuICAgIHNlcSxcbiAgICBzZXQsXG4gICAgdGltZXN0YW1wXG59O1xuY29uc3QgY29yZUtub3duVGFncyA9IHtcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6YmluYXJ5JzogYmluYXJ5LFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJzogb21hcCxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnOiBwYWlycyxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6c2V0Jzogc2V0LFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnOiB0aW1lc3RhbXBcbn07XG5mdW5jdGlvbiBnZXRUYWdzKGN1c3RvbVRhZ3MsIHNjaGVtYU5hbWUpIHtcbiAgICBsZXQgdGFncyA9IHNjaGVtYXMuZ2V0KHNjaGVtYU5hbWUpO1xuICAgIGlmICghdGFncykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjdXN0b21UYWdzKSlcbiAgICAgICAgICAgIHRhZ3MgPSBbXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gQXJyYXkuZnJvbShzY2hlbWFzLmtleXMoKSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGtleSA9PiBrZXkgIT09ICd5YW1sMTEnKVxuICAgICAgICAgICAgICAgIC5tYXAoa2V5ID0+IEpTT04uc3RyaW5naWZ5KGtleSkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc2NoZW1hIFwiJHtzY2hlbWFOYW1lfVwiOyB1c2Ugb25lIG9mICR7a2V5c30gb3IgZGVmaW5lIGN1c3RvbVRhZ3MgYXJyYXlgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjdXN0b21UYWdzKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBjdXN0b21UYWdzKVxuICAgICAgICAgICAgdGFncyA9IHRhZ3MuY29uY2F0KHRhZyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBjdXN0b21UYWdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRhZ3MgPSBjdXN0b21UYWdzKHRhZ3Muc2xpY2UoKSk7XG4gICAgfVxuICAgIHJldHVybiB0YWdzLm1hcCh0YWcgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHRhZyAhPT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXR1cm4gdGFnO1xuICAgICAgICBjb25zdCB0YWdPYmogPSB0YWdzQnlOYW1lW3RhZ107XG4gICAgICAgIGlmICh0YWdPYmopXG4gICAgICAgICAgICByZXR1cm4gdGFnT2JqO1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGFnc0J5TmFtZSlcbiAgICAgICAgICAgIC5tYXAoa2V5ID0+IEpTT04uc3RyaW5naWZ5KGtleSkpXG4gICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGN1c3RvbSB0YWcgXCIke3RhZ31cIjsgdXNlIG9uZSBvZiAke2tleXN9YCk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IGNvcmVLbm93blRhZ3MsIGdldFRhZ3MgfTtcbiIsImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfSBmcm9tICcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJztcblxuY29uc3QgYmluYXJ5ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXksIC8vIEJ1ZmZlciBpbmhlcml0cyBmcm9tIFVpbnQ4QXJyYXlcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknLFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBCdWZmZXIgaW4gbm9kZSBhbmQgYW4gVWludDhBcnJheSBpbiBicm93c2Vyc1xuICAgICAqXG4gICAgICogVG8gdXNlIHRoZSByZXN1bHRpbmcgYnVmZmVyIGFzIGFuIGltYWdlLCB5b3UnbGwgd2FudCB0byBkbyBzb21ldGhpbmcgbGlrZTpcbiAgICAgKlxuICAgICAqICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtidWZmZXJdLCB7IHR5cGU6ICdpbWFnZS9qcGVnJyB9KVxuICAgICAqICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Bob3RvJykuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICAgICAqL1xuICAgIHJlc29sdmUoc3JjLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0eXBlb2YgQnVmZmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20oc3JjLCAnYmFzZTY0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGF0b2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIE9uIElFIDExLCBhdG9iKCkgY2FuJ3QgaGFuZGxlIG5ld2xpbmVzXG4gICAgICAgICAgICBjb25zdCBzdHIgPSBhdG9iKHNyYy5yZXBsYWNlKC9bXFxuXFxyXS9nLCAnJykpO1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoc3RyLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBidWZmZXJbaV0gPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvbkVycm9yKCdUaGlzIGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgcmVhZGluZyBiaW5hcnkgdGFnczsgZWl0aGVyIEJ1ZmZlciBvciBhdG9iIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgICAgICByZXR1cm4gc3JjO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzdHJpbmdpZnkoeyBjb21tZW50LCB0eXBlLCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgY29uc3QgYnVmID0gdmFsdWU7IC8vIGNoZWNrZWQgZWFybGllciBieSBiaW5hcnkuaWRlbnRpZnkoKVxuICAgICAgICBsZXQgc3RyO1xuICAgICAgICBpZiAodHlwZW9mIEJ1ZmZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc3RyID1cbiAgICAgICAgICAgICAgICBidWYgaW5zdGFuY2VvZiBCdWZmZXJcbiAgICAgICAgICAgICAgICAgICAgPyBidWYudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgICAgICAgICAgICAgIDogQnVmZmVyLmZyb20oYnVmLmJ1ZmZlcikudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBsZXQgcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSk7XG4gICAgICAgICAgICBzdHIgPSBidG9hKHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgd3JpdGluZyBiaW5hcnkgdGFnczsgZWl0aGVyIEJ1ZmZlciBvciBidG9hIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0eXBlKVxuICAgICAgICAgICAgdHlwZSA9IFNjYWxhci5CTE9DS19MSVRFUkFMO1xuICAgICAgICBpZiAodHlwZSAhPT0gU2NhbGFyLlFVT1RFX0RPVUJMRSkge1xuICAgICAgICAgICAgY29uc3QgbGluZVdpZHRoID0gTWF0aC5tYXgoY3R4Lm9wdGlvbnMubGluZVdpZHRoIC0gY3R4LmluZGVudC5sZW5ndGgsIGN0eC5vcHRpb25zLm1pbkNvbnRlbnRXaWR0aCk7XG4gICAgICAgICAgICBjb25zdCBuID0gTWF0aC5jZWlsKHN0ci5sZW5ndGggLyBsaW5lV2lkdGgpO1xuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBuZXcgQXJyYXkobik7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbyA9IDA7IGkgPCBuOyArK2ksIG8gKz0gbGluZVdpZHRoKSB7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gPSBzdHIuc3Vic3RyKG8sIGxpbmVXaWR0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHIgPSBsaW5lcy5qb2luKHR5cGUgPT09IFNjYWxhci5CTE9DS19MSVRFUkFMID8gJ1xcbicgOiAnICcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcoeyBjb21tZW50LCB0eXBlLCB2YWx1ZTogc3RyIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgYmluYXJ5IH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuXG5mdW5jdGlvbiBib29sU3RyaW5naWZ5KHsgdmFsdWUsIHNvdXJjZSB9LCBjdHgpIHtcbiAgICBjb25zdCBib29sT2JqID0gdmFsdWUgPyB0cnVlVGFnIDogZmFsc2VUYWc7XG4gICAgaWYgKHNvdXJjZSAmJiBib29sT2JqLnRlc3QudGVzdChzb3VyY2UpKVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIHJldHVybiB2YWx1ZSA/IGN0eC5vcHRpb25zLnRydWVTdHIgOiBjdHgub3B0aW9ucy5mYWxzZVN0cjtcbn1cbmNvbnN0IHRydWVUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09PSB0cnVlLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpZfHl8W1l5XWVzfFlFU3xbVHRdcnVlfFRSVUV8W09vXW58T04pJC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhcih0cnVlKSxcbiAgICBzdHJpbmdpZnk6IGJvb2xTdHJpbmdpZnlcbn07XG5jb25zdCBmYWxzZVRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT09IGZhbHNlLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpOfG58W05uXW98Tk98W0ZmXWFsc2V8RkFMU0V8W09vXWZmfE9GRikkLyxcbiAgICByZXNvbHZlOiAoKSA9PiBuZXcgU2NhbGFyKGZhbHNlKSxcbiAgICBzdHJpbmdpZnk6IGJvb2xTdHJpbmdpZnlcbn07XG5cbmV4cG9ydCB7IGZhbHNlVGFnLCB0cnVlVGFnIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGZsb2F0TmFOID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eKD86Wy0rXT9cXC4oPzppbmZ8SW5mfElORil8XFwubmFufFxcLk5hTnxcXC5OQU4pJC8sXG4gICAgcmVzb2x2ZTogKHN0cikgPT4gc3RyLnNsaWNlKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnbmFuJ1xuICAgICAgICA/IE5hTlxuICAgICAgICA6IHN0clswXSA9PT0gJy0nXG4gICAgICAgICAgICA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgICAgICAgICAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBmbG9hdEV4cCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICBmb3JtYXQ6ICdFWFAnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpbMC05XVswLTlfXSopPyg/OlxcLlswLTlfXSopP1tlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IChzdHIpID0+IHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSxcbiAgICBzdHJpbmdpZnkobm9kZSkge1xuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIobm9kZS52YWx1ZSk7XG4gICAgICAgIHJldHVybiBpc0Zpbml0ZShudW0pID8gbnVtLnRvRXhwb25lbnRpYWwoKSA6IHN0cmluZ2lmeU51bWJlcihub2RlKTtcbiAgICB9XG59O1xuY29uc3QgZmxvYXQgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL15bLStdPyg/OlswLTldWzAtOV9dKik/XFwuWzAtOV9dKiQvLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyKHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSk7XG4gICAgICAgIGNvbnN0IGRvdCA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChkb3QgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBmID0gc3RyLnN1YnN0cmluZyhkb3QgKyAxKS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICAgICAgICAgIGlmIChmW2YubGVuZ3RoIC0gMV0gPT09ICcwJylcbiAgICAgICAgICAgICAgICBub2RlLm1pbkZyYWN0aW9uRGlnaXRzID0gZi5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0IHsgZmxvYXQsIGZsb2F0RXhwLCBmbG9hdE5hTiB9O1xuIiwiaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuZnVuY3Rpb24gaW50UmVzb2x2ZShzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgaWYgKHNpZ24gPT09ICctJyB8fCBzaWduID09PSAnKycpXG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcob2Zmc2V0KS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICBpZiAoaW50QXNCaWdJbnQpIHtcbiAgICAgICAgc3dpdGNoIChyYWRpeCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHN0ciA9IGAwYiR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgc3RyID0gYDBvJHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgc3RyID0gYDB4JHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuID0gQmlnSW50KHN0cik7XG4gICAgICAgIHJldHVybiBzaWduID09PSAnLScgPyBCaWdJbnQoLTEpICogbiA6IG47XG4gICAgfVxuICAgIGNvbnN0IG4gPSBwYXJzZUludChzdHIsIHJhZGl4KTtcbiAgICByZXR1cm4gc2lnbiA9PT0gJy0nID8gLTEgKiBuIDogbjtcbn1cbmZ1bmN0aW9uIGludFN0cmluZ2lmeShub2RlLCByYWRpeCwgcHJlZml4KSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBpZiAoaW50SWRlbnRpZnkodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHN0ciA9IHZhbHVlLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlIDwgMCA/ICctJyArIHByZWZpeCArIHN0ci5zdWJzdHIoMSkgOiBwcmVmaXggKyBzdHI7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG59XG5jb25zdCBpbnRCaW4gPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdCSU4nLFxuICAgIHRlc3Q6IC9eWy0rXT8wYlswLTFfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDIsICcwYicpXG59O1xuY29uc3QgaW50T2N0ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnT0NUJyxcbiAgICB0ZXN0OiAvXlstK10/MFswLTdfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMSwgOCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDgsICcwJylcbn07XG5jb25zdCBpbnQgPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDAsIDEwLCBvcHQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgaW50SGV4ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnSEVYJyxcbiAgICB0ZXN0OiAvXlstK10/MHhbMC05YS1mQS1GX10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDE2LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgMTYsICcweCcpXG59O1xuXG5leHBvcnQgeyBpbnQsIGludEJpbiwgaW50SGV4LCBpbnRPY3QgfTtcbiIsImltcG9ydCB7IGlzU2NhbGFyLCBpc1BhaXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi4vLi4vbm9kZXMvdG9KUy5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlUGFpcnMsIGNyZWF0ZVBhaXJzIH0gZnJvbSAnLi9wYWlycy5qcyc7XG5cbmNsYXNzIFlBTUxPTWFwIGV4dGVuZHMgWUFNTFNlcSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWRkID0gWUFNTE1hcC5wcm90b3R5cGUuYWRkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGVsZXRlID0gWUFNTE1hcC5wcm90b3R5cGUuZGVsZXRlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZ2V0ID0gWUFNTE1hcC5wcm90b3R5cGUuZ2V0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFzID0gWUFNTE1hcC5wcm90b3R5cGUuaGFzLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2V0ID0gWUFNTE1hcC5wcm90b3R5cGUuc2V0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudGFnID0gWUFNTE9NYXAudGFnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJZiBgY3R4YCBpcyBnaXZlbiwgdGhlIHJldHVybiB0eXBlIGlzIGFjdHVhbGx5IGBNYXA8dW5rbm93biwgdW5rbm93bj5gLFxuICAgICAqIGJ1dCBUeXBlU2NyaXB0IHdvbid0IGFsbG93IHdpZGVuaW5nIHRoZSBzaWduYXR1cmUgb2YgYSBjaGlsZCBtZXRob2QuXG4gICAgICovXG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBzdXBlci50b0pTT04oXyk7XG4gICAgICAgIGNvbnN0IG1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgaWYgKGN0eD8ub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUobWFwKTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHRoaXMuaXRlbXMpIHtcbiAgICAgICAgICAgIGxldCBrZXksIHZhbHVlO1xuICAgICAgICAgICAgaWYgKGlzUGFpcihwYWlyKSkge1xuICAgICAgICAgICAgICAgIGtleSA9IHRvSlMocGFpci5rZXksICcnLCBjdHgpO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdG9KUyhwYWlyLnZhbHVlLCBrZXksIGN0eCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSB0b0pTKHBhaXIsICcnLCBjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1hcC5oYXMoa2V5KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09yZGVyZWQgbWFwcyBtdXN0IG5vdCBpbmNsdWRlIGR1cGxpY2F0ZSBrZXlzJyk7XG4gICAgICAgICAgICBtYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkge1xuICAgICAgICBjb25zdCBwYWlycyA9IGNyZWF0ZVBhaXJzKHNjaGVtYSwgaXRlcmFibGUsIGN0eCk7XG4gICAgICAgIGNvbnN0IG9tYXAgPSBuZXcgdGhpcygpO1xuICAgICAgICBvbWFwLml0ZW1zID0gcGFpcnMuaXRlbXM7XG4gICAgICAgIHJldHVybiBvbWFwO1xuICAgIH1cbn1cbllBTUxPTWFwLnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJztcbmNvbnN0IG9tYXAgPSB7XG4gICAgY29sbGVjdGlvbjogJ3NlcScsXG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgTWFwLFxuICAgIG5vZGVDbGFzczogWUFNTE9NYXAsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6b21hcCcsXG4gICAgcmVzb2x2ZShzZXEsIG9uRXJyb3IpIHtcbiAgICAgICAgY29uc3QgcGFpcnMgPSByZXNvbHZlUGFpcnMoc2VxLCBvbkVycm9yKTtcbiAgICAgICAgY29uc3Qgc2VlbktleXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCB7IGtleSB9IG9mIHBhaXJzLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaXNTY2FsYXIoa2V5KSkge1xuICAgICAgICAgICAgICAgIGlmIChzZWVuS2V5cy5pbmNsdWRlcyhrZXkudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoYE9yZGVyZWQgbWFwcyBtdXN0IG5vdCBpbmNsdWRlIGR1cGxpY2F0ZSBrZXlzOiAke2tleS52YWx1ZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlZW5LZXlzLnB1c2goa2V5LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IFlBTUxPTWFwKCksIHBhaXJzKTtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpID0+IFlBTUxPTWFwLmZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KVxufTtcblxuZXhwb3J0IHsgWUFNTE9NYXAsIG9tYXAgfTtcbiIsImltcG9ydCB7IGlzU2VxLCBpc1BhaXIsIGlzTWFwIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgUGFpciwgY3JlYXRlUGFpciB9IGZyb20gJy4uLy4uL25vZGVzL1BhaXIuanMnO1xuaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuLi8uLi9ub2Rlcy9ZQU1MU2VxLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZVBhaXJzKHNlcSwgb25FcnJvcikge1xuICAgIGlmIChpc1NlcShzZXEpKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VxLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHNlcS5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmIChpc1BhaXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBlbHNlIGlmIChpc01hcChpdGVtKSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLml0ZW1zLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ0VhY2ggcGFpciBtdXN0IGhhdmUgaXRzIG93biBzZXF1ZW5jZSBpbmRpY2F0b3InKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYWlyID0gaXRlbS5pdGVtc1swXSB8fCBuZXcgUGFpcihuZXcgU2NhbGFyKG51bGwpKTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50QmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBwYWlyLmtleS5jb21tZW50QmVmb3JlID0gcGFpci5rZXkuY29tbWVudEJlZm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtpdGVtLmNvbW1lbnRCZWZvcmV9XFxuJHtwYWlyLmtleS5jb21tZW50QmVmb3JlfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY24gPSBwYWlyLnZhbHVlID8/IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgICAgICBjbi5jb21tZW50ID0gY24uY29tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtpdGVtLmNvbW1lbnR9XFxuJHtjbi5jb21tZW50fWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtID0gcGFpcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlcS5pdGVtc1tpXSA9IGlzUGFpcihpdGVtKSA/IGl0ZW0gOiBuZXcgUGFpcihpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgc2VxdWVuY2UgZm9yIHRoaXMgdGFnJyk7XG4gICAgcmV0dXJuIHNlcTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVBhaXJzKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkge1xuICAgIGNvbnN0IHsgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICBjb25zdCBwYWlycyA9IG5ldyBZQU1MU2VxKHNjaGVtYSk7XG4gICAgcGFpcnMudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJztcbiAgICBsZXQgaSA9IDA7XG4gICAgaWYgKGl0ZXJhYmxlICYmIFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcmFibGUpKVxuICAgICAgICBmb3IgKGxldCBpdCBvZiBpdGVyYWJsZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICBpdCA9IHJlcGxhY2VyLmNhbGwoaXRlcmFibGUsIFN0cmluZyhpKyspLCBpdCk7XG4gICAgICAgICAgICBsZXQga2V5LCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGl0KSkge1xuICAgICAgICAgICAgICAgIGlmIChpdC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gaXRbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gaXRbMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgW2tleSwgdmFsdWVdIHR1cGxlOiAke2l0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXQgJiYgaXQgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoaXQpO1xuICAgICAgICAgICAgICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBrZXlzWzBdO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGl0W2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0dXBsZSB3aXRoIG9uZSBrZXksIG5vdCAke2tleXMubGVuZ3RofSBrZXlzYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYWlycy5pdGVtcy5wdXNoKGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSk7XG4gICAgICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG59XG5jb25zdCBwYWlycyA9IHtcbiAgICBjb2xsZWN0aW9uOiAnc2VxJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycycsXG4gICAgcmVzb2x2ZTogcmVzb2x2ZVBhaXJzLFxuICAgIGNyZWF0ZU5vZGU6IGNyZWF0ZVBhaXJzXG59O1xuXG5leHBvcnQgeyBjcmVhdGVQYWlycywgcGFpcnMsIHJlc29sdmVQYWlycyB9O1xuIiwiaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBudWxsVGFnIH0gZnJvbSAnLi4vY29tbW9uL251bGwuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi4vY29tbW9uL3NlcS5qcyc7XG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tICcuLi9jb21tb24vc3RyaW5nLmpzJztcbmltcG9ydCB7IGJpbmFyeSB9IGZyb20gJy4vYmluYXJ5LmpzJztcbmltcG9ydCB7IHRydWVUYWcsIGZhbHNlVGFnIH0gZnJvbSAnLi9ib29sLmpzJztcbmltcG9ydCB7IGZsb2F0TmFOLCBmbG9hdEV4cCwgZmxvYXQgfSBmcm9tICcuL2Zsb2F0LmpzJztcbmltcG9ydCB7IGludEJpbiwgaW50T2N0LCBpbnQsIGludEhleCB9IGZyb20gJy4vaW50LmpzJztcbmltcG9ydCB7IG9tYXAgfSBmcm9tICcuL29tYXAuanMnO1xuaW1wb3J0IHsgcGFpcnMgfSBmcm9tICcuL3BhaXJzLmpzJztcbmltcG9ydCB7IHNldCB9IGZyb20gJy4vc2V0LmpzJztcbmltcG9ydCB7IGludFRpbWUsIGZsb2F0VGltZSwgdGltZXN0YW1wIH0gZnJvbSAnLi90aW1lc3RhbXAuanMnO1xuXG5jb25zdCBzY2hlbWEgPSBbXG4gICAgbWFwLFxuICAgIHNlcSxcbiAgICBzdHJpbmcsXG4gICAgbnVsbFRhZyxcbiAgICB0cnVlVGFnLFxuICAgIGZhbHNlVGFnLFxuICAgIGludEJpbixcbiAgICBpbnRPY3QsXG4gICAgaW50LFxuICAgIGludEhleCxcbiAgICBmbG9hdE5hTixcbiAgICBmbG9hdEV4cCxcbiAgICBmbG9hdCxcbiAgICBiaW5hcnksXG4gICAgb21hcCxcbiAgICBwYWlycyxcbiAgICBzZXQsXG4gICAgaW50VGltZSxcbiAgICBmbG9hdFRpbWUsXG4gICAgdGltZXN0YW1wXG5dO1xuXG5leHBvcnQgeyBzY2hlbWEgfTtcbiIsImltcG9ydCB7IGlzTWFwLCBpc1BhaXIsIGlzU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgUGFpciwgY3JlYXRlUGFpciB9IGZyb20gJy4uLy4uL25vZGVzL1BhaXIuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCwgZmluZFBhaXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9ZQU1MTWFwLmpzJztcblxuY2xhc3MgWUFNTFNldCBleHRlbmRzIFlBTUxNYXAge1xuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihzY2hlbWEpO1xuICAgICAgICB0aGlzLnRhZyA9IFlBTUxTZXQudGFnO1xuICAgIH1cbiAgICBhZGQoa2V5KSB7XG4gICAgICAgIGxldCBwYWlyO1xuICAgICAgICBpZiAoaXNQYWlyKGtleSkpXG4gICAgICAgICAgICBwYWlyID0ga2V5O1xuICAgICAgICBlbHNlIGlmIChrZXkgJiZcbiAgICAgICAgICAgIHR5cGVvZiBrZXkgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAna2V5JyBpbiBrZXkgJiZcbiAgICAgICAgICAgICd2YWx1ZScgaW4ga2V5ICYmXG4gICAgICAgICAgICBrZXkudmFsdWUgPT09IG51bGwpXG4gICAgICAgICAgICBwYWlyID0gbmV3IFBhaXIoa2V5LmtleSwgbnVsbCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBhaXIgPSBuZXcgUGFpcihrZXksIG51bGwpO1xuICAgICAgICBjb25zdCBwcmV2ID0gZmluZFBhaXIodGhpcy5pdGVtcywgcGFpci5rZXkpO1xuICAgICAgICBpZiAoIXByZXYpXG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2gocGFpcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIElmIGBrZWVwUGFpcmAgaXMgYHRydWVgLCByZXR1cm5zIHRoZSBQYWlyIG1hdGNoaW5nIGBrZXlgLlxuICAgICAqIE90aGVyd2lzZSwgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhhdCBQYWlyJ3Mga2V5LlxuICAgICAqL1xuICAgIGdldChrZXksIGtlZXBQYWlyKSB7XG4gICAgICAgIGNvbnN0IHBhaXIgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICByZXR1cm4gIWtlZXBQYWlyICYmIGlzUGFpcihwYWlyKVxuICAgICAgICAgICAgPyBpc1NjYWxhcihwYWlyLmtleSlcbiAgICAgICAgICAgICAgICA/IHBhaXIua2V5LnZhbHVlXG4gICAgICAgICAgICAgICAgOiBwYWlyLmtleVxuICAgICAgICAgICAgOiBwYWlyO1xuICAgIH1cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGJvb2xlYW4gdmFsdWUgZm9yIHNldChrZXksIHZhbHVlKSBpbiBhIFlBTUwgc2V0LCBub3QgJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICBpZiAocHJldiAmJiAhdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMuaXRlbXMuaW5kZXhPZihwcmV2KSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXByZXYgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChuZXcgUGFpcihrZXkpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIHJldHVybiBzdXBlci50b0pTT04oXywgY3R4LCBTZXQpO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmhhc0FsbE51bGxWYWx1ZXModHJ1ZSkpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7IGFsbE51bGxWYWx1ZXM6IHRydWUgfSksIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldCBpdGVtcyBtdXN0IGFsbCBoYXZlIG51bGwgdmFsdWVzJyk7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkge1xuICAgICAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IHNldCA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGlmIChpdGVyYWJsZSAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXJhYmxlKSlcbiAgICAgICAgICAgIGZvciAobGV0IHZhbHVlIG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKGl0ZXJhYmxlLCB2YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNldC5pdGVtcy5wdXNoKGNyZWF0ZVBhaXIodmFsdWUsIG51bGwsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0O1xuICAgIH1cbn1cbllBTUxTZXQudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOnNldCc7XG5jb25zdCBzZXQgPSB7XG4gICAgY29sbGVjdGlvbjogJ21hcCcsXG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgU2V0LFxuICAgIG5vZGVDbGFzczogWUFNTFNldCxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnLFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpID0+IFlBTUxTZXQuZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpLFxuICAgIHJlc29sdmUobWFwLCBvbkVycm9yKSB7XG4gICAgICAgIGlmIChpc01hcChtYXApKSB7XG4gICAgICAgICAgICBpZiAobWFwLmhhc0FsbE51bGxWYWx1ZXModHJ1ZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IFlBTUxTZXQoKSwgbWFwKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvbkVycm9yKCdTZXQgaXRlbXMgbXVzdCBhbGwgaGF2ZSBudWxsIHZhbHVlcycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgbWFwcGluZyBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG59O1xuXG5leHBvcnQgeyBZQU1MU2V0LCBzZXQgfTtcbiIsImltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG4vKiogSW50ZXJuYWwgdHlwZXMgaGFuZGxlIGJpZ2ludCBhcyBudW1iZXIsIGJlY2F1c2UgVFMgY2FuJ3QgZmlndXJlIGl0IG91dC4gKi9cbmZ1bmN0aW9uIHBhcnNlU2V4YWdlc2ltYWwoc3RyLCBhc0JpZ0ludCkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgY29uc3QgcGFydHMgPSBzaWduID09PSAnLScgfHwgc2lnbiA9PT0gJysnID8gc3RyLnN1YnN0cmluZygxKSA6IHN0cjtcbiAgICBjb25zdCBudW0gPSAobikgPT4gYXNCaWdJbnQgPyBCaWdJbnQobikgOiBOdW1iZXIobik7XG4gICAgY29uc3QgcmVzID0gcGFydHNcbiAgICAgICAgLnJlcGxhY2UoL18vZywgJycpXG4gICAgICAgIC5zcGxpdCgnOicpXG4gICAgICAgIC5yZWR1Y2UoKHJlcywgcCkgPT4gcmVzICogbnVtKDYwKSArIG51bShwKSwgbnVtKDApKTtcbiAgICByZXR1cm4gKHNpZ24gPT09ICctJyA/IG51bSgtMSkgKiByZXMgOiByZXMpO1xufVxuLyoqXG4gKiBoaGhoOm1tOnNzLnNzc1xuICpcbiAqIEludGVybmFsIHR5cGVzIGhhbmRsZSBiaWdpbnQgYXMgbnVtYmVyLCBiZWNhdXNlIFRTIGNhbid0IGZpZ3VyZSBpdCBvdXQuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVNleGFnZXNpbWFsKG5vZGUpIHtcbiAgICBsZXQgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBsZXQgbnVtID0gKG4pID0+IG47XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcpXG4gICAgICAgIG51bSA9IG4gPT4gQmlnSW50KG4pO1xuICAgIGVsc2UgaWYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIGxldCBzaWduID0gJyc7XG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICBzaWduID0gJy0nO1xuICAgICAgICB2YWx1ZSAqPSBudW0oLTEpO1xuICAgIH1cbiAgICBjb25zdCBfNjAgPSBudW0oNjApO1xuICAgIGNvbnN0IHBhcnRzID0gW3ZhbHVlICUgXzYwXTsgLy8gc2Vjb25kcywgaW5jbHVkaW5nIG1zXG4gICAgaWYgKHZhbHVlIDwgNjApIHtcbiAgICAgICAgcGFydHMudW5zaGlmdCgwKTsgLy8gYXQgbGVhc3Qgb25lIDogaXMgcmVxdWlyZWRcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhbHVlID0gKHZhbHVlIC0gcGFydHNbMF0pIC8gXzYwO1xuICAgICAgICBwYXJ0cy51bnNoaWZ0KHZhbHVlICUgXzYwKTsgLy8gbWludXRlc1xuICAgICAgICBpZiAodmFsdWUgPj0gNjApIHtcbiAgICAgICAgICAgIHZhbHVlID0gKHZhbHVlIC0gcGFydHNbMF0pIC8gXzYwO1xuICAgICAgICAgICAgcGFydHMudW5zaGlmdCh2YWx1ZSk7IC8vIGhvdXJzXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChzaWduICtcbiAgICAgICAgcGFydHNcbiAgICAgICAgICAgIC5tYXAobiA9PiBTdHJpbmcobikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAgICAgICAgIC5qb2luKCc6JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8wMDAwMDBcXGQqJC8sICcnKSAvLyAlIDYwIG1heSBpbnRyb2R1Y2UgZXJyb3JcbiAgICApO1xufVxuY29uc3QgaW50VGltZSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnVElNRScsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKig/OjpbMC01XT9bMC05XSkrJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIHsgaW50QXNCaWdJbnQgfSkgPT4gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGludEFzQmlnSW50KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeVNleGFnZXNpbWFsXG59O1xuY29uc3QgZmxvYXRUaW1lID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ1RJTUUnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pK1xcLlswLTlfXSokLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGZhbHNlKSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeVNleGFnZXNpbWFsXG59O1xuY29uc3QgdGltZXN0YW1wID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnLFxuICAgIC8vIElmIHRoZSB0aW1lIHpvbmUgaXMgb21pdHRlZCwgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIHNwZWNpZmllZCBpbiBVVEMuIFRoZSB0aW1lIHBhcnRcbiAgICAvLyBtYXkgYmUgb21pdHRlZCBhbHRvZ2V0aGVyLCByZXN1bHRpbmcgaW4gYSBkYXRlIGZvcm1hdC4gSW4gc3VjaCBhIGNhc2UsIHRoZSB0aW1lIHBhcnQgaXNcbiAgICAvLyBhc3N1bWVkIHRvIGJlIDAwOjAwOjAwWiAoc3RhcnQgb2YgZGF5LCBVVEMpLlxuICAgIHRlc3Q6IFJlZ0V4cCgnXihbMC05XXs0fSktKFswLTldezEsMn0pLShbMC05XXsxLDJ9KScgKyAvLyBZWVlZLU1tLURkXG4gICAgICAgICcoPzonICsgLy8gdGltZSBpcyBvcHRpb25hbFxuICAgICAgICAnKD86dHxUfFsgXFxcXHRdKyknICsgLy8gdCB8IFQgfCB3aGl0ZXNwYWNlXG4gICAgICAgICcoWzAtOV17MSwyfSk6KFswLTldezEsMn0pOihbMC05XXsxLDJ9KFxcXFwuWzAtOV0rKT8pJyArIC8vIEhoOk1tOlNzKC5zcyk/XG4gICAgICAgICcoPzpbIFxcXFx0XSooWnxbLStdWzAxMl0/WzAtOV0oPzo6WzAtOV17Mn0pPykpPycgKyAvLyBaIHwgKzUgfCAtMDM6MzBcbiAgICAgICAgJyk/JCcpLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKHRpbWVzdGFtcC50ZXN0KTtcbiAgICAgICAgaWYgKCFtYXRjaClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignISF0aW1lc3RhbXAgZXhwZWN0cyBhIGRhdGUsIHN0YXJ0aW5nIHdpdGggeXl5eS1tbS1kZCcpO1xuICAgICAgICBjb25zdCBbLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZF0gPSBtYXRjaC5tYXAoTnVtYmVyKTtcbiAgICAgICAgY29uc3QgbWlsbGlzZWMgPSBtYXRjaFs3XSA/IE51bWJlcigobWF0Y2hbN10gKyAnMDAnKS5zdWJzdHIoMSwgMykpIDogMDtcbiAgICAgICAgbGV0IGRhdGUgPSBEYXRlLlVUQyh5ZWFyLCBtb250aCAtIDEsIGRheSwgaG91ciB8fCAwLCBtaW51dGUgfHwgMCwgc2Vjb25kIHx8IDAsIG1pbGxpc2VjKTtcbiAgICAgICAgY29uc3QgdHogPSBtYXRjaFs4XTtcbiAgICAgICAgaWYgKHR6ICYmIHR6ICE9PSAnWicpIHtcbiAgICAgICAgICAgIGxldCBkID0gcGFyc2VTZXhhZ2VzaW1hbCh0eiwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGQpIDwgMzApXG4gICAgICAgICAgICAgICAgZCAqPSA2MDtcbiAgICAgICAgICAgIGRhdGUgLT0gNjAwMDAgKiBkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlKTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gdmFsdWUudG9JU09TdHJpbmcoKS5yZXBsYWNlKC8oKFQwMDowMCk/OjAwKT9cXC4wMDBaJC8sICcnKVxufTtcblxuZXhwb3J0IHsgZmxvYXRUaW1lLCBpbnRUaW1lLCB0aW1lc3RhbXAgfTtcbiIsImNvbnN0IEZPTERfRkxPVyA9ICdmbG93JztcbmNvbnN0IEZPTERfQkxPQ0sgPSAnYmxvY2snO1xuY29uc3QgRk9MRF9RVU9URUQgPSAncXVvdGVkJztcbi8qKlxuICogVHJpZXMgdG8ga2VlcCBpbnB1dCBhdCB1cCB0byBgbGluZVdpZHRoYCBjaGFyYWN0ZXJzLCBzcGxpdHRpbmcgb25seSBvbiBzcGFjZXNcbiAqIG5vdCBmb2xsb3dlZCBieSBuZXdsaW5lcyBvciBzcGFjZXMgdW5sZXNzIGBtb2RlYCBpcyBgJ3F1b3RlZCdgLiBMaW5lcyBhcmVcbiAqIHRlcm1pbmF0ZWQgd2l0aCBgXFxuYCBhbmQgc3RhcnRlZCB3aXRoIGBpbmRlbnRgLlxuICovXG5mdW5jdGlvbiBmb2xkRmxvd0xpbmVzKHRleHQsIGluZGVudCwgbW9kZSA9ICdmbG93JywgeyBpbmRlbnRBdFN0YXJ0LCBsaW5lV2lkdGggPSA4MCwgbWluQ29udGVudFdpZHRoID0gMjAsIG9uRm9sZCwgb25PdmVyZmxvdyB9ID0ge30pIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBpZiAobGluZVdpZHRoIDwgbWluQ29udGVudFdpZHRoKVxuICAgICAgICBtaW5Db250ZW50V2lkdGggPSAwO1xuICAgIGNvbnN0IGVuZFN0ZXAgPSBNYXRoLm1heCgxICsgbWluQ29udGVudFdpZHRoLCAxICsgbGluZVdpZHRoIC0gaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IGVuZFN0ZXApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IGZvbGRzID0gW107XG4gICAgY29uc3QgZXNjYXBlZEZvbGRzID0ge307XG4gICAgbGV0IGVuZCA9IGxpbmVXaWR0aCAtIGluZGVudC5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBpbmRlbnRBdFN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoaW5kZW50QXRTdGFydCA+IGxpbmVXaWR0aCAtIE1hdGgubWF4KDIsIG1pbkNvbnRlbnRXaWR0aCkpXG4gICAgICAgICAgICBmb2xkcy5wdXNoKDApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlbmQgPSBsaW5lV2lkdGggLSBpbmRlbnRBdFN0YXJ0O1xuICAgIH1cbiAgICBsZXQgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHByZXYgPSB1bmRlZmluZWQ7XG4gICAgbGV0IG92ZXJmbG93ID0gZmFsc2U7XG4gICAgbGV0IGkgPSAtMTtcbiAgICBsZXQgZXNjU3RhcnQgPSAtMTtcbiAgICBsZXQgZXNjRW5kID0gLTE7XG4gICAgaWYgKG1vZGUgPT09IEZPTERfQkxPQ0spIHtcbiAgICAgICAgaSA9IGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGkgIT09IC0xKVxuICAgICAgICAgICAgZW5kID0gaSArIGVuZFN0ZXA7XG4gICAgfVxuICAgIGZvciAobGV0IGNoOyAoY2ggPSB0ZXh0WyhpICs9IDEpXSk7KSB7XG4gICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBlc2NTdGFydCA9IGk7XG4gICAgICAgICAgICBzd2l0Y2ggKHRleHRbaSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnVSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gOTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXNjRW5kID0gaTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9CTE9DSylcbiAgICAgICAgICAgICAgICBpID0gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudC5sZW5ndGgpO1xuICAgICAgICAgICAgZW5kID0gaSArIGluZGVudC5sZW5ndGggKyBlbmRTdGVwO1xuICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICcgJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnICcgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnXFxuJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgIT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgLy8gc3BhY2Ugc3Vycm91bmRlZCBieSBub24tc3BhY2UgY2FuIGJlIHJlcGxhY2VkIHdpdGggbmV3bGluZSArIGluZGVudFxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0ZXh0W2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0ICE9PSAnICcgJiYgbmV4dCAhPT0gJ1xcbicgJiYgbmV4dCAhPT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIHNwbGl0ID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpID49IGVuZCkge1xuICAgICAgICAgICAgICAgIGlmIChzcGxpdCkge1xuICAgICAgICAgICAgICAgICAgICBmb2xkcy5wdXNoKHNwbGl0KTtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3BsaXQgKyBlbmRTdGVwO1xuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hpdGUtc3BhY2UgY29sbGVjdGVkIGF0IGVuZCBtYXkgc3RyZXRjaCBwYXN0IGxpbmVXaWR0aFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocHJldiA9PT0gJyAnIHx8IHByZXYgPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaCA9IHRleHRbKGkgKz0gMSldO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEFjY291bnQgZm9yIG5ld2xpbmUgZXNjYXBlLCBidXQgZG9uJ3QgYnJlYWsgcHJlY2VkaW5nIGVzY2FwZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBqID0gaSA+IGVzY0VuZCArIDEgPyBpIC0gMiA6IGVzY1N0YXJ0IC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQmFpbCBvdXQgaWYgbGluZVdpZHRoICYgbWluQ29udGVudFdpZHRoIGFyZSBzaG9ydGVyIHRoYW4gYW4gZXNjYXBlIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXNjYXBlZEZvbGRzW2pdKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgIGVzY2FwZWRGb2xkc1tqXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGogKyBlbmRTdGVwO1xuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJldiA9IGNoO1xuICAgIH1cbiAgICBpZiAob3ZlcmZsb3cgJiYgb25PdmVyZmxvdylcbiAgICAgICAgb25PdmVyZmxvdygpO1xuICAgIGlmIChmb2xkcy5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGlmIChvbkZvbGQpXG4gICAgICAgIG9uRm9sZCgpO1xuICAgIGxldCByZXMgPSB0ZXh0LnNsaWNlKDAsIGZvbGRzWzBdKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbGRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGZvbGQgPSBmb2xkc1tpXTtcbiAgICAgICAgY29uc3QgZW5kID0gZm9sZHNbaSArIDFdIHx8IHRleHQubGVuZ3RoO1xuICAgICAgICBpZiAoZm9sZCA9PT0gMClcbiAgICAgICAgICAgIHJlcyA9IGBcXG4ke2luZGVudH0ke3RleHQuc2xpY2UoMCwgZW5kKX1gO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBlc2NhcGVkRm9sZHNbZm9sZF0pXG4gICAgICAgICAgICAgICAgcmVzICs9IGAke3RleHRbZm9sZF19XFxcXGA7XG4gICAgICAgICAgICByZXMgKz0gYFxcbiR7aW5kZW50fSR7dGV4dC5zbGljZShmb2xkICsgMSwgZW5kKX1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG4vKipcbiAqIFByZXN1bWVzIGBpICsgMWAgaXMgYXQgdGhlIHN0YXJ0IG9mIGEgbGluZVxuICogQHJldHVybnMgaW5kZXggb2YgbGFzdCBuZXdsaW5lIGluIG1vcmUtaW5kZW50ZWQgYmxvY2tcbiAqL1xuZnVuY3Rpb24gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudCkge1xuICAgIGxldCBlbmQgPSBpO1xuICAgIGxldCBzdGFydCA9IGkgKyAxO1xuICAgIGxldCBjaCA9IHRleHRbc3RhcnRdO1xuICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICBpZiAoaSA8IHN0YXJ0ICsgaW5kZW50KSB7XG4gICAgICAgICAgICBjaCA9IHRleHRbKytpXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjaCA9IHRleHRbKytpXTtcbiAgICAgICAgICAgIH0gd2hpbGUgKGNoICYmIGNoICE9PSAnXFxuJyk7XG4gICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGNoID0gdGV4dFtzdGFydF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVuZDtcbn1cblxuZXhwb3J0IHsgRk9MRF9CTE9DSywgRk9MRF9GTE9XLCBGT0xEX1FVT1RFRCwgZm9sZEZsb3dMaW5lcyB9O1xuIiwiaW1wb3J0IHsgYW5jaG9ySXNWYWxpZCB9IGZyb20gJy4uL2RvYy9hbmNob3JzLmpzJztcbmltcG9ydCB7IGlzUGFpciwgaXNBbGlhcywgaXNOb2RlLCBpc1NjYWxhciwgaXNDb2xsZWN0aW9uIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5Q29tbWVudCB9IGZyb20gJy4vc3RyaW5naWZ5Q29tbWVudC5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfSBmcm9tICcuL3N0cmluZ2lmeVN0cmluZy5qcyc7XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoZG9jLCBvcHRpb25zKSB7XG4gICAgY29uc3Qgb3B0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGJsb2NrUXVvdGU6IHRydWUsXG4gICAgICAgIGNvbW1lbnRTdHJpbmc6IHN0cmluZ2lmeUNvbW1lbnQsXG4gICAgICAgIGRlZmF1bHRLZXlUeXBlOiBudWxsLFxuICAgICAgICBkZWZhdWx0U3RyaW5nVHlwZTogJ1BMQUlOJyxcbiAgICAgICAgZGlyZWN0aXZlczogbnVsbCxcbiAgICAgICAgZG91YmxlUXVvdGVkQXNKU09OOiBmYWxzZSxcbiAgICAgICAgZG91YmxlUXVvdGVkTWluTXVsdGlMaW5lTGVuZ3RoOiA0MCxcbiAgICAgICAgZmFsc2VTdHI6ICdmYWxzZScsXG4gICAgICAgIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogdHJ1ZSxcbiAgICAgICAgaW5kZW50U2VxOiB0cnVlLFxuICAgICAgICBsaW5lV2lkdGg6IDgwLFxuICAgICAgICBtaW5Db250ZW50V2lkdGg6IDIwLFxuICAgICAgICBudWxsU3RyOiAnbnVsbCcsXG4gICAgICAgIHNpbXBsZUtleXM6IGZhbHNlLFxuICAgICAgICBzaW5nbGVRdW90ZTogbnVsbCxcbiAgICAgICAgdHJ1ZVN0cjogJ3RydWUnLFxuICAgICAgICB2ZXJpZnlBbGlhc09yZGVyOiB0cnVlXG4gICAgfSwgZG9jLnNjaGVtYS50b1N0cmluZ09wdGlvbnMsIG9wdGlvbnMpO1xuICAgIGxldCBpbkZsb3c7XG4gICAgc3dpdGNoIChvcHQuY29sbGVjdGlvblN0eWxlKSB7XG4gICAgICAgIGNhc2UgJ2Jsb2NrJzpcbiAgICAgICAgICAgIGluRmxvdyA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Zsb3cnOlxuICAgICAgICAgICAgaW5GbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5GbG93ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5jaG9yczogbmV3IFNldCgpLFxuICAgICAgICBkb2MsXG4gICAgICAgIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogb3B0LmZsb3dDb2xsZWN0aW9uUGFkZGluZyA/ICcgJyA6ICcnLFxuICAgICAgICBpbmRlbnQ6ICcnLFxuICAgICAgICBpbmRlbnRTdGVwOiB0eXBlb2Ygb3B0LmluZGVudCA9PT0gJ251bWJlcicgPyAnICcucmVwZWF0KG9wdC5pbmRlbnQpIDogJyAgJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiBvcHRcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0VGFnT2JqZWN0KHRhZ3MsIGl0ZW0pIHtcbiAgICBpZiAoaXRlbS50YWcpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQudGFnID09PSBpdGVtLnRhZyk7XG4gICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoLmZpbmQodCA9PiB0LmZvcm1hdCA9PT0gaXRlbS5mb3JtYXQpID8/IG1hdGNoWzBdO1xuICAgIH1cbiAgICBsZXQgdGFnT2JqID0gdW5kZWZpbmVkO1xuICAgIGxldCBvYmo7XG4gICAgaWYgKGlzU2NhbGFyKGl0ZW0pKSB7XG4gICAgICAgIG9iaiA9IGl0ZW0udmFsdWU7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LmlkZW50aWZ5Py4ob2JqKSk7XG4gICAgICAgIHRhZ09iaiA9XG4gICAgICAgICAgICBtYXRjaC5maW5kKHQgPT4gdC5mb3JtYXQgPT09IGl0ZW0uZm9ybWF0KSA/PyBtYXRjaC5maW5kKHQgPT4gIXQuZm9ybWF0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9iaiA9IGl0ZW07XG4gICAgICAgIHRhZ09iaiA9IHRhZ3MuZmluZCh0ID0+IHQubm9kZUNsYXNzICYmIG9iaiBpbnN0YW5jZW9mIHQubm9kZUNsYXNzKTtcbiAgICB9XG4gICAgaWYgKCF0YWdPYmopIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IG9iaj8uY29uc3RydWN0b3I/Lm5hbWUgPz8gdHlwZW9mIG9iajtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUYWcgbm90IHJlc29sdmVkIGZvciAke25hbWV9IHZhbHVlYCk7XG4gICAgfVxuICAgIHJldHVybiB0YWdPYmo7XG59XG4vLyBuZWVkcyB0byBiZSBjYWxsZWQgYmVmb3JlIHZhbHVlIHN0cmluZ2lmaWVyIHRvIGFsbG93IGZvciBjaXJjdWxhciBhbmNob3IgcmVmc1xuZnVuY3Rpb24gc3RyaW5naWZ5UHJvcHMobm9kZSwgdGFnT2JqLCB7IGFuY2hvcnMsIGRvYyB9KSB7XG4gICAgaWYgKCFkb2MuZGlyZWN0aXZlcylcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIGNvbnN0IHByb3BzID0gW107XG4gICAgY29uc3QgYW5jaG9yID0gKGlzU2NhbGFyKG5vZGUpIHx8IGlzQ29sbGVjdGlvbihub2RlKSkgJiYgbm9kZS5hbmNob3I7XG4gICAgaWYgKGFuY2hvciAmJiBhbmNob3JJc1ZhbGlkKGFuY2hvcikpIHtcbiAgICAgICAgYW5jaG9ycy5hZGQoYW5jaG9yKTtcbiAgICAgICAgcHJvcHMucHVzaChgJiR7YW5jaG9yfWApO1xuICAgIH1cbiAgICBjb25zdCB0YWcgPSBub2RlLnRhZyA/IG5vZGUudGFnIDogdGFnT2JqLmRlZmF1bHQgPyBudWxsIDogdGFnT2JqLnRhZztcbiAgICBpZiAodGFnKVxuICAgICAgICBwcm9wcy5wdXNoKGRvYy5kaXJlY3RpdmVzLnRhZ1N0cmluZyh0YWcpKTtcbiAgICByZXR1cm4gcHJvcHMuam9pbignICcpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5KGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGlmIChpc1BhaXIoaXRlbSkpXG4gICAgICAgIHJldHVybiBpdGVtLnRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgaWYgKGlzQWxpYXMoaXRlbSkpIHtcbiAgICAgICAgaWYgKGN0eC5kb2MuZGlyZWN0aXZlcylcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRvU3RyaW5nKGN0eCk7XG4gICAgICAgIGlmIChjdHgucmVzb2x2ZWRBbGlhc2VzPy5oYXMoaXRlbSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBzdHJpbmdpZnkgY2lyY3VsYXIgc3RydWN0dXJlIHdpdGhvdXQgYWxpYXMgbm9kZXNgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjdHgucmVzb2x2ZWRBbGlhc2VzKVxuICAgICAgICAgICAgICAgIGN0eC5yZXNvbHZlZEFsaWFzZXMuYWRkKGl0ZW0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGN0eC5yZXNvbHZlZEFsaWFzZXMgPSBuZXcgU2V0KFtpdGVtXSk7XG4gICAgICAgICAgICBpdGVtID0gaXRlbS5yZXNvbHZlKGN0eC5kb2MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxldCB0YWdPYmogPSB1bmRlZmluZWQ7XG4gICAgY29uc3Qgbm9kZSA9IGlzTm9kZShpdGVtKVxuICAgICAgICA/IGl0ZW1cbiAgICAgICAgOiBjdHguZG9jLmNyZWF0ZU5vZGUoaXRlbSwgeyBvblRhZ09iajogbyA9PiAodGFnT2JqID0gbykgfSk7XG4gICAgaWYgKCF0YWdPYmopXG4gICAgICAgIHRhZ09iaiA9IGdldFRhZ09iamVjdChjdHguZG9jLnNjaGVtYS50YWdzLCBub2RlKTtcbiAgICBjb25zdCBwcm9wcyA9IHN0cmluZ2lmeVByb3BzKG5vZGUsIHRhZ09iaiwgY3R4KTtcbiAgICBpZiAocHJvcHMubGVuZ3RoID4gMClcbiAgICAgICAgY3R4LmluZGVudEF0U3RhcnQgPSAoY3R4LmluZGVudEF0U3RhcnQgPz8gMCkgKyBwcm9wcy5sZW5ndGggKyAxO1xuICAgIGNvbnN0IHN0ciA9IHR5cGVvZiB0YWdPYmouc3RyaW5naWZ5ID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gdGFnT2JqLnN0cmluZ2lmeShub2RlLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgIDogaXNTY2FsYXIobm9kZSlcbiAgICAgICAgICAgID8gc3RyaW5naWZ5U3RyaW5nKG5vZGUsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgICAgIDogbm9kZS50b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIGlmICghcHJvcHMpXG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgcmV0dXJuIGlzU2NhbGFyKG5vZGUpIHx8IHN0clswXSA9PT0gJ3snIHx8IHN0clswXSA9PT0gJ1snXG4gICAgICAgID8gYCR7cHJvcHN9ICR7c3RyfWBcbiAgICAgICAgOiBgJHtwcm9wc31cXG4ke2N0eC5pbmRlbnR9JHtzdHJ9YDtcbn1cblxuZXhwb3J0IHsgY3JlYXRlU3RyaW5naWZ5Q29udGV4dCwgc3RyaW5naWZ5IH07XG4iLCJpbXBvcnQgeyBpc05vZGUsIGlzUGFpciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGxpbmVDb21tZW50LCBpbmRlbnRDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcblxuZnVuY3Rpb24gc3RyaW5naWZ5Q29sbGVjdGlvbihjb2xsZWN0aW9uLCBjdHgsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBmbG93ID0gY3R4LmluRmxvdyA/PyBjb2xsZWN0aW9uLmZsb3c7XG4gICAgY29uc3Qgc3RyaW5naWZ5ID0gZmxvdyA/IHN0cmluZ2lmeUZsb3dDb2xsZWN0aW9uIDogc3RyaW5naWZ5QmxvY2tDb2xsZWN0aW9uO1xuICAgIHJldHVybiBzdHJpbmdpZnkoY29sbGVjdGlvbiwgY3R4LCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUJsb2NrQ29sbGVjdGlvbih7IGNvbW1lbnQsIGl0ZW1zIH0sIGN0eCwgeyBibG9ja0l0ZW1QcmVmaXgsIGZsb3dDaGFycywgaXRlbUluZGVudCwgb25DaG9tcEtlZXAsIG9uQ29tbWVudCB9KSB7XG4gICAgY29uc3QgeyBpbmRlbnQsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0gPSBjdHg7XG4gICAgY29uc3QgaXRlbUN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBpbmRlbnQ6IGl0ZW1JbmRlbnQsIHR5cGU6IG51bGwgfSk7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlOyAvLyBmbGFnIGZvciB0aGUgcHJlY2VkaW5nIG5vZGUncyBzdGF0dXNcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICBsZXQgY29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmIChpc05vZGUoaXRlbSkpIHtcbiAgICAgICAgICAgIGlmICghY2hvbXBLZWVwICYmIGl0ZW0uc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGl0ZW0uY29tbWVudEJlZm9yZSwgY2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGl0ZW0uY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1BhaXIoaXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlrID0gaXNOb2RlKGl0ZW0ua2V5KSA/IGl0ZW0ua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpaykge1xuICAgICAgICAgICAgICAgIGlmICghY2hvbXBLZWVwICYmIGlrLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGlrLmNvbW1lbnRCZWZvcmUsIGNob21wS2VlcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgICAgIGxldCBzdHIgPSBzdHJpbmdpZnkoaXRlbSwgaXRlbUN0eCwgKCkgPT4gKGNvbW1lbnQgPSBudWxsKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBpdGVtSW5kZW50LCBjb21tZW50U3RyaW5nKGNvbW1lbnQpKTtcbiAgICAgICAgaWYgKGNob21wS2VlcCAmJiBjb21tZW50KVxuICAgICAgICAgICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgICAgIGxpbmVzLnB1c2goYmxvY2tJdGVtUHJlZml4ICsgc3RyKTtcbiAgICB9XG4gICAgbGV0IHN0cjtcbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHN0ciA9IGZsb3dDaGFycy5zdGFydCArIGZsb3dDaGFycy5lbmQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHIgPSBsaW5lc1swXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICAgICAgc3RyICs9IGxpbmUgPyBgXFxuJHtpbmRlbnR9JHtsaW5lfWAgOiAnXFxuJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBzdHIgKz0gJ1xcbicgKyBpbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoY29tbWVudCksIGluZGVudCk7XG4gICAgICAgIGlmIChvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKVxuICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgIHJldHVybiBzdHI7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlGbG93Q29sbGVjdGlvbih7IGl0ZW1zIH0sIGN0eCwgeyBmbG93Q2hhcnMsIGl0ZW1JbmRlbnQgfSkge1xuICAgIGNvbnN0IHsgaW5kZW50LCBpbmRlbnRTdGVwLCBmbG93Q29sbGVjdGlvblBhZGRpbmc6IGZjUGFkZGluZywgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSA9IGN0eDtcbiAgICBpdGVtSW5kZW50ICs9IGluZGVudFN0ZXA7XG4gICAgY29uc3QgaXRlbUN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwge1xuICAgICAgICBpbmRlbnQ6IGl0ZW1JbmRlbnQsXG4gICAgICAgIGluRmxvdzogdHJ1ZSxcbiAgICAgICAgdHlwZTogbnVsbFxuICAgIH0pO1xuICAgIGxldCByZXFOZXdsaW5lID0gZmFsc2U7XG4gICAgbGV0IGxpbmVzQXRWYWx1ZSA9IDA7XG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgbGV0IGNvbW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAoaXNOb2RlKGl0ZW0pKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaXRlbS5jb21tZW50QmVmb3JlLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpdGVtLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQYWlyKGl0ZW0pKSB7XG4gICAgICAgICAgICBjb25zdCBpayA9IGlzTm9kZShpdGVtLmtleSkgPyBpdGVtLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoaWspIHtcbiAgICAgICAgICAgICAgICBpZiAoaWsuc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaWsuY29tbWVudEJlZm9yZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChpay5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGl2ID0gaXNOb2RlKGl0ZW0udmFsdWUpID8gaXRlbS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoaXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXYuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCA9IGl2LmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGl2LmNvbW1lbnRCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS52YWx1ZSA9PSBudWxsICYmIGlrPy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGlrLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgbGV0IHN0ciA9IHN0cmluZ2lmeShpdGVtLCBpdGVtQ3R4LCAoKSA9PiAoY29tbWVudCA9IG51bGwpKTtcbiAgICAgICAgaWYgKGkgPCBpdGVtcy5sZW5ndGggLSAxKVxuICAgICAgICAgICAgc3RyICs9ICcsJztcbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBpdGVtSW5kZW50LCBjb21tZW50U3RyaW5nKGNvbW1lbnQpKTtcbiAgICAgICAgaWYgKCFyZXFOZXdsaW5lICYmIChsaW5lcy5sZW5ndGggPiBsaW5lc0F0VmFsdWUgfHwgc3RyLmluY2x1ZGVzKCdcXG4nKSkpXG4gICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgbGluZXMucHVzaChzdHIpO1xuICAgICAgICBsaW5lc0F0VmFsdWUgPSBsaW5lcy5sZW5ndGg7XG4gICAgfVxuICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gZmxvd0NoYXJzO1xuICAgIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0ICsgZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFyZXFOZXdsaW5lKSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBsaW5lcy5yZWR1Y2UoKHN1bSwgbGluZSkgPT4gc3VtICsgbGluZS5sZW5ndGggKyAyLCAyKTtcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSBjdHgub3B0aW9ucy5saW5lV2lkdGggPiAwICYmIGxlbiA+IGN0eC5vcHRpb25zLmxpbmVXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVxTmV3bGluZSkge1xuICAgICAgICAgICAgbGV0IHN0ciA9IHN0YXJ0O1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKVxuICAgICAgICAgICAgICAgIHN0ciArPSBsaW5lID8gYFxcbiR7aW5kZW50U3RlcH0ke2luZGVudH0ke2xpbmV9YCA6ICdcXG4nO1xuICAgICAgICAgICAgcmV0dXJuIGAke3N0cn1cXG4ke2luZGVudH0ke2VuZH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGAke3N0YXJ0fSR7ZmNQYWRkaW5nfSR7bGluZXMuam9pbignICcpfSR7ZmNQYWRkaW5nfSR7ZW5kfWA7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhZGRDb21tZW50QmVmb3JlKHsgaW5kZW50LCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcgfSB9LCBsaW5lcywgY29tbWVudCwgY2hvbXBLZWVwKSB7XG4gICAgaWYgKGNvbW1lbnQgJiYgY2hvbXBLZWVwKVxuICAgICAgICBjb21tZW50ID0gY29tbWVudC5yZXBsYWNlKC9eXFxuKy8sICcnKTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBjb25zdCBpYyA9IGluZGVudENvbW1lbnQoY29tbWVudFN0cmluZyhjb21tZW50KSwgaW5kZW50KTtcbiAgICAgICAgbGluZXMucHVzaChpYy50cmltU3RhcnQoKSk7IC8vIEF2b2lkIGRvdWJsZSBpbmRlbnQgb24gZmlyc3QgbGluZVxuICAgIH1cbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5Q29sbGVjdGlvbiB9O1xuIiwiLyoqXG4gKiBTdHJpbmdpZmllcyBhIGNvbW1lbnQuXG4gKlxuICogRW1wdHkgY29tbWVudCBsaW5lcyBhcmUgbGVmdCBlbXB0eSxcbiAqIGxpbmVzIGNvbnNpc3Rpbmcgb2YgYSBzaW5nbGUgc3BhY2UgYXJlIHJlcGxhY2VkIGJ5IGAjYCxcbiAqIGFuZCBhbGwgb3RoZXIgbGluZXMgYXJlIHByZWZpeGVkIHdpdGggYSBgI2AuXG4gKi9cbmNvbnN0IHN0cmluZ2lmeUNvbW1lbnQgPSAoc3RyKSA9PiBzdHIucmVwbGFjZSgvXig/ISQpKD86ICQpPy9nbSwgJyMnKTtcbmZ1bmN0aW9uIGluZGVudENvbW1lbnQoY29tbWVudCwgaW5kZW50KSB7XG4gICAgaWYgKC9eXFxuKyQvLnRlc3QoY29tbWVudCkpXG4gICAgICAgIHJldHVybiBjb21tZW50LnN1YnN0cmluZygxKTtcbiAgICByZXR1cm4gaW5kZW50ID8gY29tbWVudC5yZXBsYWNlKC9eKD8hICokKS9nbSwgaW5kZW50KSA6IGNvbW1lbnQ7XG59XG5jb25zdCBsaW5lQ29tbWVudCA9IChzdHIsIGluZGVudCwgY29tbWVudCkgPT4gc3RyLmVuZHNXaXRoKCdcXG4nKVxuICAgID8gaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpXG4gICAgOiBjb21tZW50LmluY2x1ZGVzKCdcXG4nKVxuICAgICAgICA/ICdcXG4nICsgaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpXG4gICAgICAgIDogKHN0ci5lbmRzV2l0aCgnICcpID8gJycgOiAnICcpICsgY29tbWVudDtcblxuZXhwb3J0IHsgaW5kZW50Q29tbWVudCwgbGluZUNvbW1lbnQsIHN0cmluZ2lmeUNvbW1lbnQgfTtcbiIsImltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQsIHN0cmluZ2lmeSB9IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGluZGVudENvbW1lbnQsIGxpbmVDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcblxuZnVuY3Rpb24gc3RyaW5naWZ5RG9jdW1lbnQoZG9jLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBsZXQgaGFzRGlyZWN0aXZlcyA9IG9wdGlvbnMuZGlyZWN0aXZlcyA9PT0gdHJ1ZTtcbiAgICBpZiAob3B0aW9ucy5kaXJlY3RpdmVzICE9PSBmYWxzZSAmJiBkb2MuZGlyZWN0aXZlcykge1xuICAgICAgICBjb25zdCBkaXIgPSBkb2MuZGlyZWN0aXZlcy50b1N0cmluZyhkb2MpO1xuICAgICAgICBpZiAoZGlyKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGRpcik7XG4gICAgICAgICAgICBoYXNEaXJlY3RpdmVzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkb2MuZGlyZWN0aXZlcy5kb2NTdGFydClcbiAgICAgICAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoaGFzRGlyZWN0aXZlcylcbiAgICAgICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgY29uc3QgY3R4ID0gY3JlYXRlU3RyaW5naWZ5Q29udGV4dChkb2MsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHsgY29tbWVudFN0cmluZyB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgaWYgKGRvYy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBsaW5lcy51bnNoaWZ0KCcnKTtcbiAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgbGluZXMudW5zaGlmdChpbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgIH1cbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgbGV0IGNvbnRlbnRDb21tZW50ID0gbnVsbDtcbiAgICBpZiAoZG9jLmNvbnRlbnRzKSB7XG4gICAgICAgIGlmIChpc05vZGUoZG9jLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgaWYgKGRvYy5jb250ZW50cy5zcGFjZUJlZm9yZSAmJiBoYXNEaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgaWYgKGRvYy5jb250ZW50cy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb250ZW50cy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKGluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0b3AtbGV2ZWwgYmxvY2sgc2NhbGFycyBuZWVkIHRvIGJlIGluZGVudGVkIGlmIGZvbGxvd2VkIGJ5IGEgY29tbWVudFxuICAgICAgICAgICAgY3R4LmZvcmNlQmxvY2tJbmRlbnQgPSAhIWRvYy5jb21tZW50O1xuICAgICAgICAgICAgY29udGVudENvbW1lbnQgPSBkb2MuY29udGVudHMuY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvbkNob21wS2VlcCA9IGNvbnRlbnRDb21tZW50ID8gdW5kZWZpbmVkIDogKCkgPT4gKGNob21wS2VlcCA9IHRydWUpO1xuICAgICAgICBsZXQgYm9keSA9IHN0cmluZ2lmeShkb2MuY29udGVudHMsIGN0eCwgKCkgPT4gKGNvbnRlbnRDb21tZW50ID0gbnVsbCksIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgaWYgKGNvbnRlbnRDb21tZW50KVxuICAgICAgICAgICAgYm9keSArPSBsaW5lQ29tbWVudChib2R5LCAnJywgY29tbWVudFN0cmluZyhjb250ZW50Q29tbWVudCkpO1xuICAgICAgICBpZiAoKGJvZHlbMF0gPT09ICd8JyB8fCBib2R5WzBdID09PSAnPicpICYmXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJy0tLScpIHtcbiAgICAgICAgICAgIC8vIFRvcC1sZXZlbCBibG9jayBzY2FsYXJzIHdpdGggYSBwcmVjZWRpbmcgZG9jIG1hcmtlciBvdWdodCB0byB1c2UgdGhlXG4gICAgICAgICAgICAvLyBzYW1lIGxpbmUgZm9yIHRoZWlyIGhlYWRlci5cbiAgICAgICAgICAgIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID0gYC0tLSAke2JvZHl9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsaW5lcy5wdXNoKGJvZHkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGluZXMucHVzaChzdHJpbmdpZnkoZG9jLmNvbnRlbnRzLCBjdHgpKTtcbiAgICB9XG4gICAgaWYgKGRvYy5kaXJlY3RpdmVzPy5kb2NFbmQpIHtcbiAgICAgICAgaWYgKGRvYy5jb21tZW50KSB7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbW1lbnQpO1xuICAgICAgICAgICAgaWYgKGNzLmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJy4uLicpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50Q29tbWVudChjcywgJycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYC4uLiAke2NzfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGluZXMucHVzaCgnLi4uJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCBkYyA9IGRvYy5jb21tZW50O1xuICAgICAgICBpZiAoZGMgJiYgY2hvbXBLZWVwKVxuICAgICAgICAgICAgZGMgPSBkYy5yZXBsYWNlKC9eXFxuKy8sICcnKTtcbiAgICAgICAgaWYgKGRjKSB7XG4gICAgICAgICAgICBpZiAoKCFjaG9tcEtlZXAgfHwgY29udGVudENvbW1lbnQpICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdICE9PSAnJylcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGRjKSwgJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykgKyAnXFxuJztcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5RG9jdW1lbnQgfTtcbiIsImZ1bmN0aW9uIHN0cmluZ2lmeU51bWJlcih7IGZvcm1hdCwgbWluRnJhY3Rpb25EaWdpdHMsIHRhZywgdmFsdWUgfSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnKVxuICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICBjb25zdCBudW0gPSB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgOiBOdW1iZXIodmFsdWUpO1xuICAgIGlmICghaXNGaW5pdGUobnVtKSlcbiAgICAgICAgcmV0dXJuIGlzTmFOKG51bSkgPyAnLm5hbicgOiBudW0gPCAwID8gJy0uaW5mJyA6ICcuaW5mJztcbiAgICBsZXQgbiA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBpZiAoIWZvcm1hdCAmJlxuICAgICAgICBtaW5GcmFjdGlvbkRpZ2l0cyAmJlxuICAgICAgICAoIXRhZyB8fCB0YWcgPT09ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcpICYmXG4gICAgICAgIC9eXFxkLy50ZXN0KG4pKSB7XG4gICAgICAgIGxldCBpID0gbi5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChpIDwgMCkge1xuICAgICAgICAgICAgaSA9IG4ubGVuZ3RoO1xuICAgICAgICAgICAgbiArPSAnLic7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGQgPSBtaW5GcmFjdGlvbkRpZ2l0cyAtIChuLmxlbmd0aCAtIGkgLSAxKTtcbiAgICAgICAgd2hpbGUgKGQtLSA+IDApXG4gICAgICAgICAgICBuICs9ICcwJztcbiAgICB9XG4gICAgcmV0dXJuIG47XG59XG5cbmV4cG9ydCB7IHN0cmluZ2lmeU51bWJlciB9O1xuIiwiaW1wb3J0IHsgaXNDb2xsZWN0aW9uLCBpc05vZGUsIGlzU2NhbGFyLCBpc1NlcSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5pbXBvcnQgeyBsaW5lQ29tbWVudCwgaW5kZW50Q29tbWVudCB9IGZyb20gJy4vc3RyaW5naWZ5Q29tbWVudC5qcyc7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVBhaXIoeyBrZXksIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgYWxsTnVsbFZhbHVlcywgZG9jLCBpbmRlbnQsIGluZGVudFN0ZXAsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZywgaW5kZW50U2VxLCBzaW1wbGVLZXlzIH0gfSA9IGN0eDtcbiAgICBsZXQga2V5Q29tbWVudCA9IChpc05vZGUoa2V5KSAmJiBrZXkuY29tbWVudCkgfHwgbnVsbDtcbiAgICBpZiAoc2ltcGxlS2V5cykge1xuICAgICAgICBpZiAoa2V5Q29tbWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaXRoIHNpbXBsZSBrZXlzLCBrZXkgbm9kZXMgY2Fubm90IGhhdmUgY29tbWVudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKGtleSkgfHwgKCFpc05vZGUoa2V5KSAmJiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdXaXRoIHNpbXBsZSBrZXlzLCBjb2xsZWN0aW9uIGNhbm5vdCBiZSB1c2VkIGFzIGEga2V5IHZhbHVlJztcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBleHBsaWNpdEtleSA9ICFzaW1wbGVLZXlzICYmXG4gICAgICAgICgha2V5IHx8XG4gICAgICAgICAgICAoa2V5Q29tbWVudCAmJiB2YWx1ZSA9PSBudWxsICYmICFjdHguaW5GbG93KSB8fFxuICAgICAgICAgICAgaXNDb2xsZWN0aW9uKGtleSkgfHxcbiAgICAgICAgICAgIChpc1NjYWxhcihrZXkpXG4gICAgICAgICAgICAgICAgPyBrZXkudHlwZSA9PT0gU2NhbGFyLkJMT0NLX0ZPTERFRCB8fCBrZXkudHlwZSA9PT0gU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA6IHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSk7XG4gICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7XG4gICAgICAgIGFsbE51bGxWYWx1ZXM6IGZhbHNlLFxuICAgICAgICBpbXBsaWNpdEtleTogIWV4cGxpY2l0S2V5ICYmIChzaW1wbGVLZXlzIHx8ICFhbGxOdWxsVmFsdWVzKSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgKyBpbmRlbnRTdGVwXG4gICAgfSk7XG4gICAgbGV0IGtleUNvbW1lbnREb25lID0gZmFsc2U7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGxldCBzdHIgPSBzdHJpbmdpZnkoa2V5LCBjdHgsICgpID0+IChrZXlDb21tZW50RG9uZSA9IHRydWUpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgIGlmICghZXhwbGljaXRLZXkgJiYgIWN0eC5pbkZsb3cgJiYgc3RyLmxlbmd0aCA+IDEwMjQpIHtcbiAgICAgICAgaWYgKHNpbXBsZUtleXMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dpdGggc2ltcGxlIGtleXMsIHNpbmdsZSBsaW5lIHNjYWxhciBtdXN0IG5vdCBzcGFuIG1vcmUgdGhhbiAxMDI0IGNoYXJhY3RlcnMnKTtcbiAgICAgICAgZXhwbGljaXRLZXkgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY3R4LmluRmxvdykge1xuICAgICAgICBpZiAoYWxsTnVsbFZhbHVlcyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoa2V5Q29tbWVudERvbmUgJiYgb25Db21tZW50KVxuICAgICAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgICAgICAgICAgcmV0dXJuIHN0ciA9PT0gJycgPyAnPycgOiBleHBsaWNpdEtleSA/IGA/ICR7c3RyfWAgOiBzdHI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoKGFsbE51bGxWYWx1ZXMgJiYgIXNpbXBsZUtleXMpIHx8ICh2YWx1ZSA9PSBudWxsICYmIGV4cGxpY2l0S2V5KSkge1xuICAgICAgICBzdHIgPSBgPyAke3N0cn1gO1xuICAgICAgICBpZiAoa2V5Q29tbWVudCAmJiAha2V5Q29tbWVudERvbmUpIHtcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIGlmIChrZXlDb21tZW50RG9uZSlcbiAgICAgICAga2V5Q29tbWVudCA9IG51bGw7XG4gICAgaWYgKGV4cGxpY2l0S2V5KSB7XG4gICAgICAgIGlmIChrZXlDb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyhrZXlDb21tZW50KSk7XG4gICAgICAgIHN0ciA9IGA/ICR7c3RyfVxcbiR7aW5kZW50fTpgO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3RyID0gYCR7c3RyfTpgO1xuICAgICAgICBpZiAoa2V5Q29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgIH1cbiAgICBsZXQgdnNiLCB2Y2IsIHZhbHVlQ29tbWVudDtcbiAgICBpZiAoaXNOb2RlKHZhbHVlKSkge1xuICAgICAgICB2c2IgPSAhIXZhbHVlLnNwYWNlQmVmb3JlO1xuICAgICAgICB2Y2IgPSB2YWx1ZS5jb21tZW50QmVmb3JlO1xuICAgICAgICB2YWx1ZUNvbW1lbnQgPSB2YWx1ZS5jb21tZW50O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdnNiID0gZmFsc2U7XG4gICAgICAgIHZjYiA9IG51bGw7XG4gICAgICAgIHZhbHVlQ29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgdmFsdWUgPSBkb2MuY3JlYXRlTm9kZSh2YWx1ZSk7XG4gICAgfVxuICAgIGN0eC5pbXBsaWNpdEtleSA9IGZhbHNlO1xuICAgIGlmICghZXhwbGljaXRLZXkgJiYgIWtleUNvbW1lbnQgJiYgaXNTY2FsYXIodmFsdWUpKVxuICAgICAgICBjdHguaW5kZW50QXRTdGFydCA9IHN0ci5sZW5ndGggKyAxO1xuICAgIGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGlmICghaW5kZW50U2VxICYmXG4gICAgICAgIGluZGVudFN0ZXAubGVuZ3RoID49IDIgJiZcbiAgICAgICAgIWN0eC5pbkZsb3cgJiZcbiAgICAgICAgIWV4cGxpY2l0S2V5ICYmXG4gICAgICAgIGlzU2VxKHZhbHVlKSAmJlxuICAgICAgICAhdmFsdWUuZmxvdyAmJlxuICAgICAgICAhdmFsdWUudGFnICYmXG4gICAgICAgICF2YWx1ZS5hbmNob3IpIHtcbiAgICAgICAgLy8gSWYgaW5kZW50U2VxID09PSBmYWxzZSwgY29uc2lkZXIgJy0gJyBhcyBwYXJ0IG9mIGluZGVudGF0aW9uIHdoZXJlIHBvc3NpYmxlXG4gICAgICAgIGN0eC5pbmRlbnQgPSBjdHguaW5kZW50LnN1YnN0cmluZygyKTtcbiAgICB9XG4gICAgbGV0IHZhbHVlQ29tbWVudERvbmUgPSBmYWxzZTtcbiAgICBjb25zdCB2YWx1ZVN0ciA9IHN0cmluZ2lmeSh2YWx1ZSwgY3R4LCAoKSA9PiAodmFsdWVDb21tZW50RG9uZSA9IHRydWUpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgIGxldCB3cyA9ICcgJztcbiAgICBpZiAoa2V5Q29tbWVudCB8fCB2c2IgfHwgdmNiKSB7XG4gICAgICAgIHdzID0gdnNiID8gJ1xcbicgOiAnJztcbiAgICAgICAgaWYgKHZjYikge1xuICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKHZjYik7XG4gICAgICAgICAgICB3cyArPSBgXFxuJHtpbmRlbnRDb21tZW50KGNzLCBjdHguaW5kZW50KX1gO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZVN0ciA9PT0gJycgJiYgIWN0eC5pbkZsb3cpIHtcbiAgICAgICAgICAgIGlmICh3cyA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgd3MgPSAnXFxuXFxuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdzICs9IGBcXG4ke2N0eC5pbmRlbnR9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICghZXhwbGljaXRLZXkgJiYgaXNDb2xsZWN0aW9uKHZhbHVlKSkge1xuICAgICAgICBjb25zdCB2czAgPSB2YWx1ZVN0clswXTtcbiAgICAgICAgY29uc3QgbmwwID0gdmFsdWVTdHIuaW5kZXhPZignXFxuJyk7XG4gICAgICAgIGNvbnN0IGhhc05ld2xpbmUgPSBubDAgIT09IC0xO1xuICAgICAgICBjb25zdCBmbG93ID0gY3R4LmluRmxvdyA/PyB2YWx1ZS5mbG93ID8/IHZhbHVlLml0ZW1zLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgaWYgKGhhc05ld2xpbmUgfHwgIWZsb3cpIHtcbiAgICAgICAgICAgIGxldCBoYXNQcm9wc0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChoYXNOZXdsaW5lICYmICh2czAgPT09ICcmJyB8fCB2czAgPT09ICchJykpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3AwID0gdmFsdWVTdHIuaW5kZXhPZignICcpO1xuICAgICAgICAgICAgICAgIGlmICh2czAgPT09ICcmJyAmJlxuICAgICAgICAgICAgICAgICAgICBzcDAgIT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgIHNwMCA8IG5sMCAmJlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cltzcDAgKyAxXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwMCA9IHZhbHVlU3RyLmluZGV4T2YoJyAnLCBzcDAgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwMCA9PT0gLTEgfHwgbmwwIDwgc3AwKVxuICAgICAgICAgICAgICAgICAgICBoYXNQcm9wc0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFoYXNQcm9wc0xpbmUpXG4gICAgICAgICAgICAgICAgd3MgPSBgXFxuJHtjdHguaW5kZW50fWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWVTdHIgPT09ICcnIHx8IHZhbHVlU3RyWzBdID09PSAnXFxuJykge1xuICAgICAgICB3cyA9ICcnO1xuICAgIH1cbiAgICBzdHIgKz0gd3MgKyB2YWx1ZVN0cjtcbiAgICBpZiAoY3R4LmluRmxvdykge1xuICAgICAgICBpZiAodmFsdWVDb21tZW50RG9uZSAmJiBvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWVDb21tZW50ICYmICF2YWx1ZUNvbW1lbnREb25lKSB7XG4gICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcodmFsdWVDb21tZW50KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcCkge1xuICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuXG5leHBvcnQgeyBzdHJpbmdpZnlQYWlyIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgZm9sZEZsb3dMaW5lcywgRk9MRF9RVU9URUQsIEZPTERfRkxPVywgRk9MRF9CTE9DSyB9IGZyb20gJy4vZm9sZEZsb3dMaW5lcy5qcyc7XG5cbmNvbnN0IGdldEZvbGRPcHRpb25zID0gKGN0eCwgaXNCbG9jaykgPT4gKHtcbiAgICBpbmRlbnRBdFN0YXJ0OiBpc0Jsb2NrID8gY3R4LmluZGVudC5sZW5ndGggOiBjdHguaW5kZW50QXRTdGFydCxcbiAgICBsaW5lV2lkdGg6IGN0eC5vcHRpb25zLmxpbmVXaWR0aCxcbiAgICBtaW5Db250ZW50V2lkdGg6IGN0eC5vcHRpb25zLm1pbkNvbnRlbnRXaWR0aFxufSk7XG4vLyBBbHNvIGNoZWNrcyBmb3IgbGluZXMgc3RhcnRpbmcgd2l0aCAlLCBhcyBwYXJzaW5nIHRoZSBvdXRwdXQgYXMgWUFNTCAxLjEgd2lsbFxuLy8gcHJlc3VtZSB0aGF0J3Mgc3RhcnRpbmcgYSBuZXcgZG9jdW1lbnQuXG5jb25zdCBjb250YWluc0RvY3VtZW50TWFya2VyID0gKHN0cikgPT4gL14oJXwtLS18XFwuXFwuXFwuKS9tLnRlc3Qoc3RyKTtcbmZ1bmN0aW9uIGxpbmVMZW5ndGhPdmVyTGltaXQoc3RyLCBsaW5lV2lkdGgsIGluZGVudExlbmd0aCkge1xuICAgIGlmICghbGluZVdpZHRoIHx8IGxpbmVXaWR0aCA8IDApXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBsaW1pdCA9IGxpbmVXaWR0aCAtIGluZGVudExlbmd0aDtcbiAgICBjb25zdCBzdHJMZW4gPSBzdHIubGVuZ3RoO1xuICAgIGlmIChzdHJMZW4gPD0gbGltaXQpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMCwgc3RhcnQgPSAwOyBpIDwgc3RyTGVuOyArK2kpIHtcbiAgICAgICAgaWYgKHN0cltpXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIGlmIChpIC0gc3RhcnQgPiBsaW1pdClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBpZiAoc3RyTGVuIC0gc3RhcnQgPD0gbGltaXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gZG91YmxlUXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpIHtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGlmIChjdHgub3B0aW9ucy5kb3VibGVRdW90ZWRBc0pTT04pXG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIGNvbnN0IHsgaW1wbGljaXRLZXkgfSA9IGN0eDtcbiAgICBjb25zdCBtaW5NdWx0aUxpbmVMZW5ndGggPSBjdHgub3B0aW9ucy5kb3VibGVRdW90ZWRNaW5NdWx0aUxpbmVMZW5ndGg7XG4gICAgY29uc3QgaW5kZW50ID0gY3R4LmluZGVudCB8fCAoY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkgPyAnICAnIDogJycpO1xuICAgIGxldCBzdHIgPSAnJztcbiAgICBsZXQgc3RhcnQgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwLCBjaCA9IGpzb25baV07IGNoOyBjaCA9IGpzb25bKytpXSkge1xuICAgICAgICBpZiAoY2ggPT09ICcgJyAmJiBqc29uW2kgKyAxXSA9PT0gJ1xcXFwnICYmIGpzb25baSArIDJdID09PSAnbicpIHtcbiAgICAgICAgICAgIC8vIHNwYWNlIGJlZm9yZSBuZXdsaW5lIG5lZWRzIHRvIGJlIGVzY2FwZWQgdG8gbm90IGJlIGZvbGRlZFxuICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpICsgJ1xcXFwgJztcbiAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIHN0YXJ0ID0gaTtcbiAgICAgICAgICAgIGNoID0gJ1xcXFwnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgc3dpdGNoIChqc29uW2kgKyAxXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3UnOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0ganNvbi5zdWJzdHIoaSArIDIsIDQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwMCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXDAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDA3JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcYSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMGInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFx2JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAxYic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDg1JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcTic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwYTAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxfJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjAyOCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXEwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcyMDI5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcUCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2RlLnN1YnN0cigwLCAyKSA9PT0gJzAwJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXHgnICsgY29kZS5zdWJzdHIoMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBqc29uLnN1YnN0cihpLCA2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbic6XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbltpICsgMl0gPT09ICdcIicgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ubGVuZ3RoIDwgbWluTXVsdGlMaW5lTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb2xkaW5nIHdpbGwgZWF0IGZpcnN0IG5ld2xpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKSArICdcXG5cXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGpzb25baSArIDJdID09PSAnXFxcXCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyAzXSA9PT0gJ24nICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbltpICsgNF0gIT09ICdcIicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGluZGVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNwYWNlIGFmdGVyIG5ld2xpbmUgbmVlZHMgdG8gYmUgZXNjYXBlZCB0byBub3QgYmUgZm9sZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbltpICsgMl0gPT09ICcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgfVxuICAgIHN0ciA9IHN0YXJ0ID8gc3RyICsganNvbi5zbGljZShzdGFydCkgOiBqc29uO1xuICAgIHJldHVybiBpbXBsaWNpdEtleVxuICAgICAgICA/IHN0clxuICAgICAgICA6IGZvbGRGbG93TGluZXMoc3RyLCBpbmRlbnQsIEZPTERfUVVPVEVELCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBzaW5nbGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGlmIChjdHgub3B0aW9ucy5zaW5nbGVRdW90ZSA9PT0gZmFsc2UgfHxcbiAgICAgICAgKGN0eC5pbXBsaWNpdEtleSAmJiB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHx8XG4gICAgICAgIC9bIFxcdF1cXG58XFxuWyBcXHRdLy50ZXN0KHZhbHVlKSAvLyBzaW5nbGUgcXVvdGVkIHN0cmluZyBjYW4ndCBoYXZlIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZSBhcm91bmQgbmV3bGluZVxuICAgIClcbiAgICAgICAgcmV0dXJuIGRvdWJsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8IChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgY29uc3QgcmVzID0gXCInXCIgKyB2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIikucmVwbGFjZSgvXFxuKy9nLCBgJCZcXG4ke2luZGVudH1gKSArIFwiJ1wiO1xuICAgIHJldHVybiBjdHguaW1wbGljaXRLZXlcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzKHJlcywgaW5kZW50LCBGT0xEX0ZMT1csIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QgeyBzaW5nbGVRdW90ZSB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgbGV0IHFzO1xuICAgIGlmIChzaW5nbGVRdW90ZSA9PT0gZmFsc2UpXG4gICAgICAgIHFzID0gZG91YmxlUXVvdGVkU3RyaW5nO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBoYXNEb3VibGUgPSB2YWx1ZS5pbmNsdWRlcygnXCInKTtcbiAgICAgICAgY29uc3QgaGFzU2luZ2xlID0gdmFsdWUuaW5jbHVkZXMoXCInXCIpO1xuICAgICAgICBpZiAoaGFzRG91YmxlICYmICFoYXNTaW5nbGUpXG4gICAgICAgICAgICBxcyA9IHNpbmdsZVF1b3RlZFN0cmluZztcbiAgICAgICAgZWxzZSBpZiAoaGFzU2luZ2xlICYmICFoYXNEb3VibGUpXG4gICAgICAgICAgICBxcyA9IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcXMgPSBzaW5nbGVRdW90ZSA/IHNpbmdsZVF1b3RlZFN0cmluZyA6IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHFzKHZhbHVlLCBjdHgpO1xufVxuLy8gVGhlIG5lZ2F0aXZlIGxvb2tiZWhpbmQgYXZvaWRzIGEgcG9seW5vbWlhbCBzZWFyY2gsXG4vLyBidXQgaXNuJ3Qgc3VwcG9ydGVkIHlldCBvbiBTYWZhcmk6IGh0dHBzOi8vY2FuaXVzZS5jb20vanMtcmVnZXhwLWxvb2tiZWhpbmRcbmxldCBibG9ja0VuZE5ld2xpbmVzO1xudHJ5IHtcbiAgICBibG9ja0VuZE5ld2xpbmVzID0gbmV3IFJlZ0V4cCgnKF58KD88IVxcbikpXFxuKyg/IVxcbnwkKScsICdnJyk7XG59XG5jYXRjaCB7XG4gICAgYmxvY2tFbmROZXdsaW5lcyA9IC9cXG4rKD8hXFxufCQpL2c7XG59XG5mdW5jdGlvbiBibG9ja1N0cmluZyh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgYmxvY2tRdW90ZSwgY29tbWVudFN0cmluZywgbGluZVdpZHRoIH0gPSBjdHgub3B0aW9ucztcbiAgICAvLyAxLiBCbG9jayBjYW4ndCBlbmQgaW4gd2hpdGVzcGFjZSB1bmxlc3MgdGhlIGxhc3QgbGluZSBpcyBub24tZW1wdHkuXG4gICAgLy8gMi4gU3RyaW5ncyBjb25zaXN0aW5nIG9mIG9ubHkgd2hpdGVzcGFjZSBhcmUgYmVzdCByZW5kZXJlZCBleHBsaWNpdGx5LlxuICAgIGlmICghYmxvY2tRdW90ZSB8fCAvXFxuW1xcdCBdKyQvLnRlc3QodmFsdWUpIHx8IC9eXFxzKiQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHxcbiAgICAgICAgKGN0eC5mb3JjZUJsb2NrSW5kZW50IHx8IGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBjb25zdCBsaXRlcmFsID0gYmxvY2tRdW90ZSA9PT0gJ2xpdGVyYWwnXG4gICAgICAgID8gdHJ1ZVxuICAgICAgICA6IGJsb2NrUXVvdGUgPT09ICdmb2xkZWQnIHx8IHR5cGUgPT09IFNjYWxhci5CTE9DS19GT0xERURcbiAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIDogdHlwZSA9PT0gU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgICAgICA6ICFsaW5lTGVuZ3RoT3ZlckxpbWl0KHZhbHVlLCBsaW5lV2lkdGgsIGluZGVudC5sZW5ndGgpO1xuICAgIGlmICghdmFsdWUpXG4gICAgICAgIHJldHVybiBsaXRlcmFsID8gJ3xcXG4nIDogJz5cXG4nO1xuICAgIC8vIGRldGVybWluZSBjaG9tcGluZyBmcm9tIHdoaXRlc3BhY2UgYXQgdmFsdWUgZW5kXG4gICAgbGV0IGNob21wO1xuICAgIGxldCBlbmRTdGFydDtcbiAgICBmb3IgKGVuZFN0YXJ0ID0gdmFsdWUubGVuZ3RoOyBlbmRTdGFydCA+IDA7IC0tZW5kU3RhcnQpIHtcbiAgICAgICAgY29uc3QgY2ggPSB2YWx1ZVtlbmRTdGFydCAtIDFdO1xuICAgICAgICBpZiAoY2ggIT09ICdcXG4nICYmIGNoICE9PSAnXFx0JyAmJiBjaCAhPT0gJyAnKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBlbmQgPSB2YWx1ZS5zdWJzdHJpbmcoZW5kU3RhcnQpO1xuICAgIGNvbnN0IGVuZE5sUG9zID0gZW5kLmluZGV4T2YoJ1xcbicpO1xuICAgIGlmIChlbmRObFBvcyA9PT0gLTEpIHtcbiAgICAgICAgY2hvbXAgPSAnLSc7IC8vIHN0cmlwXG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlID09PSBlbmQgfHwgZW5kTmxQb3MgIT09IGVuZC5sZW5ndGggLSAxKSB7XG4gICAgICAgIGNob21wID0gJysnOyAvLyBrZWVwXG4gICAgICAgIGlmIChvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjaG9tcCA9ICcnOyAvLyBjbGlwXG4gICAgfVxuICAgIGlmIChlbmQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgwLCAtZW5kLmxlbmd0aCk7XG4gICAgICAgIGlmIChlbmRbZW5kLmxlbmd0aCAtIDFdID09PSAnXFxuJylcbiAgICAgICAgICAgIGVuZCA9IGVuZC5zbGljZSgwLCAtMSk7XG4gICAgICAgIGVuZCA9IGVuZC5yZXBsYWNlKGJsb2NrRW5kTmV3bGluZXMsIGAkJiR7aW5kZW50fWApO1xuICAgIH1cbiAgICAvLyBkZXRlcm1pbmUgaW5kZW50IGluZGljYXRvciBmcm9tIHdoaXRlc3BhY2UgYXQgdmFsdWUgc3RhcnRcbiAgICBsZXQgc3RhcnRXaXRoU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRFbmQ7XG4gICAgbGV0IHN0YXJ0TmxQb3MgPSAtMTtcbiAgICBmb3IgKHN0YXJ0RW5kID0gMDsgc3RhcnRFbmQgPCB2YWx1ZS5sZW5ndGg7ICsrc3RhcnRFbmQpIHtcbiAgICAgICAgY29uc3QgY2ggPSB2YWx1ZVtzdGFydEVuZF07XG4gICAgICAgIGlmIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgc3RhcnRXaXRoU3BhY2UgPSB0cnVlO1xuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICBzdGFydE5sUG9zID0gc3RhcnRFbmQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgc3RhcnQgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnRObFBvcyA8IHN0YXJ0RW5kID8gc3RhcnRObFBvcyArIDEgOiBzdGFydEVuZCk7XG4gICAgaWYgKHN0YXJ0KSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKHN0YXJ0Lmxlbmd0aCk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICB9XG4gICAgY29uc3QgaW5kZW50U2l6ZSA9IGluZGVudCA/ICcyJyA6ICcxJzsgLy8gcm9vdCBpcyBhdCAtMVxuICAgIGxldCBoZWFkZXIgPSAobGl0ZXJhbCA/ICd8JyA6ICc+JykgKyAoc3RhcnRXaXRoU3BhY2UgPyBpbmRlbnRTaXplIDogJycpICsgY2hvbXA7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgaGVhZGVyICs9ICcgJyArIGNvbW1lbnRTdHJpbmcoY29tbWVudC5yZXBsYWNlKC8gP1tcXHJcXG5dKy9nLCAnICcpKTtcbiAgICAgICAgaWYgKG9uQ29tbWVudClcbiAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgIH1cbiAgICBpZiAobGl0ZXJhbCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcbisvZywgYCQmJHtpbmRlbnR9YCk7XG4gICAgICAgIHJldHVybiBgJHtoZWFkZXJ9XFxuJHtpbmRlbnR9JHtzdGFydH0ke3ZhbHVlfSR7ZW5kfWA7XG4gICAgfVxuICAgIHZhbHVlID0gdmFsdWVcbiAgICAgICAgLnJlcGxhY2UoL1xcbisvZywgJ1xcbiQmJylcbiAgICAgICAgLnJlcGxhY2UoLyg/Ol58XFxuKShbXFx0IF0uKikoPzooW1xcblxcdCBdKilcXG4oPyFbXFxuXFx0IF0pKT8vZywgJyQxJDInKSAvLyBtb3JlLWluZGVudGVkIGxpbmVzIGFyZW4ndCBmb2xkZWRcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgXiBtb3JlLWluZC4gXiBlbXB0eSAgICAgXiBjYXB0dXJlIG5leHQgZW1wdHkgbGluZXMgb25seSBhdCBlbmQgb2YgaW5kZW50XG4gICAgICAgIC5yZXBsYWNlKC9cXG4rL2csIGAkJiR7aW5kZW50fWApO1xuICAgIGNvbnN0IGJvZHkgPSBmb2xkRmxvd0xpbmVzKGAke3N0YXJ0fSR7dmFsdWV9JHtlbmR9YCwgaW5kZW50LCBGT0xEX0JMT0NLLCBnZXRGb2xkT3B0aW9ucyhjdHgsIHRydWUpKTtcbiAgICByZXR1cm4gYCR7aGVhZGVyfVxcbiR7aW5kZW50fSR7Ym9keX1gO1xufVxuZnVuY3Rpb24gcGxhaW5TdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyB0eXBlLCB2YWx1ZSB9ID0gaXRlbTtcbiAgICBjb25zdCB7IGFjdHVhbFN0cmluZywgaW1wbGljaXRLZXksIGluZGVudCwgaW5kZW50U3RlcCwgaW5GbG93IH0gPSBjdHg7XG4gICAgaWYgKChpbXBsaWNpdEtleSAmJiB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHx8XG4gICAgICAgIChpbkZsb3cgJiYgL1tbXFxde30sXS8udGVzdCh2YWx1ZSkpKSB7XG4gICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIGlmICghdmFsdWUgfHxcbiAgICAgICAgL15bXFxuXFx0ICxbXFxde30jJiohfD4nXCIlQGBdfF5bPy1dJHxeWz8tXVsgXFx0XXxbXFxuOl1bIFxcdF18WyBcXHRdXFxufFtcXG5cXHQgXSN8W1xcblxcdCA6XSQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIC8vIG5vdCBhbGxvd2VkOlxuICAgICAgICAvLyAtIGVtcHR5IHN0cmluZywgJy0nIG9yICc/J1xuICAgICAgICAvLyAtIHN0YXJ0IHdpdGggYW4gaW5kaWNhdG9yIGNoYXJhY3RlciAoZXhjZXB0IFs/Oi1dKSBvciAvWz8tXSAvXG4gICAgICAgIC8vIC0gJ1xcbiAnLCAnOiAnIG9yICcgXFxuJyBhbnl3aGVyZVxuICAgICAgICAvLyAtICcjJyBub3QgcHJlY2VkZWQgYnkgYSBub24tc3BhY2UgY2hhclxuICAgICAgICAvLyAtIGVuZCB3aXRoICcgJyBvciAnOidcbiAgICAgICAgcmV0dXJuIGltcGxpY2l0S2V5IHx8IGluRmxvdyB8fCAhdmFsdWUuaW5jbHVkZXMoJ1xcbicpXG4gICAgICAgICAgICA/IHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KVxuICAgICAgICAgICAgOiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbiAgICBpZiAoIWltcGxpY2l0S2V5ICYmXG4gICAgICAgICFpbkZsb3cgJiZcbiAgICAgICAgdHlwZSAhPT0gU2NhbGFyLlBMQUlOICYmXG4gICAgICAgIHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAvLyBXaGVyZSBhbGxvd2VkICYgdHlwZSBub3Qgc2V0IGV4cGxpY2l0bHksIHByZWZlciBibG9jayBzdHlsZSBmb3IgbXVsdGlsaW5lIHN0cmluZ3NcbiAgICAgICAgcmV0dXJuIGJsb2NrU3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxuICAgIGlmIChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSkge1xuICAgICAgICBpZiAoaW5kZW50ID09PSAnJykge1xuICAgICAgICAgICAgY3R4LmZvcmNlQmxvY2tJbmRlbnQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGJsb2NrU3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW1wbGljaXRLZXkgJiYgaW5kZW50ID09PSBpbmRlbnRTdGVwKSB7XG4gICAgICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHN0ciA9IHZhbHVlLnJlcGxhY2UoL1xcbisvZywgYCQmXFxuJHtpbmRlbnR9YCk7XG4gICAgLy8gVmVyaWZ5IHRoYXQgb3V0cHV0IHdpbGwgYmUgcGFyc2VkIGFzIGEgc3RyaW5nLCBhcyBlLmcuIHBsYWluIG51bWJlcnMgYW5kXG4gICAgLy8gYm9vbGVhbnMgZ2V0IHBhcnNlZCB3aXRoIHRob3NlIHR5cGVzIGluIHYxLjIgKGUuZy4gJzQyJywgJ3RydWUnICYgJzAuOWUtMycpLFxuICAgIC8vIGFuZCBvdGhlcnMgaW4gdjEuMS5cbiAgICBpZiAoYWN0dWFsU3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHRlc3QgPSAodGFnKSA9PiB0YWcuZGVmYXVsdCAmJiB0YWcudGFnICE9PSAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyAmJiB0YWcudGVzdD8udGVzdChzdHIpO1xuICAgICAgICBjb25zdCB7IGNvbXBhdCwgdGFncyB9ID0gY3R4LmRvYy5zY2hlbWE7XG4gICAgICAgIGlmICh0YWdzLnNvbWUodGVzdCkgfHwgY29tcGF0Py5zb21lKHRlc3QpKVxuICAgICAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICB9XG4gICAgcmV0dXJuIGltcGxpY2l0S2V5XG4gICAgICAgID8gc3RyXG4gICAgICAgIDogZm9sZEZsb3dMaW5lcyhzdHIsIGluZGVudCwgRk9MRF9GTE9XLCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSwgaW5GbG93IH0gPSBjdHg7XG4gICAgY29uc3Qgc3MgPSB0eXBlb2YgaXRlbS52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBpdGVtXG4gICAgICAgIDogT2JqZWN0LmFzc2lnbih7fSwgaXRlbSwgeyB2YWx1ZTogU3RyaW5nKGl0ZW0udmFsdWUpIH0pO1xuICAgIGxldCB7IHR5cGUgfSA9IGl0ZW07XG4gICAgaWYgKHR5cGUgIT09IFNjYWxhci5RVU9URV9ET1VCTEUpIHtcbiAgICAgICAgLy8gZm9yY2UgZG91YmxlIHF1b3RlcyBvbiBjb250cm9sIGNoYXJhY3RlcnMgJiB1bnBhaXJlZCBzdXJyb2dhdGVzXG4gICAgICAgIGlmICgvW1xceDAwLVxceDA4XFx4MGItXFx4MWZcXHg3Zi1cXHg5ZlxcdXtEODAwfS1cXHV7REZGRn1dL3UudGVzdChzcy52YWx1ZSkpXG4gICAgICAgICAgICB0eXBlID0gU2NhbGFyLlFVT1RFX0RPVUJMRTtcbiAgICB9XG4gICAgY29uc3QgX3N0cmluZ2lmeSA9IChfdHlwZSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKF90eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5CTE9DS19GT0xERUQ6XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5CTE9DS19MSVRFUkFMOlxuICAgICAgICAgICAgICAgIHJldHVybiBpbXBsaWNpdEtleSB8fCBpbkZsb3dcbiAgICAgICAgICAgICAgICAgICAgPyBxdW90ZWRTdHJpbmcoc3MudmFsdWUsIGN0eCkgLy8gYmxvY2tzIGFyZSBub3QgdmFsaWQgaW5zaWRlIGZsb3cgY29udGFpbmVyc1xuICAgICAgICAgICAgICAgICAgICA6IGJsb2NrU3RyaW5nKHNzLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuUVVPVEVfRE9VQkxFOlxuICAgICAgICAgICAgICAgIHJldHVybiBkb3VibGVRdW90ZWRTdHJpbmcoc3MudmFsdWUsIGN0eCk7XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5RVU9URV9TSU5HTEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpbmdsZVF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlBMQUlOOlxuICAgICAgICAgICAgICAgIHJldHVybiBwbGFpblN0cmluZyhzcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGxldCByZXMgPSBfc3RyaW5naWZ5KHR5cGUpO1xuICAgIGlmIChyZXMgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgeyBkZWZhdWx0S2V5VHlwZSwgZGVmYXVsdFN0cmluZ1R5cGUgfSA9IGN0eC5vcHRpb25zO1xuICAgICAgICBjb25zdCB0ID0gKGltcGxpY2l0S2V5ICYmIGRlZmF1bHRLZXlUeXBlKSB8fCBkZWZhdWx0U3RyaW5nVHlwZTtcbiAgICAgICAgcmVzID0gX3N0cmluZ2lmeSh0KTtcbiAgICAgICAgaWYgKHJlcyA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGVmYXVsdCBzdHJpbmcgdHlwZSAke3R9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbmV4cG9ydCB7IHN0cmluZ2lmeVN0cmluZyB9O1xuIiwiaW1wb3J0IHsgaXNEb2N1bWVudCwgaXNOb2RlLCBpc1BhaXIsIGlzQ29sbGVjdGlvbiwgaXNNYXAsIGlzU2VxLCBpc1NjYWxhciwgaXNBbGlhcyB9IGZyb20gJy4vbm9kZXMvaWRlbnRpdHkuanMnO1xuXG5jb25zdCBCUkVBSyA9IFN5bWJvbCgnYnJlYWsgdmlzaXQnKTtcbmNvbnN0IFNLSVAgPSBTeW1ib2woJ3NraXAgY2hpbGRyZW4nKTtcbmNvbnN0IFJFTU9WRSA9IFN5bWJvbCgncmVtb3ZlIG5vZGUnKTtcbi8qKlxuICogQXBwbHkgYSB2aXNpdG9yIHRvIGFuIEFTVCBub2RlIG9yIGRvY3VtZW50LlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIGBub2RlYCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0aHJlZSBhcmd1bWVudHM6XG4gKiAgIC0gYGtleWA6IEZvciBzZXF1ZW5jZSB2YWx1ZXMgYW5kIG1hcCBgUGFpcmAsIHRoZSBub2RlJ3MgaW5kZXggaW4gdGhlXG4gKiAgICAgY29sbGVjdGlvbi4gV2l0aGluIGEgYFBhaXJgLCBgJ2tleSdgIG9yIGAndmFsdWUnYCwgY29ycmVzcG9uZGluZ2x5LlxuICogICAgIGBudWxsYCBmb3IgdGhlIHJvb3Qgbm9kZS5cbiAqICAgLSBgbm9kZWA6IFRoZSBjdXJyZW50IG5vZGUuXG4gKiAgIC0gYHBhdGhgOiBUaGUgYW5jZXN0cnkgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSwgY29udGludWUgd2l0aCBuZXh0XG4gKiAgICAgc2libGluZ1xuICogICAtIGB2aXNpdC5CUkVBS2A6IFRlcm1pbmF0ZSB0cmF2ZXJzYWwgY29tcGxldGVseVxuICogICAtIGB2aXNpdC5SRU1PVkVgOiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSB3aXRoIHRoZSBuZXh0IG9uZVxuICogICAtIGBOb2RlYDogUmVwbGFjZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIGJ5IHZpc2l0aW5nIGl0XG4gKiAgIC0gYG51bWJlcmA6IFdoaWxlIGl0ZXJhdGluZyB0aGUgaXRlbXMgb2YgYSBzZXF1ZW5jZSBvciBtYXAsIHNldCB0aGUgaW5kZXhcbiAqICAgICBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudFxuICogICAgIG5vZGUgaGFzIGNoYW5nZWQuXG4gKlxuICogSWYgYHZpc2l0b3JgIGlzIGEgc2luZ2xlIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGFsbCB2YWx1ZXNcbiAqIGVuY291bnRlcmVkIGluIHRoZSB0cmVlLCBpbmNsdWRpbmcgZS5nLiBgbnVsbGAgdmFsdWVzLiBBbHRlcm5hdGl2ZWx5LFxuICogc2VwYXJhdGUgdmlzaXRvciBmdW5jdGlvbnMgbWF5IGJlIGRlZmluZWQgZm9yIGVhY2ggYE1hcGAsIGBQYWlyYCwgYFNlcWAsXG4gKiBgQWxpYXNgIGFuZCBgU2NhbGFyYCBub2RlLiBUbyBkZWZpbmUgdGhlIHNhbWUgdmlzaXRvciBmdW5jdGlvbiBmb3IgbW9yZSB0aGFuXG4gKiBvbmUgbm9kZSB0eXBlLCB1c2UgdGhlIGBDb2xsZWN0aW9uYCAobWFwIGFuZCBzZXEpLCBgVmFsdWVgIChtYXAsIHNlcSAmIHNjYWxhcilcbiAqIGFuZCBgTm9kZWAgKGFsaWFzLCBtYXAsIHNlcSAmIHNjYWxhcikgdGFyZ2V0cy4gT2YgYWxsIHRoZXNlLCBvbmx5IHRoZSBtb3N0XG4gKiBzcGVjaWZpYyBkZWZpbmVkIG9uZSB3aWxsIGJlIHVzZWQgZm9yIGVhY2ggbm9kZS5cbiAqL1xuZnVuY3Rpb24gdmlzaXQobm9kZSwgdmlzaXRvcikge1xuICAgIGNvbnN0IHZpc2l0b3JfID0gaW5pdFZpc2l0b3IodmlzaXRvcik7XG4gICAgaWYgKGlzRG9jdW1lbnQobm9kZSkpIHtcbiAgICAgICAgY29uc3QgY2QgPSB2aXNpdF8obnVsbCwgbm9kZS5jb250ZW50cywgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW25vZGVdKSk7XG4gICAgICAgIGlmIChjZCA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgbm9kZS5jb250ZW50cyA9IG51bGw7XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgdmlzaXRfKG51bGwsIG5vZGUsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtdKSk7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0LkJSRUFLID0gQlJFQUs7XG4vKiogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCBub2RlICovXG52aXNpdC5TS0lQID0gU0tJUDtcbi8qKiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXQuUkVNT1ZFID0gUkVNT1ZFO1xuZnVuY3Rpb24gdmlzaXRfKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCkge1xuICAgIGNvbnN0IGN0cmwgPSBjYWxsVmlzaXRvcihrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpO1xuICAgIGlmIChpc05vZGUoY3RybCkgfHwgaXNQYWlyKGN0cmwpKSB7XG4gICAgICAgIHJlcGxhY2VOb2RlKGtleSwgcGF0aCwgY3RybCk7XG4gICAgICAgIHJldHVybiB2aXNpdF8oa2V5LCBjdHJsLCB2aXNpdG9yLCBwYXRoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjdHJsICE9PSAnc3ltYm9sJykge1xuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaSA9IHZpc2l0XyhpLCBub2RlLml0ZW1zW2ldLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzUGFpcihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgY29uc3QgY2sgPSB2aXNpdF8oJ2tleScsIG5vZGUua2V5LCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgIGlmIChjayA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2sgPT09IFJFTU9WRSlcbiAgICAgICAgICAgICAgICBub2RlLmtleSA9IG51bGw7XG4gICAgICAgICAgICBjb25zdCBjdiA9IHZpc2l0XygndmFsdWUnLCBub2RlLnZhbHVlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgIGlmIChjdiA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgZWxzZSBpZiAoY3YgPT09IFJFTU9WRSlcbiAgICAgICAgICAgICAgICBub2RlLnZhbHVlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbn1cbi8qKlxuICogQXBwbHkgYW4gYXN5bmMgdmlzaXRvciB0byBhbiBBU1Qgbm9kZSBvciBkb2N1bWVudC5cbiAqXG4gKiBXYWxrcyB0aHJvdWdoIHRoZSB0cmVlIChkZXB0aC1maXJzdCkgc3RhcnRpbmcgZnJvbSBgbm9kZWAsIGNhbGxpbmcgYVxuICogYHZpc2l0b3JgIGZ1bmN0aW9uIHdpdGggdGhyZWUgYXJndW1lbnRzOlxuICogICAtIGBrZXlgOiBGb3Igc2VxdWVuY2UgdmFsdWVzIGFuZCBtYXAgYFBhaXJgLCB0aGUgbm9kZSdzIGluZGV4IGluIHRoZVxuICogICAgIGNvbGxlY3Rpb24uIFdpdGhpbiBhIGBQYWlyYCwgYCdrZXknYCBvciBgJ3ZhbHVlJ2AsIGNvcnJlc3BvbmRpbmdseS5cbiAqICAgICBgbnVsbGAgZm9yIHRoZSByb290IG5vZGUuXG4gKiAgIC0gYG5vZGVgOiBUaGUgY3VycmVudCBub2RlLlxuICogICAtIGBwYXRoYDogVGhlIGFuY2VzdHJ5IG9mIHRoZSBjdXJyZW50IG5vZGUuXG4gKlxuICogVGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgdmlzaXRvciBtYXkgYmUgdXNlZCB0byBjb250cm9sIHRoZSB0cmF2ZXJzYWw6XG4gKiAgIC0gYFByb21pc2VgOiBNdXN0IHJlc29sdmUgdG8gb25lIG9mIHRoZSBmb2xsb3dpbmcgdmFsdWVzXG4gKiAgIC0gYHVuZGVmaW5lZGAgKGRlZmF1bHQpOiBEbyBub3RoaW5nIGFuZCBjb250aW51ZVxuICogICAtIGB2aXNpdC5TS0lQYDogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUsIGNvbnRpbnVlIHdpdGggbmV4dFxuICogICAgIHNpYmxpbmdcbiAqICAgLSBgdmlzaXQuQlJFQUtgOiBUZXJtaW5hdGUgdHJhdmVyc2FsIGNvbXBsZXRlbHlcbiAqICAgLSBgdmlzaXQuUkVNT1ZFYDogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgd2l0aCB0aGUgbmV4dCBvbmVcbiAqICAgLSBgTm9kZWA6IFJlcGxhY2UgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSBieSB2aXNpdGluZyBpdFxuICogICAtIGBudW1iZXJgOiBXaGlsZSBpdGVyYXRpbmcgdGhlIGl0ZW1zIG9mIGEgc2VxdWVuY2Ugb3IgbWFwLCBzZXQgdGhlIGluZGV4XG4gKiAgICAgb2YgdGhlIG5leHQgc3RlcC4gVGhpcyBpcyB1c2VmdWwgZXNwZWNpYWxseSBpZiB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnRcbiAqICAgICBub2RlIGhhcyBjaGFuZ2VkLlxuICpcbiAqIElmIGB2aXNpdG9yYCBpcyBhIHNpbmdsZSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCBhbGwgdmFsdWVzXG4gKiBlbmNvdW50ZXJlZCBpbiB0aGUgdHJlZSwgaW5jbHVkaW5nIGUuZy4gYG51bGxgIHZhbHVlcy4gQWx0ZXJuYXRpdmVseSxcbiAqIHNlcGFyYXRlIHZpc2l0b3IgZnVuY3Rpb25zIG1heSBiZSBkZWZpbmVkIGZvciBlYWNoIGBNYXBgLCBgUGFpcmAsIGBTZXFgLFxuICogYEFsaWFzYCBhbmQgYFNjYWxhcmAgbm9kZS4gVG8gZGVmaW5lIHRoZSBzYW1lIHZpc2l0b3IgZnVuY3Rpb24gZm9yIG1vcmUgdGhhblxuICogb25lIG5vZGUgdHlwZSwgdXNlIHRoZSBgQ29sbGVjdGlvbmAgKG1hcCBhbmQgc2VxKSwgYFZhbHVlYCAobWFwLCBzZXEgJiBzY2FsYXIpXG4gKiBhbmQgYE5vZGVgIChhbGlhcywgbWFwLCBzZXEgJiBzY2FsYXIpIHRhcmdldHMuIE9mIGFsbCB0aGVzZSwgb25seSB0aGUgbW9zdFxuICogc3BlY2lmaWMgZGVmaW5lZCBvbmUgd2lsbCBiZSB1c2VkIGZvciBlYWNoIG5vZGUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHZpc2l0QXN5bmMobm9kZSwgdmlzaXRvcikge1xuICAgIGNvbnN0IHZpc2l0b3JfID0gaW5pdFZpc2l0b3IodmlzaXRvcik7XG4gICAgaWYgKGlzRG9jdW1lbnQobm9kZSkpIHtcbiAgICAgICAgY29uc3QgY2QgPSBhd2FpdCB2aXNpdEFzeW5jXyhudWxsLCBub2RlLmNvbnRlbnRzLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbbm9kZV0pKTtcbiAgICAgICAgaWYgKGNkID09PSBSRU1PVkUpXG4gICAgICAgICAgICBub2RlLmNvbnRlbnRzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICBhd2FpdCB2aXNpdEFzeW5jXyhudWxsLCBub2RlLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbXSkpO1xufVxuLy8gV2l0aG91dCB0aGUgYGFzIHN5bWJvbGAgY2FzdHMsIFRTIGRlY2xhcmVzIHRoZXNlIGluIHRoZSBgdmlzaXRgXG4vLyBuYW1lc3BhY2UgdXNpbmcgYHZhcmAsIGJ1dCB0aGVuIGNvbXBsYWlucyBhYm91dCB0aGF0IGJlY2F1c2Vcbi8vIGB1bmlxdWUgc3ltYm9sYCBtdXN0IGJlIGBjb25zdGAuXG4vKiogVGVybWluYXRlIHZpc2l0IHRyYXZlcnNhbCBjb21wbGV0ZWx5ICovXG52aXNpdEFzeW5jLkJSRUFLID0gQlJFQUs7XG4vKiogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCBub2RlICovXG52aXNpdEFzeW5jLlNLSVAgPSBTS0lQO1xuLyoqIFJlbW92ZSB0aGUgY3VycmVudCBub2RlICovXG52aXNpdEFzeW5jLlJFTU9WRSA9IFJFTU9WRTtcbmFzeW5jIGZ1bmN0aW9uIHZpc2l0QXN5bmNfKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCkge1xuICAgIGNvbnN0IGN0cmwgPSBhd2FpdCBjYWxsVmlzaXRvcihrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpO1xuICAgIGlmIChpc05vZGUoY3RybCkgfHwgaXNQYWlyKGN0cmwpKSB7XG4gICAgICAgIHJlcGxhY2VOb2RlKGtleSwgcGF0aCwgY3RybCk7XG4gICAgICAgIHJldHVybiB2aXNpdEFzeW5jXyhrZXksIGN0cmwsIHZpc2l0b3IsIHBhdGgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGN0cmwgIT09ICdzeW1ib2wnKSB7XG4gICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gYXdhaXQgdmlzaXRBc3luY18oaSwgbm9kZS5pdGVtc1tpXSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjaSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgICAgIGkgPSBjaSAtIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IFJFTU9WRSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLml0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1BhaXIobm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGNvbnN0IGNrID0gYXdhaXQgdmlzaXRBc3luY18oJ2tleScsIG5vZGUua2V5LCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgIGlmIChjayA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2sgPT09IFJFTU9WRSlcbiAgICAgICAgICAgICAgICBub2RlLmtleSA9IG51bGw7XG4gICAgICAgICAgICBjb25zdCBjdiA9IGF3YWl0IHZpc2l0QXN5bmNfKCd2YWx1ZScsIG5vZGUudmFsdWUsIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGN2ID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjdiA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUudmFsdWUgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHJsO1xufVxuZnVuY3Rpb24gaW5pdFZpc2l0b3IodmlzaXRvcikge1xuICAgIGlmICh0eXBlb2YgdmlzaXRvciA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgKHZpc2l0b3IuQ29sbGVjdGlvbiB8fCB2aXNpdG9yLk5vZGUgfHwgdmlzaXRvci5WYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgQWxpYXM6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIE1hcDogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgU2NhbGFyOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBTZXE6IHZpc2l0b3IuTm9kZVxuICAgICAgICB9LCB2aXNpdG9yLlZhbHVlICYmIHtcbiAgICAgICAgICAgIE1hcDogdmlzaXRvci5WYWx1ZSxcbiAgICAgICAgICAgIFNjYWxhcjogdmlzaXRvci5WYWx1ZSxcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5WYWx1ZVxuICAgICAgICB9LCB2aXNpdG9yLkNvbGxlY3Rpb24gJiYge1xuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLkNvbGxlY3Rpb24sXG4gICAgICAgICAgICBTZXE6IHZpc2l0b3IuQ29sbGVjdGlvblxuICAgICAgICB9LCB2aXNpdG9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHZpc2l0b3I7XG59XG5mdW5jdGlvbiBjYWxsVmlzaXRvcihrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpIHtcbiAgICBpZiAodHlwZW9mIHZpc2l0b3IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgIHJldHVybiB2aXNpdG9yKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlzTWFwKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5NYXA/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc1NlcShub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuU2VxPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNQYWlyKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5QYWlyPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNTY2FsYXIobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlNjYWxhcj8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlzQWxpYXMobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLkFsaWFzPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBub2RlKSB7XG4gICAgY29uc3QgcGFyZW50ID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdO1xuICAgIGlmIChpc0NvbGxlY3Rpb24ocGFyZW50KSkge1xuICAgICAgICBwYXJlbnQuaXRlbXNba2V5XSA9IG5vZGU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzUGFpcihwYXJlbnQpKSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdrZXknKVxuICAgICAgICAgICAgcGFyZW50LmtleSA9IG5vZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBhcmVudC52YWx1ZSA9IG5vZGU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzRG9jdW1lbnQocGFyZW50KSkge1xuICAgICAgICBwYXJlbnQuY29udGVudHMgPSBub2RlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcHQgPSBpc0FsaWFzKHBhcmVudCkgPyAnYWxpYXMnIDogJ3NjYWxhcic7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlcGxhY2Ugbm9kZSB3aXRoICR7cHR9IHBhcmVudGApO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgdmlzaXQsIHZpc2l0QXN5bmMgfTtcbiIsIi8vIGBleHBvcnQgKiBhcyBkZWZhdWx0IGZyb20gLi4uYCBmYWlscyBvbiBXZWJwYWNrIHY0XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZWVtZWxpL3lhbWwvaXNzdWVzLzIyOFxuaW1wb3J0ICogYXMgWUFNTCBmcm9tICcuL2Rpc3QvaW5kZXguanMnXG5leHBvcnQgZGVmYXVsdCBZQU1MXG5leHBvcnQgKiBmcm9tICcuL2Rpc3QvaW5kZXguanMnXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICd5YW1sJztcbmltcG9ydCB7UGRsQmxvY2tzLCBQZGxCbG9ja30gZnJvbSAnLi9wZGxfYXN0JztcbmltcG9ydCB7bWF0Y2gsIFB9IGZyb20gJ3RzLXBhdHRlcm4nO1xuaW1wb3J0IHttYXBfYmxvY2tfY2hpbGRyZW59IGZyb20gJy4vcGRsX2FzdF91dGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93X291dHB1dChkYXRhOiBQZGxCbG9ja3MpIHtcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5jbGFzc0xpc3QuYWRkKCdwZGxfYmxvY2snKTtcbiAgbWF0Y2goZGF0YSlcbiAgICAud2l0aChQLnVuaW9uKFAuc3RyaW5nLCBQLm51bWJlciksIG91dHB1dCA9PiB7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gaHRtbGl6ZShvdXRwdXQpO1xuICAgIH0pXG4gICAgLndpdGgoe2NvbnRyaWJ1dGU6IFAudW5pb24oW10sIFsnY29udGV4dCddKX0sICgpID0+IHtcbiAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdwZGxfc2hvd19yZXN1bHRfZmFsc2UnKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSAn4piQJztcbiAgICB9KVxuICAgIC53aXRoKHtyZXN1bHQ6IFAuc3RyaW5nfSwgZGF0YSA9PiB7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gaHRtbGl6ZShkYXRhLnJlc3VsdCk7XG4gICAgfSlcbiAgICAub3RoZXJ3aXNlKCgpID0+IHtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSAn4piQJztcbiAgICB9KTtcbiAgc3dpdGNoX2Rpdl9vbl9jbGljayhkaXYsIHNob3dfYmxvY2tzLCBkYXRhKTtcbiAgcmV0dXJuIGRpdjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dfYmxvY2tzKGJsb2NrczogUGRsQmxvY2tzKSB7XG4gIGNvbnN0IGRvY19mcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbWF0Y2goYmxvY2tzKVxuICAgIC53aXRoKFAuYXJyYXkoUC5fKSwgZGF0YSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGRvYyBvZiBkYXRhKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gc2hvd19ibG9ja3MoZG9jKTtcbiAgICAgICAgZG9jX2ZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5vdGhlcndpc2UoYmxvY2sgPT4ge1xuICAgICAgY29uc3QgY2hpbGQgPSBzaG93X2Jsb2NrKGJsb2NrKTtcbiAgICAgIGRvY19mcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgfSk7XG4gIHJldHVybiBkb2NfZnJhZ21lbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93X2Jsb2NrKGRhdGE6IFBkbEJsb2NrKSB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHNob3dfb3V0cHV0KGRhdGEpO1xuICB9XG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBzd2l0Y2hfZGl2X29uX2NsaWNrKGRpdiwgc2hvd19vdXRwdXQsIGRhdGEpO1xuICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgZSA9PiB7XG4gICAgdXBkYXRlX2NvZGUoZGF0YSk7XG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9KTtcbiAgaWYgKGRhdGEuZGVmcykge1xuICAgIGRpdi5hcHBlbmRDaGlsZChzaG93X2RlZnMoZGF0YS5kZWZzKSk7XG4gIH1cbiAgY29uc3QgYm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkc2V0Jyk7XG4gIGRpdi5hcHBlbmRDaGlsZChib2R5KTtcbiAgYWRkX2RlZihib2R5LCBkYXRhLmRlZik7XG4gIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2Jsb2NrJyk7XG4gIGlmIChkYXRhPy5jb250cmlidXRlICE9PSB1bmRlZmluZWQgJiYgIWRhdGEuY29udHJpYnV0ZS5pbmNsdWRlcygncmVzdWx0JykpIHtcbiAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9zaG93X3Jlc3VsdF9mYWxzZScpO1xuICB9XG4gIG1hdGNoKGRhdGEpXG4gICAgLndpdGgoe2tpbmQ6ICdtb2RlbCd9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX21vZGVsJyk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKHNob3dfcmVzdWx0X29yX2NvZGUoZGF0YSkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdjb2RlJ30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfY29kZScpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChzaG93X3Jlc3VsdF9vcl9jb2RlKGRhdGEpKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnYXBpJ30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfYXBpJyk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKHNob3dfcmVzdWx0X29yX2NvZGUoZGF0YSkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdnZXQnfSwgZGF0YSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9nZXQnKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19yZXN1bHRfb3JfY29kZShkYXRhKSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2RhdGEnfSwgZGF0YSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9kYXRhJyk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKHNob3dfcmVzdWx0X29yX2NvZGUoZGF0YSkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdpZid9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2lmJyk7XG4gICAgICBpZiAoZGF0YS5pZl9yZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBib2R5LmFwcGVuZENoaWxkKHNob3dfcmVzdWx0X29yX2NvZGUoZGF0YSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGlmX2NoaWxkOiBEb2N1bWVudEZyYWdtZW50O1xuICAgICAgICBpZiAoZGF0YS5pZl9yZXN1bHQpIHtcbiAgICAgICAgICBpZl9jaGlsZCA9IHNob3dfYmxvY2tzKGRhdGE/LnRoZW4gPz8gJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmX2NoaWxkID0gc2hvd19ibG9ja3MoZGF0YT8uZWxzZSA/PyAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgYm9keS5hcHBlbmRDaGlsZChpZl9jaGlsZCk7XG4gICAgICB9XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3JlYWQnfSwgZGF0YSA9PiB7XG4gICAgICAvLyBUT0RPXG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9yZWFkJyk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKHNob3dfcmVzdWx0X29yX2NvZGUoZGF0YSkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdpbmNsdWRlJ30sIGRhdGEgPT4ge1xuICAgICAgLy8gVE9ET1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfaW5jbHVkZScpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChzaG93X3Jlc3VsdF9vcl9jb2RlKGRhdGEpKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZnVuY3Rpb24nfSwgZGF0YSA9PiB7XG4gICAgICAvLyBUT0RPXG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9mdW5jdGlvbicpO1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfc2hvd19yZXN1bHRfZmFsc2UnKTtcbiAgICAgIGNvbnN0IGFyZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbiAgICAgIGFyZ3MuaW5uZXJIVE1MID0gaHRtbGl6ZShzdHJpbmdpZnkoe2Z1bmN0aW9uOiBkYXRhLmZ1bmN0aW9ufSkpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChhcmdzKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19ibG9ja3MoZGF0YS5yZXR1cm4pKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnY2FsbCd9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2NhbGwnKTtcbiAgICAgIGlmIChkYXRhLnRyYWNlKSB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbiAgICAgICAgYXJncy5pbm5lckhUTUwgPSBodG1saXplKHN0cmluZ2lmeSh7Y2FsbDogZGF0YS5jYWxsLCBhcmdzOiBkYXRhLmFyZ3N9KSk7XG4gICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoYXJncyk7XG4gICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19ibG9ja3MoZGF0YS50cmFjZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9keS5hcHBlbmRDaGlsZChzaG93X3Jlc3VsdF9vcl9jb2RlKGRhdGEpKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZG9jdW1lbnQnfSwgZGF0YSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9kb2N1bWVudCcpO1xuICAgICAgY29uc3QgZG9jX2NoaWxkID0gc2hvd19ibG9ja3MoZGF0YS5kb2N1bWVudCk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKGRvY19jaGlsZCk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3NlcXVlbmNlJ30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfc2VxdWVuY2UnKTtcbiAgICAgIGNvbnN0IGRvY19jaGlsZCA9IHNob3dfYmxvY2tzKGRhdGEuc2VxdWVuY2UpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChkb2NfY2hpbGQpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdhcnJheSd9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2FycmF5Jyk7XG4gICAgICBjb25zdCBkb2NfY2hpbGQgPSBzaG93X2Jsb2NrcyhkYXRhLmFycmF5KTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoZG9jX2NoaWxkKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnbWVzc2FnZSd9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX21lc3NhZ2UnKTtcbiAgICAgIGNvbnN0IHJvbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbiAgICAgIHJvbGUuaW5uZXJIVE1MID0gaHRtbGl6ZShkYXRhLnJvbGUgKyAnOiAnKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQocm9sZSk7XG4gICAgICBjb25zdCBkb2NfY2hpbGQgPSBzaG93X2Jsb2NrcyhkYXRhLmNvbnRlbnQpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChkb2NfY2hpbGQpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdyZXBlYXQnfSwgZGF0YSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9yZXBlYXQnKTtcbiAgICAgIGNvbnN0IGxvb3BfYm9keSA9IHNob3dfbG9vcF90cmFjZShkYXRhPy50cmFjZSA/PyBbZGF0YS5yZXBlYXRdKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQobG9vcF9ib2R5KTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAncmVwZWF0X3VudGlsJ30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfcmVwZWF0X3VudGlsJyk7XG4gICAgICBjb25zdCBsb29wX2JvZHkgPSBzaG93X2xvb3BfdHJhY2UoZGF0YT8udHJhY2UgPz8gW2RhdGEucmVwZWF0XSk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKGxvb3BfYm9keSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2Zvcid9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2ZvcicpO1xuICAgICAgY29uc3QgbG9vcF9ib2R5ID0gc2hvd19sb29wX3RyYWNlKGRhdGE/LnRyYWNlID8/IFtkYXRhLnJlcGVhdF0pO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChsb29wX2JvZHkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdlbXB0eSd9LCAoKSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9lbXB0eScpO1xuICAgICAgYm9keS5pbm5lckhUTUwgPSBodG1saXplKCcnKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZXJyb3InfSwgZGF0YSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9lcnJvcicpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChzaG93X3Jlc3VsdF9vcl9jb2RlKGRhdGEpKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiB1bmRlZmluZWR9LCAoKSA9PiB7XG4gICAgICB0aHJvdyBFcnJvcignTWlzc2luZyBraW5kOlxcbicgKyBodG1saXplKGRhdGEpKTtcbiAgICB9KVxuICAgIC5leGhhdXN0aXZlKCk7XG4gIHJldHVybiBkaXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93X2RlZnMoZGVmczoge1trOiBzdHJpbmddOiBQZGxCbG9ja3N9KTogRG9jdW1lbnRGcmFnbWVudCB7XG4gIGNvbnN0IGRvY19mcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgZm9yIChjb25zdCB4IGluIGRlZnMpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmaWVsZHNldCcpO1xuICAgIGRvY19mcmFnbWVudC5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdwZGxfc2hvd19yZXN1bHRfZmFsc2UnKTtcbiAgICBhZGRfZGVmKGRpdiwgeCk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHNob3dfYmxvY2tzKGRlZnNbeF0pKTtcbiAgfVxuICByZXR1cm4gZG9jX2ZyYWdtZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd19sb29wX3RyYWNlKHRyYWNlOiBQZGxCbG9ja3NbXSk6IERvY3VtZW50RnJhZ21lbnQge1xuICBjb25zdCBkb2NfZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGlmICh0cmFjZS5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgZG90X2RvdF9kb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkb3RfZG90X2RvdC5pbm5lckhUTUwgPSAnwrfCt8K3JztcbiAgICBkb3RfZG90X2RvdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgZG90X2RvdF9kb3QucmVwbGFjZVdpdGgoc2hvd19sb29wX3RyYWNlKHRyYWNlLnNsaWNlKDAsIC0xKSkpO1xuICAgICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0pO1xuICAgIGRvY19mcmFnbWVudC5hcHBlbmRDaGlsZChkb3RfZG90X2RvdCk7XG4gIH1cbiAgaWYgKHRyYWNlLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBpdGVyYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpdGVyYXRpb24uY2xhc3NMaXN0LmFkZCgncGRsX2Jsb2NrJywgJ3BkbF9zZXF1ZW5jZScpO1xuICAgIGNvbnN0IGNoaWxkID0gc2hvd19ibG9ja3ModHJhY2Uuc2xpY2UoLTEpWzBdKTtcbiAgICBpdGVyYXRpb24uYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgIGRvY19mcmFnbWVudC5hcHBlbmRDaGlsZChpdGVyYXRpb24pO1xuICB9XG4gIHJldHVybiBkb2NfZnJhZ21lbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRfZGVmKGJsb2NrX2RpdjogRWxlbWVudCwgbmFtZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCkge1xuICBpZiAobmFtZSkge1xuICAgIGNvbnN0IGxlZ2VuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xlZ2VuZCcpO1xuICAgIGxlZ2VuZC5pbm5lckhUTUwgPSBuYW1lO1xuICAgIGJsb2NrX2Rpdi5hcHBlbmRDaGlsZChsZWdlbmQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93X2NvZGUoYmxvY2tzOiBQZGxCbG9ja3MpIHtcbiAgY29uc3QgY29kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICBibG9ja3MgPSBibG9ja3NfY29kZV9jbGVhbnVwKGJsb2Nrcyk7XG4gIGNvZGUuaW5uZXJIVE1MID0gaHRtbGl6ZShzdHJpbmdpZnkoYmxvY2tzKSk7XG4gIHJldHVybiBjb2RlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlX2NvZGUoYmxvY2tzOiBQZGxCbG9ja3MpIHtcbiAgY29uc3QgY29kZSA9IHNob3dfY29kZShibG9ja3MpO1xuICByZXBsYWNlX2RpdignY29kZScsIGNvZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd19yZXN1bHRfb3JfY29kZShibG9jazogUGRsQmxvY2spOiBFbGVtZW50IHtcbiAgY29uc3QgZGl2OiBFbGVtZW50ID0gbWF0Y2goYmxvY2spXG4gICAgLndpdGgoUC51bmlvbihQLnN0cmluZywgUC5udW1iZXIpLCBkYXRhID0+IHNob3dfdmFsdWUoZGF0YSkpXG4gICAgLndpdGgoe3Jlc3VsdDogUC5ffSwgZGF0YSA9PiBzaG93X3ZhbHVlKGRhdGEucmVzdWx0KSlcbiAgICAub3RoZXJ3aXNlKGRhdGEgPT4gc2hvd19jb2RlKGRhdGEpKTtcbiAgcmV0dXJuIGRpdjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dfdmFsdWUoczogdW5rbm93bikge1xuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LmlubmVySFRNTCA9IGh0bWxpemUocyk7XG4gIHJldHVybiBkaXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBibG9ja3NfY29kZV9jbGVhbnVwKGRhdGE6IFBkbEJsb2Nrcyk6IFBkbEJsb2NrcyB7XG4gIGNvbnN0IG5ld19kYXRhID0gbWF0Y2goZGF0YSlcbiAgICAud2l0aChQLmFycmF5KFAuXyksIGRhdGEgPT4gZGF0YS5tYXAoYmxvY2tfY29kZV9jbGVhbnVwKSlcbiAgICAub3RoZXJ3aXNlKGRhdGEgPT4gYmxvY2tfY29kZV9jbGVhbnVwKGRhdGEpKTtcbiAgcmV0dXJuIG5ld19kYXRhO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tfY29kZV9jbGVhbnVwKGRhdGE6IHN0cmluZyB8IFBkbEJsb2NrKTogc3RyaW5nIHwgUGRsQmxvY2sge1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdudW1iZXInIHx8IHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBkYXRhO1xuICB9XG4gIC8vIHJlbW92ZSByZXN1bHRcbiAgY29uc3QgbmV3X2RhdGEgPSB7Li4uZGF0YSwgcmVzdWx0OiB1bmRlZmluZWR9O1xuICAvLyByZW1vdmUgdHJhY2VcbiAgbWF0Y2gobmV3X2RhdGEpLndpdGgoe3RyYWNlOiBQLl99LCBkYXRhID0+IHtcbiAgICBkYXRhLnRyYWNlID0gdW5kZWZpbmVkO1xuICB9KTtcbiAgLy8gcmVtb3ZlIGNvbnRyaWJ1dGU6IFtcInJlc3VsdFwiLCBjb250ZXh0XVxuICBpZiAoXG4gICAgbmV3X2RhdGE/LmNvbnRyaWJ1dGU/LmluY2x1ZGVzKCdyZXN1bHQnKSAmJlxuICAgIG5ld19kYXRhPy5jb250cmlidXRlPy5pbmNsdWRlcygnY29udGV4dCcpXG4gICkge1xuICAgIG5ld19kYXRhLmNvbnRyaWJ1dGUgPSB1bmRlZmluZWQ7XG4gIH1cbiAgLy8gcmVtb3ZlIGVtcHR5IGRlZnMgbGlzdFxuICBpZiAoT2JqZWN0LmtleXMoZGF0YT8uZGVmcyA/PyB7fSkubGVuZ3RoID09PSAwKSB7XG4gICAgbmV3X2RhdGEuZGVmcyA9IHVuZGVmaW5lZDtcbiAgfVxuICAvLyByZW1vdmUgbG9jYXRpb24gaW5mb1xuICBuZXdfZGF0YS5sb2NhdGlvbiA9IHVuZGVmaW5lZDtcbiAgLy8gcmVjdXJzaXZlIGNsZWFudXBcbiAgcmV0dXJuIG1hcF9ibG9ja19jaGlsZHJlbihibG9ja19jb2RlX2NsZWFudXAsIG5ld19kYXRhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VfZGl2KGlkOiBzdHJpbmcsIGVsZW06IEVsZW1lbnQpIHtcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5pZCA9IGlkO1xuICBkaXYuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKT8ucmVwbGFjZVdpdGgoZGl2KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh0bWxpemUoeDogdW5rbm93bik6IHN0cmluZyB7XG4gIGNvbnN0IGh0bWwgPSBtYXRjaCh4KVxuICAgIC53aXRoKFAubnVsbGlzaCwgKCkgPT4gJ+KYkCcpXG4gICAgLndpdGgoUC5zdHJpbmcsIHMgPT4ge1xuICAgICAgaWYgKHMgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiAn4piQJztcbiAgICAgIH1cbiAgICAgIHMgPSBzXG4gICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgIC5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xuICAgICAgcyA9IHMuc3BsaXQoJ1xcbicpLmpvaW4oJzxicj4nKTtcbiAgICAgIHJldHVybiBzO1xuICAgIH0pXG4gICAgLm90aGVyd2lzZSh4ID0+IGh0bWxpemUoSlNPTi5zdHJpbmdpZnkoeCkpKTtcbiAgcmV0dXJuIGh0bWw7XG59XG5cbmZ1bmN0aW9uIHN3aXRjaF9kaXZfb25fY2xpY2soXG4gIGRpdjogRWxlbWVudCxcbiAgc2hvdzogKGRhdGE6IFBkbEJsb2NrcykgPT4gc3RyaW5nIHwgTm9kZSxcbiAgZGF0YTogUGRsQmxvY2tzXG4pIHtcbiAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgZGl2LnJlcGxhY2VXaXRoKHNob3coZGF0YSkpO1xuICAgIGlmIChlLnN0b3BQcm9wYWdhdGlvbikgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=