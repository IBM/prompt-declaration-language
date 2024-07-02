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
    if (typeof block === 'string') {
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
        .with(ts_pattern_1.P.array(ts_pattern_1.P._), sequence => sequence.map(doc => f(doc)))
        .otherwise(block => f(block));
    return blocks;
}
exports.map_blocks = map_blocks;
function iter_block_children(f, block) {
    if (typeof block === 'string') {
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

/***/ "./src/pdl_viewer.ts":
/*!***************************!*\
  !*** ./src/pdl_viewer.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.htmlize = exports.replace_div = exports.block_code_cleanup = exports.blocks_code_cleanup = exports.show_string = exports.show_result_or_code = exports.update_code = exports.show_code = exports.add_def = exports.show_loop_trace = exports.show_defs = exports.show_block = exports.show_blocks = exports.show_output = exports.data = exports.hello = void 0;
const yaml_1 = __webpack_require__(/*! yaml */ "./node_modules/yaml/browser/index.js");
const ts_pattern_1 = __webpack_require__(/*! ts-pattern */ "./node_modules/ts-pattern/dist/index.cjs");
const pdl_ast_utils_1 = __webpack_require__(/*! ./pdl_ast_utils */ "./src/pdl_ast_utils.ts");
exports.hello = {
    kind: 'document',
    description: 'Hello world to call into a model',
    document: [
        'Hello,',
        {
            kind: 'model',
            model: 'ibm/granite-20b-code-instruct-v2',
            parameters: '{"beam_width":null,"decoding_method":"greedy","include_stop_sequence":true,"length_penalty":null,"max_new_tokens":1024,"min_new_tokens":1,"random_seed":null,"repetition_penalty":1.07,"return_options":null,"stop_sequences":["!"],"temperature":null,"time_limit":null,"top_k":null,"top_p":null,"truncate_input_tokens":null,"typical_p":null}',
            result: ' world!',
        },
    ],
    result: 'Hello, world!',
};
exports.data = exports.hello;
function show_output(data) {
    const div = document.createElement('div');
    div.classList.add('pdl_block');
    (0, ts_pattern_1.match)(data)
        .with(ts_pattern_1.P.string, output => {
        div.innerHTML = htmlize(output);
    })
        .with({ show_result: false }, () => {
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
    if (typeof data === 'string') {
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
    if ((data === null || data === void 0 ? void 0 : data.show_result) === false) {
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
        .with(ts_pattern_1.P.string, data => show_string(data))
        .with({ result: ts_pattern_1.P.string }, data => show_string(data.result))
        .otherwise(data => show_code(data));
    return div;
}
exports.show_result_or_code = show_result_or_code;
function show_string(s) {
    const div = document.createElement('div');
    div.innerHTML = htmlize(s);
    return div;
}
exports.show_string = show_string;
function blocks_code_cleanup(data) {
    const new_data = (0, ts_pattern_1.match)(data)
        .with(ts_pattern_1.P.array(ts_pattern_1.P._), data => data.map(block_code_cleanup))
        .otherwise(data => block_code_cleanup(data));
    return new_data;
}
exports.blocks_code_cleanup = blocks_code_cleanup;
function block_code_cleanup(data) {
    var _a;
    if (typeof data === 'string') {
        return data;
    }
    // remove result
    const new_data = { ...data, result: undefined };
    // remove trace
    (0, ts_pattern_1.match)(new_data).with({ trace: ts_pattern_1.P._ }, data => {
        data.trace = undefined;
    });
    // remove show_result: true
    if (new_data === null || new_data === void 0 ? void 0 : new_data.show_result) {
        new_data.show_result = undefined;
    }
    // remove empty defs list
    if (Object.keys((_a = data === null || data === void 0 ? void 0 : data.defs) !== null && _a !== void 0 ? _a : {}).length === 0) {
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


/***/ }),

/***/ "./node_modules/ts-pattern/dist/index.cjs":
/*!************************************************!*\
  !*** ./node_modules/ts-pattern/dist/index.cjs ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {

function n(n,t){(null==t||t>n.length)&&(t=n.length);for(var r=0,e=new Array(t);r<t;r++)e[r]=n[r];return e}function t(t,r){var e="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(e)return(e=e.call(t)).next.bind(e);if(Array.isArray(t)||(e=function(t,r){if(t){if("string"==typeof t)return n(t,r);var e=Object.prototype.toString.call(t).slice(8,-1);return"Object"===e&&t.constructor&&(e=t.constructor.name),"Map"===e||"Set"===e?Array.from(t):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?n(t,r):void 0}}(t))||r&&t&&"number"==typeof t.length){e&&(t=e);var u=0;return function(){return u>=t.length?{done:!0}:{done:!1,value:t[u++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r=Symbol.for("@ts-pattern/matcher"),e=Symbol.for("@ts-pattern/isVariadic"),u="@ts-pattern/anonymous-select-key",i=function(n){return Boolean(n&&"object"==typeof n)},o=function(n){return n&&!!n[r]},c=function n(u,c,a){if(o(u)){var f=u[r]().match(c),s=f.matched,l=f.selections;return s&&l&&Object.keys(l).forEach(function(n){return a(n,l[n])}),s}if(i(u)){if(!i(c))return!1;if(Array.isArray(u)){if(!Array.isArray(c))return!1;for(var h,v=[],g=[],m=[],d=t(u.keys());!(h=d()).done;){var y=u[h.value];o(y)&&y[e]?m.push(y):m.length?g.push(y):v.push(y)}if(m.length){if(m.length>1)throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");if(c.length<v.length+g.length)return!1;var p=c.slice(0,v.length),b=0===g.length?[]:c.slice(-g.length),w=c.slice(v.length,0===g.length?Infinity:-g.length);return v.every(function(t,r){return n(t,p[r],a)})&&g.every(function(t,r){return n(t,b[r],a)})&&(0===m.length||n(m[0],w,a))}return u.length===c.length&&u.every(function(t,r){return n(t,c[r],a)})}return Object.keys(u).every(function(t){var e,i=u[t];return(t in c||o(e=i)&&"optional"===e[r]().matcherType)&&n(i,c[t],a)})}return Object.is(c,u)},a=function n(t){var e,u,c;return i(t)?o(t)?null!=(e=null==(u=(c=t[r]()).getSelectionKeys)?void 0:u.call(c))?e:[]:Array.isArray(t)?f(t,n):f(Object.values(t),n):[]},f=function(n,t){return n.reduce(function(n,r){return n.concat(t(r))},[])};function s(){var n=[].slice.call(arguments);if(1===n.length){var t=n[0];return function(n){return c(t,n,function(){})}}if(2===n.length)return c(n[0],n[1],function(){});throw new Error("isMatching wasn't given the right number of arguments: expected 1 or 2, received "+n.length+".")}function l(n){return Object.assign(n,{optional:function(){return v(n)},and:function(t){return d(n,t)},or:function(t){return y(n,t)},select:function(t){return void 0===t?b(n):b(t,n)}})}function h(n){return Object.assign(function(n){var t;return Object.assign(n,((t={})[Symbol.iterator]=function(){var t,r=0,u=[{value:Object.assign(n,((t={})[e]=!0,t)),done:!1},{done:!0,value:void 0}];return{next:function(){var n;return null!=(n=u[r++])?n:u.at(-1)}}},t))}(n),{optional:function(){return h(v(n))},select:function(t){return h(void 0===t?b(n):b(t,n))}})}function v(n){var t;return l(((t={})[r]=function(){return{match:function(t){var r={},e=function(n,t){r[n]=t};return void 0===t?(a(n).forEach(function(n){return e(n,void 0)}),{matched:!0,selections:r}):{matched:c(n,t,e),selections:r}},getSelectionKeys:function(){return a(n)},matcherType:"optional"}},t))}var g=function(n,r){for(var e,u=t(n);!(e=u()).done;)if(!r(e.value))return!1;return!0},m=function(n,r){for(var e,u=t(n.entries());!(e=u()).done;){var i=e.value;if(!r(i[1],i[0]))return!1}return!0};function d(){var n,t=[].slice.call(arguments);return l(((n={})[r]=function(){return{match:function(n){var r={},e=function(n,t){r[n]=t};return{matched:t.every(function(t){return c(t,n,e)}),selections:r}},getSelectionKeys:function(){return f(t,a)},matcherType:"and"}},n))}function y(){var n,t=[].slice.call(arguments);return l(((n={})[r]=function(){return{match:function(n){var r={},e=function(n,t){r[n]=t};return f(t,a).forEach(function(n){return e(n,void 0)}),{matched:t.some(function(t){return c(t,n,e)}),selections:r}},getSelectionKeys:function(){return f(t,a)},matcherType:"or"}},n))}function p(n){var t;return(t={})[r]=function(){return{match:function(t){return{matched:Boolean(n(t))}}}},t}function b(){var n,t=[].slice.call(arguments),e="string"==typeof t[0]?t[0]:void 0,i=2===t.length?t[1]:"string"==typeof t[0]?void 0:t[0];return l(((n={})[r]=function(){return{match:function(n){var t,r=((t={})[null!=e?e:u]=n,t);return{matched:void 0===i||c(i,n,function(n,t){r[n]=t}),selections:r}},getSelectionKeys:function(){return[null!=e?e:u].concat(void 0===i?[]:a(i))}}},n))}function w(n){return"number"==typeof n}function S(n){return"string"==typeof n}function j(n){return"bigint"==typeof n}var O=l(p(function(n){return!0})),A=O,x=function n(t){return Object.assign(l(t),{startsWith:function(r){return n(d(t,(e=r,p(function(n){return S(n)&&n.startsWith(e)}))));var e},endsWith:function(r){return n(d(t,(e=r,p(function(n){return S(n)&&n.endsWith(e)}))));var e},minLength:function(r){return n(d(t,function(n){return p(function(t){return S(t)&&t.length>=n})}(r)))},length:function(r){return n(d(t,function(n){return p(function(t){return S(t)&&t.length===n})}(r)))},maxLength:function(r){return n(d(t,function(n){return p(function(t){return S(t)&&t.length<=n})}(r)))},includes:function(r){return n(d(t,(e=r,p(function(n){return S(n)&&n.includes(e)}))));var e},regex:function(r){return n(d(t,(e=r,p(function(n){return S(n)&&Boolean(n.match(e))}))));var e}})}(p(S)),E=function n(t){return Object.assign(l(t),{between:function(r,e){return n(d(t,function(n,t){return p(function(r){return w(r)&&n<=r&&t>=r})}(r,e)))},lt:function(r){return n(d(t,function(n){return p(function(t){return w(t)&&t<n})}(r)))},gt:function(r){return n(d(t,function(n){return p(function(t){return w(t)&&t>n})}(r)))},lte:function(r){return n(d(t,function(n){return p(function(t){return w(t)&&t<=n})}(r)))},gte:function(r){return n(d(t,function(n){return p(function(t){return w(t)&&t>=n})}(r)))},int:function(){return n(d(t,p(function(n){return w(n)&&Number.isInteger(n)})))},finite:function(){return n(d(t,p(function(n){return w(n)&&Number.isFinite(n)})))},positive:function(){return n(d(t,p(function(n){return w(n)&&n>0})))},negative:function(){return n(d(t,p(function(n){return w(n)&&n<0})))}})}(p(w)),K=function n(t){return Object.assign(l(t),{between:function(r,e){return n(d(t,function(n,t){return p(function(r){return j(r)&&n<=r&&t>=r})}(r,e)))},lt:function(r){return n(d(t,function(n){return p(function(t){return j(t)&&t<n})}(r)))},gt:function(r){return n(d(t,function(n){return p(function(t){return j(t)&&t>n})}(r)))},lte:function(r){return n(d(t,function(n){return p(function(t){return j(t)&&t<=n})}(r)))},gte:function(r){return n(d(t,function(n){return p(function(t){return j(t)&&t>=n})}(r)))},positive:function(){return n(d(t,p(function(n){return j(n)&&n>0})))},negative:function(){return n(d(t,p(function(n){return j(n)&&n<0})))}})}(p(j)),T=l(p(function(n){return"boolean"==typeof n})),P=l(p(function(n){return"symbol"==typeof n})),k=l(p(function(n){return null==n})),B=l(p(function(n){return null!=n})),I={__proto__:null,matcher:r,optional:v,array:function(){var n,t=[].slice.call(arguments);return h(((n={})[r]=function(){return{match:function(n){if(!Array.isArray(n))return{matched:!1};if(0===t.length)return{matched:!0};var r=t[0],e={};if(0===n.length)return a(r).forEach(function(n){e[n]=[]}),{matched:!0,selections:e};var u=function(n,t){e[n]=(e[n]||[]).concat([t])};return{matched:n.every(function(n){return c(r,n,u)}),selections:e}},getSelectionKeys:function(){return 0===t.length?[]:a(t[0])}}},n))},set:function(){var n,t=[].slice.call(arguments);return l(((n={})[r]=function(){return{match:function(n){if(!(n instanceof Set))return{matched:!1};var r={};if(0===n.size)return{matched:!0,selections:r};if(0===t.length)return{matched:!0};var e=function(n,t){r[n]=(r[n]||[]).concat([t])},u=t[0];return{matched:g(n,function(n){return c(u,n,e)}),selections:r}},getSelectionKeys:function(){return 0===t.length?[]:a(t[0])}}},n))},map:function(){var n,t=[].slice.call(arguments);return l(((n={})[r]=function(){return{match:function(n){if(!(n instanceof Map))return{matched:!1};var r={};if(0===n.size)return{matched:!0,selections:r};var e,u=function(n,t){r[n]=(r[n]||[]).concat([t])};if(0===t.length)return{matched:!0};if(1===t.length)throw new Error("`P.map` wasn't given enough arguments. Expected (key, value), received "+(null==(e=t[0])?void 0:e.toString()));var i=t[0],o=t[1];return{matched:m(n,function(n,t){var r=c(i,t,u),e=c(o,n,u);return r&&e}),selections:r}},getSelectionKeys:function(){return 0===t.length?[]:[].concat(a(t[0]),a(t[1]))}}},n))},intersection:d,union:y,not:function(n){var t;return l(((t={})[r]=function(){return{match:function(t){return{matched:!c(n,t,function(){})}},getSelectionKeys:function(){return[]},matcherType:"not"}},t))},when:p,select:b,any:O,_:A,string:x,number:E,bigint:K,boolean:T,symbol:P,nullish:k,nonNullable:B,instanceOf:function(n){return l(p(function(n){return function(t){return t instanceof n}}(n)))},shape:function(n){return l(p(s(n)))}},_={matched:!1,value:void 0},M=/*#__PURE__*/function(){function n(n,t){this.input=void 0,this.state=void 0,this.input=n,this.state=t}var t=n.prototype;return t.with=function(){var t=this,r=[].slice.call(arguments);if(this.state.matched)return this;var e=r[r.length-1],i=[r[0]],o=void 0;3===r.length&&"function"==typeof r[1]?o=r[1]:r.length>2&&i.push.apply(i,r.slice(1,r.length-1));var a=!1,f={},s=function(n,t){a=!0,f[n]=t},l=!i.some(function(n){return c(n,t.input,s)})||o&&!Boolean(o(this.input))?_:{matched:!0,value:e(a?u in f?f[u]:f:this.input,this.input)};return new n(this.input,l)},t.when=function(t,r){if(this.state.matched)return this;var e=Boolean(t(this.input));return new n(this.input,e?{matched:!0,value:r(this.input,this.input)}:_)},t.otherwise=function(n){return this.state.matched?this.state.value:n(this.input)},t.exhaustive=function(){if(this.state.matched)return this.state.value;var n;try{n=JSON.stringify(this.input)}catch(t){n=this.input}throw new Error("Pattern matching error: no pattern matches value "+n)},t.run=function(){return this.exhaustive()},t.returnType=function(){return this},n}();exports.P=I,exports.Pattern=I,exports.isMatching=s,exports.match=function(n){return new M(n,_)};
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
function composeCollection(CN, ctx, token, tagToken, onError) {
    const tagName = !tagToken
        ? null
        : ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg));
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
        (tagName === _nodes_YAMLSeq_js__WEBPACK_IMPORTED_MODULE_3__.YAMLSeq.tagName && expType === 'seq') ||
        !expType) {
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
            node = (0,_compose_collection_js__WEBPACK_IMPORTED_MODULE_1__.composeCollection)(CN, ctx, token, tag, onError);
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
            if (keyProps.hasNewlineAfterProp || (0,_util_contains_newline_js__WEBPACK_IMPORTED_MODULE_3__.containsNewline)(key)) {
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
    let hasNewlineAfterProp = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
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
                    hasNewlineAfterProp = true;
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
        hasNewlineAfterProp,
        anchor,
        tag,
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
Collection.maxFlowStringSingleLineLength = 60;




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
            if (s === '---' && isEmpty(this.charAt(3))) {
                yield* this.pushCount(3);
                this.indentValue = 0;
                this.indentNext = 0;
                return 'doc';
            }
            else if (s === '...' && isEmpty(this.charAt(3))) {
                yield* this.pushCount(3);
                return 'stream';
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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/pdl_viewer.ts");
/******/ 	pdl_viewer = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RTtBQUN0RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyRkFBMkYsY0FBYztBQUN6RztBQUNBLHFFQUFxRSxjQUFjLEtBQUsscUJBQXFCO0FBQzdHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4RUFBOEUsS0FBSztBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFpRSxZQUFZO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRXdCOzs7Ozs7Ozs7Ozs7Ozs7O0FDbkp4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBOztBQUUyRjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqR2hDOztBQUUzRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkZBQTJGO0FBQzNGLHlDQUF5QztBQUN6QywwQ0FBMEM7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsS0FBSztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix3Q0FBRztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0Q7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyw2Q0FBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRCxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQiw2Q0FBUTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0EscUNBQXFDLHVCQUF1QjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBLGNBQWMsMkNBQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsMkNBQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3BkbF92aWV3ZXIvLi9zcmMvcGRsX2FzdF91dGlscy50cyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vc3JjL3BkbF92aWV3ZXIudHMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy90cy1wYXR0ZXJuL2Rpc3QvaW5kZXguY2pzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3NlLWNvbGxlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL2NvbXBvc2UtZG9jLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3NlLW5vZGUuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL2NvbXBvc2Utc2NhbGFyLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3Nlci5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1tYXAuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2NhbGFyLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWJsb2NrLXNlcS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1lbmQuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtZmxvdy1jb2xsZWN0aW9uLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWZsb3ctc2NhbGFyLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLXByb3BzLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtZW1wdHktc2NhbGFyLXBvc2l0aW9uLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS91dGlsLW1hcC1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2RvYy9Eb2N1bWVudC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2RvYy9hbmNob3JzLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2FwcGx5UmV2aXZlci5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2RvYy9jcmVhdGVOb2RlLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2RpcmVjdGl2ZXMuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2xvZy5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL0FsaWFzLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvQ29sbGVjdGlvbi5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL05vZGUuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9QYWlyLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvU2NhbGFyLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvWUFNTE1hcC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL1lBTUxTZXEuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9hZGRQYWlyVG9KU01hcC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL2lkZW50aXR5LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvdG9KUy5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3BhcnNlL2NzdC1zY2FsYXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9jc3Qtc3RyaW5naWZ5LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvY3N0LXZpc2l0LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvY3N0LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvbGV4ZXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9saW5lLWNvdW50ZXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wdWJsaWMtYXBpLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL1NjaGVtYS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb21tb24vbWFwLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvbW1vbi9udWxsLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvbW1vbi9zZXEuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL3N0cmluZy5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL2Jvb2wuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29yZS9mbG9hdC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL2ludC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL3NjaGVtYS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9qc29uL3NjaGVtYS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS90YWdzLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2JpbmFyeS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9ib29sLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2Zsb2F0LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2ludC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9vbWFwLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3BhaXJzLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3NjaGVtYS5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9zZXQuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvdGltZXN0YW1wLmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L2ZvbGRGbG93TGluZXMuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzIiwid2VicGFjazovL3BkbF92aWV3ZXIvLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeUNvbGxlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5Q29tbWVudC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5UGFpci5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci8uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC92aXNpdC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyLy4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9pbmRleC5qcyIsIndlYnBhY2s6Ly9wZGxfdmlld2VyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3BkbF92aWV3ZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3BkbF92aWV3ZXIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9wZGxfdmlld2VyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vcGRsX3ZpZXdlci93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3BkbF92aWV3ZXIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3BkbF92aWV3ZXIvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGRsQmxvY2tzLCBQZGxCbG9ja30gZnJvbSAnLi9wZGxfYXN0JztcbmltcG9ydCB7bWF0Y2gsIFB9IGZyb20gJ3RzLXBhdHRlcm4nO1xuXG5leHBvcnQgZnVuY3Rpb24gbWFwX2Jsb2NrX2NoaWxkcmVuKFxuICBmOiAoYmxvY2s6IFBkbEJsb2NrKSA9PiBQZGxCbG9jayxcbiAgYmxvY2s6IFBkbEJsb2NrXG4pOiBQZGxCbG9jayB7XG4gIGlmICh0eXBlb2YgYmxvY2sgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGJsb2NrO1xuICB9XG4gIGxldCBuZXdfYmxvY2s6IFBkbEJsb2NrO1xuICBpZiAoYmxvY2s/LmRlZnMgPT09IHVuZGVmaW5lZCkge1xuICAgIG5ld19ibG9jayA9IHsuLi5ibG9ja307XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZGVmczoge1trOiBzdHJpbmddOiBQZGxCbG9ja3N9ID0ge307XG4gICAgZm9yIChjb25zdCB4IGluIGJsb2NrLmRlZnMpIHtcbiAgICAgIGRlZnNbeF0gPSBtYXBfYmxvY2tzKGYsIGJsb2NrLmRlZnNbeF0pO1xuICAgIH1cbiAgICBuZXdfYmxvY2sgPSB7Li4uYmxvY2ssIGRlZnM6IGRlZnN9O1xuICB9XG4gIG5ld19ibG9jayA9IG1hdGNoKG5ld19ibG9jaylcbiAgICAvLyAud2l0aChQLnN0cmluZywgcyA9PiBzKVxuICAgIC53aXRoKHtraW5kOiAnZW1wdHknfSwgYmxvY2sgPT4gYmxvY2spXG4gICAgLndpdGgoe2tpbmQ6ICdmdW5jdGlvbid9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCByZXR1cm5zID0gbWFwX2Jsb2NrcyhmLCBibG9jay5yZXR1cm4pO1xuICAgICAgcmV0dXJuIHsuLi5ibG9jaywgcmV0dXJuOiByZXR1cm5zfTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnY2FsbCd9LCBibG9jayA9PiBibG9jaylcbiAgICAud2l0aCh7a2luZDogJ21vZGVsJ30sIGJsb2NrID0+IHtcbiAgICAgIGlmIChibG9jay5pbnB1dCkge1xuICAgICAgICBjb25zdCBpbnB1dCA9IG1hcF9ibG9ja3MoZiwgYmxvY2suaW5wdXQpO1xuICAgICAgICBibG9jayA9IHsuLi5ibG9jaywgaW5wdXQ6IGlucHV0fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9jaztcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnY29kZSd9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gbWFwX2Jsb2NrcyhmLCBibG9jay5jb2RlKTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIGNvZGU6IGNvZGV9O1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdhcGknfSwgYmxvY2sgPT4ge1xuICAgICAgY29uc3QgaW5wdXQgPSBtYXBfYmxvY2tzKGYsIGJsb2NrLmlucHV0KTtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIGlucHV0OiBpbnB1dH07XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2dldCd9LCBibG9jayA9PiBibG9jaylcbiAgICAud2l0aCh7a2luZDogJ2RhdGEnfSwgYmxvY2sgPT4gYmxvY2spXG4gICAgLndpdGgoe2tpbmQ6ICdkb2N1bWVudCd9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCBkb2N1bWVudCA9IG1hcF9ibG9ja3MoZiwgYmxvY2suZG9jdW1lbnQpO1xuICAgICAgcmV0dXJuIHsuLi5ibG9jaywgZG9jdW1lbnQ6IGRvY3VtZW50fTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnaWYnfSwgYmxvY2sgPT4ge1xuICAgICAgY29uc3QgdGhlbl8gPSBtYXBfYmxvY2tzKGYsIGJsb2NrLnRoZW4pO1xuICAgICAgY29uc3QgZWxzZV8gPSBibG9jay5lbHNlID8gbWFwX2Jsb2NrcyhmLCBibG9jay5lbHNlKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB7Li4uYmxvY2ssIHRoZW46IHRoZW5fLCBlbHNlOiBlbHNlX307XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3JlcGVhdCd9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCByZXBlYXQgPSBtYXBfYmxvY2tzKGYsIGJsb2NrLnJlcGVhdCk7XG4gICAgICByZXR1cm4gey4uLmJsb2NrLCByZXBlYXQ6IHJlcGVhdH07XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3JlcGVhdF91bnRpbCd9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCByZXBlYXQgPSBtYXBfYmxvY2tzKGYsIGJsb2NrLnJlcGVhdCk7XG4gICAgICByZXR1cm4gey4uLmJsb2NrLCByZXBlYXQ6IHJlcGVhdH07XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2Zvcid9LCBibG9jayA9PiB7XG4gICAgICBjb25zdCByZXBlYXQgPSBtYXBfYmxvY2tzKGYsIGJsb2NrLnJlcGVhdCk7XG4gICAgICByZXR1cm4gey4uLmJsb2NrLCByZXBlYXQ6IHJlcGVhdH07XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2Vycm9yJ30sIGJsb2NrID0+IHtcbiAgICAgIGNvbnN0IGRvYyA9IG1hcF9ibG9ja3MoZiwgYmxvY2sucHJvZ3JhbSk7XG4gICAgICByZXR1cm4gey4uLmJsb2NrLCBwcm9ncmFtOiBkb2N9O1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdyZWFkJ30sIGJsb2NrID0+IGJsb2NrKVxuICAgIC53aXRoKHtraW5kOiAnaW5jbHVkZSd9LCBibG9jayA9PiBibG9jaylcbiAgICAud2l0aCh7a2luZDogdW5kZWZpbmVkfSwgYmxvY2sgPT4gYmxvY2spXG4gICAgLmV4aGF1c3RpdmUoKTtcbiAgbWF0Y2gobmV3X2Jsb2NrKVxuICAgIC53aXRoKHtwYXJzZXI6IHtwZGw6IFAuX319LCBibG9jayA9PiB7XG4gICAgICBibG9jay5wYXJzZXIucGRsID0gbWFwX2Jsb2NrcyhmLCBibG9jay5wYXJzZXIucGRsKTtcbiAgICB9KVxuICAgIC5vdGhlcndpc2UoKCkgPT4ge30pO1xuICBpZiAoYmxvY2suZmFsbGJhY2spIHtcbiAgICBibG9jay5mYWxsYmFjayA9IG1hcF9ibG9ja3MoZiwgYmxvY2suZmFsbGJhY2spO1xuICB9XG4gIHJldHVybiBuZXdfYmxvY2s7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBfYmxvY2tzKFxuICBmOiAoYmxvY2s6IFBkbEJsb2NrKSA9PiBQZGxCbG9jayxcbiAgYmxvY2tzOiBQZGxCbG9ja3Ncbik6IFBkbEJsb2NrcyB7XG4gIGJsb2NrcyA9IG1hdGNoKGJsb2NrcylcbiAgICAud2l0aChQLnN0cmluZywgcyA9PiBzKVxuICAgIC53aXRoKFAuYXJyYXkoUC5fKSwgc2VxdWVuY2UgPT4gc2VxdWVuY2UubWFwKGRvYyA9PiBmKGRvYykpKVxuICAgIC5vdGhlcndpc2UoYmxvY2sgPT4gZihibG9jaykpO1xuICByZXR1cm4gYmxvY2tzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXRlcl9ibG9ja19jaGlsZHJlbihcbiAgZjogKGJsb2NrOiBQZGxCbG9jaykgPT4gdm9pZCxcbiAgYmxvY2s6IFBkbEJsb2NrXG4pOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBibG9jayA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGJsb2NrPy5kZWZzKSB7XG4gICAgZm9yIChjb25zdCB4IGluIGJsb2NrLmRlZnMpIHtcbiAgICAgIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLmRlZnNbeF0pO1xuICAgIH1cbiAgfVxuICBtYXRjaChibG9jaylcbiAgICAud2l0aChQLnN0cmluZywgKCkgPT4ge30pXG4gICAgLndpdGgoe2tpbmQ6ICdlbXB0eSd9LCAoKSA9PiB7fSlcbiAgICAud2l0aCh7a2luZDogJ2Z1bmN0aW9uJ30sIGJsb2NrID0+IHtcbiAgICAgIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLnJldHVybik7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2NhbGwnfSwgKCkgPT4ge30pXG4gICAgLndpdGgoe2tpbmQ6ICdtb2RlbCd9LCBibG9jayA9PiB7XG4gICAgICBpZiAoYmxvY2suaW5wdXQpIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLmlucHV0KTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnY29kZSd9LCBibG9jayA9PiB7XG4gICAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5jb2RlKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnYXBpJ30sIGJsb2NrID0+IHtcbiAgICAgIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLmlucHV0KTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZ2V0J30sICgpID0+IHt9KVxuICAgIC53aXRoKHtraW5kOiAnZGF0YSd9LCAoKSA9PiB7fSlcbiAgICAud2l0aCh7a2luZDogJ2RvY3VtZW50J30sIGJsb2NrID0+IHtcbiAgICAgIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLmRvY3VtZW50KTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnaWYnfSwgYmxvY2sgPT4ge1xuICAgICAgaWYgKGJsb2NrLnRoZW4pIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLnRoZW4pO1xuICAgICAgaWYgKGJsb2NrLmVsc2UpIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLmVsc2UpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdyZXBlYXQnfSwgYmxvY2sgPT4ge1xuICAgICAgaXRlcl9ibG9ja3MoZiwgYmxvY2sucmVwZWF0KTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAncmVwZWF0X3VudGlsJ30sIGJsb2NrID0+IHtcbiAgICAgIGl0ZXJfYmxvY2tzKGYsIGJsb2NrLnJlcGVhdCk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2Zvcid9LCBibG9jayA9PiB7XG4gICAgICBpdGVyX2Jsb2NrcyhmLCBibG9jay5yZXBlYXQpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdlcnJvcid9LCBibG9jayA9PiBpdGVyX2Jsb2NrcyhmLCBibG9jay5wcm9ncmFtKSlcbiAgICAud2l0aCh7a2luZDogJ3JlYWQnfSwgKCkgPT4ge30pXG4gICAgLndpdGgoe2tpbmQ6ICdpbmNsdWRlJ30sICgpID0+IHt9KVxuICAgIC53aXRoKHtraW5kOiB1bmRlZmluZWR9LCAoKSA9PiB7fSlcbiAgICAuZXhoYXVzdGl2ZSgpO1xuICBtYXRjaChibG9jaylcbiAgICAud2l0aCh7cGFyc2VyOiB7cGRsOiBQLl99fSwgYmxvY2sgPT4ge1xuICAgICAgaXRlcl9ibG9ja3MoZiwgYmxvY2sucGFyc2VyLnBkbCk7XG4gICAgfSlcbiAgICAub3RoZXJ3aXNlKCgpID0+IHt9KTtcbiAgaWYgKGJsb2NrLmZhbGxiYWNrKSB7XG4gICAgaXRlcl9ibG9ja3MoZiwgYmxvY2suZmFsbGJhY2spO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpdGVyX2Jsb2NrcyhcbiAgZjogKGJsb2NrOiBQZGxCbG9jaykgPT4gdm9pZCxcbiAgYmxvY2tzOiBQZGxCbG9ja3Ncbik6IHZvaWQge1xuICBtYXRjaChibG9ja3MpXG4gICAgLndpdGgoUC5zdHJpbmcsICgpID0+IHt9KVxuICAgIC53aXRoKFAuYXJyYXkoUC5fKSwgc2VxdWVuY2UgPT4ge1xuICAgICAgc2VxdWVuY2UuZm9yRWFjaChkb2MgPT4gaXRlcl9ibG9ja3MoZiwgZG9jKSk7XG4gICAgfSlcbiAgICAub3RoZXJ3aXNlKGJsb2NrID0+IGYoYmxvY2spKTtcbn1cbiIsImltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICd5YW1sJztcbmltcG9ydCB7UGRsQmxvY2tzLCBQZGxCbG9ja30gZnJvbSAnLi9wZGxfYXN0JztcbmltcG9ydCB7bWF0Y2gsIFB9IGZyb20gJ3RzLXBhdHRlcm4nO1xuaW1wb3J0IHttYXBfYmxvY2tfY2hpbGRyZW59IGZyb20gJy4vcGRsX2FzdF91dGlscyc7XG5cbmV4cG9ydCBjb25zdCBoZWxsbyA9IHtcbiAga2luZDogJ2RvY3VtZW50JyxcbiAgZGVzY3JpcHRpb246ICdIZWxsbyB3b3JsZCB0byBjYWxsIGludG8gYSBtb2RlbCcsXG4gIGRvY3VtZW50OiBbXG4gICAgJ0hlbGxvLCcsXG4gICAge1xuICAgICAga2luZDogJ21vZGVsJyxcbiAgICAgIG1vZGVsOiAnaWJtL2dyYW5pdGUtMjBiLWNvZGUtaW5zdHJ1Y3QtdjInLFxuICAgICAgcGFyYW1ldGVyczpcbiAgICAgICAgJ3tcImJlYW1fd2lkdGhcIjpudWxsLFwiZGVjb2RpbmdfbWV0aG9kXCI6XCJncmVlZHlcIixcImluY2x1ZGVfc3RvcF9zZXF1ZW5jZVwiOnRydWUsXCJsZW5ndGhfcGVuYWx0eVwiOm51bGwsXCJtYXhfbmV3X3Rva2Vuc1wiOjEwMjQsXCJtaW5fbmV3X3Rva2Vuc1wiOjEsXCJyYW5kb21fc2VlZFwiOm51bGwsXCJyZXBldGl0aW9uX3BlbmFsdHlcIjoxLjA3LFwicmV0dXJuX29wdGlvbnNcIjpudWxsLFwic3RvcF9zZXF1ZW5jZXNcIjpbXCIhXCJdLFwidGVtcGVyYXR1cmVcIjpudWxsLFwidGltZV9saW1pdFwiOm51bGwsXCJ0b3Bfa1wiOm51bGwsXCJ0b3BfcFwiOm51bGwsXCJ0cnVuY2F0ZV9pbnB1dF90b2tlbnNcIjpudWxsLFwidHlwaWNhbF9wXCI6bnVsbH0nLFxuICAgICAgcmVzdWx0OiAnIHdvcmxkIScsXG4gICAgfSxcbiAgXSxcbiAgcmVzdWx0OiAnSGVsbG8sIHdvcmxkIScsXG59O1xuXG5leHBvcnQgY29uc3QgZGF0YSA9IGhlbGxvO1xuXG5leHBvcnQgZnVuY3Rpb24gc2hvd19vdXRwdXQoZGF0YTogUGRsQmxvY2tzKSB7XG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkaXYuY2xhc3NMaXN0LmFkZCgncGRsX2Jsb2NrJyk7XG4gIG1hdGNoKGRhdGEpXG4gICAgLndpdGgoUC5zdHJpbmcsIG91dHB1dCA9PiB7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gaHRtbGl6ZShvdXRwdXQpO1xuICAgIH0pXG4gICAgLndpdGgoe3Nob3dfcmVzdWx0OiBmYWxzZX0sICgpID0+IHtcbiAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdwZGxfc2hvd19yZXN1bHRfZmFsc2UnKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSAn4piQJztcbiAgICB9KVxuICAgIC53aXRoKHtyZXN1bHQ6IFAuc3RyaW5nfSwgZGF0YSA9PiB7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gaHRtbGl6ZShkYXRhLnJlc3VsdCk7XG4gICAgfSlcbiAgICAub3RoZXJ3aXNlKCgpID0+IHtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSAn4piQJztcbiAgICB9KTtcbiAgc3dpdGNoX2Rpdl9vbl9jbGljayhkaXYsIHNob3dfYmxvY2tzLCBkYXRhKTtcbiAgcmV0dXJuIGRpdjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dfYmxvY2tzKGJsb2NrczogUGRsQmxvY2tzKSB7XG4gIGNvbnN0IGRvY19mcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbWF0Y2goYmxvY2tzKVxuICAgIC53aXRoKFAuYXJyYXkoUC5fKSwgZGF0YSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGRvYyBvZiBkYXRhKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gc2hvd19ibG9ja3MoZG9jKTtcbiAgICAgICAgZG9jX2ZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5vdGhlcndpc2UoYmxvY2sgPT4ge1xuICAgICAgY29uc3QgY2hpbGQgPSBzaG93X2Jsb2NrKGJsb2NrKTtcbiAgICAgIGRvY19mcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgfSk7XG4gIHJldHVybiBkb2NfZnJhZ21lbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93X2Jsb2NrKGRhdGE6IFBkbEJsb2NrKSB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc2hvd19vdXRwdXQoZGF0YSk7XG4gIH1cbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHN3aXRjaF9kaXZfb25fY2xpY2soZGl2LCBzaG93X291dHB1dCwgZGF0YSk7XG4gIGRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBlID0+IHtcbiAgICB1cGRhdGVfY29kZShkYXRhKTtcbiAgICBpZiAoZS5zdG9wUHJvcGFnYXRpb24pIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0pO1xuICBpZiAoZGF0YS5kZWZzKSB7XG4gICAgZGl2LmFwcGVuZENoaWxkKHNob3dfZGVmcyhkYXRhLmRlZnMpKTtcbiAgfVxuICBjb25zdCBib2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmllbGRzZXQnKTtcbiAgZGl2LmFwcGVuZENoaWxkKGJvZHkpO1xuICBhZGRfZGVmKGJvZHksIGRhdGEuZGVmKTtcbiAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfYmxvY2snKTtcbiAgaWYgKGRhdGE/LnNob3dfcmVzdWx0ID09PSBmYWxzZSkge1xuICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX3Nob3dfcmVzdWx0X2ZhbHNlJyk7XG4gIH1cbiAgbWF0Y2goZGF0YSlcbiAgICAud2l0aCh7a2luZDogJ21vZGVsJ30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfbW9kZWwnKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19yZXN1bHRfb3JfY29kZShkYXRhKSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2NvZGUnfSwgZGF0YSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9jb2RlJyk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKHNob3dfcmVzdWx0X29yX2NvZGUoZGF0YSkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdhcGknfSwgZGF0YSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9hcGknKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19yZXN1bHRfb3JfY29kZShkYXRhKSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2dldCd9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2dldCcpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChzaG93X3Jlc3VsdF9vcl9jb2RlKGRhdGEpKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZGF0YSd9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2RhdGEnKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19yZXN1bHRfb3JfY29kZShkYXRhKSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2lmJ30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfaWYnKTtcbiAgICAgIGlmIChkYXRhLmlmX3Jlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19yZXN1bHRfb3JfY29kZShkYXRhKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaWZfY2hpbGQ6IERvY3VtZW50RnJhZ21lbnQ7XG4gICAgICAgIGlmIChkYXRhLmlmX3Jlc3VsdCkge1xuICAgICAgICAgIGlmX2NoaWxkID0gc2hvd19ibG9ja3MoZGF0YT8udGhlbiA/PyAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWZfY2hpbGQgPSBzaG93X2Jsb2NrcyhkYXRhPy5lbHNlID8/ICcnKTtcbiAgICAgICAgfVxuICAgICAgICBib2R5LmFwcGVuZENoaWxkKGlmX2NoaWxkKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAncmVhZCd9LCBkYXRhID0+IHtcbiAgICAgIC8vIFRPRE9cbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX3JlYWQnKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19yZXN1bHRfb3JfY29kZShkYXRhKSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2luY2x1ZGUnfSwgZGF0YSA9PiB7XG4gICAgICAvLyBUT0RPXG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9pbmNsdWRlJyk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKHNob3dfcmVzdWx0X29yX2NvZGUoZGF0YSkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdmdW5jdGlvbid9LCBkYXRhID0+IHtcbiAgICAgIC8vIFRPRE9cbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2Z1bmN0aW9uJyk7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9zaG93X3Jlc3VsdF9mYWxzZScpO1xuICAgICAgY29uc3QgYXJncyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICAgICAgYXJncy5pbm5lckhUTUwgPSBodG1saXplKHN0cmluZ2lmeSh7ZnVuY3Rpb246IGRhdGEuZnVuY3Rpb259KSk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKGFyZ3MpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChzaG93X2Jsb2NrcyhkYXRhLnJldHVybikpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdjYWxsJ30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfY2FsbCcpO1xuICAgICAgaWYgKGRhdGEudHJhY2UpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICAgICAgICBhcmdzLmlubmVySFRNTCA9IGh0bWxpemUoc3RyaW5naWZ5KHtjYWxsOiBkYXRhLmNhbGwsIGFyZ3M6IGRhdGEuYXJnc30pKTtcbiAgICAgICAgYm9keS5hcHBlbmRDaGlsZChhcmdzKTtcbiAgICAgICAgYm9keS5hcHBlbmRDaGlsZChzaG93X2Jsb2NrcyhkYXRhLnRyYWNlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib2R5LmFwcGVuZENoaWxkKHNob3dfcmVzdWx0X29yX2NvZGUoZGF0YSkpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdkb2N1bWVudCd9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX2RvY3VtZW50Jyk7XG4gICAgICBjb25zdCBkb2NfY2hpbGQgPSBzaG93X2Jsb2NrcyhkYXRhLmRvY3VtZW50KTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoZG9jX2NoaWxkKTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAncmVwZWF0J30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfcmVwZWF0Jyk7XG4gICAgICBjb25zdCBsb29wX2JvZHkgPSBzaG93X2xvb3BfdHJhY2UoZGF0YT8udHJhY2UgPz8gW2RhdGEucmVwZWF0XSk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKGxvb3BfYm9keSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ3JlcGVhdF91bnRpbCd9LCBkYXRhID0+IHtcbiAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgncGRsX3JlcGVhdF91bnRpbCcpO1xuICAgICAgY29uc3QgbG9vcF9ib2R5ID0gc2hvd19sb29wX3RyYWNlKGRhdGE/LnRyYWNlID8/IFtkYXRhLnJlcGVhdF0pO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChsb29wX2JvZHkpO1xuICAgIH0pXG4gICAgLndpdGgoe2tpbmQ6ICdmb3InfSwgZGF0YSA9PiB7XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3BkbF9mb3InKTtcbiAgICAgIGNvbnN0IGxvb3BfYm9keSA9IHNob3dfbG9vcF90cmFjZShkYXRhPy50cmFjZSA/PyBbZGF0YS5yZXBlYXRdKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQobG9vcF9ib2R5KTtcbiAgICB9KVxuICAgIC53aXRoKHtraW5kOiAnZW1wdHknfSwgKCkgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfZW1wdHknKTtcbiAgICAgIGJvZHkuaW5uZXJIVE1MID0gaHRtbGl6ZSgnJyk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogJ2Vycm9yJ30sIGRhdGEgPT4ge1xuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdwZGxfZXJyb3InKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoc2hvd19yZXN1bHRfb3JfY29kZShkYXRhKSk7XG4gICAgfSlcbiAgICAud2l0aCh7a2luZDogdW5kZWZpbmVkfSwgKCkgPT4ge1xuICAgICAgdGhyb3cgRXJyb3IoJ01pc3Npbmcga2luZDpcXG4nICsgaHRtbGl6ZShkYXRhKSk7XG4gICAgfSlcbiAgICAuZXhoYXVzdGl2ZSgpO1xuICByZXR1cm4gZGl2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd19kZWZzKGRlZnM6IHtbazogc3RyaW5nXTogUGRsQmxvY2tzfSk6IERvY3VtZW50RnJhZ21lbnQge1xuICBjb25zdCBkb2NfZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGZvciAoY29uc3QgeCBpbiBkZWZzKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmllbGRzZXQnKTtcbiAgICBkb2NfZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZCgncGRsX3Nob3dfcmVzdWx0X2ZhbHNlJyk7XG4gICAgYWRkX2RlZihkaXYsIHgpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChzaG93X2Jsb2NrcyhkZWZzW3hdKSk7XG4gIH1cbiAgcmV0dXJuIGRvY19mcmFnbWVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dfbG9vcF90cmFjZSh0cmFjZTogUGRsQmxvY2tzW10pOiBEb2N1bWVudEZyYWdtZW50IHtcbiAgY29uc3QgZG9jX2ZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBpZiAodHJhY2UubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGRvdF9kb3RfZG90ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZG90X2RvdF9kb3QuaW5uZXJIVE1MID0gJ8K3wrfCtyc7XG4gICAgZG90X2RvdF9kb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgIGRvdF9kb3RfZG90LnJlcGxhY2VXaXRoKHNob3dfbG9vcF90cmFjZSh0cmFjZS5zbGljZSgwLCAtMSkpKTtcbiAgICAgIGlmIChlLnN0b3BQcm9wYWdhdGlvbikgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9KTtcbiAgICBkb2NfZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZG90X2RvdF9kb3QpO1xuICB9XG4gIGlmICh0cmFjZS5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgaXRlcmF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaXRlcmF0aW9uLmNsYXNzTGlzdC5hZGQoJ3BkbF9ibG9jaycsICdwZGxfc2VxdWVuY2UnKTtcbiAgICBjb25zdCBjaGlsZCA9IHNob3dfYmxvY2tzKHRyYWNlLnNsaWNlKC0xKVswXSk7XG4gICAgaXRlcmF0aW9uLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICBkb2NfZnJhZ21lbnQuYXBwZW5kQ2hpbGQoaXRlcmF0aW9uKTtcbiAgfVxuICByZXR1cm4gZG9jX2ZyYWdtZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkX2RlZihibG9ja19kaXY6IEVsZW1lbnQsIG5hbWU6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpIHtcbiAgaWYgKG5hbWUpIHtcbiAgICBjb25zdCBsZWdlbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsZWdlbmQnKTtcbiAgICBsZWdlbmQuaW5uZXJIVE1MID0gbmFtZTtcbiAgICBibG9ja19kaXYuYXBwZW5kQ2hpbGQobGVnZW5kKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd19jb2RlKGJsb2NrczogUGRsQmxvY2tzKSB7XG4gIGNvbnN0IGNvZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbiAgYmxvY2tzID0gYmxvY2tzX2NvZGVfY2xlYW51cChibG9ja3MpO1xuICBjb2RlLmlubmVySFRNTCA9IGh0bWxpemUoc3RyaW5naWZ5KGJsb2NrcykpO1xuICByZXR1cm4gY29kZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9jb2RlKGJsb2NrczogUGRsQmxvY2tzKSB7XG4gIGNvbnN0IGNvZGUgPSBzaG93X2NvZGUoYmxvY2tzKTtcbiAgcmVwbGFjZV9kaXYoJ2NvZGUnLCBjb2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dfcmVzdWx0X29yX2NvZGUoYmxvY2s6IFBkbEJsb2NrKTogRWxlbWVudCB7XG4gIGNvbnN0IGRpdjogRWxlbWVudCA9IG1hdGNoKGJsb2NrKVxuICAgIC53aXRoKFAuc3RyaW5nLCBkYXRhID0+IHNob3dfc3RyaW5nKGRhdGEpKVxuICAgIC53aXRoKHtyZXN1bHQ6IFAuc3RyaW5nfSwgZGF0YSA9PiBzaG93X3N0cmluZyhkYXRhLnJlc3VsdCkpXG4gICAgLm90aGVyd2lzZShkYXRhID0+IHNob3dfY29kZShkYXRhKSk7XG4gIHJldHVybiBkaXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93X3N0cmluZyhzOiBzdHJpbmcpIHtcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5pbm5lckhUTUwgPSBodG1saXplKHMpO1xuICByZXR1cm4gZGl2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tzX2NvZGVfY2xlYW51cChkYXRhOiBQZGxCbG9ja3MpOiBQZGxCbG9ja3Mge1xuICBjb25zdCBuZXdfZGF0YSA9IG1hdGNoKGRhdGEpXG4gICAgLndpdGgoUC5hcnJheShQLl8pLCBkYXRhID0+IGRhdGEubWFwKGJsb2NrX2NvZGVfY2xlYW51cCkpXG4gICAgLm90aGVyd2lzZShkYXRhID0+IGJsb2NrX2NvZGVfY2xlYW51cChkYXRhKSk7XG4gIHJldHVybiBuZXdfZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrX2NvZGVfY2xlYW51cChkYXRhOiBzdHJpbmcgfCBQZGxCbG9jayk6IHN0cmluZyB8IFBkbEJsb2NrIHtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBkYXRhO1xuICB9XG4gIC8vIHJlbW92ZSByZXN1bHRcbiAgY29uc3QgbmV3X2RhdGEgPSB7Li4uZGF0YSwgcmVzdWx0OiB1bmRlZmluZWR9O1xuICAvLyByZW1vdmUgdHJhY2VcbiAgbWF0Y2gobmV3X2RhdGEpLndpdGgoe3RyYWNlOiBQLl99LCBkYXRhID0+IHtcbiAgICBkYXRhLnRyYWNlID0gdW5kZWZpbmVkO1xuICB9KTtcbiAgLy8gcmVtb3ZlIHNob3dfcmVzdWx0OiB0cnVlXG4gIGlmIChuZXdfZGF0YT8uc2hvd19yZXN1bHQpIHtcbiAgICBuZXdfZGF0YS5zaG93X3Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgfVxuICAvLyByZW1vdmUgZW1wdHkgZGVmcyBsaXN0XG4gIGlmIChPYmplY3Qua2V5cyhkYXRhPy5kZWZzID8/IHt9KS5sZW5ndGggPT09IDApIHtcbiAgICBuZXdfZGF0YS5kZWZzID0gdW5kZWZpbmVkO1xuICB9XG4gIC8vIHJlbW92ZSBsb2NhdGlvbiBpbmZvXG4gIG5ld19kYXRhLmxvY2F0aW9uID0gdW5kZWZpbmVkO1xuICAvLyByZWN1cnNpdmUgY2xlYW51cFxuICByZXR1cm4gbWFwX2Jsb2NrX2NoaWxkcmVuKGJsb2NrX2NvZGVfY2xlYW51cCwgbmV3X2RhdGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZV9kaXYoaWQ6IHN0cmluZywgZWxlbTogRWxlbWVudCkge1xuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LmlkID0gaWQ7XG4gIGRpdi5hcHBlbmRDaGlsZChlbGVtKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpPy5yZXBsYWNlV2l0aChkaXYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHRtbGl6ZSh4OiB1bmtub3duKTogc3RyaW5nIHtcbiAgY29uc3QgaHRtbCA9IG1hdGNoKHgpXG4gICAgLndpdGgoUC5udWxsaXNoLCAoKSA9PiAn4piQJylcbiAgICAud2l0aChQLnN0cmluZywgcyA9PiB7XG4gICAgICBpZiAocyA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuICfimJAnO1xuICAgICAgfVxuICAgICAgcyA9IHNcbiAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgLnJlcGxhY2UoLycvZywgJyYjMzk7Jyk7XG4gICAgICBzID0gcy5zcGxpdCgnXFxuJykuam9pbignPGJyPicpO1xuICAgICAgcmV0dXJuIHM7XG4gICAgfSlcbiAgICAub3RoZXJ3aXNlKHggPT4gaHRtbGl6ZShKU09OLnN0cmluZ2lmeSh4KSkpO1xuICByZXR1cm4gaHRtbDtcbn1cblxuZnVuY3Rpb24gc3dpdGNoX2Rpdl9vbl9jbGljayhcbiAgZGl2OiBFbGVtZW50LFxuICBzaG93OiAoZGF0YTogUGRsQmxvY2tzKSA9PiBzdHJpbmcgfCBOb2RlLFxuICBkYXRhOiBQZGxCbG9ja3Ncbikge1xuICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICBkaXYucmVwbGFjZVdpdGgoc2hvdyhkYXRhKSk7XG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9KTtcbn1cbiIsImZ1bmN0aW9uIG4obix0KXsobnVsbD09dHx8dD5uLmxlbmd0aCkmJih0PW4ubGVuZ3RoKTtmb3IodmFyIHI9MCxlPW5ldyBBcnJheSh0KTtyPHQ7cisrKWVbcl09bltyXTtyZXR1cm4gZX1mdW5jdGlvbiB0KHQscil7dmFyIGU9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmdFtTeW1ib2wuaXRlcmF0b3JdfHx0W1wiQEBpdGVyYXRvclwiXTtpZihlKXJldHVybihlPWUuY2FsbCh0KSkubmV4dC5iaW5kKGUpO2lmKEFycmF5LmlzQXJyYXkodCl8fChlPWZ1bmN0aW9uKHQscil7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIG4odCxyKTt2YXIgZT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PWUmJnQuY29uc3RydWN0b3ImJihlPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PWV8fFwiU2V0XCI9PT1lP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PWV8fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KGUpP24odCxyKTp2b2lkIDB9fSh0KSl8fHImJnQmJlwibnVtYmVyXCI9PXR5cGVvZiB0Lmxlbmd0aCl7ZSYmKHQ9ZSk7dmFyIHU9MDtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gdT49dC5sZW5ndGg/e2RvbmU6ITB9Ontkb25lOiExLHZhbHVlOnRbdSsrXX19fXRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gaXRlcmF0ZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX12YXIgcj1TeW1ib2wuZm9yKFwiQHRzLXBhdHRlcm4vbWF0Y2hlclwiKSxlPVN5bWJvbC5mb3IoXCJAdHMtcGF0dGVybi9pc1ZhcmlhZGljXCIpLHU9XCJAdHMtcGF0dGVybi9hbm9ueW1vdXMtc2VsZWN0LWtleVwiLGk9ZnVuY3Rpb24obil7cmV0dXJuIEJvb2xlYW4obiYmXCJvYmplY3RcIj09dHlwZW9mIG4pfSxvPWZ1bmN0aW9uKG4pe3JldHVybiBuJiYhIW5bcl19LGM9ZnVuY3Rpb24gbih1LGMsYSl7aWYobyh1KSl7dmFyIGY9dVtyXSgpLm1hdGNoKGMpLHM9Zi5tYXRjaGVkLGw9Zi5zZWxlY3Rpb25zO3JldHVybiBzJiZsJiZPYmplY3Qua2V5cyhsKS5mb3JFYWNoKGZ1bmN0aW9uKG4pe3JldHVybiBhKG4sbFtuXSl9KSxzfWlmKGkodSkpe2lmKCFpKGMpKXJldHVybiExO2lmKEFycmF5LmlzQXJyYXkodSkpe2lmKCFBcnJheS5pc0FycmF5KGMpKXJldHVybiExO2Zvcih2YXIgaCx2PVtdLGc9W10sbT1bXSxkPXQodS5rZXlzKCkpOyEoaD1kKCkpLmRvbmU7KXt2YXIgeT11W2gudmFsdWVdO28oeSkmJnlbZV0/bS5wdXNoKHkpOm0ubGVuZ3RoP2cucHVzaCh5KTp2LnB1c2goeSl9aWYobS5sZW5ndGgpe2lmKG0ubGVuZ3RoPjEpdGhyb3cgbmV3IEVycm9yKFwiUGF0dGVybiBlcnJvcjogVXNpbmcgYC4uLlAuYXJyYXkoLi4uKWAgc2V2ZXJhbCB0aW1lcyBpbiBhIHNpbmdsZSBwYXR0ZXJuIGlzIG5vdCBhbGxvd2VkLlwiKTtpZihjLmxlbmd0aDx2Lmxlbmd0aCtnLmxlbmd0aClyZXR1cm4hMTt2YXIgcD1jLnNsaWNlKDAsdi5sZW5ndGgpLGI9MD09PWcubGVuZ3RoP1tdOmMuc2xpY2UoLWcubGVuZ3RoKSx3PWMuc2xpY2Uodi5sZW5ndGgsMD09PWcubGVuZ3RoP0luZmluaXR5Oi1nLmxlbmd0aCk7cmV0dXJuIHYuZXZlcnkoZnVuY3Rpb24odCxyKXtyZXR1cm4gbih0LHBbcl0sYSl9KSYmZy5ldmVyeShmdW5jdGlvbih0LHIpe3JldHVybiBuKHQsYltyXSxhKX0pJiYoMD09PW0ubGVuZ3RofHxuKG1bMF0sdyxhKSl9cmV0dXJuIHUubGVuZ3RoPT09Yy5sZW5ndGgmJnUuZXZlcnkoZnVuY3Rpb24odCxyKXtyZXR1cm4gbih0LGNbcl0sYSl9KX1yZXR1cm4gT2JqZWN0LmtleXModSkuZXZlcnkoZnVuY3Rpb24odCl7dmFyIGUsaT11W3RdO3JldHVybih0IGluIGN8fG8oZT1pKSYmXCJvcHRpb25hbFwiPT09ZVtyXSgpLm1hdGNoZXJUeXBlKSYmbihpLGNbdF0sYSl9KX1yZXR1cm4gT2JqZWN0LmlzKGMsdSl9LGE9ZnVuY3Rpb24gbih0KXt2YXIgZSx1LGM7cmV0dXJuIGkodCk/byh0KT9udWxsIT0oZT1udWxsPT0odT0oYz10W3JdKCkpLmdldFNlbGVjdGlvbktleXMpP3ZvaWQgMDp1LmNhbGwoYykpP2U6W106QXJyYXkuaXNBcnJheSh0KT9mKHQsbik6ZihPYmplY3QudmFsdWVzKHQpLG4pOltdfSxmPWZ1bmN0aW9uKG4sdCl7cmV0dXJuIG4ucmVkdWNlKGZ1bmN0aW9uKG4scil7cmV0dXJuIG4uY29uY2F0KHQocikpfSxbXSl9O2Z1bmN0aW9uIHMoKXt2YXIgbj1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7aWYoMT09PW4ubGVuZ3RoKXt2YXIgdD1uWzBdO3JldHVybiBmdW5jdGlvbihuKXtyZXR1cm4gYyh0LG4sZnVuY3Rpb24oKXt9KX19aWYoMj09PW4ubGVuZ3RoKXJldHVybiBjKG5bMF0sblsxXSxmdW5jdGlvbigpe30pO3Rocm93IG5ldyBFcnJvcihcImlzTWF0Y2hpbmcgd2Fzbid0IGdpdmVuIHRoZSByaWdodCBudW1iZXIgb2YgYXJndW1lbnRzOiBleHBlY3RlZCAxIG9yIDIsIHJlY2VpdmVkIFwiK24ubGVuZ3RoK1wiLlwiKX1mdW5jdGlvbiBsKG4pe3JldHVybiBPYmplY3QuYXNzaWduKG4se29wdGlvbmFsOmZ1bmN0aW9uKCl7cmV0dXJuIHYobil9LGFuZDpmdW5jdGlvbih0KXtyZXR1cm4gZChuLHQpfSxvcjpmdW5jdGlvbih0KXtyZXR1cm4geShuLHQpfSxzZWxlY3Q6ZnVuY3Rpb24odCl7cmV0dXJuIHZvaWQgMD09PXQ/YihuKTpiKHQsbil9fSl9ZnVuY3Rpb24gaChuKXtyZXR1cm4gT2JqZWN0LmFzc2lnbihmdW5jdGlvbihuKXt2YXIgdDtyZXR1cm4gT2JqZWN0LmFzc2lnbihuLCgodD17fSlbU3ltYm9sLml0ZXJhdG9yXT1mdW5jdGlvbigpe3ZhciB0LHI9MCx1PVt7dmFsdWU6T2JqZWN0LmFzc2lnbihuLCgodD17fSlbZV09ITAsdCkpLGRvbmU6ITF9LHtkb25lOiEwLHZhbHVlOnZvaWQgMH1dO3JldHVybntuZXh0OmZ1bmN0aW9uKCl7dmFyIG47cmV0dXJuIG51bGwhPShuPXVbcisrXSk/bjp1LmF0KC0xKX19fSx0KSl9KG4pLHtvcHRpb25hbDpmdW5jdGlvbigpe3JldHVybiBoKHYobikpfSxzZWxlY3Q6ZnVuY3Rpb24odCl7cmV0dXJuIGgodm9pZCAwPT09dD9iKG4pOmIodCxuKSl9fSl9ZnVuY3Rpb24gdihuKXt2YXIgdDtyZXR1cm4gbCgoKHQ9e30pW3JdPWZ1bmN0aW9uKCl7cmV0dXJue21hdGNoOmZ1bmN0aW9uKHQpe3ZhciByPXt9LGU9ZnVuY3Rpb24obix0KXtyW25dPXR9O3JldHVybiB2b2lkIDA9PT10PyhhKG4pLmZvckVhY2goZnVuY3Rpb24obil7cmV0dXJuIGUobix2b2lkIDApfSkse21hdGNoZWQ6ITAsc2VsZWN0aW9uczpyfSk6e21hdGNoZWQ6YyhuLHQsZSksc2VsZWN0aW9uczpyfX0sZ2V0U2VsZWN0aW9uS2V5czpmdW5jdGlvbigpe3JldHVybiBhKG4pfSxtYXRjaGVyVHlwZTpcIm9wdGlvbmFsXCJ9fSx0KSl9dmFyIGc9ZnVuY3Rpb24obixyKXtmb3IodmFyIGUsdT10KG4pOyEoZT11KCkpLmRvbmU7KWlmKCFyKGUudmFsdWUpKXJldHVybiExO3JldHVybiEwfSxtPWZ1bmN0aW9uKG4scil7Zm9yKHZhciBlLHU9dChuLmVudHJpZXMoKSk7IShlPXUoKSkuZG9uZTspe3ZhciBpPWUudmFsdWU7aWYoIXIoaVsxXSxpWzBdKSlyZXR1cm4hMX1yZXR1cm4hMH07ZnVuY3Rpb24gZCgpe3ZhciBuLHQ9W10uc2xpY2UuY2FsbChhcmd1bWVudHMpO3JldHVybiBsKCgobj17fSlbcl09ZnVuY3Rpb24oKXtyZXR1cm57bWF0Y2g6ZnVuY3Rpb24obil7dmFyIHI9e30sZT1mdW5jdGlvbihuLHQpe3Jbbl09dH07cmV0dXJue21hdGNoZWQ6dC5ldmVyeShmdW5jdGlvbih0KXtyZXR1cm4gYyh0LG4sZSl9KSxzZWxlY3Rpb25zOnJ9fSxnZXRTZWxlY3Rpb25LZXlzOmZ1bmN0aW9uKCl7cmV0dXJuIGYodCxhKX0sbWF0Y2hlclR5cGU6XCJhbmRcIn19LG4pKX1mdW5jdGlvbiB5KCl7dmFyIG4sdD1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIGwoKChuPXt9KVtyXT1mdW5jdGlvbigpe3JldHVybnttYXRjaDpmdW5jdGlvbihuKXt2YXIgcj17fSxlPWZ1bmN0aW9uKG4sdCl7cltuXT10fTtyZXR1cm4gZih0LGEpLmZvckVhY2goZnVuY3Rpb24obil7cmV0dXJuIGUobix2b2lkIDApfSkse21hdGNoZWQ6dC5zb21lKGZ1bmN0aW9uKHQpe3JldHVybiBjKHQsbixlKX0pLHNlbGVjdGlvbnM6cn19LGdldFNlbGVjdGlvbktleXM6ZnVuY3Rpb24oKXtyZXR1cm4gZih0LGEpfSxtYXRjaGVyVHlwZTpcIm9yXCJ9fSxuKSl9ZnVuY3Rpb24gcChuKXt2YXIgdDtyZXR1cm4odD17fSlbcl09ZnVuY3Rpb24oKXtyZXR1cm57bWF0Y2g6ZnVuY3Rpb24odCl7cmV0dXJue21hdGNoZWQ6Qm9vbGVhbihuKHQpKX19fX0sdH1mdW5jdGlvbiBiKCl7dmFyIG4sdD1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyksZT1cInN0cmluZ1wiPT10eXBlb2YgdFswXT90WzBdOnZvaWQgMCxpPTI9PT10Lmxlbmd0aD90WzFdOlwic3RyaW5nXCI9PXR5cGVvZiB0WzBdP3ZvaWQgMDp0WzBdO3JldHVybiBsKCgobj17fSlbcl09ZnVuY3Rpb24oKXtyZXR1cm57bWF0Y2g6ZnVuY3Rpb24obil7dmFyIHQscj0oKHQ9e30pW251bGwhPWU/ZTp1XT1uLHQpO3JldHVybnttYXRjaGVkOnZvaWQgMD09PWl8fGMoaSxuLGZ1bmN0aW9uKG4sdCl7cltuXT10fSksc2VsZWN0aW9uczpyfX0sZ2V0U2VsZWN0aW9uS2V5czpmdW5jdGlvbigpe3JldHVybltudWxsIT1lP2U6dV0uY29uY2F0KHZvaWQgMD09PWk/W106YShpKSl9fX0sbikpfWZ1bmN0aW9uIHcobil7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIG59ZnVuY3Rpb24gUyhuKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2Ygbn1mdW5jdGlvbiBqKG4pe3JldHVyblwiYmlnaW50XCI9PXR5cGVvZiBufXZhciBPPWwocChmdW5jdGlvbihuKXtyZXR1cm4hMH0pKSxBPU8seD1mdW5jdGlvbiBuKHQpe3JldHVybiBPYmplY3QuYXNzaWduKGwodCkse3N0YXJ0c1dpdGg6ZnVuY3Rpb24ocil7cmV0dXJuIG4oZCh0LChlPXIscChmdW5jdGlvbihuKXtyZXR1cm4gUyhuKSYmbi5zdGFydHNXaXRoKGUpfSkpKSk7dmFyIGV9LGVuZHNXaXRoOmZ1bmN0aW9uKHIpe3JldHVybiBuKGQodCwoZT1yLHAoZnVuY3Rpb24obil7cmV0dXJuIFMobikmJm4uZW5kc1dpdGgoZSl9KSkpKTt2YXIgZX0sbWluTGVuZ3RoOmZ1bmN0aW9uKHIpe3JldHVybiBuKGQodCxmdW5jdGlvbihuKXtyZXR1cm4gcChmdW5jdGlvbih0KXtyZXR1cm4gUyh0KSYmdC5sZW5ndGg+PW59KX0ocikpKX0sbGVuZ3RoOmZ1bmN0aW9uKHIpe3JldHVybiBuKGQodCxmdW5jdGlvbihuKXtyZXR1cm4gcChmdW5jdGlvbih0KXtyZXR1cm4gUyh0KSYmdC5sZW5ndGg9PT1ufSl9KHIpKSl9LG1heExlbmd0aDpmdW5jdGlvbihyKXtyZXR1cm4gbihkKHQsZnVuY3Rpb24obil7cmV0dXJuIHAoZnVuY3Rpb24odCl7cmV0dXJuIFModCkmJnQubGVuZ3RoPD1ufSl9KHIpKSl9LGluY2x1ZGVzOmZ1bmN0aW9uKHIpe3JldHVybiBuKGQodCwoZT1yLHAoZnVuY3Rpb24obil7cmV0dXJuIFMobikmJm4uaW5jbHVkZXMoZSl9KSkpKTt2YXIgZX0scmVnZXg6ZnVuY3Rpb24ocil7cmV0dXJuIG4oZCh0LChlPXIscChmdW5jdGlvbihuKXtyZXR1cm4gUyhuKSYmQm9vbGVhbihuLm1hdGNoKGUpKX0pKSkpO3ZhciBlfX0pfShwKFMpKSxFPWZ1bmN0aW9uIG4odCl7cmV0dXJuIE9iamVjdC5hc3NpZ24obCh0KSx7YmV0d2VlbjpmdW5jdGlvbihyLGUpe3JldHVybiBuKGQodCxmdW5jdGlvbihuLHQpe3JldHVybiBwKGZ1bmN0aW9uKHIpe3JldHVybiB3KHIpJiZuPD1yJiZ0Pj1yfSl9KHIsZSkpKX0sbHQ6ZnVuY3Rpb24ocil7cmV0dXJuIG4oZCh0LGZ1bmN0aW9uKG4pe3JldHVybiBwKGZ1bmN0aW9uKHQpe3JldHVybiB3KHQpJiZ0PG59KX0ocikpKX0sZ3Q6ZnVuY3Rpb24ocil7cmV0dXJuIG4oZCh0LGZ1bmN0aW9uKG4pe3JldHVybiBwKGZ1bmN0aW9uKHQpe3JldHVybiB3KHQpJiZ0Pm59KX0ocikpKX0sbHRlOmZ1bmN0aW9uKHIpe3JldHVybiBuKGQodCxmdW5jdGlvbihuKXtyZXR1cm4gcChmdW5jdGlvbih0KXtyZXR1cm4gdyh0KSYmdDw9bn0pfShyKSkpfSxndGU6ZnVuY3Rpb24ocil7cmV0dXJuIG4oZCh0LGZ1bmN0aW9uKG4pe3JldHVybiBwKGZ1bmN0aW9uKHQpe3JldHVybiB3KHQpJiZ0Pj1ufSl9KHIpKSl9LGludDpmdW5jdGlvbigpe3JldHVybiBuKGQodCxwKGZ1bmN0aW9uKG4pe3JldHVybiB3KG4pJiZOdW1iZXIuaXNJbnRlZ2VyKG4pfSkpKX0sZmluaXRlOmZ1bmN0aW9uKCl7cmV0dXJuIG4oZCh0LHAoZnVuY3Rpb24obil7cmV0dXJuIHcobikmJk51bWJlci5pc0Zpbml0ZShuKX0pKSl9LHBvc2l0aXZlOmZ1bmN0aW9uKCl7cmV0dXJuIG4oZCh0LHAoZnVuY3Rpb24obil7cmV0dXJuIHcobikmJm4+MH0pKSl9LG5lZ2F0aXZlOmZ1bmN0aW9uKCl7cmV0dXJuIG4oZCh0LHAoZnVuY3Rpb24obil7cmV0dXJuIHcobikmJm48MH0pKSl9fSl9KHAodykpLEs9ZnVuY3Rpb24gbih0KXtyZXR1cm4gT2JqZWN0LmFzc2lnbihsKHQpLHtiZXR3ZWVuOmZ1bmN0aW9uKHIsZSl7cmV0dXJuIG4oZCh0LGZ1bmN0aW9uKG4sdCl7cmV0dXJuIHAoZnVuY3Rpb24ocil7cmV0dXJuIGoocikmJm48PXImJnQ+PXJ9KX0ocixlKSkpfSxsdDpmdW5jdGlvbihyKXtyZXR1cm4gbihkKHQsZnVuY3Rpb24obil7cmV0dXJuIHAoZnVuY3Rpb24odCl7cmV0dXJuIGoodCkmJnQ8bn0pfShyKSkpfSxndDpmdW5jdGlvbihyKXtyZXR1cm4gbihkKHQsZnVuY3Rpb24obil7cmV0dXJuIHAoZnVuY3Rpb24odCl7cmV0dXJuIGoodCkmJnQ+bn0pfShyKSkpfSxsdGU6ZnVuY3Rpb24ocil7cmV0dXJuIG4oZCh0LGZ1bmN0aW9uKG4pe3JldHVybiBwKGZ1bmN0aW9uKHQpe3JldHVybiBqKHQpJiZ0PD1ufSl9KHIpKSl9LGd0ZTpmdW5jdGlvbihyKXtyZXR1cm4gbihkKHQsZnVuY3Rpb24obil7cmV0dXJuIHAoZnVuY3Rpb24odCl7cmV0dXJuIGoodCkmJnQ+PW59KX0ocikpKX0scG9zaXRpdmU6ZnVuY3Rpb24oKXtyZXR1cm4gbihkKHQscChmdW5jdGlvbihuKXtyZXR1cm4gaihuKSYmbj4wfSkpKX0sbmVnYXRpdmU6ZnVuY3Rpb24oKXtyZXR1cm4gbihkKHQscChmdW5jdGlvbihuKXtyZXR1cm4gaihuKSYmbjwwfSkpKX19KX0ocChqKSksVD1sKHAoZnVuY3Rpb24obil7cmV0dXJuXCJib29sZWFuXCI9PXR5cGVvZiBufSkpLFA9bChwKGZ1bmN0aW9uKG4pe3JldHVyblwic3ltYm9sXCI9PXR5cGVvZiBufSkpLGs9bChwKGZ1bmN0aW9uKG4pe3JldHVybiBudWxsPT1ufSkpLEI9bChwKGZ1bmN0aW9uKG4pe3JldHVybiBudWxsIT1ufSkpLEk9e19fcHJvdG9fXzpudWxsLG1hdGNoZXI6cixvcHRpb25hbDp2LGFycmF5OmZ1bmN0aW9uKCl7dmFyIG4sdD1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIGgoKChuPXt9KVtyXT1mdW5jdGlvbigpe3JldHVybnttYXRjaDpmdW5jdGlvbihuKXtpZighQXJyYXkuaXNBcnJheShuKSlyZXR1cm57bWF0Y2hlZDohMX07aWYoMD09PXQubGVuZ3RoKXJldHVybnttYXRjaGVkOiEwfTt2YXIgcj10WzBdLGU9e307aWYoMD09PW4ubGVuZ3RoKXJldHVybiBhKHIpLmZvckVhY2goZnVuY3Rpb24obil7ZVtuXT1bXX0pLHttYXRjaGVkOiEwLHNlbGVjdGlvbnM6ZX07dmFyIHU9ZnVuY3Rpb24obix0KXtlW25dPShlW25dfHxbXSkuY29uY2F0KFt0XSl9O3JldHVybnttYXRjaGVkOm4uZXZlcnkoZnVuY3Rpb24obil7cmV0dXJuIGMocixuLHUpfSksc2VsZWN0aW9uczplfX0sZ2V0U2VsZWN0aW9uS2V5czpmdW5jdGlvbigpe3JldHVybiAwPT09dC5sZW5ndGg/W106YSh0WzBdKX19fSxuKSl9LHNldDpmdW5jdGlvbigpe3ZhciBuLHQ9W10uc2xpY2UuY2FsbChhcmd1bWVudHMpO3JldHVybiBsKCgobj17fSlbcl09ZnVuY3Rpb24oKXtyZXR1cm57bWF0Y2g6ZnVuY3Rpb24obil7aWYoIShuIGluc3RhbmNlb2YgU2V0KSlyZXR1cm57bWF0Y2hlZDohMX07dmFyIHI9e307aWYoMD09PW4uc2l6ZSlyZXR1cm57bWF0Y2hlZDohMCxzZWxlY3Rpb25zOnJ9O2lmKDA9PT10Lmxlbmd0aClyZXR1cm57bWF0Y2hlZDohMH07dmFyIGU9ZnVuY3Rpb24obix0KXtyW25dPShyW25dfHxbXSkuY29uY2F0KFt0XSl9LHU9dFswXTtyZXR1cm57bWF0Y2hlZDpnKG4sZnVuY3Rpb24obil7cmV0dXJuIGModSxuLGUpfSksc2VsZWN0aW9uczpyfX0sZ2V0U2VsZWN0aW9uS2V5czpmdW5jdGlvbigpe3JldHVybiAwPT09dC5sZW5ndGg/W106YSh0WzBdKX19fSxuKSl9LG1hcDpmdW5jdGlvbigpe3ZhciBuLHQ9W10uc2xpY2UuY2FsbChhcmd1bWVudHMpO3JldHVybiBsKCgobj17fSlbcl09ZnVuY3Rpb24oKXtyZXR1cm57bWF0Y2g6ZnVuY3Rpb24obil7aWYoIShuIGluc3RhbmNlb2YgTWFwKSlyZXR1cm57bWF0Y2hlZDohMX07dmFyIHI9e307aWYoMD09PW4uc2l6ZSlyZXR1cm57bWF0Y2hlZDohMCxzZWxlY3Rpb25zOnJ9O3ZhciBlLHU9ZnVuY3Rpb24obix0KXtyW25dPShyW25dfHxbXSkuY29uY2F0KFt0XSl9O2lmKDA9PT10Lmxlbmd0aClyZXR1cm57bWF0Y2hlZDohMH07aWYoMT09PXQubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcImBQLm1hcGAgd2Fzbid0IGdpdmVuIGVub3VnaCBhcmd1bWVudHMuIEV4cGVjdGVkIChrZXksIHZhbHVlKSwgcmVjZWl2ZWQgXCIrKG51bGw9PShlPXRbMF0pP3ZvaWQgMDplLnRvU3RyaW5nKCkpKTt2YXIgaT10WzBdLG89dFsxXTtyZXR1cm57bWF0Y2hlZDptKG4sZnVuY3Rpb24obix0KXt2YXIgcj1jKGksdCx1KSxlPWMobyxuLHUpO3JldHVybiByJiZlfSksc2VsZWN0aW9uczpyfX0sZ2V0U2VsZWN0aW9uS2V5czpmdW5jdGlvbigpe3JldHVybiAwPT09dC5sZW5ndGg/W106W10uY29uY2F0KGEodFswXSksYSh0WzFdKSl9fX0sbikpfSxpbnRlcnNlY3Rpb246ZCx1bmlvbjp5LG5vdDpmdW5jdGlvbihuKXt2YXIgdDtyZXR1cm4gbCgoKHQ9e30pW3JdPWZ1bmN0aW9uKCl7cmV0dXJue21hdGNoOmZ1bmN0aW9uKHQpe3JldHVybnttYXRjaGVkOiFjKG4sdCxmdW5jdGlvbigpe30pfX0sZ2V0U2VsZWN0aW9uS2V5czpmdW5jdGlvbigpe3JldHVybltdfSxtYXRjaGVyVHlwZTpcIm5vdFwifX0sdCkpfSx3aGVuOnAsc2VsZWN0OmIsYW55Ok8sXzpBLHN0cmluZzp4LG51bWJlcjpFLGJpZ2ludDpLLGJvb2xlYW46VCxzeW1ib2w6UCxudWxsaXNoOmssbm9uTnVsbGFibGU6QixpbnN0YW5jZU9mOmZ1bmN0aW9uKG4pe3JldHVybiBsKHAoZnVuY3Rpb24obil7cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0IGluc3RhbmNlb2Ygbn19KG4pKSl9LHNoYXBlOmZ1bmN0aW9uKG4pe3JldHVybiBsKHAocyhuKSkpfX0sXz17bWF0Y2hlZDohMSx2YWx1ZTp2b2lkIDB9LE09LyojX19QVVJFX18qL2Z1bmN0aW9uKCl7ZnVuY3Rpb24gbihuLHQpe3RoaXMuaW5wdXQ9dm9pZCAwLHRoaXMuc3RhdGU9dm9pZCAwLHRoaXMuaW5wdXQ9bix0aGlzLnN0YXRlPXR9dmFyIHQ9bi5wcm90b3R5cGU7cmV0dXJuIHQud2l0aD1mdW5jdGlvbigpe3ZhciB0PXRoaXMscj1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7aWYodGhpcy5zdGF0ZS5tYXRjaGVkKXJldHVybiB0aGlzO3ZhciBlPXJbci5sZW5ndGgtMV0saT1bclswXV0sbz12b2lkIDA7Mz09PXIubGVuZ3RoJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiByWzFdP289clsxXTpyLmxlbmd0aD4yJiZpLnB1c2guYXBwbHkoaSxyLnNsaWNlKDEsci5sZW5ndGgtMSkpO3ZhciBhPSExLGY9e30scz1mdW5jdGlvbihuLHQpe2E9ITAsZltuXT10fSxsPSFpLnNvbWUoZnVuY3Rpb24obil7cmV0dXJuIGMobix0LmlucHV0LHMpfSl8fG8mJiFCb29sZWFuKG8odGhpcy5pbnB1dCkpP186e21hdGNoZWQ6ITAsdmFsdWU6ZShhP3UgaW4gZj9mW3VdOmY6dGhpcy5pbnB1dCx0aGlzLmlucHV0KX07cmV0dXJuIG5ldyBuKHRoaXMuaW5wdXQsbCl9LHQud2hlbj1mdW5jdGlvbih0LHIpe2lmKHRoaXMuc3RhdGUubWF0Y2hlZClyZXR1cm4gdGhpczt2YXIgZT1Cb29sZWFuKHQodGhpcy5pbnB1dCkpO3JldHVybiBuZXcgbih0aGlzLmlucHV0LGU/e21hdGNoZWQ6ITAsdmFsdWU6cih0aGlzLmlucHV0LHRoaXMuaW5wdXQpfTpfKX0sdC5vdGhlcndpc2U9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuc3RhdGUubWF0Y2hlZD90aGlzLnN0YXRlLnZhbHVlOm4odGhpcy5pbnB1dCl9LHQuZXhoYXVzdGl2ZT1mdW5jdGlvbigpe2lmKHRoaXMuc3RhdGUubWF0Y2hlZClyZXR1cm4gdGhpcy5zdGF0ZS52YWx1ZTt2YXIgbjt0cnl7bj1KU09OLnN0cmluZ2lmeSh0aGlzLmlucHV0KX1jYXRjaCh0KXtuPXRoaXMuaW5wdXR9dGhyb3cgbmV3IEVycm9yKFwiUGF0dGVybiBtYXRjaGluZyBlcnJvcjogbm8gcGF0dGVybiBtYXRjaGVzIHZhbHVlIFwiK24pfSx0LnJ1bj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmV4aGF1c3RpdmUoKX0sdC5yZXR1cm5UeXBlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9LG59KCk7ZXhwb3J0cy5QPUksZXhwb3J0cy5QYXR0ZXJuPUksZXhwb3J0cy5pc01hdGNoaW5nPXMsZXhwb3J0cy5tYXRjaD1mdW5jdGlvbihuKXtyZXR1cm4gbmV3IE0obixfKX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5janMubWFwXG4iLCJpbXBvcnQgeyBpc05vZGUgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uL25vZGVzL1lBTUxNYXAuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUJsb2NrTWFwIH0gZnJvbSAnLi9yZXNvbHZlLWJsb2NrLW1hcC5qcyc7XG5pbXBvcnQgeyByZXNvbHZlQmxvY2tTZXEgfSBmcm9tICcuL3Jlc29sdmUtYmxvY2stc2VxLmpzJztcbmltcG9ydCB7IHJlc29sdmVGbG93Q29sbGVjdGlvbiB9IGZyb20gJy4vcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSwgdGFnKSB7XG4gICAgY29uc3QgY29sbCA9IHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnXG4gICAgICAgID8gcmVzb2x2ZUJsb2NrTWFwKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpXG4gICAgICAgIDogdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcSdcbiAgICAgICAgICAgID8gcmVzb2x2ZUJsb2NrU2VxKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpXG4gICAgICAgICAgICA6IHJlc29sdmVGbG93Q29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKTtcbiAgICBjb25zdCBDb2xsID0gY29sbC5jb25zdHJ1Y3RvcjtcbiAgICAvLyBJZiB3ZSBnb3QgYSB0YWdOYW1lIG1hdGNoaW5nIHRoZSBjbGFzcywgb3IgdGhlIHRhZyBuYW1lIGlzICchJyxcbiAgICAvLyB0aGVuIHVzZSB0aGUgdGFnTmFtZSBmcm9tIHRoZSBub2RlIGNsYXNzIHVzZWQgdG8gY3JlYXRlIGl0LlxuICAgIGlmICh0YWdOYW1lID09PSAnIScgfHwgdGFnTmFtZSA9PT0gQ29sbC50YWdOYW1lKSB7XG4gICAgICAgIGNvbGwudGFnID0gQ29sbC50YWdOYW1lO1xuICAgICAgICByZXR1cm4gY29sbDtcbiAgICB9XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIGNvbGwudGFnID0gdGFnTmFtZTtcbiAgICByZXR1cm4gY29sbDtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCB0YWdUb2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHRhZ05hbWUgPSAhdGFnVG9rZW5cbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogY3R4LmRpcmVjdGl2ZXMudGFnTmFtZSh0YWdUb2tlbi5zb3VyY2UsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSk7XG4gICAgY29uc3QgZXhwVHlwZSA9IHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnXG4gICAgICAgID8gJ21hcCdcbiAgICAgICAgOiB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJ1xuICAgICAgICAgICAgPyAnc2VxJ1xuICAgICAgICAgICAgOiB0b2tlbi5zdGFydC5zb3VyY2UgPT09ICd7J1xuICAgICAgICAgICAgICAgID8gJ21hcCdcbiAgICAgICAgICAgICAgICA6ICdzZXEnO1xuICAgIC8vIHNob3J0Y3V0OiBjaGVjayBpZiBpdCdzIGEgZ2VuZXJpYyBZQU1MTWFwIG9yIFlBTUxTZXFcbiAgICAvLyBiZWZvcmUganVtcGluZyBpbnRvIHRoZSBjdXN0b20gdGFnIGxvZ2ljLlxuICAgIGlmICghdGFnVG9rZW4gfHxcbiAgICAgICAgIXRhZ05hbWUgfHxcbiAgICAgICAgdGFnTmFtZSA9PT0gJyEnIHx8XG4gICAgICAgICh0YWdOYW1lID09PSBZQU1MTWFwLnRhZ05hbWUgJiYgZXhwVHlwZSA9PT0gJ21hcCcpIHx8XG4gICAgICAgICh0YWdOYW1lID09PSBZQU1MU2VxLnRhZ05hbWUgJiYgZXhwVHlwZSA9PT0gJ3NlcScpIHx8XG4gICAgICAgICFleHBUeXBlKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSk7XG4gICAgfVxuICAgIGxldCB0YWcgPSBjdHguc2NoZW1hLnRhZ3MuZmluZCh0ID0+IHQudGFnID09PSB0YWdOYW1lICYmIHQuY29sbGVjdGlvbiA9PT0gZXhwVHlwZSk7XG4gICAgaWYgKCF0YWcpIHtcbiAgICAgICAgY29uc3Qga3QgPSBjdHguc2NoZW1hLmtub3duVGFnc1t0YWdOYW1lXTtcbiAgICAgICAgaWYgKGt0ICYmIGt0LmNvbGxlY3Rpb24gPT09IGV4cFR5cGUpIHtcbiAgICAgICAgICAgIGN0eC5zY2hlbWEudGFncy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIGt0LCB7IGRlZmF1bHQ6IGZhbHNlIH0pKTtcbiAgICAgICAgICAgIHRhZyA9IGt0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGt0Py5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWdUb2tlbiwgJ0JBRF9DT0xMRUNUSU9OX1RZUEUnLCBgJHtrdC50YWd9IHVzZWQgZm9yICR7ZXhwVHlwZX0gY29sbGVjdGlvbiwgYnV0IGV4cGVjdHMgJHtrdC5jb2xsZWN0aW9ufWAsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIGBVbnJlc29sdmVkIHRhZzogJHt0YWdOYW1lfWAsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjb2xsID0gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUsIHRhZyk7XG4gICAgY29uc3QgcmVzID0gdGFnLnJlc29sdmU/Lihjb2xsLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyksIGN0eC5vcHRpb25zKSA/PyBjb2xsO1xuICAgIGNvbnN0IG5vZGUgPSBpc05vZGUocmVzKVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IG5ldyBTY2FsYXIocmVzKTtcbiAgICBub2RlLnJhbmdlID0gY29sbC5yYW5nZTtcbiAgICBub2RlLnRhZyA9IHRhZ05hbWU7XG4gICAgaWYgKHRhZz8uZm9ybWF0KVxuICAgICAgICBub2RlLmZvcm1hdCA9IHRhZy5mb3JtYXQ7XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydCB7IGNvbXBvc2VDb2xsZWN0aW9uIH07XG4iLCJpbXBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4uL2RvYy9Eb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9IGZyb20gJy4vY29tcG9zZS1ub2RlLmpzJztcbmltcG9ydCB7IHJlc29sdmVFbmQgfSBmcm9tICcuL3Jlc29sdmUtZW5kLmpzJztcbmltcG9ydCB7IHJlc29sdmVQcm9wcyB9IGZyb20gJy4vcmVzb2x2ZS1wcm9wcy5qcyc7XG5cbmZ1bmN0aW9uIGNvbXBvc2VEb2Mob3B0aW9ucywgZGlyZWN0aXZlcywgeyBvZmZzZXQsIHN0YXJ0LCB2YWx1ZSwgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7IF9kaXJlY3RpdmVzOiBkaXJlY3RpdmVzIH0sIG9wdGlvbnMpO1xuICAgIGNvbnN0IGRvYyA9IG5ldyBEb2N1bWVudCh1bmRlZmluZWQsIG9wdHMpO1xuICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgYXRSb290OiB0cnVlLFxuICAgICAgICBkaXJlY3RpdmVzOiBkb2MuZGlyZWN0aXZlcyxcbiAgICAgICAgb3B0aW9uczogZG9jLm9wdGlvbnMsXG4gICAgICAgIHNjaGVtYTogZG9jLnNjaGVtYVxuICAgIH07XG4gICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgaW5kaWNhdG9yOiAnZG9jLXN0YXJ0JyxcbiAgICAgICAgbmV4dDogdmFsdWUgPz8gZW5kPy5bMF0sXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgb25FcnJvcixcbiAgICAgICAgcGFyZW50SW5kZW50OiAwLFxuICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgIH0pO1xuICAgIGlmIChwcm9wcy5mb3VuZCkge1xuICAgICAgICBkb2MuZGlyZWN0aXZlcy5kb2NTdGFydCA9IHRydWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgKHZhbHVlLnR5cGUgPT09ICdibG9jay1tYXAnIHx8IHZhbHVlLnR5cGUgPT09ICdibG9jay1zZXEnKSAmJlxuICAgICAgICAgICAgIXByb3BzLmhhc05ld2xpbmUpXG4gICAgICAgICAgICBvbkVycm9yKHByb3BzLmVuZCwgJ01JU1NJTkdfQ0hBUicsICdCbG9jayBjb2xsZWN0aW9uIGNhbm5vdCBzdGFydCBvbiBzYW1lIGxpbmUgd2l0aCBkaXJlY3RpdmVzLWVuZCBtYXJrZXInKTtcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJZiBDb250ZW50cyBpcyBzZXQsIGxldCdzIHRydXN0IHRoZSB1c2VyXG4gICAgZG9jLmNvbnRlbnRzID0gdmFsdWVcbiAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgIGNvbnN0IGNvbnRlbnRFbmQgPSBkb2MuY29udGVudHMucmFuZ2VbMl07XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kKGVuZCwgY29udGVudEVuZCwgZmFsc2UsIG9uRXJyb3IpO1xuICAgIGlmIChyZS5jb21tZW50KVxuICAgICAgICBkb2MuY29tbWVudCA9IHJlLmNvbW1lbnQ7XG4gICAgZG9jLnJhbmdlID0gW29mZnNldCwgY29udGVudEVuZCwgcmUub2Zmc2V0XTtcbiAgICByZXR1cm4gZG9jO1xufVxuXG5leHBvcnQgeyBjb21wb3NlRG9jIH07XG4iLCJpbXBvcnQgeyBBbGlhcyB9IGZyb20gJy4uL25vZGVzL0FsaWFzLmpzJztcbmltcG9ydCB7IGNvbXBvc2VDb2xsZWN0aW9uIH0gZnJvbSAnLi9jb21wb3NlLWNvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgY29tcG9zZVNjYWxhciB9IGZyb20gJy4vY29tcG9zZS1zY2FsYXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUVuZCB9IGZyb20gJy4vcmVzb2x2ZS1lbmQuanMnO1xuaW1wb3J0IHsgZW1wdHlTY2FsYXJQb3NpdGlvbiB9IGZyb20gJy4vdXRpbC1lbXB0eS1zY2FsYXItcG9zaXRpb24uanMnO1xuXG5jb25zdCBDTiA9IHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfTtcbmZ1bmN0aW9uIGNvbXBvc2VOb2RlKGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKSB7XG4gICAgY29uc3QgeyBzcGFjZUJlZm9yZSwgY29tbWVudCwgYW5jaG9yLCB0YWcgfSA9IHByb3BzO1xuICAgIGxldCBub2RlO1xuICAgIGxldCBpc1NyY1Rva2VuID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VBbGlhcyhjdHgsIHRva2VuLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdBTElBU19QUk9QUycsICdBbiBhbGlhcyBub2RlIG11c3Qgbm90IHNwZWNpZnkgYW55IHByb3BlcnRpZXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgdGFnLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IpXG4gICAgICAgICAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gdG9rZW4udHlwZSA9PT0gJ2Vycm9yJ1xuICAgICAgICAgICAgICAgID8gdG9rZW4ubWVzc2FnZVxuICAgICAgICAgICAgICAgIDogYFVuc3VwcG9ydGVkIHRva2VuICh0eXBlOiAke3Rva2VuLnR5cGV9KWA7XG4gICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCB0b2tlbi5vZmZzZXQsIHVuZGVmaW5lZCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaXNTcmNUb2tlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbmNob3IgJiYgbm9kZS5hbmNob3IgPT09ICcnKVxuICAgICAgICBvbkVycm9yKGFuY2hvciwgJ0JBRF9BTElBUycsICdBbmNob3IgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIGlmIChzcGFjZUJlZm9yZSlcbiAgICAgICAgbm9kZS5zcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdzY2FsYXInICYmIHRva2VuLnNvdXJjZSA9PT0gJycpXG4gICAgICAgICAgICBub2RlLmNvbW1lbnQgPSBjb21tZW50O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmNvbW1lbnRCZWZvcmUgPSBjb21tZW50O1xuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFR5cGUgY2hlY2tpbmcgbWlzc2VzIG1lYW5pbmcgb2YgaXNTcmNUb2tlblxuICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zICYmIGlzU3JjVG9rZW4pXG4gICAgICAgIG5vZGUuc3JjVG9rZW4gPSB0b2tlbjtcbiAgICByZXR1cm4gbm9kZTtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBvZmZzZXQsIGJlZm9yZSwgcG9zLCB7IHNwYWNlQmVmb3JlLCBjb21tZW50LCBhbmNob3IsIHRhZywgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgdHlwZTogJ3NjYWxhcicsXG4gICAgICAgIG9mZnNldDogZW1wdHlTY2FsYXJQb3NpdGlvbihvZmZzZXQsIGJlZm9yZSwgcG9zKSxcbiAgICAgICAgaW5kZW50OiAtMSxcbiAgICAgICAgc291cmNlOiAnJ1xuICAgIH07XG4gICAgY29uc3Qgbm9kZSA9IGNvbXBvc2VTY2FsYXIoY3R4LCB0b2tlbiwgdGFnLCBvbkVycm9yKTtcbiAgICBpZiAoYW5jaG9yKSB7XG4gICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGlmIChub2RlLmFuY2hvciA9PT0gJycpXG4gICAgICAgICAgICBvbkVycm9yKGFuY2hvciwgJ0JBRF9BTElBUycsICdBbmNob3IgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIH1cbiAgICBpZiAoc3BhY2VCZWZvcmUpXG4gICAgICAgIG5vZGUuc3BhY2VCZWZvcmUgPSB0cnVlO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIG5vZGUuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgICAgIG5vZGUucmFuZ2VbMl0gPSBlbmQ7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gY29tcG9zZUFsaWFzKHsgb3B0aW9ucyB9LCB7IG9mZnNldCwgc291cmNlLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IGFsaWFzID0gbmV3IEFsaWFzKHNvdXJjZS5zdWJzdHJpbmcoMSkpO1xuICAgIGlmIChhbGlhcy5zb3VyY2UgPT09ICcnKVxuICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9BTElBUycsICdBbGlhcyBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgaWYgKGFsaWFzLnNvdXJjZS5lbmRzV2l0aCgnOicpKVxuICAgICAgICBvbkVycm9yKG9mZnNldCArIHNvdXJjZS5sZW5ndGggLSAxLCAnQkFEX0FMSUFTJywgJ0FsaWFzIGVuZGluZyBpbiA6IGlzIGFtYmlndW91cycsIHRydWUpO1xuICAgIGNvbnN0IHZhbHVlRW5kID0gb2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQoZW5kLCB2YWx1ZUVuZCwgb3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGFsaWFzLnJhbmdlID0gW29mZnNldCwgdmFsdWVFbmQsIHJlLm9mZnNldF07XG4gICAgaWYgKHJlLmNvbW1lbnQpXG4gICAgICAgIGFsaWFzLmNvbW1lbnQgPSByZS5jb21tZW50O1xuICAgIHJldHVybiBhbGlhcztcbn1cblxuZXhwb3J0IHsgY29tcG9zZUVtcHR5Tm9kZSwgY29tcG9zZU5vZGUgfTtcbiIsImltcG9ydCB7IFNDQUxBUiwgaXNTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUJsb2NrU2NhbGFyIH0gZnJvbSAnLi9yZXNvbHZlLWJsb2NrLXNjYWxhci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRmxvd1NjYWxhciB9IGZyb20gJy4vcmVzb2x2ZS1mbG93LXNjYWxhci5qcyc7XG5cbmZ1bmN0aW9uIGNvbXBvc2VTY2FsYXIoY3R4LCB0b2tlbiwgdGFnVG9rZW4sIG9uRXJyb3IpIHtcbiAgICBjb25zdCB7IHZhbHVlLCB0eXBlLCBjb21tZW50LCByYW5nZSB9ID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcidcbiAgICAgICAgPyByZXNvbHZlQmxvY2tTY2FsYXIoY3R4LCB0b2tlbiwgb25FcnJvcilcbiAgICAgICAgOiByZXNvbHZlRmxvd1NjYWxhcih0b2tlbiwgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICBjb25zdCB0YWdOYW1lID0gdGFnVG9rZW5cbiAgICAgICAgPyBjdHguZGlyZWN0aXZlcy50YWdOYW1lKHRhZ1Rva2VuLnNvdXJjZSwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpKVxuICAgICAgICA6IG51bGw7XG4gICAgY29uc3QgdGFnID0gdGFnVG9rZW4gJiYgdGFnTmFtZVxuICAgICAgICA/IGZpbmRTY2FsYXJUYWdCeU5hbWUoY3R4LnNjaGVtYSwgdmFsdWUsIHRhZ05hbWUsIHRhZ1Rva2VuLCBvbkVycm9yKVxuICAgICAgICA6IHRva2VuLnR5cGUgPT09ICdzY2FsYXInXG4gICAgICAgICAgICA/IGZpbmRTY2FsYXJUYWdCeVRlc3QoY3R4LCB2YWx1ZSwgdG9rZW4sIG9uRXJyb3IpXG4gICAgICAgICAgICA6IGN0eC5zY2hlbWFbU0NBTEFSXTtcbiAgICBsZXQgc2NhbGFyO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHRhZy5yZXNvbHZlKHZhbHVlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiA/PyB0b2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyksIGN0eC5vcHRpb25zKTtcbiAgICAgICAgc2NhbGFyID0gaXNTY2FsYXIocmVzKSA/IHJlcyA6IG5ldyBTY2FsYXIocmVzKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgb25FcnJvcih0YWdUb2tlbiA/PyB0b2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyk7XG4gICAgICAgIHNjYWxhciA9IG5ldyBTY2FsYXIodmFsdWUpO1xuICAgIH1cbiAgICBzY2FsYXIucmFuZ2UgPSByYW5nZTtcbiAgICBzY2FsYXIuc291cmNlID0gdmFsdWU7XG4gICAgaWYgKHR5cGUpXG4gICAgICAgIHNjYWxhci50eXBlID0gdHlwZTtcbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgc2NhbGFyLnRhZyA9IHRhZ05hbWU7XG4gICAgaWYgKHRhZy5mb3JtYXQpXG4gICAgICAgIHNjYWxhci5mb3JtYXQgPSB0YWcuZm9ybWF0O1xuICAgIGlmIChjb21tZW50KVxuICAgICAgICBzY2FsYXIuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgcmV0dXJuIHNjYWxhcjtcbn1cbmZ1bmN0aW9uIGZpbmRTY2FsYXJUYWdCeU5hbWUoc2NoZW1hLCB2YWx1ZSwgdGFnTmFtZSwgdGFnVG9rZW4sIG9uRXJyb3IpIHtcbiAgICBpZiAodGFnTmFtZSA9PT0gJyEnKVxuICAgICAgICByZXR1cm4gc2NoZW1hW1NDQUxBUl07IC8vIG5vbi1zcGVjaWZpYyB0YWdcbiAgICBjb25zdCBtYXRjaFdpdGhUZXN0ID0gW107XG4gICAgZm9yIChjb25zdCB0YWcgb2Ygc2NoZW1hLnRhZ3MpIHtcbiAgICAgICAgaWYgKCF0YWcuY29sbGVjdGlvbiAmJiB0YWcudGFnID09PSB0YWdOYW1lKSB7XG4gICAgICAgICAgICBpZiAodGFnLmRlZmF1bHQgJiYgdGFnLnRlc3QpXG4gICAgICAgICAgICAgICAgbWF0Y2hXaXRoVGVzdC5wdXNoKHRhZyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBtYXRjaFdpdGhUZXN0KVxuICAgICAgICBpZiAodGFnLnRlc3Q/LnRlc3QodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICBjb25zdCBrdCA9IHNjaGVtYS5rbm93blRhZ3NbdGFnTmFtZV07XG4gICAgaWYgKGt0ICYmICFrdC5jb2xsZWN0aW9uKSB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBrbm93biB0YWcgaXMgYXZhaWxhYmxlIGZvciBzdHJpbmdpZnlpbmcsXG4gICAgICAgIC8vIGJ1dCBkb2VzIG5vdCBnZXQgdXNlZCBieSBkZWZhdWx0LlxuICAgICAgICBzY2hlbWEudGFncy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIGt0LCB7IGRlZmF1bHQ6IGZhbHNlLCB0ZXN0OiB1bmRlZmluZWQgfSkpO1xuICAgICAgICByZXR1cm4ga3Q7XG4gICAgfVxuICAgIG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBgVW5yZXNvbHZlZCB0YWc6ICR7dGFnTmFtZX1gLCB0YWdOYW1lICE9PSAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyk7XG4gICAgcmV0dXJuIHNjaGVtYVtTQ0FMQVJdO1xufVxuZnVuY3Rpb24gZmluZFNjYWxhclRhZ0J5VGVzdCh7IGRpcmVjdGl2ZXMsIHNjaGVtYSB9LCB2YWx1ZSwgdG9rZW4sIG9uRXJyb3IpIHtcbiAgICBjb25zdCB0YWcgPSBzY2hlbWEudGFncy5maW5kKHRhZyA9PiB0YWcuZGVmYXVsdCAmJiB0YWcudGVzdD8udGVzdCh2YWx1ZSkpIHx8IHNjaGVtYVtTQ0FMQVJdO1xuICAgIGlmIChzY2hlbWEuY29tcGF0KSB7XG4gICAgICAgIGNvbnN0IGNvbXBhdCA9IHNjaGVtYS5jb21wYXQuZmluZCh0YWcgPT4gdGFnLmRlZmF1bHQgJiYgdGFnLnRlc3Q/LnRlc3QodmFsdWUpKSA/P1xuICAgICAgICAgICAgc2NoZW1hW1NDQUxBUl07XG4gICAgICAgIGlmICh0YWcudGFnICE9PSBjb21wYXQudGFnKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGRpcmVjdGl2ZXMudGFnU3RyaW5nKHRhZy50YWcpO1xuICAgICAgICAgICAgY29uc3QgY3MgPSBkaXJlY3RpdmVzLnRhZ1N0cmluZyhjb21wYXQudGFnKTtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBWYWx1ZSBtYXkgYmUgcGFyc2VkIGFzIGVpdGhlciAke3RzfSBvciAke2NzfWA7XG4gICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFnO1xufVxuXG5leHBvcnQgeyBjb21wb3NlU2NhbGFyIH07XG4iLCJpbXBvcnQgeyBEaXJlY3RpdmVzIH0gZnJvbSAnLi4vZG9jL2RpcmVjdGl2ZXMuanMnO1xuaW1wb3J0IHsgRG9jdW1lbnQgfSBmcm9tICcuLi9kb2MvRG9jdW1lbnQuanMnO1xuaW1wb3J0IHsgWUFNTFdhcm5pbmcsIFlBTUxQYXJzZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzLmpzJztcbmltcG9ydCB7IGlzQ29sbGVjdGlvbiwgaXNQYWlyIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgY29tcG9zZURvYyB9IGZyb20gJy4vY29tcG9zZS1kb2MuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUVuZCB9IGZyb20gJy4vcmVzb2x2ZS1lbmQuanMnO1xuXG5mdW5jdGlvbiBnZXRFcnJvclBvcyhzcmMpIHtcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ251bWJlcicpXG4gICAgICAgIHJldHVybiBbc3JjLCBzcmMgKyAxXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzcmMpKVxuICAgICAgICByZXR1cm4gc3JjLmxlbmd0aCA9PT0gMiA/IHNyYyA6IFtzcmNbMF0sIHNyY1sxXV07XG4gICAgY29uc3QgeyBvZmZzZXQsIHNvdXJjZSB9ID0gc3JjO1xuICAgIHJldHVybiBbb2Zmc2V0LCBvZmZzZXQgKyAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgPyBzb3VyY2UubGVuZ3RoIDogMSldO1xufVxuZnVuY3Rpb24gcGFyc2VQcmVsdWRlKHByZWx1ZGUpIHtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGxldCBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICBsZXQgYWZ0ZXJFbXB0eUxpbmUgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWx1ZGUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gcHJlbHVkZVtpXTtcbiAgICAgICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIGNvbW1lbnQgKz1cbiAgICAgICAgICAgICAgICAgICAgKGNvbW1lbnQgPT09ICcnID8gJycgOiBhZnRlckVtcHR5TGluZSA/ICdcXG5cXG4nIDogJ1xcbicpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChzb3VyY2Uuc3Vic3RyaW5nKDEpIHx8ICcgJyk7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhZnRlckVtcHR5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICAgICAgaWYgKHByZWx1ZGVbaSArIDFdPy5bMF0gIT09ICcjJylcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBUaGlzIG1heSBiZSB3cm9uZyBhZnRlciBkb2MtZW5kLCBidXQgaW4gdGhhdCBjYXNlIGl0IGRvZXNuJ3QgbWF0dGVyXG4gICAgICAgICAgICAgICAgaWYgKCFhdENvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGFmdGVyRW1wdHlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBjb21tZW50LCBhZnRlckVtcHR5TGluZSB9O1xufVxuLyoqXG4gKiBDb21wb3NlIGEgc3RyZWFtIG9mIENTVCBub2RlcyBpbnRvIGEgc3RyZWFtIG9mIFlBTUwgRG9jdW1lbnRzLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBDb21wb3NlciwgUGFyc2VyIH0gZnJvbSAneWFtbCdcbiAqXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogY29uc3QgdG9rZW5zID0gbmV3IFBhcnNlcigpLnBhcnNlKHNyYylcbiAqIGNvbnN0IGRvY3MgPSBuZXcgQ29tcG9zZXIoKS5jb21wb3NlKHRva2VucylcbiAqIGBgYFxuICovXG5jbGFzcyBDb21wb3NlciB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wcmVsdWRlID0gW107XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcbiAgICAgICAgdGhpcy5vbkVycm9yID0gKHNvdXJjZSwgY29kZSwgbWVzc2FnZSwgd2FybmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zID0gZ2V0RXJyb3JQb3Moc291cmNlKTtcbiAgICAgICAgICAgIGlmICh3YXJuaW5nKVxuICAgICAgICAgICAgICAgIHRoaXMud2FybmluZ3MucHVzaChuZXcgWUFNTFdhcm5pbmcocG9zLCBjb2RlLCBtZXNzYWdlKSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChuZXcgWUFNTFBhcnNlRXJyb3IocG9zLCBjb2RlLCBtZXNzYWdlKSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgRGlyZWN0aXZlcyh7IHZlcnNpb246IG9wdGlvbnMudmVyc2lvbiB8fCAnMS4yJyB9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgZGVjb3JhdGUoZG9jLCBhZnRlckRvYykge1xuICAgICAgICBjb25zdCB7IGNvbW1lbnQsIGFmdGVyRW1wdHlMaW5lIH0gPSBwYXJzZVByZWx1ZGUodGhpcy5wcmVsdWRlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh7IGRjOiBkb2MuY29tbWVudCwgcHJlbHVkZSwgY29tbWVudCB9KVxuICAgICAgICBpZiAoY29tbWVudCkge1xuICAgICAgICAgICAgY29uc3QgZGMgPSBkb2MuY29udGVudHM7XG4gICAgICAgICAgICBpZiAoYWZ0ZXJEb2MpIHtcbiAgICAgICAgICAgICAgICBkb2MuY29tbWVudCA9IGRvYy5jb21tZW50ID8gYCR7ZG9jLmNvbW1lbnR9XFxuJHtjb21tZW50fWAgOiBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYWZ0ZXJFbXB0eUxpbmUgfHwgZG9jLmRpcmVjdGl2ZXMuZG9jU3RhcnQgfHwgIWRjKSB7XG4gICAgICAgICAgICAgICAgZG9jLmNvbW1lbnRCZWZvcmUgPSBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNDb2xsZWN0aW9uKGRjKSAmJiAhZGMuZmxvdyAmJiBkYy5pdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ID0gZGMuaXRlbXNbMF07XG4gICAgICAgICAgICAgICAgaWYgKGlzUGFpcihpdCkpXG4gICAgICAgICAgICAgICAgICAgIGl0ID0gaXQua2V5O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gaXQuY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBpdC5jb21tZW50QmVmb3JlID0gY2IgPyBgJHtjb21tZW50fVxcbiR7Y2J9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IGRjLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgICAgICAgICAgZGMuY29tbWVudEJlZm9yZSA9IGNiID8gYCR7Y29tbWVudH1cXG4ke2NifWAgOiBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhZnRlckRvYykge1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZG9jLmVycm9ycywgdGhpcy5lcnJvcnMpO1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZG9jLndhcm5pbmdzLCB0aGlzLndhcm5pbmdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvYy5lcnJvcnMgPSB0aGlzLmVycm9ycztcbiAgICAgICAgICAgIGRvYy53YXJuaW5ncyA9IHRoaXMud2FybmluZ3M7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVsdWRlID0gW107XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3VycmVudCBzdHJlYW0gc3RhdHVzIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogTW9zdGx5IHVzZWZ1bCBhdCB0aGUgZW5kIG9mIGlucHV0IGZvciBhbiBlbXB0eSBzdHJlYW0uXG4gICAgICovXG4gICAgc3RyZWFtSW5mbygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbW1lbnQ6IHBhcnNlUHJlbHVkZSh0aGlzLnByZWx1ZGUpLmNvbW1lbnQsXG4gICAgICAgICAgICBkaXJlY3RpdmVzOiB0aGlzLmRpcmVjdGl2ZXMsXG4gICAgICAgICAgICBlcnJvcnM6IHRoaXMuZXJyb3JzLFxuICAgICAgICAgICAgd2FybmluZ3M6IHRoaXMud2FybmluZ3NcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29tcG9zZSB0b2tlbnMgaW50byBkb2N1bWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZm9yY2VEb2MgLSBJZiB0aGUgc3RyZWFtIGNvbnRhaW5zIG5vIGRvY3VtZW50LCBzdGlsbCBlbWl0IGEgZmluYWwgZG9jdW1lbnQgaW5jbHVkaW5nIGFueSBjb21tZW50cyBhbmQgZGlyZWN0aXZlcyB0aGF0IHdvdWxkIGJlIGFwcGxpZWQgdG8gYSBzdWJzZXF1ZW50IGRvY3VtZW50LlxuICAgICAqIEBwYXJhbSBlbmRPZmZzZXQgLSBTaG91bGQgYmUgc2V0IGlmIGBmb3JjZURvY2AgaXMgYWxzbyBzZXQsIHRvIHNldCB0aGUgZG9jdW1lbnQgcmFuZ2UgZW5kIGFuZCB0byBpbmRpY2F0ZSBlcnJvcnMgY29ycmVjdGx5LlxuICAgICAqL1xuICAgICpjb21wb3NlKHRva2VucywgZm9yY2VEb2MgPSBmYWxzZSwgZW5kT2Zmc2V0ID0gLTEpIHtcbiAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5uZXh0KHRva2VuKTtcbiAgICAgICAgeWllbGQqIHRoaXMuZW5kKGZvcmNlRG9jLCBlbmRPZmZzZXQpO1xuICAgIH1cbiAgICAvKiogQWR2YW5jZSB0aGUgY29tcG9zZXIgYnkgb25lIENTVCB0b2tlbi4gKi9cbiAgICAqbmV4dCh0b2tlbikge1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGl2ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLmFkZCh0b2tlbi5zb3VyY2UsIChvZmZzZXQsIG1lc3NhZ2UsIHdhcm5pbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zID0gZ2V0RXJyb3JQb3ModG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBwb3NbMF0gKz0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IocG9zLCAnQkFEX0RJUkVDVElWRScsIG1lc3NhZ2UsIHdhcm5pbmcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucHJlbHVkZS5wdXNoKHRva2VuLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZG9jdW1lbnQnOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZG9jID0gY29tcG9zZURvYyh0aGlzLm9wdGlvbnMsIHRoaXMuZGlyZWN0aXZlcywgdG9rZW4sIHRoaXMub25FcnJvcik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXREaXJlY3RpdmVzICYmICFkb2MuZGlyZWN0aXZlcy5kb2NTdGFydClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQvZG9jLXN0YXJ0IGluZGljYXRvciBsaW5lJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZShkb2MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kb2MpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuZG9jID0gZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLnByZWx1ZGUucHVzaCh0b2tlbi5zb3VyY2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gdG9rZW4uc291cmNlXG4gICAgICAgICAgICAgICAgICAgID8gYCR7dG9rZW4ubWVzc2FnZX06ICR7SlNPTi5zdHJpbmdpZnkodG9rZW4uc291cmNlKX1gXG4gICAgICAgICAgICAgICAgICAgIDogdG9rZW4ubWVzc2FnZTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgbXNnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMgfHwgIXRoaXMuZG9jKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9jLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRvYykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSAnVW5leHBlY3RlZCBkb2MtZW5kIHdpdGhvdXQgcHJlY2VkaW5nIGRvY3VtZW50JztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChuZXcgWUFNTFBhcnNlRXJyb3IoZ2V0RXJyb3JQb3ModG9rZW4pLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1zZykpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MuZGlyZWN0aXZlcy5kb2NFbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHJlc29sdmVFbmQodG9rZW4uZW5kLCB0b2tlbi5vZmZzZXQgKyB0b2tlbi5zb3VyY2UubGVuZ3RoLCB0aGlzLmRvYy5vcHRpb25zLnN0cmljdCwgdGhpcy5vbkVycm9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29yYXRlKHRoaXMuZG9jLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGMgPSB0aGlzLmRvYy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvYy5jb21tZW50ID0gZGMgPyBgJHtkY31cXG4ke2VuZC5jb21tZW50fWAgOiBlbmQuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MucmFuZ2VbMl0gPSBlbmQub2Zmc2V0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuc3VwcG9ydGVkIHRva2VuICR7dG9rZW4udHlwZX1gKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbCBhdCBlbmQgb2YgaW5wdXQgdG8geWllbGQgYW55IHJlbWFpbmluZyBkb2N1bWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZURvYyAtIElmIHRoZSBzdHJlYW0gY29udGFpbnMgbm8gZG9jdW1lbnQsIHN0aWxsIGVtaXQgYSBmaW5hbCBkb2N1bWVudCBpbmNsdWRpbmcgYW55IGNvbW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHN1YnNlcXVlbnQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIGVuZE9mZnNldCAtIFNob3VsZCBiZSBzZXQgaWYgYGZvcmNlRG9jYCBpcyBhbHNvIHNldCwgdG8gc2V0IHRoZSBkb2N1bWVudCByYW5nZSBlbmQgYW5kIHRvIGluZGljYXRlIGVycm9ycyBjb3JyZWN0bHkuXG4gICAgICovXG4gICAgKmVuZChmb3JjZURvYyA9IGZhbHNlLCBlbmRPZmZzZXQgPSAtMSkge1xuICAgICAgICBpZiAodGhpcy5kb2MpIHtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUodGhpcy5kb2MsIHRydWUpO1xuICAgICAgICAgICAgeWllbGQgdGhpcy5kb2M7XG4gICAgICAgICAgICB0aGlzLmRvYyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZm9yY2VEb2MpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHsgX2RpcmVjdGl2ZXM6IHRoaXMuZGlyZWN0aXZlcyB9LCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgZG9jID0gbmV3IERvY3VtZW50KHVuZGVmaW5lZCwgb3B0cyk7XG4gICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGVuZE9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdNaXNzaW5nIGRpcmVjdGl2ZXMtZW5kIGluZGljYXRvciBsaW5lJyk7XG4gICAgICAgICAgICBkb2MucmFuZ2UgPSBbMCwgZW5kT2Zmc2V0LCBlbmRPZmZzZXRdO1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZShkb2MsIGZhbHNlKTtcbiAgICAgICAgICAgIHlpZWxkIGRvYztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgQ29tcG9zZXIgfTtcbiIsImltcG9ydCB7IFBhaXIgfSBmcm9tICcuLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IFlBTUxNYXAgfSBmcm9tICcuLi9ub2Rlcy9ZQU1MTWFwLmpzJztcbmltcG9ydCB7IHJlc29sdmVQcm9wcyB9IGZyb20gJy4vcmVzb2x2ZS1wcm9wcy5qcyc7XG5pbXBvcnQgeyBjb250YWluc05ld2xpbmUgfSBmcm9tICcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcyc7XG5pbXBvcnQgeyBmbG93SW5kZW50Q2hlY2sgfSBmcm9tICcuL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMnO1xuaW1wb3J0IHsgbWFwSW5jbHVkZXMgfSBmcm9tICcuL3V0aWwtbWFwLWluY2x1ZGVzLmpzJztcblxuY29uc3Qgc3RhcnRDb2xNc2cgPSAnQWxsIG1hcHBpbmcgaXRlbXMgbXVzdCBzdGFydCBhdCB0aGUgc2FtZSBjb2x1bW4nO1xuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrTWFwKHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSwgY3R4LCBibSwgb25FcnJvciwgdGFnKSB7XG4gICAgY29uc3QgTm9kZUNsYXNzID0gdGFnPy5ub2RlQ2xhc3MgPz8gWUFNTE1hcDtcbiAgICBjb25zdCBtYXAgPSBuZXcgTm9kZUNsYXNzKGN0eC5zY2hlbWEpO1xuICAgIGlmIChjdHguYXRSb290KVxuICAgICAgICBjdHguYXRSb290ID0gZmFsc2U7XG4gICAgbGV0IG9mZnNldCA9IGJtLm9mZnNldDtcbiAgICBsZXQgY29tbWVudEVuZCA9IG51bGw7XG4gICAgZm9yIChjb25zdCBjb2xsSXRlbSBvZiBibS5pdGVtcykge1xuICAgICAgICBjb25zdCB7IHN0YXJ0LCBrZXksIHNlcCwgdmFsdWUgfSA9IGNvbGxJdGVtO1xuICAgICAgICAvLyBrZXkgcHJvcGVydGllc1xuICAgICAgICBjb25zdCBrZXlQcm9wcyA9IHJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnZXhwbGljaXQta2V5LWluZCcsXG4gICAgICAgICAgICBuZXh0OiBrZXkgPz8gc2VwPy5bMF0sXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBibS5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgaW1wbGljaXRLZXkgPSAha2V5UHJvcHMuZm91bmQ7XG4gICAgICAgIGlmIChpbXBsaWNpdEtleSkge1xuICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkudHlwZSA9PT0gJ2Jsb2NrLXNlcScpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkxPQ0tfQVNfSU1QTElDSVRfS0VZJywgJ0EgYmxvY2sgc2VxdWVuY2UgbWF5IG5vdCBiZSB1c2VkIGFzIGFuIGltcGxpY2l0IG1hcCBrZXknKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICgnaW5kZW50JyBpbiBrZXkgJiYga2V5LmluZGVudCAhPT0gYm0uaW5kZW50KVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9JTkRFTlQnLCBzdGFydENvbE1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWtleVByb3BzLmFuY2hvciAmJiAha2V5UHJvcHMudGFnICYmICFzZXApIHtcbiAgICAgICAgICAgICAgICBjb21tZW50RW5kID0ga2V5UHJvcHMuZW5kO1xuICAgICAgICAgICAgICAgIGlmIChrZXlQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXAuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5jb21tZW50ICs9ICdcXG4nICsga2V5UHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLmNvbW1lbnQgPSBrZXlQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChrZXlQcm9wcy5oYXNOZXdsaW5lQWZ0ZXJQcm9wIHx8IGNvbnRhaW5zTmV3bGluZShrZXkpKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXkgPz8gc3RhcnRbc3RhcnQubGVuZ3RoIC0gMV0sICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5UHJvcHMuZm91bmQ/LmluZGVudCAhPT0gYm0uaW5kZW50KSB7XG4gICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9JTkRFTlQnLCBzdGFydENvbE1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8ga2V5IHZhbHVlXG4gICAgICAgIGNvbnN0IGtleVN0YXJ0ID0ga2V5UHJvcHMuZW5kO1xuICAgICAgICBjb25zdCBrZXlOb2RlID0ga2V5XG4gICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwga2V5LCBrZXlQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIGtleVN0YXJ0LCBzdGFydCwgbnVsbCwga2V5UHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoY3R4LnNjaGVtYS5jb21wYXQpXG4gICAgICAgICAgICBmbG93SW5kZW50Q2hlY2soYm0uaW5kZW50LCBrZXksIG9uRXJyb3IpO1xuICAgICAgICBpZiAobWFwSW5jbHVkZXMoY3R4LCBtYXAuaXRlbXMsIGtleU5vZGUpKVxuICAgICAgICAgICAgb25FcnJvcihrZXlTdGFydCwgJ0RVUExJQ0FURV9LRVknLCAnTWFwIGtleXMgbXVzdCBiZSB1bmlxdWUnKTtcbiAgICAgICAgLy8gdmFsdWUgcHJvcGVydGllc1xuICAgICAgICBjb25zdCB2YWx1ZVByb3BzID0gcmVzb2x2ZVByb3BzKHNlcCA/PyBbXSwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnbWFwLXZhbHVlLWluZCcsXG4gICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgIG9mZnNldDoga2V5Tm9kZS5yYW5nZVsyXSxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJtLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiAha2V5IHx8IGtleS50eXBlID09PSAnYmxvY2stc2NhbGFyJ1xuICAgICAgICB9KTtcbiAgICAgICAgb2Zmc2V0ID0gdmFsdWVQcm9wcy5lbmQ7XG4gICAgICAgIGlmICh2YWx1ZVByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAoaW1wbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWU/LnR5cGUgPT09ICdibG9jay1tYXAnICYmICF2YWx1ZVByb3BzLmhhc05ld2xpbmUpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkxPQ0tfQVNfSU1QTElDSVRfS0VZJywgJ05lc3RlZCBtYXBwaW5ncyBhcmUgbm90IGFsbG93ZWQgaW4gY29tcGFjdCBtYXBwaW5ncycpO1xuICAgICAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5zdHJpY3QgJiZcbiAgICAgICAgICAgICAgICAgICAga2V5UHJvcHMuc3RhcnQgPCB2YWx1ZVByb3BzLmZvdW5kLm9mZnNldCAtIDEwMjQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ0tFWV9PVkVSXzEwMjRfQ0hBUlMnLCAnVGhlIDogaW5kaWNhdG9yIG11c3QgYmUgYXQgbW9zdCAxMDI0IGNoYXJzIGFmdGVyIHRoZSBzdGFydCBvZiBhbiBpbXBsaWNpdCBibG9jayBtYXBwaW5nIGtleScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdmFsdWUgdmFsdWVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlTm9kZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIG9mZnNldCwgc2VwLCBudWxsLCB2YWx1ZVByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgICAgICBmbG93SW5kZW50Q2hlY2soYm0uaW5kZW50LCB2YWx1ZSwgb25FcnJvcik7XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUucmFuZ2VbMl07XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIoa2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8ga2V5IHdpdGggbm8gdmFsdWVcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdNSVNTSU5HX0NIQVInLCAnSW1wbGljaXQgbWFwIGtleXMgbmVlZCB0byBiZSBmb2xsb3dlZCBieSBtYXAgdmFsdWVzJyk7XG4gICAgICAgICAgICBpZiAodmFsdWVQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleU5vZGUuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ICs9ICdcXG4nICsgdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ID0gdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyKGtleU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbW1lbnRFbmQgJiYgY29tbWVudEVuZCA8IG9mZnNldClcbiAgICAgICAgb25FcnJvcihjb21tZW50RW5kLCAnSU1QT1NTSUJMRScsICdNYXAgY29tbWVudCB3aXRoIHRyYWlsaW5nIGNvbnRlbnQnKTtcbiAgICBtYXAucmFuZ2UgPSBbYm0ub2Zmc2V0LCBvZmZzZXQsIGNvbW1lbnRFbmQgPz8gb2Zmc2V0XTtcbiAgICByZXR1cm4gbWFwO1xufVxuXG5leHBvcnQgeyByZXNvbHZlQmxvY2tNYXAgfTtcbiIsImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVCbG9ja1NjYWxhcihjdHgsIHNjYWxhciwgb25FcnJvcikge1xuICAgIGNvbnN0IHN0YXJ0ID0gc2NhbGFyLm9mZnNldDtcbiAgICBjb25zdCBoZWFkZXIgPSBwYXJzZUJsb2NrU2NhbGFySGVhZGVyKHNjYWxhciwgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICBpZiAoIWhlYWRlcilcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6ICcnLCB0eXBlOiBudWxsLCBjb21tZW50OiAnJywgcmFuZ2U6IFtzdGFydCwgc3RhcnQsIHN0YXJ0XSB9O1xuICAgIGNvbnN0IHR5cGUgPSBoZWFkZXIubW9kZSA9PT0gJz4nID8gU2NhbGFyLkJMT0NLX0ZPTERFRCA6IFNjYWxhci5CTE9DS19MSVRFUkFMO1xuICAgIGNvbnN0IGxpbmVzID0gc2NhbGFyLnNvdXJjZSA/IHNwbGl0TGluZXMoc2NhbGFyLnNvdXJjZSkgOiBbXTtcbiAgICAvLyBkZXRlcm1pbmUgdGhlIGVuZCBvZiBjb250ZW50ICYgc3RhcnQgb2YgY2hvbXBpbmdcbiAgICBsZXQgY2hvbXBTdGFydCA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gbGluZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGxpbmVzW2ldWzFdO1xuICAgICAgICBpZiAoY29udGVudCA9PT0gJycgfHwgY29udGVudCA9PT0gJ1xccicpXG4gICAgICAgICAgICBjaG9tcFN0YXJ0ID0gaTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIHNob3J0Y3V0IGZvciBlbXB0eSBjb250ZW50c1xuICAgIGlmIChjaG9tcFN0YXJ0ID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaGVhZGVyLmNob21wID09PSAnKycgJiYgbGluZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyAnXFxuJy5yZXBlYXQoTWF0aC5tYXgoMSwgbGluZXMubGVuZ3RoIC0gMSkpXG4gICAgICAgICAgICA6ICcnO1xuICAgICAgICBsZXQgZW5kID0gc3RhcnQgKyBoZWFkZXIubGVuZ3RoO1xuICAgICAgICBpZiAoc2NhbGFyLnNvdXJjZSlcbiAgICAgICAgICAgIGVuZCArPSBzY2FsYXIuc291cmNlLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQ6IGhlYWRlci5jb21tZW50LCByYW5nZTogW3N0YXJ0LCBlbmQsIGVuZF0gfTtcbiAgICB9XG4gICAgLy8gZmluZCB0aGUgaW5kZW50YXRpb24gbGV2ZWwgdG8gdHJpbSBmcm9tIHN0YXJ0XG4gICAgbGV0IHRyaW1JbmRlbnQgPSBzY2FsYXIuaW5kZW50ICsgaGVhZGVyLmluZGVudDtcbiAgICBsZXQgb2Zmc2V0ID0gc2NhbGFyLm9mZnNldCArIGhlYWRlci5sZW5ndGg7XG4gICAgbGV0IGNvbnRlbnRTdGFydCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaG9tcFN0YXJ0OyArK2kpIHtcbiAgICAgICAgY29uc3QgW2luZGVudCwgY29udGVudF0gPSBsaW5lc1tpXTtcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09ICcnIHx8IGNvbnRlbnQgPT09ICdcXHInKSB7XG4gICAgICAgICAgICBpZiAoaGVhZGVyLmluZGVudCA9PT0gMCAmJiBpbmRlbnQubGVuZ3RoID4gdHJpbUluZGVudClcbiAgICAgICAgICAgICAgICB0cmltSW5kZW50ID0gaW5kZW50Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRlbnQubGVuZ3RoIDwgdHJpbUluZGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQmxvY2sgc2NhbGFycyB3aXRoIG1vcmUtaW5kZW50ZWQgbGVhZGluZyBlbXB0eSBsaW5lcyBtdXN0IHVzZSBhbiBleHBsaWNpdCBpbmRlbnRhdGlvbiBpbmRpY2F0b3InO1xuICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0ICsgaW5kZW50Lmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhlYWRlci5pbmRlbnQgPT09IDApXG4gICAgICAgICAgICAgICAgdHJpbUluZGVudCA9IGluZGVudC5sZW5ndGg7XG4gICAgICAgICAgICBjb250ZW50U3RhcnQgPSBpO1xuICAgICAgICAgICAgaWYgKHRyaW1JbmRlbnQgPT09IDAgJiYgIWN0eC5hdFJvb3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0Jsb2NrIHNjYWxhciB2YWx1ZXMgaW4gY29sbGVjdGlvbnMgbXVzdCBiZSBpbmRlbnRlZCc7XG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgKz0gaW5kZW50Lmxlbmd0aCArIGNvbnRlbnQubGVuZ3RoICsgMTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZSB0cmFpbGluZyBtb3JlLWluZGVudGVkIGVtcHR5IGxpbmVzIGluIGNvbnRlbnRcbiAgICBmb3IgKGxldCBpID0gbGluZXMubGVuZ3RoIC0gMTsgaSA+PSBjaG9tcFN0YXJ0OyAtLWkpIHtcbiAgICAgICAgaWYgKGxpbmVzW2ldWzBdLmxlbmd0aCA+IHRyaW1JbmRlbnQpXG4gICAgICAgICAgICBjaG9tcFN0YXJ0ID0gaSArIDE7XG4gICAgfVxuICAgIGxldCB2YWx1ZSA9ICcnO1xuICAgIGxldCBzZXAgPSAnJztcbiAgICBsZXQgcHJldk1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgIC8vIGxlYWRpbmcgd2hpdGVzcGFjZSBpcyBrZXB0IGludGFjdFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudFN0YXJ0OyArK2kpXG4gICAgICAgIHZhbHVlICs9IGxpbmVzW2ldWzBdLnNsaWNlKHRyaW1JbmRlbnQpICsgJ1xcbic7XG4gICAgZm9yIChsZXQgaSA9IGNvbnRlbnRTdGFydDsgaSA8IGNob21wU3RhcnQ7ICsraSkge1xuICAgICAgICBsZXQgW2luZGVudCwgY29udGVudF0gPSBsaW5lc1tpXTtcbiAgICAgICAgb2Zmc2V0ICs9IGluZGVudC5sZW5ndGggKyBjb250ZW50Lmxlbmd0aCArIDE7XG4gICAgICAgIGNvbnN0IGNybGYgPSBjb250ZW50W2NvbnRlbnQubGVuZ3RoIC0gMV0gPT09ICdcXHInO1xuICAgICAgICBpZiAoY3JsZilcbiAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmIGFscmVhZHkgY2F1Z2h0IGluIGxleGVyICovXG4gICAgICAgIGlmIChjb250ZW50ICYmIGluZGVudC5sZW5ndGggPCB0cmltSW5kZW50KSB7XG4gICAgICAgICAgICBjb25zdCBzcmMgPSBoZWFkZXIuaW5kZW50XG4gICAgICAgICAgICAgICAgPyAnZXhwbGljaXQgaW5kZW50YXRpb24gaW5kaWNhdG9yJ1xuICAgICAgICAgICAgICAgIDogJ2ZpcnN0IGxpbmUnO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBCbG9jayBzY2FsYXIgbGluZXMgbXVzdCBub3QgYmUgbGVzcyBpbmRlbnRlZCB0aGFuIHRoZWlyICR7c3JjfWA7XG4gICAgICAgICAgICBvbkVycm9yKG9mZnNldCAtIGNvbnRlbnQubGVuZ3RoIC0gKGNybGYgPyAyIDogMSksICdCQURfSU5ERU5UJywgbWVzc2FnZSk7XG4gICAgICAgICAgICBpbmRlbnQgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gU2NhbGFyLkJMT0NLX0xJVEVSQUwpIHtcbiAgICAgICAgICAgIHZhbHVlICs9IHNlcCArIGluZGVudC5zbGljZSh0cmltSW5kZW50KSArIGNvbnRlbnQ7XG4gICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbmRlbnQubGVuZ3RoID4gdHJpbUluZGVudCB8fCBjb250ZW50WzBdID09PSAnXFx0Jykge1xuICAgICAgICAgICAgLy8gbW9yZS1pbmRlbnRlZCBjb250ZW50IHdpdGhpbiBhIGZvbGRlZCBibG9ja1xuICAgICAgICAgICAgaWYgKHNlcCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICAgICAgZWxzZSBpZiAoIXByZXZNb3JlSW5kZW50ZWQgJiYgc2VwID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICBzZXAgPSAnXFxuXFxuJztcbiAgICAgICAgICAgIHZhbHVlICs9IHNlcCArIGluZGVudC5zbGljZSh0cmltSW5kZW50KSArIGNvbnRlbnQ7XG4gICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgICAgIHByZXZNb3JlSW5kZW50ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbnRlbnQgPT09ICcnKSB7XG4gICAgICAgICAgICAvLyBlbXB0eSBsaW5lXG4gICAgICAgICAgICBpZiAoc2VwID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAnXFxuJztcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlICs9IHNlcCArIGNvbnRlbnQ7XG4gICAgICAgICAgICBzZXAgPSAnICc7XG4gICAgICAgICAgICBwcmV2TW9yZUluZGVudGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3dpdGNoIChoZWFkZXIuY2hvbXApIHtcbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2hvbXBTdGFydDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nICsgbGluZXNbaV1bMF0uc2xpY2UodHJpbUluZGVudCk7XG4gICAgICAgICAgICBpZiAodmFsdWVbdmFsdWUubGVuZ3RoIC0gMV0gIT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB2YWx1ZSArPSAnXFxuJztcbiAgICB9XG4gICAgY29uc3QgZW5kID0gc3RhcnQgKyBoZWFkZXIubGVuZ3RoICsgc2NhbGFyLnNvdXJjZS5sZW5ndGg7XG4gICAgcmV0dXJuIHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQ6IGhlYWRlci5jb21tZW50LCByYW5nZTogW3N0YXJ0LCBlbmQsIGVuZF0gfTtcbn1cbmZ1bmN0aW9uIHBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoeyBvZmZzZXQsIHByb3BzIH0sIHN0cmljdCwgb25FcnJvcikge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgIGlmIChwcm9wc1swXS50eXBlICE9PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpIHtcbiAgICAgICAgb25FcnJvcihwcm9wc1swXSwgJ0lNUE9TU0lCTEUnLCAnQmxvY2sgc2NhbGFyIGhlYWRlciBub3QgZm91bmQnKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHsgc291cmNlIH0gPSBwcm9wc1swXTtcbiAgICBjb25zdCBtb2RlID0gc291cmNlWzBdO1xuICAgIGxldCBpbmRlbnQgPSAwO1xuICAgIGxldCBjaG9tcCA9ICcnO1xuICAgIGxldCBlcnJvciA9IC0xO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc291cmNlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGNoID0gc291cmNlW2ldO1xuICAgICAgICBpZiAoIWNob21wICYmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnKycpKVxuICAgICAgICAgICAgY2hvbXAgPSBjaDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBuID0gTnVtYmVyKGNoKTtcbiAgICAgICAgICAgIGlmICghaW5kZW50ICYmIG4pXG4gICAgICAgICAgICAgICAgaW5kZW50ID0gbjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGVycm9yID09PSAtMSlcbiAgICAgICAgICAgICAgICBlcnJvciA9IG9mZnNldCArIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVycm9yICE9PSAtMSlcbiAgICAgICAgb25FcnJvcihlcnJvciwgJ1VORVhQRUNURURfVE9LRU4nLCBgQmxvY2sgc2NhbGFyIGhlYWRlciBpbmNsdWRlcyBleHRyYSBjaGFyYWN0ZXJzOiAke3NvdXJjZX1gKTtcbiAgICBsZXQgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGxldCBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcHJvcHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBwcm9wc1tpXTtcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0b2tlbi5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKHN0cmljdCAmJiAhaGFzU3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJztcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gdG9rZW4uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gdG9rZW4uc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIHRva2VuLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0b2tlbi5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYFVuZXhwZWN0ZWQgdG9rZW4gaW4gYmxvY2sgc2NhbGFyIGhlYWRlcjogJHt0b2tlbi50eXBlfWA7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0cyA9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICBpZiAodHMgJiYgdHlwZW9mIHRzID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRzLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBtb2RlLCBpbmRlbnQsIGNob21wLCBjb21tZW50LCBsZW5ndGggfTtcbn1cbi8qKiBAcmV0dXJucyBBcnJheSBvZiBsaW5lcyBzcGxpdCB1cCBhcyBgW2luZGVudCwgY29udGVudF1gICovXG5mdW5jdGlvbiBzcGxpdExpbmVzKHNvdXJjZSkge1xuICAgIGNvbnN0IHNwbGl0ID0gc291cmNlLnNwbGl0KC9cXG4oICopLyk7XG4gICAgY29uc3QgZmlyc3QgPSBzcGxpdFswXTtcbiAgICBjb25zdCBtID0gZmlyc3QubWF0Y2goL14oICopLyk7XG4gICAgY29uc3QgbGluZTAgPSBtPy5bMV1cbiAgICAgICAgPyBbbVsxXSwgZmlyc3Quc2xpY2UobVsxXS5sZW5ndGgpXVxuICAgICAgICA6IFsnJywgZmlyc3RdO1xuICAgIGNvbnN0IGxpbmVzID0gW2xpbmUwXTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNwbGl0Lmxlbmd0aDsgaSArPSAyKVxuICAgICAgICBsaW5lcy5wdXNoKFtzcGxpdFtpXSwgc3BsaXRbaSArIDFdXSk7XG4gICAgcmV0dXJuIGxpbmVzO1xufVxuXG5leHBvcnQgeyByZXNvbHZlQmxvY2tTY2FsYXIgfTtcbiIsImltcG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuLi9ub2Rlcy9ZQU1MU2VxLmpzJztcbmltcG9ydCB7IHJlc29sdmVQcm9wcyB9IGZyb20gJy4vcmVzb2x2ZS1wcm9wcy5qcyc7XG5pbXBvcnQgeyBmbG93SW5kZW50Q2hlY2sgfSBmcm9tICcuL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlQmxvY2tTZXEoeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGJzLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSB0YWc/Lm5vZGVDbGFzcyA/PyBZQU1MU2VxO1xuICAgIGNvbnN0IHNlcSA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgaWYgKGN0eC5hdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gYnMub2Zmc2V0O1xuICAgIGxldCBjb21tZW50RW5kID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHsgc3RhcnQsIHZhbHVlIH0gb2YgYnMuaXRlbXMpIHtcbiAgICAgICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGluZGljYXRvcjogJ3NlcS1pdGVtLWluZCcsXG4gICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJzLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMuYW5jaG9yIHx8IHByb3BzLnRhZyB8fCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS50eXBlID09PSAnYmxvY2stc2VxJylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5lbmQsICdCQURfSU5ERU5UJywgJ0FsbCBzZXF1ZW5jZSBpdGVtcyBtdXN0IHN0YXJ0IGF0IHRoZSBzYW1lIGNvbHVtbicpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnU2VxdWVuY2UgaXRlbSB3aXRob3V0IC0gaW5kaWNhdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21tZW50RW5kID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBzZXEuY29tbWVudCA9IHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgbm9kZSA9IHZhbHVlXG4gICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoY3R4LnNjaGVtYS5jb21wYXQpXG4gICAgICAgICAgICBmbG93SW5kZW50Q2hlY2soYnMuaW5kZW50LCB2YWx1ZSwgb25FcnJvcik7XG4gICAgICAgIG9mZnNldCA9IG5vZGUucmFuZ2VbMl07XG4gICAgICAgIHNlcS5pdGVtcy5wdXNoKG5vZGUpO1xuICAgIH1cbiAgICBzZXEucmFuZ2UgPSBbYnMub2Zmc2V0LCBvZmZzZXQsIGNvbW1lbnRFbmQgPz8gb2Zmc2V0XTtcbiAgICByZXR1cm4gc2VxO1xufVxuXG5leHBvcnQgeyByZXNvbHZlQmxvY2tTZXEgfTtcbiIsImZ1bmN0aW9uIHJlc29sdmVFbmQoZW5kLCBvZmZzZXQsIHJlcVNwYWNlLCBvbkVycm9yKSB7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBpZiAoZW5kKSB7XG4gICAgICAgIGxldCBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICBsZXQgc2VwID0gJyc7XG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgZW5kKSB7XG4gICAgICAgICAgICBjb25zdCB7IHNvdXJjZSwgdHlwZSB9ID0gdG9rZW47XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcVNwYWNlICYmICFoYXNTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnQ29tbWVudHMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSBvdGhlciB0b2tlbnMgYnkgd2hpdGUgc3BhY2UgY2hhcmFjdGVycycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYiA9IHNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gY2I7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gc2VwICsgY2I7XG4gICAgICAgICAgICAgICAgICAgIHNlcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VwICs9IHNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dHlwZX0gYXQgbm9kZSBlbmRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGNvbW1lbnQsIG9mZnNldCB9O1xufVxuXG5leHBvcnQgeyByZXNvbHZlRW5kIH07XG4iLCJpbXBvcnQgeyBpc1BhaXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyIH0gZnJvbSAnLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5pbXBvcnQgeyByZXNvbHZlUHJvcHMgfSBmcm9tICcuL3Jlc29sdmUtcHJvcHMuanMnO1xuaW1wb3J0IHsgY29udGFpbnNOZXdsaW5lIH0gZnJvbSAnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnO1xuaW1wb3J0IHsgbWFwSW5jbHVkZXMgfSBmcm9tICcuL3V0aWwtbWFwLWluY2x1ZGVzLmpzJztcblxuY29uc3QgYmxvY2tNc2cgPSAnQmxvY2sgY29sbGVjdGlvbnMgYXJlIG5vdCBhbGxvd2VkIHdpdGhpbiBmbG93IGNvbGxlY3Rpb25zJztcbmNvbnN0IGlzQmxvY2sgPSAodG9rZW4pID0+IHRva2VuICYmICh0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJyB8fCB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJyk7XG5mdW5jdGlvbiByZXNvbHZlRmxvd0NvbGxlY3Rpb24oeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGZjLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBpc01hcCA9IGZjLnN0YXJ0LnNvdXJjZSA9PT0gJ3snO1xuICAgIGNvbnN0IGZjTmFtZSA9IGlzTWFwID8gJ2Zsb3cgbWFwJyA6ICdmbG93IHNlcXVlbmNlJztcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSAodGFnPy5ub2RlQ2xhc3MgPz8gKGlzTWFwID8gWUFNTE1hcCA6IFlBTUxTZXEpKTtcbiAgICBjb25zdCBjb2xsID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBjb2xsLmZsb3cgPSB0cnVlO1xuICAgIGNvbnN0IGF0Um9vdCA9IGN0eC5hdFJvb3Q7XG4gICAgaWYgKGF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBmYy5vZmZzZXQgKyBmYy5zdGFydC5zb3VyY2UubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmMuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgY29sbEl0ZW0gPSBmYy5pdGVtc1tpXTtcbiAgICAgICAgY29uc3QgeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0gPSBjb2xsSXRlbTtcbiAgICAgICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGZsb3c6IGZjTmFtZSxcbiAgICAgICAgICAgIGluZGljYXRvcjogJ2V4cGxpY2l0LWtleS1pbmQnLFxuICAgICAgICAgICAgbmV4dDoga2V5ID8/IHNlcD8uWzBdLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogZmMuaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAoIXByb3BzLmFuY2hvciAmJiAhcHJvcHMudGFnICYmICFzZXAgJiYgIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgcHJvcHMuY29tbWEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuY29tbWEsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgLCBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpIDwgZmMuaXRlbXMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5zdGFydCwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCBlbXB0eSBpdGVtIGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xsLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgKz0gJ1xcbicgKyBwcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgPSBwcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzTWFwICYmIGN0eC5vcHRpb25zLnN0cmljdCAmJiBjb250YWluc05ld2xpbmUoa2V5KSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleSwgLy8gY2hlY2tlZCBieSBjb250YWluc05ld2xpbmUoKVxuICAgICAgICAgICAgICAgICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgb2YgZmxvdyBzZXF1ZW5jZSBwYWlycyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuY29tbWEsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgLCBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghcHJvcHMuY29tbWEpXG4gICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5zdGFydCwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nICwgYmV0d2VlbiAke2ZjTmFtZX0gaXRlbXNgKTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgbGV0IHByZXZJdGVtQ29tbWVudCA9ICcnO1xuICAgICAgICAgICAgICAgIGxvb3A6IGZvciAoY29uc3Qgc3Qgb2Ygc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2SXRlbUNvbW1lbnQgPSBzdC5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHByZXZJdGVtQ29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldiA9IGNvbGwuaXRlbXNbY29sbC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUGFpcihwcmV2KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYgPSBwcmV2LnZhbHVlID8/IHByZXYua2V5O1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldi5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldi5jb21tZW50ICs9ICdcXG4nICsgcHJldkl0ZW1Db21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2LmNvbW1lbnQgPSBwcmV2SXRlbUNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmNvbW1lbnQgPSBwcm9wcy5jb21tZW50LnN1YnN0cmluZyhwcmV2SXRlbUNvbW1lbnQubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNNYXAgJiYgIXNlcCAmJiAhcHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIC8vIGl0ZW0gaXMgYSB2YWx1ZSBpbiBhIHNlcVxuICAgICAgICAgICAgLy8g4oaSIGtleSAmIHNlcCBhcmUgZW1wdHksIHN0YXJ0IGRvZXMgbm90IGluY2x1ZGUgPyBvciA6XG4gICAgICAgICAgICBjb25zdCB2YWx1ZU5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzZXAsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGNvbGwuaXRlbXMucHVzaCh2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgb2Zmc2V0ID0gdmFsdWVOb2RlLnJhbmdlWzJdO1xuICAgICAgICAgICAgaWYgKGlzQmxvY2sodmFsdWUpKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVOb2RlLnJhbmdlLCAnQkxPQ0tfSU5fRkxPVycsIGJsb2NrTXNnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGl0ZW0gaXMgYSBrZXkrdmFsdWUgcGFpclxuICAgICAgICAgICAgLy8ga2V5IHZhbHVlXG4gICAgICAgICAgICBjb25zdCBrZXlTdGFydCA9IHByb3BzLmVuZDtcbiAgICAgICAgICAgIGNvbnN0IGtleU5vZGUgPSBrZXlcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwga2V5LCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBrZXlTdGFydCwgc3RhcnQsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChpc0Jsb2NrKGtleSkpXG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXlOb2RlLnJhbmdlLCAnQkxPQ0tfSU5fRkxPVycsIGJsb2NrTXNnKTtcbiAgICAgICAgICAgIC8vIHZhbHVlIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlUHJvcHMgPSByZXNvbHZlUHJvcHMoc2VwID8/IFtdLCB7XG4gICAgICAgICAgICAgICAgZmxvdzogZmNOYW1lLFxuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ21hcC12YWx1ZS1pbmQnLFxuICAgICAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgICAgIG9mZnNldDoga2V5Tm9kZS5yYW5nZVsyXSxcbiAgICAgICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgICAgIHBhcmVudEluZGVudDogZmMuaW5kZW50LFxuICAgICAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodmFsdWVQcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgICAgIGlmICghaXNNYXAgJiYgIXByb3BzLmZvdW5kICYmIGN0eC5vcHRpb25zLnN0cmljdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBzZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QgPT09IHZhbHVlUHJvcHMuZm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcihzdCwgJ01VTFRJTElORV9JTVBMSUNJVF9LRVknLCAnSW1wbGljaXQga2V5cyBvZiBmbG93IHNlcXVlbmNlIHBhaXJzIG5lZWQgdG8gYmUgb24gYSBzaW5nbGUgbGluZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wcy5zdGFydCA8IHZhbHVlUHJvcHMuZm91bmQub2Zmc2V0IC0gMTAyNClcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVQcm9wcy5mb3VuZCwgJ0tFWV9PVkVSXzEwMjRfQ0hBUlMnLCAnVGhlIDogaW5kaWNhdG9yIG11c3QgYmUgYXQgbW9zdCAxMDI0IGNoYXJzIGFmdGVyIHRoZSBzdGFydCBvZiBhbiBpbXBsaWNpdCBmbG93IHNlcXVlbmNlIGtleScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdzb3VyY2UnIGluIHZhbHVlICYmIHZhbHVlLnNvdXJjZSAmJiB2YWx1ZS5zb3VyY2VbMF0gPT09ICc6JylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZSwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nIHNwYWNlIGFmdGVyIDogaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlUHJvcHMuc3RhcnQsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyAsIG9yIDogYmV0d2VlbiAke2ZjTmFtZX0gaXRlbXNgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHZhbHVlIHZhbHVlXG4gICAgICAgICAgICBjb25zdCB2YWx1ZU5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgdmFsdWVQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICA6IHZhbHVlUHJvcHMuZm91bmRcbiAgICAgICAgICAgICAgICAgICAgPyBjb21wb3NlRW1wdHlOb2RlKGN0eCwgdmFsdWVQcm9wcy5lbmQsIHNlcCwgbnVsbCwgdmFsdWVQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgaWYgKHZhbHVlTm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0Jsb2NrKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWVQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleU5vZGUuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ICs9ICdcXG4nICsgdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ID0gdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyKGtleU5vZGUsIHZhbHVlTm9kZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucylcbiAgICAgICAgICAgICAgICBwYWlyLnNyY1Rva2VuID0gY29sbEl0ZW07XG4gICAgICAgICAgICBpZiAoaXNNYXApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBjb2xsO1xuICAgICAgICAgICAgICAgIGlmIChtYXBJbmNsdWRlcyhjdHgsIG1hcC5pdGVtcywga2V5Tm9kZSkpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5U3RhcnQsICdEVVBMSUNBVEVfS0VZJywgJ01hcCBrZXlzIG11c3QgYmUgdW5pcXVlJyk7XG4gICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBuZXcgWUFNTE1hcChjdHguc2NoZW1hKTtcbiAgICAgICAgICAgICAgICBtYXAuZmxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgICAgICAgICAgY29sbC5pdGVtcy5wdXNoKG1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUgPyB2YWx1ZU5vZGUucmFuZ2VbMl0gOiB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBleHBlY3RlZEVuZCA9IGlzTWFwID8gJ30nIDogJ10nO1xuICAgIGNvbnN0IFtjZSwgLi4uZWVdID0gZmMuZW5kO1xuICAgIGxldCBjZVBvcyA9IG9mZnNldDtcbiAgICBpZiAoY2UgJiYgY2Uuc291cmNlID09PSBleHBlY3RlZEVuZClcbiAgICAgICAgY2VQb3MgPSBjZS5vZmZzZXQgKyBjZS5zb3VyY2UubGVuZ3RoO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBuYW1lID0gZmNOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBmY05hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICBjb25zdCBtc2cgPSBhdFJvb3RcbiAgICAgICAgICAgID8gYCR7bmFtZX0gbXVzdCBlbmQgd2l0aCBhICR7ZXhwZWN0ZWRFbmR9YFxuICAgICAgICAgICAgOiBgJHtuYW1lfSBpbiBibG9jayBjb2xsZWN0aW9uIG11c3QgYmUgc3VmZmljaWVudGx5IGluZGVudGVkIGFuZCBlbmQgd2l0aCBhICR7ZXhwZWN0ZWRFbmR9YDtcbiAgICAgICAgb25FcnJvcihvZmZzZXQsIGF0Um9vdCA/ICdNSVNTSU5HX0NIQVInIDogJ0JBRF9JTkRFTlQnLCBtc2cpO1xuICAgICAgICBpZiAoY2UgJiYgY2Uuc291cmNlLmxlbmd0aCAhPT0gMSlcbiAgICAgICAgICAgIGVlLnVuc2hpZnQoY2UpO1xuICAgIH1cbiAgICBpZiAoZWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBlbmQgPSByZXNvbHZlRW5kKGVlLCBjZVBvcywgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGVuZC5jb21tZW50KSB7XG4gICAgICAgICAgICBpZiAoY29sbC5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCArPSAnXFxuJyArIGVuZC5jb21tZW50O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCA9IGVuZC5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbGwucmFuZ2UgPSBbZmMub2Zmc2V0LCBjZVBvcywgZW5kLm9mZnNldF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb2xsLnJhbmdlID0gW2ZjLm9mZnNldCwgY2VQb3MsIGNlUG9zXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGw7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVGbG93Q29sbGVjdGlvbiB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IHJlc29sdmVFbmQgfSBmcm9tICcuL3Jlc29sdmUtZW5kLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZUZsb3dTY2FsYXIoc2NhbGFyLCBzdHJpY3QsIG9uRXJyb3IpIHtcbiAgICBjb25zdCB7IG9mZnNldCwgdHlwZSwgc291cmNlLCBlbmQgfSA9IHNjYWxhcjtcbiAgICBsZXQgX3R5cGU7XG4gICAgbGV0IHZhbHVlO1xuICAgIGNvbnN0IF9vbkVycm9yID0gKHJlbCwgY29kZSwgbXNnKSA9PiBvbkVycm9yKG9mZnNldCArIHJlbCwgY29kZSwgbXNnKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlBMQUlOO1xuICAgICAgICAgICAgdmFsdWUgPSBwbGFpblZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlFVT1RFX1NJTkdMRTtcbiAgICAgICAgICAgIHZhbHVlID0gc2luZ2xlUXVvdGVkVmFsdWUoc291cmNlLCBfb25FcnJvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuUVVPVEVfRE9VQkxFO1xuICAgICAgICAgICAgdmFsdWUgPSBkb3VibGVRdW90ZWRWYWx1ZShzb3VyY2UsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgb25FcnJvcihzY2FsYXIsICdVTkVYUEVDVEVEX1RPS0VOJywgYEV4cGVjdGVkIGEgZmxvdyBzY2FsYXIgdmFsdWUsIGJ1dCBmb3VuZDogJHt0eXBlfWApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgdHlwZTogbnVsbCxcbiAgICAgICAgICAgICAgICBjb21tZW50OiAnJyxcbiAgICAgICAgICAgICAgICByYW5nZTogW29mZnNldCwgb2Zmc2V0ICsgc291cmNlLmxlbmd0aCwgb2Zmc2V0ICsgc291cmNlLmxlbmd0aF1cbiAgICAgICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlRW5kID0gb2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQoZW5kLCB2YWx1ZUVuZCwgc3RyaWN0LCBvbkVycm9yKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZSxcbiAgICAgICAgdHlwZTogX3R5cGUsXG4gICAgICAgIGNvbW1lbnQ6IHJlLmNvbW1lbnQsXG4gICAgICAgIHJhbmdlOiBbb2Zmc2V0LCB2YWx1ZUVuZCwgcmUub2Zmc2V0XVxuICAgIH07XG59XG5mdW5jdGlvbiBwbGFpblZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGxldCBiYWRDaGFyID0gJyc7XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnYSB0YWIgY2hhcmFjdGVyJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnZmxvdyBpbmRpY2F0b3IgY2hhcmFjdGVyICwnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdkaXJlY3RpdmUgaW5kaWNhdG9yIGNoYXJhY3RlciAlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6IHtcbiAgICAgICAgICAgIGJhZENoYXIgPSBgYmxvY2sgc2NhbGFyIGluZGljYXRvciAke3NvdXJjZVswXX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgIGNhc2UgJ2AnOiB7XG4gICAgICAgICAgICBiYWRDaGFyID0gYHJlc2VydmVkIGNoYXJhY3RlciAke3NvdXJjZVswXX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJhZENoYXIpXG4gICAgICAgIG9uRXJyb3IoMCwgJ0JBRF9TQ0FMQVJfU1RBUlQnLCBgUGxhaW4gdmFsdWUgY2Fubm90IHN0YXJ0IHdpdGggJHtiYWRDaGFyfWApO1xuICAgIHJldHVybiBmb2xkTGluZXMoc291cmNlKTtcbn1cbmZ1bmN0aW9uIHNpbmdsZVF1b3RlZFZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGlmIChzb3VyY2Vbc291cmNlLmxlbmd0aCAtIDFdICE9PSBcIidcIiB8fCBzb3VyY2UubGVuZ3RoID09PSAxKVxuICAgICAgICBvbkVycm9yKHNvdXJjZS5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCBcIk1pc3NpbmcgY2xvc2luZyAncXVvdGVcIik7XG4gICAgcmV0dXJuIGZvbGRMaW5lcyhzb3VyY2Uuc2xpY2UoMSwgLTEpKS5yZXBsYWNlKC8nJy9nLCBcIidcIik7XG59XG5mdW5jdGlvbiBmb2xkTGluZXMoc291cmNlKSB7XG4gICAgLyoqXG4gICAgICogVGhlIG5lZ2F0aXZlIGxvb2tiZWhpbmQgaGVyZSBhbmQgaW4gdGhlIGByZWAgUmVnRXhwIGlzIHRvXG4gICAgICogcHJldmVudCBjYXVzaW5nIGEgcG9seW5vbWlhbCBzZWFyY2ggdGltZSBpbiBjZXJ0YWluIGNhc2VzLlxuICAgICAqXG4gICAgICogVGhlIHRyeS1jYXRjaCBpcyBmb3IgU2FmYXJpLCB3aGljaCBkb2Vzbid0IHN1cHBvcnQgdGhpcyB5ZXQ6XG4gICAgICogaHR0cHM6Ly9jYW5pdXNlLmNvbS9qcy1yZWdleHAtbG9va2JlaGluZFxuICAgICAqL1xuICAgIGxldCBmaXJzdCwgbGluZTtcbiAgICB0cnkge1xuICAgICAgICBmaXJzdCA9IG5ldyBSZWdFeHAoJyguKj8pKD88IVsgXFx0XSlbIFxcdF0qXFxyP1xcbicsICdzeScpO1xuICAgICAgICBsaW5lID0gbmV3IFJlZ0V4cCgnWyBcXHRdKiguKj8pKD86KD88IVsgXFx0XSlbIFxcdF0qKT9cXHI/XFxuJywgJ3N5Jyk7XG4gICAgfVxuICAgIGNhdGNoIChfKSB7XG4gICAgICAgIGZpcnN0ID0gLyguKj8pWyBcXHRdKlxccj9cXG4vc3k7XG4gICAgICAgIGxpbmUgPSAvWyBcXHRdKiguKj8pWyBcXHRdKlxccj9cXG4vc3k7XG4gICAgfVxuICAgIGxldCBtYXRjaCA9IGZpcnN0LmV4ZWMoc291cmNlKTtcbiAgICBpZiAoIW1hdGNoKVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIGxldCByZXMgPSBtYXRjaFsxXTtcbiAgICBsZXQgc2VwID0gJyAnO1xuICAgIGxldCBwb3MgPSBmaXJzdC5sYXN0SW5kZXg7XG4gICAgbGluZS5sYXN0SW5kZXggPSBwb3M7XG4gICAgd2hpbGUgKChtYXRjaCA9IGxpbmUuZXhlYyhzb3VyY2UpKSkge1xuICAgICAgICBpZiAobWF0Y2hbMV0gPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAoc2VwID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICByZXMgKz0gc2VwO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzICs9IHNlcCArIG1hdGNoWzFdO1xuICAgICAgICAgICAgc2VwID0gJyAnO1xuICAgICAgICB9XG4gICAgICAgIHBvcyA9IGxpbmUubGFzdEluZGV4O1xuICAgIH1cbiAgICBjb25zdCBsYXN0ID0gL1sgXFx0XSooLiopL3N5O1xuICAgIGxhc3QubGFzdEluZGV4ID0gcG9zO1xuICAgIG1hdGNoID0gbGFzdC5leGVjKHNvdXJjZSk7XG4gICAgcmV0dXJuIHJlcyArIHNlcCArIChtYXRjaD8uWzFdID8/ICcnKTtcbn1cbmZ1bmN0aW9uIGRvdWJsZVF1b3RlZFZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGxldCByZXMgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNvdXJjZS5sZW5ndGggLSAxOyArK2kpIHtcbiAgICAgICAgY29uc3QgY2ggPSBzb3VyY2VbaV07XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAxXSA9PT0gJ1xcbicpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgY29uc3QgeyBmb2xkLCBvZmZzZXQgfSA9IGZvbGROZXdsaW5lKHNvdXJjZSwgaSk7XG4gICAgICAgICAgICByZXMgKz0gZm9sZDtcbiAgICAgICAgICAgIGkgPSBvZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgbGV0IG5leHQgPSBzb3VyY2VbKytpXTtcbiAgICAgICAgICAgIGNvbnN0IGNjID0gZXNjYXBlQ29kZXNbbmV4dF07XG4gICAgICAgICAgICBpZiAoY2MpXG4gICAgICAgICAgICAgICAgcmVzICs9IGNjO1xuICAgICAgICAgICAgZWxzZSBpZiAobmV4dCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAvLyBza2lwIGVzY2FwZWQgbmV3bGluZXMsIGJ1dCBzdGlsbCB0cmltIHRoZSBmb2xsb3dpbmcgbGluZVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbaSArIDFdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDFdID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlZCBDUkxGIG5ld2xpbmVzLCBidXQgc3RpbGwgdHJpbSB0aGUgZm9sbG93aW5nIGxpbmVcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAneCcgfHwgbmV4dCA9PT0gJ3UnIHx8IG5leHQgPT09ICdVJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHsgeDogMiwgdTogNCwgVTogOCB9W25leHRdO1xuICAgICAgICAgICAgICAgIHJlcyArPSBwYXJzZUNoYXJDb2RlKHNvdXJjZSwgaSArIDEsIGxlbmd0aCwgb25FcnJvcik7XG4gICAgICAgICAgICAgICAgaSArPSBsZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYXcgPSBzb3VyY2Uuc3Vic3RyKGkgLSAxLCAyKTtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGkgLSAxLCAnQkFEX0RRX0VTQ0FQRScsIGBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZSAke3Jhd31gKTtcbiAgICAgICAgICAgICAgICByZXMgKz0gcmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAvLyB0cmltIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgICAgIGNvbnN0IHdzU3RhcnQgPSBpO1xuICAgICAgICAgICAgbGV0IG5leHQgPSBzb3VyY2VbaSArIDFdO1xuICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgaWYgKG5leHQgIT09ICdcXG4nICYmICEobmV4dCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAyXSA9PT0gJ1xcbicpKVxuICAgICAgICAgICAgICAgIHJlcyArPSBpID4gd3NTdGFydCA/IHNvdXJjZS5zbGljZSh3c1N0YXJ0LCBpICsgMSkgOiBjaDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlcyArPSBjaDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJ1wiJyB8fCBzb3VyY2UubGVuZ3RoID09PSAxKVxuICAgICAgICBvbkVycm9yKHNvdXJjZS5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBjbG9zaW5nIFwicXVvdGUnKTtcbiAgICByZXR1cm4gcmVzO1xufVxuLyoqXG4gKiBGb2xkIGEgc2luZ2xlIG5ld2xpbmUgaW50byBhIHNwYWNlLCBtdWx0aXBsZSBuZXdsaW5lcyB0byBOIC0gMSBuZXdsaW5lcy5cbiAqIFByZXN1bWVzIGBzb3VyY2Vbb2Zmc2V0XSA9PT0gJ1xcbidgXG4gKi9cbmZ1bmN0aW9uIGZvbGROZXdsaW5lKHNvdXJjZSwgb2Zmc2V0KSB7XG4gICAgbGV0IGZvbGQgPSAnJztcbiAgICBsZXQgY2ggPSBzb3VyY2Vbb2Zmc2V0ICsgMV07XG4gICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnIHx8IGNoID09PSAnXFxuJyB8fCBjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJyAmJiBzb3VyY2Vbb2Zmc2V0ICsgMl0gIT09ICdcXG4nKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICBmb2xkICs9ICdcXG4nO1xuICAgICAgICBvZmZzZXQgKz0gMTtcbiAgICAgICAgY2ggPSBzb3VyY2Vbb2Zmc2V0ICsgMV07XG4gICAgfVxuICAgIGlmICghZm9sZClcbiAgICAgICAgZm9sZCA9ICcgJztcbiAgICByZXR1cm4geyBmb2xkLCBvZmZzZXQgfTtcbn1cbmNvbnN0IGVzY2FwZUNvZGVzID0ge1xuICAgICcwJzogJ1xcMCcsIC8vIG51bGwgY2hhcmFjdGVyXG4gICAgYTogJ1xceDA3JywgLy8gYmVsbCBjaGFyYWN0ZXJcbiAgICBiOiAnXFxiJywgLy8gYmFja3NwYWNlXG4gICAgZTogJ1xceDFiJywgLy8gZXNjYXBlIGNoYXJhY3RlclxuICAgIGY6ICdcXGYnLCAvLyBmb3JtIGZlZWRcbiAgICBuOiAnXFxuJywgLy8gbGluZSBmZWVkXG4gICAgcjogJ1xccicsIC8vIGNhcnJpYWdlIHJldHVyblxuICAgIHQ6ICdcXHQnLCAvLyBob3Jpem9udGFsIHRhYlxuICAgIHY6ICdcXHYnLCAvLyB2ZXJ0aWNhbCB0YWJcbiAgICBOOiAnXFx1MDA4NScsIC8vIFVuaWNvZGUgbmV4dCBsaW5lXG4gICAgXzogJ1xcdTAwYTAnLCAvLyBVbmljb2RlIG5vbi1icmVha2luZyBzcGFjZVxuICAgIEw6ICdcXHUyMDI4JywgLy8gVW5pY29kZSBsaW5lIHNlcGFyYXRvclxuICAgIFA6ICdcXHUyMDI5JywgLy8gVW5pY29kZSBwYXJhZ3JhcGggc2VwYXJhdG9yXG4gICAgJyAnOiAnICcsXG4gICAgJ1wiJzogJ1wiJyxcbiAgICAnLyc6ICcvJyxcbiAgICAnXFxcXCc6ICdcXFxcJyxcbiAgICAnXFx0JzogJ1xcdCdcbn07XG5mdW5jdGlvbiBwYXJzZUNoYXJDb2RlKHNvdXJjZSwgb2Zmc2V0LCBsZW5ndGgsIG9uRXJyb3IpIHtcbiAgICBjb25zdCBjYyA9IHNvdXJjZS5zdWJzdHIob2Zmc2V0LCBsZW5ndGgpO1xuICAgIGNvbnN0IG9rID0gY2MubGVuZ3RoID09PSBsZW5ndGggJiYgL15bMC05YS1mQS1GXSskLy50ZXN0KGNjKTtcbiAgICBjb25zdCBjb2RlID0gb2sgPyBwYXJzZUludChjYywgMTYpIDogTmFOO1xuICAgIGlmIChpc05hTihjb2RlKSkge1xuICAgICAgICBjb25zdCByYXcgPSBzb3VyY2Uuc3Vic3RyKG9mZnNldCAtIDIsIGxlbmd0aCArIDIpO1xuICAgICAgICBvbkVycm9yKG9mZnNldCAtIDIsICdCQURfRFFfRVNDQVBFJywgYEludmFsaWQgZXNjYXBlIHNlcXVlbmNlICR7cmF3fWApO1xuICAgICAgICByZXR1cm4gcmF3O1xuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQoY29kZSk7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVGbG93U2NhbGFyIH07XG4iLCJmdW5jdGlvbiByZXNvbHZlUHJvcHModG9rZW5zLCB7IGZsb3csIGluZGljYXRvciwgbmV4dCwgb2Zmc2V0LCBvbkVycm9yLCBwYXJlbnRJbmRlbnQsIHN0YXJ0T25OZXdsaW5lIH0pIHtcbiAgICBsZXQgc3BhY2VCZWZvcmUgPSBmYWxzZTtcbiAgICBsZXQgYXROZXdsaW5lID0gc3RhcnRPbk5ld2xpbmU7XG4gICAgbGV0IGhhc1NwYWNlID0gc3RhcnRPbk5ld2xpbmU7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBsZXQgY29tbWVudFNlcCA9ICcnO1xuICAgIGxldCBoYXNOZXdsaW5lID0gZmFsc2U7XG4gICAgbGV0IGhhc05ld2xpbmVBZnRlclByb3AgPSBmYWxzZTtcbiAgICBsZXQgcmVxU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgdGFiID0gbnVsbDtcbiAgICBsZXQgYW5jaG9yID0gbnVsbDtcbiAgICBsZXQgdGFnID0gbnVsbDtcbiAgICBsZXQgY29tbWEgPSBudWxsO1xuICAgIGxldCBmb3VuZCA9IG51bGw7XG4gICAgbGV0IHN0YXJ0ID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgICBpZiAocmVxU3BhY2UpIHtcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnc3BhY2UnICYmXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSAhPT0gJ25ld2xpbmUnICYmXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSAhPT0gJ2NvbW1hJylcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLm9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdUYWdzIGFuZCBhbmNob3JzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gdGhlIG5leHQgdG9rZW4gYnkgd2hpdGUgc3BhY2UnKTtcbiAgICAgICAgICAgIHJlcVNwYWNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhYikge1xuICAgICAgICAgICAgaWYgKGF0TmV3bGluZSAmJiB0b2tlbi50eXBlICE9PSAnY29tbWVudCcgJiYgdG9rZW4udHlwZSAhPT0gJ25ld2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWIsICdUQUJfQVNfSU5ERU5UJywgJ1RhYnMgYXJlIG5vdCBhbGxvd2VkIGFzIGluZGVudGF0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIC8vIEF0IHRoZSBkb2MgbGV2ZWwsIHRhYnMgYXQgbGluZSBzdGFydCBtYXkgYmUgcGFyc2VkXG4gICAgICAgICAgICAgICAgLy8gYXMgbGVhZGluZyB3aGl0ZSBzcGFjZSByYXRoZXIgdGhhbiBpbmRlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBJbiBhIGZsb3cgY29sbGVjdGlvbiwgb25seSB0aGUgcGFyc2VyIGhhbmRsZXMgaW5kZW50LlxuICAgICAgICAgICAgICAgIGlmICghZmxvdyAmJlxuICAgICAgICAgICAgICAgICAgICAoaW5kaWNhdG9yICE9PSAnZG9jLXN0YXJ0JyB8fCBuZXh0Py50eXBlICE9PSAnZmxvdy1jb2xsZWN0aW9uJykgJiZcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uc291cmNlLmluY2x1ZGVzKCdcXHQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0YWIgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1NwYWNlKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IHRva2VuLnNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnO1xuICAgICAgICAgICAgICAgIGlmICghY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCA9IGNiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSBjb21tZW50U2VwICsgY2I7XG4gICAgICAgICAgICAgICAgY29tbWVudFNlcCA9ICcnO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgaWYgKGF0TmV3bGluZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudFNlcCArPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBoYXNOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yIHx8IHRhZylcbiAgICAgICAgICAgICAgICAgICAgaGFzTmV3bGluZUFmdGVyUHJvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTVVMVElQTEVfQU5DSE9SUycsICdBIG5vZGUgY2FuIGhhdmUgYXQgbW9zdCBvbmUgYW5jaG9yJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnNvdXJjZS5lbmRzV2l0aCgnOicpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLm9mZnNldCArIHRva2VuLnNvdXJjZS5sZW5ndGggLSAxLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBlbmRpbmcgaW4gOiBpcyBhbWJpZ3VvdXMnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBhbmNob3IgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gdG9rZW4ub2Zmc2V0O1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVxU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndGFnJzoge1xuICAgICAgICAgICAgICAgIGlmICh0YWcpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNVUxUSVBMRV9UQUdTJywgJ0Egbm9kZSBjYW4gaGF2ZSBhdCBtb3N0IG9uZSB0YWcnKTtcbiAgICAgICAgICAgICAgICB0YWcgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gdG9rZW4ub2Zmc2V0O1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVxU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBpbmRpY2F0b3I6XG4gICAgICAgICAgICAgICAgLy8gQ291bGQgaGVyZSBoYW5kbGUgcHJlY2VkaW5nIGNvbW1lbnRzIGRpZmZlcmVudGx5XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdCQURfUFJPUF9PUkRFUicsIGBBbmNob3JzIGFuZCB0YWdzIG11c3QgYmUgYWZ0ZXIgdGhlICR7dG9rZW4uc291cmNlfSBpbmRpY2F0b3JgKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0b2tlbi5zb3VyY2V9IGluICR7ZmxvdyA/PyAnY29sbGVjdGlvbid9YCk7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPVxuICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPT09ICdzZXEtaXRlbS1pbmQnIHx8IGluZGljYXRvciA9PT0gJ2V4cGxpY2l0LWtleS1pbmQnO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgaWYgKGZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1hKVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7Zmxvd31gKTtcbiAgICAgICAgICAgICAgICAgICAgY29tbWEgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVsc2UgZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAke3Rva2VuLnR5cGV9IHRva2VuYCk7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBsYXN0ID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBlbmQgPSBsYXN0ID8gbGFzdC5vZmZzZXQgKyBsYXN0LnNvdXJjZS5sZW5ndGggOiBvZmZzZXQ7XG4gICAgaWYgKHJlcVNwYWNlICYmXG4gICAgICAgIG5leHQgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnc3BhY2UnICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ25ld2xpbmUnICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ2NvbW1hJyAmJlxuICAgICAgICAobmV4dC50eXBlICE9PSAnc2NhbGFyJyB8fCBuZXh0LnNvdXJjZSAhPT0gJycpKSB7XG4gICAgICAgIG9uRXJyb3IobmV4dC5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgfVxuICAgIGlmICh0YWIgJiZcbiAgICAgICAgKChhdE5ld2xpbmUgJiYgdGFiLmluZGVudCA8PSBwYXJlbnRJbmRlbnQpIHx8XG4gICAgICAgICAgICBuZXh0Py50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgbmV4dD8udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKVxuICAgICAgICBvbkVycm9yKHRhYiwgJ1RBQl9BU19JTkRFTlQnLCAnVGFicyBhcmUgbm90IGFsbG93ZWQgYXMgaW5kZW50YXRpb24nKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb21tYSxcbiAgICAgICAgZm91bmQsXG4gICAgICAgIHNwYWNlQmVmb3JlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBoYXNOZXdsaW5lLFxuICAgICAgICBoYXNOZXdsaW5lQWZ0ZXJQcm9wLFxuICAgICAgICBhbmNob3IsXG4gICAgICAgIHRhZyxcbiAgICAgICAgZW5kLFxuICAgICAgICBzdGFydDogc3RhcnQgPz8gZW5kXG4gICAgfTtcbn1cblxuZXhwb3J0IHsgcmVzb2x2ZVByb3BzIH07XG4iLCJmdW5jdGlvbiBjb250YWluc05ld2xpbmUoa2V5KSB7XG4gICAgaWYgKCFrZXkpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHN3aXRjaCAoa2V5LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGlmIChrZXkuc291cmNlLmluY2x1ZGVzKCdcXG4nKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkuZW5kKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2Yga2V5LmVuZClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgZm9yIChjb25zdCBpdCBvZiBrZXkuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGl0LnN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChjb250YWluc05ld2xpbmUoaXQua2V5KSB8fCBjb250YWluc05ld2xpbmUoaXQudmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgY29udGFpbnNOZXdsaW5lIH07XG4iLCJmdW5jdGlvbiBlbXB0eVNjYWxhclBvc2l0aW9uKG9mZnNldCwgYmVmb3JlLCBwb3MpIHtcbiAgICBpZiAoYmVmb3JlKSB7XG4gICAgICAgIGlmIChwb3MgPT09IG51bGwpXG4gICAgICAgICAgICBwb3MgPSBiZWZvcmUubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gcG9zIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGxldCBzdCA9IGJlZm9yZVtpXTtcbiAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09IHN0LnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGVjaG5pY2FsbHksIGFuIGVtcHR5IHNjYWxhciBpcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgbGFzdCBub24tZW1wdHlcbiAgICAgICAgICAgIC8vIG5vZGUsIGJ1dCBpdCdzIG1vcmUgdXNlZnVsIHRvIHBsYWNlIGl0IGFmdGVyIGFueSB3aGl0ZXNwYWNlLlxuICAgICAgICAgICAgc3QgPSBiZWZvcmVbKytpXTtcbiAgICAgICAgICAgIHdoaWxlIChzdD8udHlwZSA9PT0gJ3NwYWNlJykge1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSBzdC5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHN0ID0gYmVmb3JlWysraV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0O1xufVxuXG5leHBvcnQgeyBlbXB0eVNjYWxhclBvc2l0aW9uIH07XG4iLCJpbXBvcnQgeyBjb250YWluc05ld2xpbmUgfSBmcm9tICcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcyc7XG5cbmZ1bmN0aW9uIGZsb3dJbmRlbnRDaGVjayhpbmRlbnQsIGZjLCBvbkVycm9yKSB7XG4gICAgaWYgKGZjPy50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJykge1xuICAgICAgICBjb25zdCBlbmQgPSBmYy5lbmRbMF07XG4gICAgICAgIGlmIChlbmQuaW5kZW50ID09PSBpbmRlbnQgJiZcbiAgICAgICAgICAgIChlbmQuc291cmNlID09PSAnXScgfHwgZW5kLnNvdXJjZSA9PT0gJ30nKSAmJlxuICAgICAgICAgICAgY29udGFpbnNOZXdsaW5lKGZjKSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gJ0Zsb3cgZW5kIGluZGljYXRvciBzaG91bGQgYmUgbW9yZSBpbmRlbnRlZCB0aGFuIHBhcmVudCc7XG4gICAgICAgICAgICBvbkVycm9yKGVuZCwgJ0JBRF9JTkRFTlQnLCBtc2csIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBmbG93SW5kZW50Q2hlY2sgfTtcbiIsImltcG9ydCB7IGlzU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuXG5mdW5jdGlvbiBtYXBJbmNsdWRlcyhjdHgsIGl0ZW1zLCBzZWFyY2gpIHtcbiAgICBjb25zdCB7IHVuaXF1ZUtleXMgfSA9IGN0eC5vcHRpb25zO1xuICAgIGlmICh1bmlxdWVLZXlzID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGlzRXF1YWwgPSB0eXBlb2YgdW5pcXVlS2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHVuaXF1ZUtleXNcbiAgICAgICAgOiAoYSwgYikgPT4gYSA9PT0gYiB8fFxuICAgICAgICAgICAgKGlzU2NhbGFyKGEpICYmXG4gICAgICAgICAgICAgICAgaXNTY2FsYXIoYikgJiZcbiAgICAgICAgICAgICAgICBhLnZhbHVlID09PSBiLnZhbHVlICYmXG4gICAgICAgICAgICAgICAgIShhLnZhbHVlID09PSAnPDwnICYmIGN0eC5zY2hlbWEubWVyZ2UpKTtcbiAgICByZXR1cm4gaXRlbXMuc29tZShwYWlyID0+IGlzRXF1YWwocGFpci5rZXksIHNlYXJjaCkpO1xufVxuXG5leHBvcnQgeyBtYXBJbmNsdWRlcyB9O1xuIiwiaW1wb3J0IHsgQWxpYXMgfSBmcm9tICcuLi9ub2Rlcy9BbGlhcy5qcyc7XG5pbXBvcnQgeyBpc0VtcHR5UGF0aCwgY29sbGVjdGlvbkZyb21QYXRoIH0gZnJvbSAnLi4vbm9kZXMvQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBOT0RFX1RZUEUsIERPQywgaXNOb2RlLCBpc0NvbGxlY3Rpb24sIGlzU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgUGFpciB9IGZyb20gJy4uL25vZGVzL1BhaXIuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4uL25vZGVzL3RvSlMuanMnO1xuaW1wb3J0IHsgU2NoZW1hIH0gZnJvbSAnLi4vc2NoZW1hL1NjaGVtYS5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlEb2N1bWVudCB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBhbmNob3JOYW1lcywgZmluZE5ld0FuY2hvciwgY3JlYXRlTm9kZUFuY2hvcnMgfSBmcm9tICcuL2FuY2hvcnMuanMnO1xuaW1wb3J0IHsgYXBwbHlSZXZpdmVyIH0gZnJvbSAnLi9hcHBseVJldml2ZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlTm9kZSB9IGZyb20gJy4vY3JlYXRlTm9kZS5qcyc7XG5pbXBvcnQgeyBEaXJlY3RpdmVzIH0gZnJvbSAnLi9kaXJlY3RpdmVzLmpzJztcblxuY2xhc3MgRG9jdW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlLCByZXBsYWNlciwgb3B0aW9ucykge1xuICAgICAgICAvKiogQSBjb21tZW50IGJlZm9yZSB0aGlzIERvY3VtZW50ICovXG4gICAgICAgIHRoaXMuY29tbWVudEJlZm9yZSA9IG51bGw7XG4gICAgICAgIC8qKiBBIGNvbW1lbnQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhpcyBEb2N1bWVudCAqL1xuICAgICAgICB0aGlzLmNvbW1lbnQgPSBudWxsO1xuICAgICAgICAvKiogRXJyb3JzIGVuY291bnRlcmVkIGR1cmluZyBwYXJzaW5nLiAqL1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICAvKiogV2FybmluZ3MgZW5jb3VudGVyZWQgZHVyaW5nIHBhcnNpbmcuICovXG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIE5PREVfVFlQRSwgeyB2YWx1ZTogRE9DIH0pO1xuICAgICAgICBsZXQgX3JlcGxhY2VyID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJyB8fCBBcnJheS5pc0FycmF5KHJlcGxhY2VyKSkge1xuICAgICAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkICYmIHJlcGxhY2VyKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gcmVwbGFjZXI7XG4gICAgICAgICAgICByZXBsYWNlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvcHQgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGludEFzQmlnSW50OiBmYWxzZSxcbiAgICAgICAgICAgIGtlZXBTb3VyY2VUb2tlbnM6IGZhbHNlLFxuICAgICAgICAgICAgbG9nTGV2ZWw6ICd3YXJuJyxcbiAgICAgICAgICAgIHByZXR0eUVycm9yczogdHJ1ZSxcbiAgICAgICAgICAgIHN0cmljdDogdHJ1ZSxcbiAgICAgICAgICAgIHVuaXF1ZUtleXM6IHRydWUsXG4gICAgICAgICAgICB2ZXJzaW9uOiAnMS4yJ1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0O1xuICAgICAgICBsZXQgeyB2ZXJzaW9uIH0gPSBvcHQ7XG4gICAgICAgIGlmIChvcHRpb25zPy5fZGlyZWN0aXZlcykge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gb3B0aW9ucy5fZGlyZWN0aXZlcy5hdERvY3VtZW50KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzLnlhbWwuZXhwbGljaXQpXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb247XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IERpcmVjdGl2ZXMoeyB2ZXJzaW9uIH0pO1xuICAgICAgICB0aGlzLnNldFNjaGVtYSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgdGhpcy5jb250ZW50cyA9XG4gICAgICAgICAgICB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHRoaXMuY3JlYXRlTm9kZSh2YWx1ZSwgX3JlcGxhY2VyLCBvcHRpb25zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgZGVlcCBjb3B5IG9mIHRoaXMgRG9jdW1lbnQgYW5kIGl0cyBjb250ZW50cy5cbiAgICAgKlxuICAgICAqIEN1c3RvbSBOb2RlIHZhbHVlcyB0aGF0IGluaGVyaXQgZnJvbSBgT2JqZWN0YCBzdGlsbCByZWZlciB0byB0aGVpciBvcmlnaW5hbCBpbnN0YW5jZXMuXG4gICAgICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKERvY3VtZW50LnByb3RvdHlwZSwge1xuICAgICAgICAgICAgW05PREVfVFlQRV06IHsgdmFsdWU6IERPQyB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb3B5LmNvbW1lbnRCZWZvcmUgPSB0aGlzLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgIGNvcHkuY29tbWVudCA9IHRoaXMuY29tbWVudDtcbiAgICAgICAgY29weS5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgpO1xuICAgICAgICBjb3B5Lndhcm5pbmdzID0gdGhpcy53YXJuaW5ncy5zbGljZSgpO1xuICAgICAgICBjb3B5Lm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgY29weS5kaXJlY3RpdmVzID0gdGhpcy5kaXJlY3RpdmVzLmNsb25lKCk7XG4gICAgICAgIGNvcHkuc2NoZW1hID0gdGhpcy5zY2hlbWEuY2xvbmUoKTtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgY29weS5jb250ZW50cyA9IGlzTm9kZSh0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmNsb25lKGNvcHkuc2NoZW1hKVxuICAgICAgICAgICAgOiB0aGlzLmNvbnRlbnRzO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKiogQWRkcyBhIHZhbHVlIHRvIHRoZSBkb2N1bWVudC4gKi9cbiAgICBhZGQodmFsdWUpIHtcbiAgICAgICAgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLmFkZCh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGRvY3VtZW50LiAqL1xuICAgIGFkZEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5hZGRJbihwYXRoLCB2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBgQWxpYXNgIG5vZGUsIGVuc3VyaW5nIHRoYXQgdGhlIHRhcmdldCBgbm9kZWAgaGFzIHRoZSByZXF1aXJlZCBhbmNob3IuXG4gICAgICpcbiAgICAgKiBJZiBgbm9kZWAgYWxyZWFkeSBoYXMgYW4gYW5jaG9yLCBgbmFtZWAgaXMgaWdub3JlZC5cbiAgICAgKiBPdGhlcndpc2UsIHRoZSBgbm9kZS5hbmNob3JgIHZhbHVlIHdpbGwgYmUgc2V0IHRvIGBuYW1lYCxcbiAgICAgKiBvciBpZiBhbiBhbmNob3Igd2l0aCB0aGF0IG5hbWUgaXMgYWxyZWFkeSBwcmVzZW50IGluIHRoZSBkb2N1bWVudCxcbiAgICAgKiBgbmFtZWAgd2lsbCBiZSB1c2VkIGFzIGEgcHJlZml4IGZvciBhIG5ldyB1bmlxdWUgYW5jaG9yLlxuICAgICAqIElmIGBuYW1lYCBpcyB1bmRlZmluZWQsIHRoZSBnZW5lcmF0ZWQgYW5jaG9yIHdpbGwgdXNlICdhJyBhcyBhIHByZWZpeC5cbiAgICAgKi9cbiAgICBjcmVhdGVBbGlhcyhub2RlLCBuYW1lKSB7XG4gICAgICAgIGlmICghbm9kZS5hbmNob3IpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXYgPSBhbmNob3JOYW1lcyh0aGlzKTtcbiAgICAgICAgICAgIG5vZGUuYW5jaG9yID1cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1udWxsaXNoLWNvYWxlc2NpbmdcbiAgICAgICAgICAgICAgICAhbmFtZSB8fCBwcmV2LmhhcyhuYW1lKSA/IGZpbmROZXdBbmNob3IobmFtZSB8fCAnYScsIHByZXYpIDogbmFtZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEFsaWFzKG5vZGUuYW5jaG9yKTtcbiAgICB9XG4gICAgY3JlYXRlTm9kZSh2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IF9yZXBsYWNlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKHsgJyc6IHZhbHVlIH0sICcnLCB2YWx1ZSk7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcGxhY2VyKSkge1xuICAgICAgICAgICAgY29uc3Qga2V5VG9TdHIgPSAodikgPT4gdHlwZW9mIHYgPT09ICdudW1iZXInIHx8IHYgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdiBpbnN0YW5jZW9mIE51bWJlcjtcbiAgICAgICAgICAgIGNvbnN0IGFzU3RyID0gcmVwbGFjZXIuZmlsdGVyKGtleVRvU3RyKS5tYXAoU3RyaW5nKTtcbiAgICAgICAgICAgIGlmIChhc1N0ci5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJlcGxhY2VyID0gcmVwbGFjZXIuY29uY2F0KGFzU3RyKTtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBhbGlhc0R1cGxpY2F0ZU9iamVjdHMsIGFuY2hvclByZWZpeCwgZmxvdywga2VlcFVuZGVmaW5lZCwgb25UYWdPYmosIHRhZyB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICAgICAgY29uc3QgeyBvbkFuY2hvciwgc2V0QW5jaG9ycywgc291cmNlT2JqZWN0cyB9ID0gY3JlYXRlTm9kZUFuY2hvcnModGhpcywgXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICBhbmNob3JQcmVmaXggfHwgJ2EnKTtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYWxpYXNEdXBsaWNhdGVPYmplY3RzOiBhbGlhc0R1cGxpY2F0ZU9iamVjdHMgPz8gdHJ1ZSxcbiAgICAgICAgICAgIGtlZXBVbmRlZmluZWQ6IGtlZXBVbmRlZmluZWQgPz8gZmFsc2UsXG4gICAgICAgICAgICBvbkFuY2hvcixcbiAgICAgICAgICAgIG9uVGFnT2JqLFxuICAgICAgICAgICAgcmVwbGFjZXI6IF9yZXBsYWNlcixcbiAgICAgICAgICAgIHNjaGVtYTogdGhpcy5zY2hlbWEsXG4gICAgICAgICAgICBzb3VyY2VPYmplY3RzXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjcmVhdGVOb2RlKHZhbHVlLCB0YWcsIGN0eCk7XG4gICAgICAgIGlmIChmbG93ICYmIGlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgIG5vZGUuZmxvdyA9IHRydWU7XG4gICAgICAgIHNldEFuY2hvcnMoKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYSBrZXkgYW5kIGEgdmFsdWUgaW50byBhIGBQYWlyYCB1c2luZyB0aGUgY3VycmVudCBzY2hlbWEsXG4gICAgICogcmVjdXJzaXZlbHkgd3JhcHBpbmcgYWxsIHZhbHVlcyBhcyBgU2NhbGFyYCBvciBgQ29sbGVjdGlvbmAgbm9kZXMuXG4gICAgICovXG4gICAgY3JlYXRlUGFpcihrZXksIHZhbHVlLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgayA9IHRoaXMuY3JlYXRlTm9kZShrZXksIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCB2ID0gdGhpcy5jcmVhdGVOb2RlKHZhbHVlLCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWlyKGssIHYpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIHJldHVybiBhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5kZWxldGUoa2V5KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGVJbihwYXRoKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFByZXN1bWVkIGltcG9zc2libGUgaWYgU3RyaWN0IGV4dGVuZHMgZmFsc2VcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5kZWxldGVJbihwYXRoKVxuICAgICAgICAgICAgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBrZXlgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXQoa2V5LCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5nZXQoa2V5LCBrZWVwU2NhbGFyKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgaXRlbSBhdCBgcGF0aGAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldEluKHBhdGgsIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKVxuICAgICAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlzU2NhbGFyKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLnZhbHVlXG4gICAgICAgICAgICAgICAgOiB0aGlzLmNvbnRlbnRzO1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZ2V0SW4ocGF0aCwga2VlcFNjYWxhcilcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGRvY3VtZW50IGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqL1xuICAgIGhhcyhrZXkpIHtcbiAgICAgICAgcmV0dXJuIGlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSA/IHRoaXMuY29udGVudHMuaGFzKGtleSkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBkb2N1bWVudCBpbmNsdWRlcyBhIHZhbHVlIGF0IGBwYXRoYC5cbiAgICAgKi9cbiAgICBoYXNJbihwYXRoKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRzICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmhhc0luKHBhdGgpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGRvY3VtZW50LiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgW2tleV0sIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBkb2N1bWVudC4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICovXG4gICAgc2V0SW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIEFycmF5LmZyb20ocGF0aCksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLnNldEluKHBhdGgsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGhlIFlBTUwgdmVyc2lvbiBhbmQgc2NoZW1hIHVzZWQgYnkgdGhlIGRvY3VtZW50LlxuICAgICAqIEEgYG51bGxgIHZlcnNpb24gZGlzYWJsZXMgc3VwcG9ydCBmb3IgZGlyZWN0aXZlcywgZXhwbGljaXQgdGFncywgYW5jaG9ycywgYW5kIGFsaWFzZXMuXG4gICAgICogSXQgYWxzbyByZXF1aXJlcyB0aGUgYHNjaGVtYWAgb3B0aW9uIHRvIGJlIGdpdmVuIGFzIGEgYFNjaGVtYWAgaW5zdGFuY2UgdmFsdWUuXG4gICAgICpcbiAgICAgKiBPdmVycmlkZXMgYWxsIHByZXZpb3VzbHkgc2V0IHNjaGVtYSBvcHRpb25zLlxuICAgICAqL1xuICAgIHNldFNjaGVtYSh2ZXJzaW9uLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHZlcnNpb24gPSBTdHJpbmcodmVyc2lvbik7XG4gICAgICAgIGxldCBvcHQ7XG4gICAgICAgIHN3aXRjaCAodmVyc2lvbikge1xuICAgICAgICAgICAgY2FzZSAnMS4xJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uID0gJzEuMSc7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgRGlyZWN0aXZlcyh7IHZlcnNpb246ICcxLjEnIH0pO1xuICAgICAgICAgICAgICAgIG9wdCA9IHsgbWVyZ2U6IHRydWUsIHJlc29sdmVLbm93blRhZ3M6IGZhbHNlLCBzY2hlbWE6ICd5YW1sLTEuMScgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzEuMic6XG4gICAgICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uID0gdmVyc2lvbjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBEaXJlY3RpdmVzKHsgdmVyc2lvbiB9KTtcbiAgICAgICAgICAgICAgICBvcHQgPSB7IG1lcmdlOiBmYWxzZSwgcmVzb2x2ZUtub3duVGFnczogdHJ1ZSwgc2NoZW1hOiAnY29yZScgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgbnVsbDpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5kaXJlY3RpdmVzO1xuICAgICAgICAgICAgICAgIG9wdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3YgPSBKU09OLnN0cmluZ2lmeSh2ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcxLjEnLCAnMS4yJyBvciBudWxsIGFzIGZpcnN0IGFyZ3VtZW50LCBidXQgZm91bmQ6ICR7c3Z9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gTm90IHVzaW5nIGBpbnN0YW5jZW9mIFNjaGVtYWAgdG8gYWxsb3cgZm9yIGR1Y2sgdHlwaW5nXG4gICAgICAgIGlmIChvcHRpb25zLnNjaGVtYSBpbnN0YW5jZW9mIE9iamVjdClcbiAgICAgICAgICAgIHRoaXMuc2NoZW1hID0gb3B0aW9ucy5zY2hlbWE7XG4gICAgICAgIGVsc2UgaWYgKG9wdClcbiAgICAgICAgICAgIHRoaXMuc2NoZW1hID0gbmV3IFNjaGVtYShPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdpdGggYSBudWxsIFlBTUwgdmVyc2lvbiwgdGhlIHsgc2NoZW1hOiBTY2hlbWEgfSBvcHRpb24gaXMgcmVxdWlyZWRgKTtcbiAgICB9XG4gICAgLy8ganNvbiAmIGpzb25BcmcgYXJlIG9ubHkgdXNlZCBmcm9tIHRvSlNPTigpXG4gICAgdG9KUyh7IGpzb24sIGpzb25BcmcsIG1hcEFzTWFwLCBtYXhBbGlhc0NvdW50LCBvbkFuY2hvciwgcmV2aXZlciB9ID0ge30pIHtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYW5jaG9yczogbmV3IE1hcCgpLFxuICAgICAgICAgICAgZG9jOiB0aGlzLFxuICAgICAgICAgICAga2VlcDogIWpzb24sXG4gICAgICAgICAgICBtYXBBc01hcDogbWFwQXNNYXAgPT09IHRydWUsXG4gICAgICAgICAgICBtYXBLZXlXYXJuZWQ6IGZhbHNlLFxuICAgICAgICAgICAgbWF4QWxpYXNDb3VudDogdHlwZW9mIG1heEFsaWFzQ291bnQgPT09ICdudW1iZXInID8gbWF4QWxpYXNDb3VudCA6IDEwMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB0b0pTKHRoaXMuY29udGVudHMsIGpzb25BcmcgPz8gJycsIGN0eCk7XG4gICAgICAgIGlmICh0eXBlb2Ygb25BbmNob3IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgY291bnQsIHJlcyB9IG9mIGN0eC5hbmNob3JzLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgIG9uQW5jaG9yKHJlcywgY291bnQpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHsgJyc6IHJlcyB9LCAnJywgcmVzKVxuICAgICAgICAgICAgOiByZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZG9jdW1lbnQgYGNvbnRlbnRzYC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBqc29uQXJnIFVzZWQgYnkgYEpTT04uc3RyaW5naWZ5YCB0byBpbmRpY2F0ZSB0aGUgYXJyYXkgaW5kZXggb3JcbiAgICAgKiAgIHByb3BlcnR5IG5hbWUuXG4gICAgICovXG4gICAgdG9KU09OKGpzb25BcmcsIG9uQW5jaG9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvSlMoeyBqc29uOiB0cnVlLCBqc29uQXJnLCBtYXBBc01hcDogZmFsc2UsIG9uQW5jaG9yIH0pO1xuICAgIH1cbiAgICAvKiogQSBZQU1MIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkb2N1bWVudC4gKi9cbiAgICB0b1N0cmluZyhvcHRpb25zID0ge30pIHtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RvY3VtZW50IHdpdGggZXJyb3JzIGNhbm5vdCBiZSBzdHJpbmdpZmllZCcpO1xuICAgICAgICBpZiAoJ2luZGVudCcgaW4gb3B0aW9ucyAmJlxuICAgICAgICAgICAgKCFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMuaW5kZW50KSB8fCBOdW1iZXIob3B0aW9ucy5pbmRlbnQpIDw9IDApKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5pbmRlbnQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcImluZGVudFwiIG9wdGlvbiBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlciwgbm90ICR7c31gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5RG9jdW1lbnQodGhpcywgb3B0aW9ucyk7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNzZXJ0Q29sbGVjdGlvbihjb250ZW50cykge1xuICAgIGlmIChpc0NvbGxlY3Rpb24oY29udGVudHMpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGEgWUFNTCBjb2xsZWN0aW9uIGFzIGRvY3VtZW50IGNvbnRlbnRzJyk7XG59XG5cbmV4cG9ydCB7IERvY3VtZW50IH07XG4iLCJpbXBvcnQgeyBpc1NjYWxhciwgaXNDb2xsZWN0aW9uIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdmlzaXQgfSBmcm9tICcuLi92aXNpdC5qcyc7XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgdGhlIGlucHV0IHN0cmluZyBpcyBhIHZhbGlkIGFuY2hvci5cbiAqXG4gKiBXaWxsIHRocm93IG9uIGVycm9ycy5cbiAqL1xuZnVuY3Rpb24gYW5jaG9ySXNWYWxpZChhbmNob3IpIHtcbiAgICBpZiAoL1tcXHgwMC1cXHgxOVxccyxbXFxde31dLy50ZXN0KGFuY2hvcikpIHtcbiAgICAgICAgY29uc3Qgc2EgPSBKU09OLnN0cmluZ2lmeShhbmNob3IpO1xuICAgICAgICBjb25zdCBtc2cgPSBgQW5jaG9yIG11c3Qgbm90IGNvbnRhaW4gd2hpdGVzcGFjZSBvciBjb250cm9sIGNoYXJhY3RlcnM6ICR7c2F9YDtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gYW5jaG9yTmFtZXMocm9vdCkge1xuICAgIGNvbnN0IGFuY2hvcnMgPSBuZXcgU2V0KCk7XG4gICAgdmlzaXQocm9vdCwge1xuICAgICAgICBWYWx1ZShfa2V5LCBub2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5hbmNob3IpXG4gICAgICAgICAgICAgICAgYW5jaG9ycy5hZGQobm9kZS5hbmNob3IpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGFuY2hvcnM7XG59XG4vKiogRmluZCBhIG5ldyBhbmNob3IgbmFtZSB3aXRoIHRoZSBnaXZlbiBgcHJlZml4YCBhbmQgYSBvbmUtaW5kZXhlZCBzdWZmaXguICovXG5mdW5jdGlvbiBmaW5kTmV3QW5jaG9yKHByZWZpeCwgZXhjbHVkZSkge1xuICAgIGZvciAobGV0IGkgPSAxOyB0cnVlOyArK2kpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGAke3ByZWZpeH0ke2l9YDtcbiAgICAgICAgaWYgKCFleGNsdWRlLmhhcyhuYW1lKSlcbiAgICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZU5vZGVBbmNob3JzKGRvYywgcHJlZml4KSB7XG4gICAgY29uc3QgYWxpYXNPYmplY3RzID0gW107XG4gICAgY29uc3Qgc291cmNlT2JqZWN0cyA9IG5ldyBNYXAoKTtcbiAgICBsZXQgcHJldkFuY2hvcnMgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAgIG9uQW5jaG9yOiAoc291cmNlKSA9PiB7XG4gICAgICAgICAgICBhbGlhc09iamVjdHMucHVzaChzb3VyY2UpO1xuICAgICAgICAgICAgaWYgKCFwcmV2QW5jaG9ycylcbiAgICAgICAgICAgICAgICBwcmV2QW5jaG9ycyA9IGFuY2hvck5hbWVzKGRvYyk7XG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBmaW5kTmV3QW5jaG9yKHByZWZpeCwgcHJldkFuY2hvcnMpO1xuICAgICAgICAgICAgcHJldkFuY2hvcnMuYWRkKGFuY2hvcik7XG4gICAgICAgICAgICByZXR1cm4gYW5jaG9yO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogV2l0aCBjaXJjdWxhciByZWZlcmVuY2VzLCB0aGUgc291cmNlIG5vZGUgaXMgb25seSByZXNvbHZlZCBhZnRlciBhbGxcbiAgICAgICAgICogb2YgaXRzIGNoaWxkIG5vZGVzIGFyZS4gVGhpcyBpcyB3aHkgYW5jaG9ycyBhcmUgc2V0IG9ubHkgYWZ0ZXIgYWxsIG9mXG4gICAgICAgICAqIHRoZSBub2RlcyBoYXZlIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFuY2hvcnM6ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGFsaWFzT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHNvdXJjZU9iamVjdHMuZ2V0KHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZWYgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgIHJlZi5hbmNob3IgJiZcbiAgICAgICAgICAgICAgICAgICAgKGlzU2NhbGFyKHJlZi5ub2RlKSB8fCBpc0NvbGxlY3Rpb24ocmVmLm5vZGUpKSkge1xuICAgICAgICAgICAgICAgICAgICByZWYubm9kZS5hbmNob3IgPSByZWYuYW5jaG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXNvbHZlIHJlcGVhdGVkIG9iamVjdCAodGhpcyBzaG91bGQgbm90IGhhcHBlbiknKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3Iuc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNvdXJjZU9iamVjdHNcbiAgICB9O1xufVxuXG5leHBvcnQgeyBhbmNob3JJc1ZhbGlkLCBhbmNob3JOYW1lcywgY3JlYXRlTm9kZUFuY2hvcnMsIGZpbmROZXdBbmNob3IgfTtcbiIsIi8qKlxuICogQXBwbGllcyB0aGUgSlNPTi5wYXJzZSByZXZpdmVyIGFsZ29yaXRobSBhcyBkZWZpbmVkIGluIHRoZSBFQ01BLTI2MiBzcGVjLFxuICogaW4gc2VjdGlvbiAyNC41LjEuMSBcIlJ1bnRpbWUgU2VtYW50aWNzOiBJbnRlcm5hbGl6ZUpTT05Qcm9wZXJ0eVwiIG9mIHRoZVxuICogMjAyMSBlZGl0aW9uOiBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLWpzb24ucGFyc2VcbiAqXG4gKiBJbmNsdWRlcyBleHRlbnNpb25zIGZvciBoYW5kbGluZyBNYXAgYW5kIFNldCBvYmplY3RzLlxuICovXG5mdW5jdGlvbiBhcHBseVJldml2ZXIocmV2aXZlciwgb2JqLCBrZXksIHZhbCkge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHZhbC5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYwID0gdmFsW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgU3RyaW5nKGkpLCB2MCk7XG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWxbaV07XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKVxuICAgICAgICAgICAgICAgICAgICB2YWxbaV0gPSB2MTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBBcnJheS5mcm9tKHZhbC5rZXlzKCkpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWwuZ2V0KGspO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgaywgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKGspO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsLnNldChrLCB2MSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYwIG9mIEFycmF5LmZyb20odmFsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgdjAsIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZSh2MCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUodjApO1xuICAgICAgICAgICAgICAgICAgICB2YWwuYWRkKHYxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrLCB2MF0gb2YgT2JqZWN0LmVudHJpZXModmFsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgaywgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsW2tdO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsW2tdID0gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldml2ZXIuY2FsbChvYmosIGtleSwgdmFsKTtcbn1cblxuZXhwb3J0IHsgYXBwbHlSZXZpdmVyIH07XG4iLCJpbXBvcnQgeyBBbGlhcyB9IGZyb20gJy4uL25vZGVzL0FsaWFzLmpzJztcbmltcG9ydCB7IGlzTm9kZSwgaXNQYWlyLCBNQVAsIFNFUSwgaXNEb2N1bWVudCB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmNvbnN0IGRlZmF1bHRUYWdQcmVmaXggPSAndGFnOnlhbWwub3JnLDIwMDI6JztcbmZ1bmN0aW9uIGZpbmRUYWdPYmplY3QodmFsdWUsIHRhZ05hbWUsIHRhZ3MpIHtcbiAgICBpZiAodGFnTmFtZSkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHRhZ3MuZmlsdGVyKHQgPT4gdC50YWcgPT09IHRhZ05hbWUpO1xuICAgICAgICBjb25zdCB0YWdPYmogPSBtYXRjaC5maW5kKHQgPT4gIXQuZm9ybWF0KSA/PyBtYXRjaFswXTtcbiAgICAgICAgaWYgKCF0YWdPYmopXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRhZyAke3RhZ05hbWV9IG5vdCBmb3VuZGApO1xuICAgICAgICByZXR1cm4gdGFnT2JqO1xuICAgIH1cbiAgICByZXR1cm4gdGFncy5maW5kKHQgPT4gdC5pZGVudGlmeT8uKHZhbHVlKSAmJiAhdC5mb3JtYXQpO1xufVxuZnVuY3Rpb24gY3JlYXRlTm9kZSh2YWx1ZSwgdGFnTmFtZSwgY3R4KSB7XG4gICAgaWYgKGlzRG9jdW1lbnQodmFsdWUpKVxuICAgICAgICB2YWx1ZSA9IHZhbHVlLmNvbnRlbnRzO1xuICAgIGlmIChpc05vZGUodmFsdWUpKVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgaWYgKGlzUGFpcih2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgbWFwID0gY3R4LnNjaGVtYVtNQVBdLmNyZWF0ZU5vZGU/LihjdHguc2NoZW1hLCBudWxsLCBjdHgpO1xuICAgICAgICBtYXAuaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZyB8fFxuICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIE51bWJlciB8fFxuICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIEJvb2xlYW4gfHxcbiAgICAgICAgKHR5cGVvZiBCaWdJbnQgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgQmlnSW50KSAvLyBub3Qgc3VwcG9ydGVkIGV2ZXJ5d2hlcmVcbiAgICApIHtcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1zZXJpYWxpemVqc29ucHJvcGVydHlcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS52YWx1ZU9mKCk7XG4gICAgfVxuICAgIGNvbnN0IHsgYWxpYXNEdXBsaWNhdGVPYmplY3RzLCBvbkFuY2hvciwgb25UYWdPYmosIHNjaGVtYSwgc291cmNlT2JqZWN0cyB9ID0gY3R4O1xuICAgIC8vIERldGVjdCBkdXBsaWNhdGUgcmVmZXJlbmNlcyB0byB0aGUgc2FtZSBvYmplY3QgJiB1c2UgQWxpYXMgbm9kZXMgZm9yIGFsbFxuICAgIC8vIGFmdGVyIGZpcnN0LiBUaGUgYHJlZmAgd3JhcHBlciBhbGxvd3MgZm9yIGNpcmN1bGFyIHJlZmVyZW5jZXMgdG8gcmVzb2x2ZS5cbiAgICBsZXQgcmVmID0gdW5kZWZpbmVkO1xuICAgIGlmIChhbGlhc0R1cGxpY2F0ZU9iamVjdHMgJiYgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICByZWYgPSBzb3VyY2VPYmplY3RzLmdldCh2YWx1ZSk7XG4gICAgICAgIGlmIChyZWYpIHtcbiAgICAgICAgICAgIGlmICghcmVmLmFuY2hvcilcbiAgICAgICAgICAgICAgICByZWYuYW5jaG9yID0gb25BbmNob3IodmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBbGlhcyhyZWYuYW5jaG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlZiA9IHsgYW5jaG9yOiBudWxsLCBub2RlOiBudWxsIH07XG4gICAgICAgICAgICBzb3VyY2VPYmplY3RzLnNldCh2YWx1ZSwgcmVmKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGFnTmFtZT8uc3RhcnRzV2l0aCgnISEnKSlcbiAgICAgICAgdGFnTmFtZSA9IGRlZmF1bHRUYWdQcmVmaXggKyB0YWdOYW1lLnNsaWNlKDIpO1xuICAgIGxldCB0YWdPYmogPSBmaW5kVGFnT2JqZWN0KHZhbHVlLCB0YWdOYW1lLCBzY2hlbWEudGFncyk7XG4gICAgaWYgKCF0YWdPYmopIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50b0pTT04gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGxcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhcih2YWx1ZSk7XG4gICAgICAgICAgICBpZiAocmVmKVxuICAgICAgICAgICAgICAgIHJlZi5ub2RlID0gbm9kZTtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHRhZ09iaiA9XG4gICAgICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIE1hcFxuICAgICAgICAgICAgICAgID8gc2NoZW1hW01BUF1cbiAgICAgICAgICAgICAgICA6IFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodmFsdWUpXG4gICAgICAgICAgICAgICAgICAgID8gc2NoZW1hW1NFUV1cbiAgICAgICAgICAgICAgICAgICAgOiBzY2hlbWFbTUFQXTtcbiAgICB9XG4gICAgaWYgKG9uVGFnT2JqKSB7XG4gICAgICAgIG9uVGFnT2JqKHRhZ09iaik7XG4gICAgICAgIGRlbGV0ZSBjdHgub25UYWdPYmo7XG4gICAgfVxuICAgIGNvbnN0IG5vZGUgPSB0YWdPYmo/LmNyZWF0ZU5vZGVcbiAgICAgICAgPyB0YWdPYmouY3JlYXRlTm9kZShjdHguc2NoZW1hLCB2YWx1ZSwgY3R4KVxuICAgICAgICA6IHR5cGVvZiB0YWdPYmo/Lm5vZGVDbGFzcz8uZnJvbSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyB0YWdPYmoubm9kZUNsYXNzLmZyb20oY3R4LnNjaGVtYSwgdmFsdWUsIGN0eClcbiAgICAgICAgICAgIDogbmV3IFNjYWxhcih2YWx1ZSk7XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIG5vZGUudGFnID0gdGFnTmFtZTtcbiAgICBlbHNlIGlmICghdGFnT2JqLmRlZmF1bHQpXG4gICAgICAgIG5vZGUudGFnID0gdGFnT2JqLnRhZztcbiAgICBpZiAocmVmKVxuICAgICAgICByZWYubm9kZSA9IG5vZGU7XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZU5vZGUgfTtcbiIsImltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHZpc2l0IH0gZnJvbSAnLi4vdmlzaXQuanMnO1xuXG5jb25zdCBlc2NhcGVDaGFycyA9IHtcbiAgICAnISc6ICclMjEnLFxuICAgICcsJzogJyUyQycsXG4gICAgJ1snOiAnJTVCJyxcbiAgICAnXSc6ICclNUQnLFxuICAgICd7JzogJyU3QicsXG4gICAgJ30nOiAnJTdEJ1xufTtcbmNvbnN0IGVzY2FwZVRhZ05hbWUgPSAodG4pID0+IHRuLnJlcGxhY2UoL1shLFtcXF17fV0vZywgY2ggPT4gZXNjYXBlQ2hhcnNbY2hdKTtcbmNsYXNzIERpcmVjdGl2ZXMge1xuICAgIGNvbnN0cnVjdG9yKHlhbWwsIHRhZ3MpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkaXJlY3RpdmVzLWVuZC9kb2Mtc3RhcnQgbWFya2VyIGAtLS1gLiBJZiBgbnVsbGAsIGEgbWFya2VyIG1heSBzdGlsbCBiZVxuICAgICAgICAgKiBpbmNsdWRlZCBpbiB0aGUgZG9jdW1lbnQncyBzdHJpbmdpZmllZCByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZG9jU3RhcnQgPSBudWxsO1xuICAgICAgICAvKiogVGhlIGRvYy1lbmQgbWFya2VyIGAuLi5gLiAgKi9cbiAgICAgICAgdGhpcy5kb2NFbmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55YW1sID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0WWFtbCwgeWFtbCk7XG4gICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MsIHRhZ3MpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IG5ldyBEaXJlY3RpdmVzKHRoaXMueWFtbCwgdGhpcy50YWdzKTtcbiAgICAgICAgY29weS5kb2NTdGFydCA9IHRoaXMuZG9jU3RhcnQ7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEdXJpbmcgcGFyc2luZywgZ2V0IGEgRGlyZWN0aXZlcyBpbnN0YW5jZSBmb3IgdGhlIGN1cnJlbnQgZG9jdW1lbnQgYW5kXG4gICAgICogdXBkYXRlIHRoZSBzdHJlYW0gc3RhdGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHZlcnNpb24ncyBzcGVjLlxuICAgICAqL1xuICAgIGF0RG9jdW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBEaXJlY3RpdmVzKHRoaXMueWFtbCwgdGhpcy50YWdzKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnlhbWwudmVyc2lvbikge1xuICAgICAgICAgICAgY2FzZSAnMS4xJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzEuMic6XG4gICAgICAgICAgICAgICAgdGhpcy5hdE5leHREb2N1bWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbGljaXQ6IERpcmVjdGl2ZXMuZGVmYXVsdFlhbWwuZXhwbGljaXQsXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246ICcxLjInXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRUYWdzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gb25FcnJvciAtIE1heSBiZSBjYWxsZWQgZXZlbiBpZiB0aGUgYWN0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgICogQHJldHVybnMgYHRydWVgIG9uIHN1Y2Nlc3NcbiAgICAgKi9cbiAgICBhZGQobGluZSwgb25FcnJvcikge1xuICAgICAgICBpZiAodGhpcy5hdE5leHREb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy55YW1sID0geyBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCwgdmVyc2lvbjogJzEuMScgfTtcbiAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgdGhpcy5hdE5leHREb2N1bWVudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbGluZS50cmltKCkuc3BsaXQoL1sgXFx0XSsvKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnJVRBRyc6IHtcbiAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoMCwgJyVUQUcgZGlyZWN0aXZlIHNob3VsZCBjb250YWluIGV4YWN0bHkgdHdvIHBhcnRzJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbaGFuZGxlLCBwcmVmaXhdID0gcGFydHM7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzW2hhbmRsZV0gPSBwcmVmaXg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICclWUFNTCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLnlhbWwuZXhwbGljaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVlBTUwgZGlyZWN0aXZlIHNob3VsZCBjb250YWluIGV4YWN0bHkgb25lIHBhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbdmVyc2lvbl0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICBpZiAodmVyc2lvbiA9PT0gJzEuMScgfHwgdmVyc2lvbiA9PT0gJzEuMicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55YW1sLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSAvXlxcZCtcXC5cXGQrJC8udGVzdCh2ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcig2LCBgVW5zdXBwb3J0ZWQgWUFNTCB2ZXJzaW9uICR7dmVyc2lvbn1gLCBpc1ZhbGlkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb25FcnJvcigwLCBgVW5rbm93biBkaXJlY3RpdmUgJHtuYW1lfWAsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBhIHRhZywgbWF0Y2hpbmcgaGFuZGxlcyB0byB0aG9zZSBkZWZpbmVkIGluICVUQUcgZGlyZWN0aXZlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJlc29sdmVkIHRhZywgd2hpY2ggbWF5IGFsc28gYmUgdGhlIG5vbi1zcGVjaWZpYyB0YWcgYCchJ2Agb3IgYVxuICAgICAqICAgYCchbG9jYWwnYCB0YWcsIG9yIGBudWxsYCBpZiB1bnJlc29sdmFibGUuXG4gICAgICovXG4gICAgdGFnTmFtZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gJyEnKVxuICAgICAgICAgICAgcmV0dXJuICchJzsgLy8gbm9uLXNwZWNpZmljIHRhZ1xuICAgICAgICBpZiAoc291cmNlWzBdICE9PSAnIScpIHtcbiAgICAgICAgICAgIG9uRXJyb3IoYE5vdCBhIHZhbGlkIHRhZzogJHtzb3VyY2V9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc291cmNlWzFdID09PSAnPCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHZlcmJhdGltID0gc291cmNlLnNsaWNlKDIsIC0xKTtcbiAgICAgICAgICAgIGlmICh2ZXJiYXRpbSA9PT0gJyEnIHx8IHZlcmJhdGltID09PSAnISEnKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihgVmVyYmF0aW0gdGFncyBhcmVuJ3QgcmVzb2x2ZWQsIHNvICR7c291cmNlfSBpcyBpbnZhbGlkLmApO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09ICc+JylcbiAgICAgICAgICAgICAgICBvbkVycm9yKCdWZXJiYXRpbSB0YWdzIG11c3QgZW5kIHdpdGggYSA+Jyk7XG4gICAgICAgICAgICByZXR1cm4gdmVyYmF0aW07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgWywgaGFuZGxlLCBzdWZmaXhdID0gc291cmNlLm1hdGNoKC9eKC4qISkoW14hXSopJC9zKTtcbiAgICAgICAgaWYgKCFzdWZmaXgpXG4gICAgICAgICAgICBvbkVycm9yKGBUaGUgJHtzb3VyY2V9IHRhZyBoYXMgbm8gc3VmZml4YCk7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMudGFnc1toYW5kbGVdO1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBkZWNvZGVVUklDb21wb25lbnQoc3VmZml4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IoU3RyaW5nKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZSA9PT0gJyEnKVxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTsgLy8gbG9jYWwgdGFnXG4gICAgICAgIG9uRXJyb3IoYENvdWxkIG5vdCByZXNvbHZlIHRhZzogJHtzb3VyY2V9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIGZ1bGx5IHJlc29sdmVkIHRhZywgcmV0dXJucyBpdHMgcHJpbnRhYmxlIHN0cmluZyBmb3JtLFxuICAgICAqIHRha2luZyBpbnRvIGFjY291bnQgY3VycmVudCB0YWcgcHJlZml4ZXMgYW5kIGRlZmF1bHRzLlxuICAgICAqL1xuICAgIHRhZ1N0cmluZyh0YWcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaGFuZGxlLCBwcmVmaXhdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMudGFncykpIHtcbiAgICAgICAgICAgIGlmICh0YWcuc3RhcnRzV2l0aChwcmVmaXgpKVxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGUgKyBlc2NhcGVUYWdOYW1lKHRhZy5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWdbMF0gPT09ICchJyA/IHRhZyA6IGAhPCR7dGFnfT5gO1xuICAgIH1cbiAgICB0b1N0cmluZyhkb2MpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSB0aGlzLnlhbWwuZXhwbGljaXRcbiAgICAgICAgICAgID8gW2AlWUFNTCAke3RoaXMueWFtbC52ZXJzaW9uIHx8ICcxLjInfWBdXG4gICAgICAgICAgICA6IFtdO1xuICAgICAgICBjb25zdCB0YWdFbnRyaWVzID0gT2JqZWN0LmVudHJpZXModGhpcy50YWdzKTtcbiAgICAgICAgbGV0IHRhZ05hbWVzO1xuICAgICAgICBpZiAoZG9jICYmIHRhZ0VudHJpZXMubGVuZ3RoID4gMCAmJiBpc05vZGUoZG9jLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHt9O1xuICAgICAgICAgICAgdmlzaXQoZG9jLmNvbnRlbnRzLCAoX2tleSwgbm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc05vZGUobm9kZSkgJiYgbm9kZS50YWcpXG4gICAgICAgICAgICAgICAgICAgIHRhZ3Nbbm9kZS50YWddID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGFnTmFtZXMgPSBPYmplY3Qua2V5cyh0YWdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0YWdOYW1lcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgdGFnRW50cmllcykge1xuICAgICAgICAgICAgaWYgKGhhbmRsZSA9PT0gJyEhJyAmJiBwcmVmaXggPT09ICd0YWc6eWFtbC5vcmcsMjAwMjonKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFkb2MgfHwgdGFnTmFtZXMuc29tZSh0biA9PiB0bi5zdGFydHNXaXRoKHByZWZpeCkpKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCVUQUcgJHtoYW5kbGV9ICR7cHJlZml4fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICB9XG59XG5EaXJlY3RpdmVzLmRlZmF1bHRZYW1sID0geyBleHBsaWNpdDogZmFsc2UsIHZlcnNpb246ICcxLjInIH07XG5EaXJlY3RpdmVzLmRlZmF1bHRUYWdzID0geyAnISEnOiAndGFnOnlhbWwub3JnLDIwMDI6JyB9O1xuXG5leHBvcnQgeyBEaXJlY3RpdmVzIH07XG4iLCJjbGFzcyBZQU1MRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgcG9zLCBjb2RlLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgIH1cbn1cbmNsYXNzIFlBTUxQYXJzZUVycm9yIGV4dGVuZHMgWUFNTEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoJ1lBTUxQYXJzZUVycm9yJywgcG9zLCBjb2RlLCBtZXNzYWdlKTtcbiAgICB9XG59XG5jbGFzcyBZQU1MV2FybmluZyBleHRlbmRzIFlBTUxFcnJvciB7XG4gICAgY29uc3RydWN0b3IocG9zLCBjb2RlLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKCdZQU1MV2FybmluZycsIHBvcywgY29kZSwgbWVzc2FnZSk7XG4gICAgfVxufVxuY29uc3QgcHJldHRpZnlFcnJvciA9IChzcmMsIGxjKSA9PiAoZXJyb3IpID0+IHtcbiAgICBpZiAoZXJyb3IucG9zWzBdID09PSAtMSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGVycm9yLmxpbmVQb3MgPSBlcnJvci5wb3MubWFwKHBvcyA9PiBsYy5saW5lUG9zKHBvcykpO1xuICAgIGNvbnN0IHsgbGluZSwgY29sIH0gPSBlcnJvci5saW5lUG9zWzBdO1xuICAgIGVycm9yLm1lc3NhZ2UgKz0gYCBhdCBsaW5lICR7bGluZX0sIGNvbHVtbiAke2NvbH1gO1xuICAgIGxldCBjaSA9IGNvbCAtIDE7XG4gICAgbGV0IGxpbmVTdHIgPSBzcmNcbiAgICAgICAgLnN1YnN0cmluZyhsYy5saW5lU3RhcnRzW2xpbmUgLSAxXSwgbGMubGluZVN0YXJ0c1tsaW5lXSlcbiAgICAgICAgLnJlcGxhY2UoL1tcXG5cXHJdKyQvLCAnJyk7XG4gICAgLy8gVHJpbSB0byBtYXggODAgY2hhcnMsIGtlZXBpbmcgY29sIHBvc2l0aW9uIG5lYXIgdGhlIG1pZGRsZVxuICAgIGlmIChjaSA+PSA2MCAmJiBsaW5lU3RyLmxlbmd0aCA+IDgwKSB7XG4gICAgICAgIGNvbnN0IHRyaW1TdGFydCA9IE1hdGgubWluKGNpIC0gMzksIGxpbmVTdHIubGVuZ3RoIC0gNzkpO1xuICAgICAgICBsaW5lU3RyID0gJ+KApicgKyBsaW5lU3RyLnN1YnN0cmluZyh0cmltU3RhcnQpO1xuICAgICAgICBjaSAtPSB0cmltU3RhcnQgLSAxO1xuICAgIH1cbiAgICBpZiAobGluZVN0ci5sZW5ndGggPiA4MClcbiAgICAgICAgbGluZVN0ciA9IGxpbmVTdHIuc3Vic3RyaW5nKDAsIDc5KSArICfigKYnO1xuICAgIC8vIEluY2x1ZGUgcHJldmlvdXMgbGluZSBpbiBjb250ZXh0IGlmIHBvaW50aW5nIGF0IGxpbmUgc3RhcnRcbiAgICBpZiAobGluZSA+IDEgJiYgL14gKiQvLnRlc3QobGluZVN0ci5zdWJzdHJpbmcoMCwgY2kpKSkge1xuICAgICAgICAvLyBSZWdleHAgd29uJ3QgbWF0Y2ggaWYgc3RhcnQgaXMgdHJpbW1lZFxuICAgICAgICBsZXQgcHJldiA9IHNyYy5zdWJzdHJpbmcobGMubGluZVN0YXJ0c1tsaW5lIC0gMl0sIGxjLmxpbmVTdGFydHNbbGluZSAtIDFdKTtcbiAgICAgICAgaWYgKHByZXYubGVuZ3RoID4gODApXG4gICAgICAgICAgICBwcmV2ID0gcHJldi5zdWJzdHJpbmcoMCwgNzkpICsgJ+KAplxcbic7XG4gICAgICAgIGxpbmVTdHIgPSBwcmV2ICsgbGluZVN0cjtcbiAgICB9XG4gICAgaWYgKC9bXiBdLy50ZXN0KGxpbmVTdHIpKSB7XG4gICAgICAgIGxldCBjb3VudCA9IDE7XG4gICAgICAgIGNvbnN0IGVuZCA9IGVycm9yLmxpbmVQb3NbMV07XG4gICAgICAgIGlmIChlbmQgJiYgZW5kLmxpbmUgPT09IGxpbmUgJiYgZW5kLmNvbCA+IGNvbCkge1xuICAgICAgICAgICAgY291bnQgPSBNYXRoLm1heCgxLCBNYXRoLm1pbihlbmQuY29sIC0gY29sLCA4MCAtIGNpKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9pbnRlciA9ICcgJy5yZXBlYXQoY2kpICsgJ14nLnJlcGVhdChjb3VudCk7XG4gICAgICAgIGVycm9yLm1lc3NhZ2UgKz0gYDpcXG5cXG4ke2xpbmVTdHJ9XFxuJHtwb2ludGVyfVxcbmA7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgWUFNTEVycm9yLCBZQU1MUGFyc2VFcnJvciwgWUFNTFdhcm5pbmcsIHByZXR0aWZ5RXJyb3IgfTtcbiIsImV4cG9ydCB7IENvbXBvc2VyIH0gZnJvbSAnLi9jb21wb3NlL2NvbXBvc2VyLmpzJztcbmV4cG9ydCB7IERvY3VtZW50IH0gZnJvbSAnLi9kb2MvRG9jdW1lbnQuanMnO1xuZXhwb3J0IHsgU2NoZW1hIH0gZnJvbSAnLi9zY2hlbWEvU2NoZW1hLmpzJztcbmV4cG9ydCB7IFlBTUxFcnJvciwgWUFNTFBhcnNlRXJyb3IsIFlBTUxXYXJuaW5nIH0gZnJvbSAnLi9lcnJvcnMuanMnO1xuZXhwb3J0IHsgQWxpYXMgfSBmcm9tICcuL25vZGVzL0FsaWFzLmpzJztcbmV4cG9ydCB7IGlzQWxpYXMsIGlzQ29sbGVjdGlvbiwgaXNEb2N1bWVudCwgaXNNYXAsIGlzTm9kZSwgaXNQYWlyLCBpc1NjYWxhciwgaXNTZXEgfSBmcm9tICcuL25vZGVzL2lkZW50aXR5LmpzJztcbmV4cG9ydCB7IFBhaXIgfSBmcm9tICcuL25vZGVzL1BhaXIuanMnO1xuZXhwb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi9ub2Rlcy9TY2FsYXIuanMnO1xuZXhwb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4vbm9kZXMvWUFNTE1hcC5qcyc7XG5leHBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi9ub2Rlcy9ZQU1MU2VxLmpzJztcbmltcG9ydCAqIGFzIGNzdCBmcm9tICcuL3BhcnNlL2NzdC5qcyc7XG5leHBvcnQgeyBjc3QgYXMgQ1NUIH07XG5leHBvcnQgeyBMZXhlciB9IGZyb20gJy4vcGFyc2UvbGV4ZXIuanMnO1xuZXhwb3J0IHsgTGluZUNvdW50ZXIgfSBmcm9tICcuL3BhcnNlL2xpbmUtY291bnRlci5qcyc7XG5leHBvcnQgeyBQYXJzZXIgfSBmcm9tICcuL3BhcnNlL3BhcnNlci5qcyc7XG5leHBvcnQgeyBwYXJzZSwgcGFyc2VBbGxEb2N1bWVudHMsIHBhcnNlRG9jdW1lbnQsIHN0cmluZ2lmeSB9IGZyb20gJy4vcHVibGljLWFwaS5qcyc7XG5leHBvcnQgeyB2aXNpdCwgdmlzaXRBc3luYyB9IGZyb20gJy4vdmlzaXQuanMnO1xuIiwiZnVuY3Rpb24gZGVidWcobG9nTGV2ZWwsIC4uLm1lc3NhZ2VzKSB7XG4gICAgaWYgKGxvZ0xldmVsID09PSAnZGVidWcnKVxuICAgICAgICBjb25zb2xlLmxvZyguLi5tZXNzYWdlcyk7XG59XG5mdW5jdGlvbiB3YXJuKGxvZ0xldmVsLCB3YXJuaW5nKSB7XG4gICAgaWYgKGxvZ0xldmVsID09PSAnZGVidWcnIHx8IGxvZ0xldmVsID09PSAnd2FybicpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3R5cGVzY3JpcHQtZXNsaW50L3R5cGVzY3JpcHQtZXNsaW50L2lzc3Vlcy83NDc4XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW9wdGlvbmFsLWNoYWluXG4gICAgICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbWl0V2FybmluZylcbiAgICAgICAgICAgIHByb2Nlc3MuZW1pdFdhcm5pbmcod2FybmluZyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybih3YXJuaW5nKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IGRlYnVnLCB3YXJuIH07XG4iLCJpbXBvcnQgeyBhbmNob3JJc1ZhbGlkIH0gZnJvbSAnLi4vZG9jL2FuY2hvcnMuanMnO1xuaW1wb3J0IHsgdmlzaXQgfSBmcm9tICcuLi92aXNpdC5qcyc7XG5pbXBvcnQgeyBBTElBUywgaXNBbGlhcywgaXNDb2xsZWN0aW9uLCBpc1BhaXIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IE5vZGVCYXNlIH0gZnJvbSAnLi9Ob2RlLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jbGFzcyBBbGlhcyBleHRlbmRzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UpIHtcbiAgICAgICAgc3VwZXIoQUxJQVMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0YWcnLCB7XG4gICAgICAgICAgICBzZXQoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbGlhcyBub2RlcyBjYW5ub3QgaGF2ZSB0YWdzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIHRoZSB2YWx1ZSBvZiB0aGlzIGFsaWFzIHdpdGhpbiBgZG9jYCwgZmluZGluZyB0aGUgbGFzdFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBgc291cmNlYCBhbmNob3IgYmVmb3JlIHRoaXMgbm9kZS5cbiAgICAgKi9cbiAgICByZXNvbHZlKGRvYykge1xuICAgICAgICBsZXQgZm91bmQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZpc2l0KGRvYywge1xuICAgICAgICAgICAgTm9kZTogKF9rZXksIG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZSA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0LkJSRUFLO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmFuY2hvciA9PT0gdGhpcy5zb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG4gICAgdG9KU09OKF9hcmcsIGN0eCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiB7IHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgY29uc3QgeyBhbmNob3JzLCBkb2MsIG1heEFsaWFzQ291bnQgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc291cmNlID0gdGhpcy5yZXNvbHZlKGRvYyk7XG4gICAgICAgIGlmICghc291cmNlKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBgVW5yZXNvbHZlZCBhbGlhcyAodGhlIGFuY2hvciBtdXN0IGJlIHNldCBiZWZvcmUgdGhlIGFsaWFzKTogJHt0aGlzLnNvdXJjZX1gO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgIC8vIFJlc29sdmUgYW5jaG9ycyBmb3IgTm9kZS5wcm90b3R5cGUudG9KUygpXG4gICAgICAgICAgICB0b0pTKHNvdXJjZSwgbnVsbCwgY3R4KTtcbiAgICAgICAgICAgIGRhdGEgPSBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoIWRhdGEgfHwgZGF0YS5yZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gJ1RoaXMgc2hvdWxkIG5vdCBoYXBwZW46IEFsaWFzIGFuY2hvciB3YXMgbm90IHJlc29sdmVkPyc7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF4QWxpYXNDb3VudCA+PSAwKSB7XG4gICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5hbGlhc0NvdW50ID09PSAwKVxuICAgICAgICAgICAgICAgIGRhdGEuYWxpYXNDb3VudCA9IGdldEFsaWFzQ291bnQoZG9jLCBzb3VyY2UsIGFuY2hvcnMpO1xuICAgICAgICAgICAgaWYgKGRhdGEuY291bnQgKiBkYXRhLmFsaWFzQ291bnQgPiBtYXhBbGlhc0NvdW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gJ0V4Y2Vzc2l2ZSBhbGlhcyBjb3VudCBpbmRpY2F0ZXMgYSByZXNvdXJjZSBleGhhdXN0aW9uIGF0dGFjayc7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGEucmVzO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIF9vbkNvbW1lbnQsIF9vbkNob21wS2VlcCkge1xuICAgICAgICBjb25zdCBzcmMgPSBgKiR7dGhpcy5zb3VyY2V9YDtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgYW5jaG9ySXNWYWxpZCh0aGlzLnNvdXJjZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMudmVyaWZ5QWxpYXNPcmRlciAmJiAhY3R4LmFuY2hvcnMuaGFzKHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3R4LmltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtzcmN9IGA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRBbGlhc0NvdW50KGRvYywgbm9kZSwgYW5jaG9ycykge1xuICAgIGlmIChpc0FsaWFzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IG5vZGUucmVzb2x2ZShkb2MpO1xuICAgICAgICBjb25zdCBhbmNob3IgPSBhbmNob3JzICYmIHNvdXJjZSAmJiBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICByZXR1cm4gYW5jaG9yID8gYW5jaG9yLmNvdW50ICogYW5jaG9yLmFsaWFzQ291bnQgOiAwO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIG5vZGUuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSBnZXRBbGlhc0NvdW50KGRvYywgaXRlbSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoYyA+IGNvdW50KVxuICAgICAgICAgICAgICAgIGNvdW50ID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzUGFpcihub2RlKSkge1xuICAgICAgICBjb25zdCBrYyA9IGdldEFsaWFzQ291bnQoZG9jLCBub2RlLmtleSwgYW5jaG9ycyk7XG4gICAgICAgIGNvbnN0IHZjID0gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUudmFsdWUsIGFuY2hvcnMpO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoa2MsIHZjKTtcbiAgICB9XG4gICAgcmV0dXJuIDE7XG59XG5cbmV4cG9ydCB7IEFsaWFzIH07XG4iLCJpbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi4vZG9jL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgaXNOb2RlLCBpc1BhaXIsIGlzQ29sbGVjdGlvbiwgaXNTY2FsYXIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IE5vZGVCYXNlIH0gZnJvbSAnLi9Ob2RlLmpzJztcblxuZnVuY3Rpb24gY29sbGVjdGlvbkZyb21QYXRoKHNjaGVtYSwgcGF0aCwgdmFsdWUpIHtcbiAgICBsZXQgdiA9IHZhbHVlO1xuICAgIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGNvbnN0IGsgPSBwYXRoW2ldO1xuICAgICAgICBpZiAodHlwZW9mIGsgPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaykgJiYgayA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gW107XG4gICAgICAgICAgICBhW2tdID0gdjtcbiAgICAgICAgICAgIHYgPSBhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdiA9IG5ldyBNYXAoW1trLCB2XV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVOb2RlKHYsIHVuZGVmaW5lZCwge1xuICAgICAgICBhbGlhc0R1cGxpY2F0ZU9iamVjdHM6IGZhbHNlLFxuICAgICAgICBrZWVwVW5kZWZpbmVkOiBmYWxzZSxcbiAgICAgICAgb25BbmNob3I6ICgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgcGxlYXNlIHJlcG9ydCBhIGJ1Zy4nKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICBzb3VyY2VPYmplY3RzOiBuZXcgTWFwKClcbiAgICB9KTtcbn1cbi8vIFR5cGUgZ3VhcmQgaXMgaW50ZW50aW9uYWxseSBhIGxpdHRsZSB3cm9uZyBzbyBhcyB0byBiZSBtb3JlIHVzZWZ1bCxcbi8vIGFzIGl0IGRvZXMgbm90IGNvdmVyIHVudHlwYWJsZSBlbXB0eSBub24tc3RyaW5nIGl0ZXJhYmxlcyAoZS5nLiBbXSkuXG5jb25zdCBpc0VtcHR5UGF0aCA9IChwYXRoKSA9PiBwYXRoID09IG51bGwgfHxcbiAgICAodHlwZW9mIHBhdGggPT09ICdvYmplY3QnICYmICEhcGF0aFtTeW1ib2wuaXRlcmF0b3JdKCkubmV4dCgpLmRvbmUpO1xuY2xhc3MgQ29sbGVjdGlvbiBleHRlbmRzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0eXBlLCBzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIodHlwZSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnc2NoZW1hJywge1xuICAgICAgICAgICAgdmFsdWU6IHNjaGVtYSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGNvcHkgb2YgdGhpcyBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNjaGVtYSAtIElmIGRlZmluZWQsIG92ZXJ3cml0ZXMgdGhlIG9yaWdpbmFsJ3Mgc2NoZW1hXG4gICAgICovXG4gICAgY2xvbmUoc2NoZW1hKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBpZiAoc2NoZW1hKVxuICAgICAgICAgICAgY29weS5zY2hlbWEgPSBzY2hlbWE7XG4gICAgICAgIGNvcHkuaXRlbXMgPSBjb3B5Lml0ZW1zLm1hcChpdCA9PiBpc05vZGUoaXQpIHx8IGlzUGFpcihpdCkgPyBpdC5jbG9uZShzY2hlbWEpIDogaXQpO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGNvbGxlY3Rpb24uIEZvciBgISFtYXBgIGFuZCBgISFvbWFwYCB0aGUgdmFsdWUgbXVzdFxuICAgICAqIGJlIGEgUGFpciBpbnN0YW5jZSBvciBhIGB7IGtleSwgdmFsdWUgfWAgb2JqZWN0LCB3aGljaCBtYXkgbm90IGhhdmUgYSBrZXlcbiAgICAgKiB0aGF0IGFscmVhZHkgZXhpc3RzIGluIHRoZSBtYXAuXG4gICAgICovXG4gICAgYWRkSW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKVxuICAgICAgICAgICAgdGhpcy5hZGQodmFsdWUpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgICAgICBub2RlLmFkZEluKHJlc3QsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCAmJiB0aGlzLnNjaGVtYSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgcmVzdCwgdmFsdWUpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGVJbihwYXRoKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuZGVsZXRlSW4ocmVzdCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBrZXlgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXRJbihwYXRoLCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpc1NjYWxhcihub2RlKSA/IG5vZGUudmFsdWUgOiBub2RlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKG5vZGUpID8gbm9kZS5nZXRJbihyZXN0LCBrZWVwU2NhbGFyKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaGFzQWxsTnVsbFZhbHVlcyhhbGxvd1NjYWxhcikge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5ldmVyeShub2RlID0+IHtcbiAgICAgICAgICAgIGlmICghaXNQYWlyKG5vZGUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBub2RlLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIChuID09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAoYWxsb3dTY2FsYXIgJiZcbiAgICAgICAgICAgICAgICAgICAgaXNTY2FsYXIobikgJiZcbiAgICAgICAgICAgICAgICAgICAgbi52YWx1ZSA9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICFuLmNvbW1lbnRCZWZvcmUgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4uY29tbWVudCAmJlxuICAgICAgICAgICAgICAgICAgICAhbi50YWcpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgY29sbGVjdGlvbiBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKi9cbiAgICBoYXNJbihwYXRoKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzKGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKG5vZGUpID8gbm9kZS5oYXNJbihyZXN0KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBjb2xsZWN0aW9uLiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICAgICAgbm9kZS5zZXRJbihyZXN0LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlID09PSB1bmRlZmluZWQgJiYgdGhpcy5zY2hlbWEpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIHJlc3QsIHZhbHVlKSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgICAgICB9XG4gICAgfVxufVxuQ29sbGVjdGlvbi5tYXhGbG93U3RyaW5nU2luZ2xlTGluZUxlbmd0aCA9IDYwO1xuXG5leHBvcnQgeyBDb2xsZWN0aW9uLCBjb2xsZWN0aW9uRnJvbVBhdGgsIGlzRW1wdHlQYXRoIH07XG4iLCJpbXBvcnQgeyBhcHBseVJldml2ZXIgfSBmcm9tICcuLi9kb2MvYXBwbHlSZXZpdmVyLmpzJztcbmltcG9ydCB7IE5PREVfVFlQRSwgaXNEb2N1bWVudCB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4vdG9KUy5qcyc7XG5cbmNsYXNzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0eXBlKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBOT0RFX1RZUEUsIHsgdmFsdWU6IHR5cGUgfSk7XG4gICAgfVxuICAgIC8qKiBDcmVhdGUgYSBjb3B5IG9mIHRoaXMgbm9kZS4gICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKiogQSBwbGFpbiBKYXZhU2NyaXB0IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgbm9kZS4gKi9cbiAgICB0b0pTKGRvYywgeyBtYXBBc01hcCwgbWF4QWxpYXNDb3VudCwgb25BbmNob3IsIHJldml2ZXIgfSA9IHt9KSB7XG4gICAgICAgIGlmICghaXNEb2N1bWVudChkb2MpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBkb2N1bWVudCBhcmd1bWVudCBpcyByZXF1aXJlZCcpO1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbmNob3JzOiBuZXcgTWFwKCksXG4gICAgICAgICAgICBkb2MsXG4gICAgICAgICAgICBrZWVwOiB0cnVlLFxuICAgICAgICAgICAgbWFwQXNNYXA6IG1hcEFzTWFwID09PSB0cnVlLFxuICAgICAgICAgICAgbWFwS2V5V2FybmVkOiBmYWxzZSxcbiAgICAgICAgICAgIG1heEFsaWFzQ291bnQ6IHR5cGVvZiBtYXhBbGlhc0NvdW50ID09PSAnbnVtYmVyJyA/IG1heEFsaWFzQ291bnQgOiAxMDBcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzID0gdG9KUyh0aGlzLCAnJywgY3R4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBvbkFuY2hvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjb3VudCwgcmVzIH0gb2YgY3R4LmFuY2hvcnMudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgb25BbmNob3IocmVzLCBjb3VudCk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBhcHBseVJldml2ZXIocmV2aXZlciwgeyAnJzogcmVzIH0sICcnLCByZXMpXG4gICAgICAgICAgICA6IHJlcztcbiAgICB9XG59XG5cbmV4cG9ydCB7IE5vZGVCYXNlIH07XG4iLCJpbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi4vZG9jL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5UGFpciB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlQYWlyLmpzJztcbmltcG9ydCB7IGFkZFBhaXJUb0pTTWFwIH0gZnJvbSAnLi9hZGRQYWlyVG9KU01hcC5qcyc7XG5pbXBvcnQgeyBOT0RFX1RZUEUsIFBBSVIsIGlzTm9kZSB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG5mdW5jdGlvbiBjcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IGsgPSBjcmVhdGVOb2RlKGtleSwgdW5kZWZpbmVkLCBjdHgpO1xuICAgIGNvbnN0IHYgPSBjcmVhdGVOb2RlKHZhbHVlLCB1bmRlZmluZWQsIGN0eCk7XG4gICAgcmV0dXJuIG5ldyBQYWlyKGssIHYpO1xufVxuY2xhc3MgUGFpciB7XG4gICAgY29uc3RydWN0b3Ioa2V5LCB2YWx1ZSA9IG51bGwpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIE5PREVfVFlQRSwgeyB2YWx1ZTogUEFJUiB9KTtcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY2xvbmUoc2NoZW1hKSB7XG4gICAgICAgIGxldCB7IGtleSwgdmFsdWUgfSA9IHRoaXM7XG4gICAgICAgIGlmIChpc05vZGUoa2V5KSlcbiAgICAgICAgICAgIGtleSA9IGtleS5jbG9uZShzY2hlbWEpO1xuICAgICAgICBpZiAoaXNOb2RlKHZhbHVlKSlcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuY2xvbmUoc2NoZW1hKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWlyKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGNvbnN0IHBhaXIgPSBjdHg/Lm1hcEFzTWFwID8gbmV3IE1hcCgpIDoge307XG4gICAgICAgIHJldHVybiBhZGRQYWlyVG9KU01hcChjdHgsIHBhaXIsIHRoaXMpO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgcmV0dXJuIGN0eD8uZG9jXG4gICAgICAgICAgICA/IHN0cmluZ2lmeVBhaXIodGhpcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgOiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFBhaXIsIGNyZWF0ZVBhaXIgfTtcbiIsImltcG9ydCB7IFNDQUxBUiB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgTm9kZUJhc2UgfSBmcm9tICcuL05vZGUuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4vdG9KUy5qcyc7XG5cbmNvbnN0IGlzU2NhbGFyVmFsdWUgPSAodmFsdWUpID0+ICF2YWx1ZSB8fCAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpO1xuY2xhc3MgU2NhbGFyIGV4dGVuZHMgTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlKSB7XG4gICAgICAgIHN1cGVyKFNDQUxBUik7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgdG9KU09OKGFyZywgY3R4KSB7XG4gICAgICAgIHJldHVybiBjdHg/LmtlZXAgPyB0aGlzLnZhbHVlIDogdG9KUyh0aGlzLnZhbHVlLCBhcmcsIGN0eCk7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHRoaXMudmFsdWUpO1xuICAgIH1cbn1cblNjYWxhci5CTE9DS19GT0xERUQgPSAnQkxPQ0tfRk9MREVEJztcblNjYWxhci5CTE9DS19MSVRFUkFMID0gJ0JMT0NLX0xJVEVSQUwnO1xuU2NhbGFyLlBMQUlOID0gJ1BMQUlOJztcblNjYWxhci5RVU9URV9ET1VCTEUgPSAnUVVPVEVfRE9VQkxFJztcblNjYWxhci5RVU9URV9TSU5HTEUgPSAnUVVPVEVfU0lOR0xFJztcblxuZXhwb3J0IHsgU2NhbGFyLCBpc1NjYWxhclZhbHVlIH07XG4iLCJpbXBvcnQgeyBzdHJpbmdpZnlDb2xsZWN0aW9uIH0gZnJvbSAnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeUNvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgYWRkUGFpclRvSlNNYXAgfSBmcm9tICcuL2FkZFBhaXJUb0pTTWFwLmpzJztcbmltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tICcuL0NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgaXNQYWlyLCBpc1NjYWxhciwgTUFQIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyLCBjcmVhdGVQYWlyIH0gZnJvbSAnLi9QYWlyLmpzJztcbmltcG9ydCB7IGlzU2NhbGFyVmFsdWUgfSBmcm9tICcuL1NjYWxhci5qcyc7XG5cbmZ1bmN0aW9uIGZpbmRQYWlyKGl0ZW1zLCBrZXkpIHtcbiAgICBjb25zdCBrID0gaXNTY2FsYXIoa2V5KSA/IGtleS52YWx1ZSA6IGtleTtcbiAgICBmb3IgKGNvbnN0IGl0IG9mIGl0ZW1zKSB7XG4gICAgICAgIGlmIChpc1BhaXIoaXQpKSB7XG4gICAgICAgICAgICBpZiAoaXQua2V5ID09PSBrZXkgfHwgaXQua2V5ID09PSBrKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdDtcbiAgICAgICAgICAgIGlmIChpc1NjYWxhcihpdC5rZXkpICYmIGl0LmtleS52YWx1ZSA9PT0gaylcbiAgICAgICAgICAgICAgICByZXR1cm4gaXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmNsYXNzIFlBTUxNYXAgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgICBzdGF0aWMgZ2V0IHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAndGFnOnlhbWwub3JnLDIwMDI6bWFwJztcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKE1BUCwgc2NoZW1hKTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIGdlbmVyaWMgY29sbGVjdGlvbiBwYXJzaW5nIG1ldGhvZCB0aGF0IGNhbiBiZSBleHRlbmRlZFxuICAgICAqIHRvIG90aGVyIG5vZGUgY2xhc3NlcyB0aGF0IGluaGVyaXQgZnJvbSBZQU1MTWFwXG4gICAgICovXG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBvYmosIGN0eCkge1xuICAgICAgICBjb25zdCB7IGtlZXBVbmRlZmluZWQsIHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IG1hcCA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGNvbnN0IGFkZCA9IChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbChvYmosIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXBsYWNlcikgJiYgIXJlcGxhY2VyLmluY2x1ZGVzKGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgfHwga2VlcFVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChjcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBvYmopXG4gICAgICAgICAgICAgICAgYWRkKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSlcbiAgICAgICAgICAgICAgICBhZGQoa2V5LCBvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBzY2hlbWEuc29ydE1hcEVudHJpZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIG1hcC5pdGVtcy5zb3J0KHNjaGVtYS5zb3J0TWFwRW50cmllcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHZhbHVlIHRvIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIG92ZXJ3cml0ZSAtIElmIG5vdCBzZXQgYHRydWVgLCB1c2luZyBhIGtleSB0aGF0IGlzIGFscmVhZHkgaW4gdGhlXG4gICAgICogICBjb2xsZWN0aW9uIHdpbGwgdGhyb3cuIE90aGVyd2lzZSwgb3ZlcndyaXRlcyB0aGUgcHJldmlvdXMgdmFsdWUuXG4gICAgICovXG4gICAgYWRkKHBhaXIsIG92ZXJ3cml0ZSkge1xuICAgICAgICBsZXQgX3BhaXI7XG4gICAgICAgIGlmIChpc1BhaXIocGFpcikpXG4gICAgICAgICAgICBfcGFpciA9IHBhaXI7XG4gICAgICAgIGVsc2UgaWYgKCFwYWlyIHx8IHR5cGVvZiBwYWlyICE9PSAnb2JqZWN0JyB8fCAhKCdrZXknIGluIHBhaXIpKSB7XG4gICAgICAgICAgICAvLyBJbiBUeXBlU2NyaXB0LCB0aGlzIG5ldmVyIGhhcHBlbnMuXG4gICAgICAgICAgICBfcGFpciA9IG5ldyBQYWlyKHBhaXIsIHBhaXI/LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBfcGFpciA9IG5ldyBQYWlyKHBhaXIua2V5LCBwYWlyLnZhbHVlKTtcbiAgICAgICAgY29uc3QgcHJldiA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIF9wYWlyLmtleSk7XG4gICAgICAgIGNvbnN0IHNvcnRFbnRyaWVzID0gdGhpcy5zY2hlbWE/LnNvcnRNYXBFbnRyaWVzO1xuICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgICAgaWYgKCFvdmVyd3JpdGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBLZXkgJHtfcGFpci5rZXl9IGFscmVhZHkgc2V0YCk7XG4gICAgICAgICAgICAvLyBGb3Igc2NhbGFycywga2VlcCB0aGUgb2xkIG5vZGUgJiBpdHMgY29tbWVudHMgYW5kIGFuY2hvcnNcbiAgICAgICAgICAgIGlmIChpc1NjYWxhcihwcmV2LnZhbHVlKSAmJiBpc1NjYWxhclZhbHVlKF9wYWlyLnZhbHVlKSlcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlLnZhbHVlID0gX3BhaXIudmFsdWU7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJldi52YWx1ZSA9IF9wYWlyLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNvcnRFbnRyaWVzKSB7XG4gICAgICAgICAgICBjb25zdCBpID0gdGhpcy5pdGVtcy5maW5kSW5kZXgoaXRlbSA9PiBzb3J0RW50cmllcyhfcGFpciwgaXRlbSkgPCAwKTtcbiAgICAgICAgICAgIGlmIChpID09PSAtMSlcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goX3BhaXIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKGksIDAsIF9wYWlyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChfcGFpcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICBjb25zdCBpdCA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGlmICghaXQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGRlbCA9IHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMuaXRlbXMuaW5kZXhPZihpdCksIDEpO1xuICAgICAgICByZXR1cm4gZGVsLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgaXQgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICBjb25zdCBub2RlID0gaXQ/LnZhbHVlO1xuICAgICAgICByZXR1cm4gKCFrZWVwU2NhbGFyICYmIGlzU2NhbGFyKG5vZGUpID8gbm9kZS52YWx1ZSA6IG5vZGUpID8/IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gISFmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgIH1cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmFkZChuZXcgUGFpcihrZXksIHZhbHVlKSwgdHJ1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBjdHggLSBDb252ZXJzaW9uIGNvbnRleHQsIG9yaWdpbmFsbHkgc2V0IGluIERvY3VtZW50I3RvSlMoKVxuICAgICAqIEBwYXJhbSB7Q2xhc3N9IFR5cGUgLSBJZiBzZXQsIGZvcmNlcyB0aGUgcmV0dXJuZWQgY29sbGVjdGlvbiB0eXBlXG4gICAgICogQHJldHVybnMgSW5zdGFuY2Ugb2YgVHlwZSwgTWFwLCBvciBPYmplY3RcbiAgICAgKi9cbiAgICB0b0pTT04oXywgY3R4LCBUeXBlKSB7XG4gICAgICAgIGNvbnN0IG1hcCA9IFR5cGUgPyBuZXcgVHlwZSgpIDogY3R4Py5tYXBBc01hcCA/IG5ldyBNYXAoKSA6IHt9O1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShtYXApO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcylcbiAgICAgICAgICAgIGFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKCFpc1BhaXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNYXAgaXRlbXMgbXVzdCBhbGwgYmUgcGFpcnM7IGZvdW5kICR7SlNPTi5zdHJpbmdpZnkoaXRlbSl9IGluc3RlYWRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWN0eC5hbGxOdWxsVmFsdWVzICYmIHRoaXMuaGFzQWxsTnVsbFZhbHVlcyhmYWxzZSkpXG4gICAgICAgICAgICBjdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHsgYWxsTnVsbFZhbHVlczogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24odGhpcywgY3R4LCB7XG4gICAgICAgICAgICBibG9ja0l0ZW1QcmVmaXg6ICcnLFxuICAgICAgICAgICAgZmxvd0NoYXJzOiB7IHN0YXJ0OiAneycsIGVuZDogJ30nIH0sXG4gICAgICAgICAgICBpdGVtSW5kZW50OiBjdHguaW5kZW50IHx8ICcnLFxuICAgICAgICAgICAgb25DaG9tcEtlZXAsXG4gICAgICAgICAgICBvbkNvbW1lbnRcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBZQU1MTWFwLCBmaW5kUGFpciB9O1xuIiwiaW1wb3J0IHsgY3JlYXRlTm9kZSB9IGZyb20gJy4uL2RvYy9jcmVhdGVOb2RlLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeUNvbGxlY3Rpb24gfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSAnLi9Db2xsZWN0aW9uLmpzJztcbmltcG9ydCB7IFNFUSwgaXNTY2FsYXIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IGlzU2NhbGFyVmFsdWUgfSBmcm9tICcuL1NjYWxhci5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi90b0pTLmpzJztcblxuY2xhc3MgWUFNTFNlcSBleHRlbmRzIENvbGxlY3Rpb24ge1xuICAgIHN0YXRpYyBnZXQgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoU0VRLCBzY2hlbWEpO1xuICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgfVxuICAgIGFkZCh2YWx1ZSkge1xuICAgICAgICB0aGlzLml0ZW1zLnB1c2godmFsdWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIGBrZXlgIG11c3QgY29udGFpbiBhIHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIgZm9yIHRoaXMgdG8gc3VjY2VlZC5cbiAgICAgKiBJdCBtYXkgYmUgd3JhcHBlZCBpbiBhIGBTY2FsYXJgLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIGlmICh0eXBlb2YgaWR4ICE9PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgZGVsID0gdGhpcy5pdGVtcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgcmV0dXJuIGRlbC5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBnZXQoa2V5LCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIGlmICh0eXBlb2YgaWR4ICE9PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IGl0ID0gdGhpcy5pdGVtc1tpZHhdO1xuICAgICAgICByZXR1cm4gIWtlZXBTY2FsYXIgJiYgaXNTY2FsYXIoaXQpID8gaXQudmFsdWUgOiBpdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjb2xsZWN0aW9uIGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqXG4gICAgICogYGtleWAgbXVzdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciBmb3IgdGhpcyB0byBzdWNjZWVkLlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICovXG4gICAgaGFzKGtleSkge1xuICAgICAgICBjb25zdCBpZHggPSBhc0l0ZW1JbmRleChrZXkpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIGlkeCA9PT0gJ251bWJlcicgJiYgaWR4IDwgdGhpcy5pdGVtcy5sZW5ndGg7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGNvbGxlY3Rpb24uIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqXG4gICAgICogSWYgYGtleWAgZG9lcyBub3QgY29udGFpbiBhIHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIsIHRoaXMgd2lsbCB0aHJvdy5cbiAgICAgKiBJdCBtYXkgYmUgd3JhcHBlZCBpbiBhIGBTY2FsYXJgLlxuICAgICAqL1xuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIGlmICh0eXBlb2YgaWR4ICE9PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYSB2YWxpZCBpbmRleCwgbm90ICR7a2V5fS5gKTtcbiAgICAgICAgY29uc3QgcHJldiA9IHRoaXMuaXRlbXNbaWR4XTtcbiAgICAgICAgaWYgKGlzU2NhbGFyKHByZXYpICYmIGlzU2NhbGFyVmFsdWUodmFsdWUpKVxuICAgICAgICAgICAgcHJldi52YWx1ZSA9IHZhbHVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2lkeF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICBjb25zdCBzZXEgPSBbXTtcbiAgICAgICAgaWYgKGN0eD8ub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUoc2VxKTtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcylcbiAgICAgICAgICAgIHNlcS5wdXNoKHRvSlMoaXRlbSwgU3RyaW5nKGkrKyksIGN0eCkpO1xuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlDb2xsZWN0aW9uKHRoaXMsIGN0eCwge1xuICAgICAgICAgICAgYmxvY2tJdGVtUHJlZml4OiAnLSAnLFxuICAgICAgICAgICAgZmxvd0NoYXJzOiB7IHN0YXJ0OiAnWycsIGVuZDogJ10nIH0sXG4gICAgICAgICAgICBpdGVtSW5kZW50OiAoY3R4LmluZGVudCB8fCAnJykgKyAnICAnLFxuICAgICAgICAgICAgb25DaG9tcEtlZXAsXG4gICAgICAgICAgICBvbkNvbW1lbnRcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tKHNjaGVtYSwgb2JqLCBjdHgpIHtcbiAgICAgICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzZXEgPSBuZXcgdGhpcyhzY2hlbWEpO1xuICAgICAgICBpZiAob2JqICYmIFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3Qob2JqKSkge1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaXQgb2Ygb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBvYmogaW5zdGFuY2VvZiBTZXQgPyBpdCA6IFN0cmluZyhpKyspO1xuICAgICAgICAgICAgICAgICAgICBpdCA9IHJlcGxhY2VyLmNhbGwob2JqLCBrZXksIGl0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goY3JlYXRlTm9kZShpdCwgdW5kZWZpbmVkLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFzSXRlbUluZGV4KGtleSkge1xuICAgIGxldCBpZHggPSBpc1NjYWxhcihrZXkpID8ga2V5LnZhbHVlIDoga2V5O1xuICAgIGlmIChpZHggJiYgdHlwZW9mIGlkeCA9PT0gJ3N0cmluZycpXG4gICAgICAgIGlkeCA9IE51bWJlcihpZHgpO1xuICAgIHJldHVybiB0eXBlb2YgaWR4ID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGlkeCkgJiYgaWR4ID49IDBcbiAgICAgICAgPyBpZHhcbiAgICAgICAgOiBudWxsO1xufVxuXG5leHBvcnQgeyBZQU1MU2VxIH07XG4iLCJpbXBvcnQgeyB3YXJuIH0gZnJvbSAnLi4vbG9nLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQgfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGlzQWxpYXMsIGlzU2VxLCBpc1NjYWxhciwgaXNNYXAsIGlzTm9kZSB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi9TY2FsYXIuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4vdG9KUy5qcyc7XG5cbmNvbnN0IE1FUkdFX0tFWSA9ICc8PCc7XG5mdW5jdGlvbiBhZGRQYWlyVG9KU01hcChjdHgsIG1hcCwgeyBrZXksIHZhbHVlIH0pIHtcbiAgICBpZiAoY3R4Py5kb2Muc2NoZW1hLm1lcmdlICYmIGlzTWVyZ2VLZXkoa2V5KSkge1xuICAgICAgICB2YWx1ZSA9IGlzQWxpYXModmFsdWUpID8gdmFsdWUucmVzb2x2ZShjdHguZG9jKSA6IHZhbHVlO1xuICAgICAgICBpZiAoaXNTZXEodmFsdWUpKVxuICAgICAgICAgICAgZm9yIChjb25zdCBpdCBvZiB2YWx1ZS5pdGVtcylcbiAgICAgICAgICAgICAgICBtZXJnZVRvSlNNYXAoY3R4LCBtYXAsIGl0KTtcbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIHZhbHVlKVxuICAgICAgICAgICAgICAgIG1lcmdlVG9KU01hcChjdHgsIG1hcCwgaXQpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGpzS2V5ID0gdG9KUyhrZXksICcnLCBjdHgpO1xuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBtYXAuc2V0KGpzS2V5LCB0b0pTKHZhbHVlLCBqc0tleSwgY3R4KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWFwIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBtYXAuYWRkKGpzS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmluZ0tleSA9IHN0cmluZ2lmeUtleShrZXksIGpzS2V5LCBjdHgpO1xuICAgICAgICAgICAgY29uc3QganNWYWx1ZSA9IHRvSlModmFsdWUsIHN0cmluZ0tleSwgY3R4KTtcbiAgICAgICAgICAgIGlmIChzdHJpbmdLZXkgaW4gbWFwKVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtYXAsIHN0cmluZ0tleSwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZToganNWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1hcFtzdHJpbmdLZXldID0ganNWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxuY29uc3QgaXNNZXJnZUtleSA9IChrZXkpID0+IGtleSA9PT0gTUVSR0VfS0VZIHx8XG4gICAgKGlzU2NhbGFyKGtleSkgJiZcbiAgICAgICAga2V5LnZhbHVlID09PSBNRVJHRV9LRVkgJiZcbiAgICAgICAgKCFrZXkudHlwZSB8fCBrZXkudHlwZSA9PT0gU2NhbGFyLlBMQUlOKSk7XG4vLyBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGEgbWVyZ2Uga2V5IGlzIGEgc2luZ2xlIG1hcHBpbmcgbm9kZSwgZWFjaCBvZlxuLy8gaXRzIGtleS92YWx1ZSBwYWlycyBpcyBpbnNlcnRlZCBpbnRvIHRoZSBjdXJyZW50IG1hcHBpbmcsIHVubGVzcyB0aGUga2V5XG4vLyBhbHJlYWR5IGV4aXN0cyBpbiBpdC4gSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVyZ2Uga2V5IGlzIGFcbi8vIHNlcXVlbmNlLCB0aGVuIHRoaXMgc2VxdWVuY2UgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBtYXBwaW5nIG5vZGVzIGFuZCBlYWNoXG4vLyBvZiB0aGVzZSBub2RlcyBpcyBtZXJnZWQgaW4gdHVybiBhY2NvcmRpbmcgdG8gaXRzIG9yZGVyIGluIHRoZSBzZXF1ZW5jZS5cbi8vIEtleXMgaW4gbWFwcGluZyBub2RlcyBlYXJsaWVyIGluIHRoZSBzZXF1ZW5jZSBvdmVycmlkZSBrZXlzIHNwZWNpZmllZCBpblxuLy8gbGF0ZXIgbWFwcGluZyBub2Rlcy4gLS0gaHR0cDovL3lhbWwub3JnL3R5cGUvbWVyZ2UuaHRtbFxuZnVuY3Rpb24gbWVyZ2VUb0pTTWFwKGN0eCwgbWFwLCB2YWx1ZSkge1xuICAgIGNvbnN0IHNvdXJjZSA9IGN0eCAmJiBpc0FsaWFzKHZhbHVlKSA/IHZhbHVlLnJlc29sdmUoY3R4LmRvYykgOiB2YWx1ZTtcbiAgICBpZiAoIWlzTWFwKHNvdXJjZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWVyZ2Ugc291cmNlcyBtdXN0IGJlIG1hcHMgb3IgbWFwIGFsaWFzZXMnKTtcbiAgICBjb25zdCBzcmNNYXAgPSBzb3VyY2UudG9KU09OKG51bGwsIGN0eCwgTWFwKTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBzcmNNYXApIHtcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgaWYgKCFtYXAuaGFzKGtleSkpXG4gICAgICAgICAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtYXAgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIG1hcC5hZGQoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1hcCwga2V5KSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwga2V5LCB7XG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlLZXkoa2V5LCBqc0tleSwgY3R4KSB7XG4gICAgaWYgKGpzS2V5ID09PSBudWxsKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgaWYgKHR5cGVvZiBqc0tleSAhPT0gJ29iamVjdCcpXG4gICAgICAgIHJldHVybiBTdHJpbmcoanNLZXkpO1xuICAgIGlmIChpc05vZGUoa2V5KSAmJiBjdHg/LmRvYykge1xuICAgICAgICBjb25zdCBzdHJDdHggPSBjcmVhdGVTdHJpbmdpZnlDb250ZXh0KGN0eC5kb2MsIHt9KTtcbiAgICAgICAgc3RyQ3R4LmFuY2hvcnMgPSBuZXcgU2V0KCk7XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBjdHguYW5jaG9ycy5rZXlzKCkpXG4gICAgICAgICAgICBzdHJDdHguYW5jaG9ycy5hZGQobm9kZS5hbmNob3IpO1xuICAgICAgICBzdHJDdHguaW5GbG93ID0gdHJ1ZTtcbiAgICAgICAgc3RyQ3R4LmluU3RyaW5naWZ5S2V5ID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgc3RyS2V5ID0ga2V5LnRvU3RyaW5nKHN0ckN0eCk7XG4gICAgICAgIGlmICghY3R4Lm1hcEtleVdhcm5lZCkge1xuICAgICAgICAgICAgbGV0IGpzb25TdHIgPSBKU09OLnN0cmluZ2lmeShzdHJLZXkpO1xuICAgICAgICAgICAgaWYgKGpzb25TdHIubGVuZ3RoID4gNDApXG4gICAgICAgICAgICAgICAganNvblN0ciA9IGpzb25TdHIuc3Vic3RyaW5nKDAsIDM2KSArICcuLi5cIic7XG4gICAgICAgICAgICB3YXJuKGN0eC5kb2Mub3B0aW9ucy5sb2dMZXZlbCwgYEtleXMgd2l0aCBjb2xsZWN0aW9uIHZhbHVlcyB3aWxsIGJlIHN0cmluZ2lmaWVkIGR1ZSB0byBKUyBPYmplY3QgcmVzdHJpY3Rpb25zOiAke2pzb25TdHJ9LiBTZXQgbWFwQXNNYXA6IHRydWUgdG8gdXNlIG9iamVjdCBrZXlzLmApO1xuICAgICAgICAgICAgY3R4Lm1hcEtleVdhcm5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cktleTtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGpzS2V5KTtcbn1cblxuZXhwb3J0IHsgYWRkUGFpclRvSlNNYXAgfTtcbiIsImNvbnN0IEFMSUFTID0gU3ltYm9sLmZvcigneWFtbC5hbGlhcycpO1xuY29uc3QgRE9DID0gU3ltYm9sLmZvcigneWFtbC5kb2N1bWVudCcpO1xuY29uc3QgTUFQID0gU3ltYm9sLmZvcigneWFtbC5tYXAnKTtcbmNvbnN0IFBBSVIgPSBTeW1ib2wuZm9yKCd5YW1sLnBhaXInKTtcbmNvbnN0IFNDQUxBUiA9IFN5bWJvbC5mb3IoJ3lhbWwuc2NhbGFyJyk7XG5jb25zdCBTRVEgPSBTeW1ib2wuZm9yKCd5YW1sLnNlcScpO1xuY29uc3QgTk9ERV9UWVBFID0gU3ltYm9sLmZvcigneWFtbC5ub2RlLnR5cGUnKTtcbmNvbnN0IGlzQWxpYXMgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IEFMSUFTO1xuY29uc3QgaXNEb2N1bWVudCA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gRE9DO1xuY29uc3QgaXNNYXAgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IE1BUDtcbmNvbnN0IGlzUGFpciA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gUEFJUjtcbmNvbnN0IGlzU2NhbGFyID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBTQ0FMQVI7XG5jb25zdCBpc1NlcSA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gU0VRO1xuZnVuY3Rpb24gaXNDb2xsZWN0aW9uKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICAgIHN3aXRjaCAobm9kZVtOT0RFX1RZUEVdKSB7XG4gICAgICAgICAgICBjYXNlIE1BUDpcbiAgICAgICAgICAgIGNhc2UgU0VROlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNOb2RlKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICAgIHN3aXRjaCAobm9kZVtOT0RFX1RZUEVdKSB7XG4gICAgICAgICAgICBjYXNlIEFMSUFTOlxuICAgICAgICAgICAgY2FzZSBNQVA6XG4gICAgICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIGNhc2UgU0VROlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuY29uc3QgaGFzQW5jaG9yID0gKG5vZGUpID0+IChpc1NjYWxhcihub2RlKSB8fCBpc0NvbGxlY3Rpb24obm9kZSkpICYmICEhbm9kZS5hbmNob3I7XG5cbmV4cG9ydCB7IEFMSUFTLCBET0MsIE1BUCwgTk9ERV9UWVBFLCBQQUlSLCBTQ0FMQVIsIFNFUSwgaGFzQW5jaG9yLCBpc0FsaWFzLCBpc0NvbGxlY3Rpb24sIGlzRG9jdW1lbnQsIGlzTWFwLCBpc05vZGUsIGlzUGFpciwgaXNTY2FsYXIsIGlzU2VxIH07XG4iLCJpbXBvcnQgeyBoYXNBbmNob3IgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBSZWN1cnNpdmVseSBjb252ZXJ0IGFueSBub2RlIG9yIGl0cyBjb250ZW50cyB0byBuYXRpdmUgSmF2YVNjcmlwdFxuICpcbiAqIEBwYXJhbSB2YWx1ZSAtIFRoZSBpbnB1dCB2YWx1ZVxuICogQHBhcmFtIGFyZyAtIElmIGB2YWx1ZWAgZGVmaW5lcyBhIGB0b0pTT04oKWAgbWV0aG9kLCB1c2UgdGhpc1xuICogICBhcyBpdHMgZmlyc3QgYXJndW1lbnRcbiAqIEBwYXJhbSBjdHggLSBDb252ZXJzaW9uIGNvbnRleHQsIG9yaWdpbmFsbHkgc2V0IGluIERvY3VtZW50I3RvSlMoKS4gSWZcbiAqICAgYHsga2VlcDogdHJ1ZSB9YCBpcyBub3Qgc2V0LCBvdXRwdXQgc2hvdWxkIGJlIHN1aXRhYmxlIGZvciBKU09OXG4gKiAgIHN0cmluZ2lmaWNhdGlvbi5cbiAqL1xuZnVuY3Rpb24gdG9KUyh2YWx1ZSwgYXJnLCBjdHgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1yZXR1cm5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAoKHYsIGkpID0+IHRvSlModiwgU3RyaW5nKGkpLCBjdHgpKTtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsXG4gICAgICAgIGlmICghY3R4IHx8ICFoYXNBbmNob3IodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvSlNPTihhcmcsIGN0eCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB7IGFsaWFzQ291bnQ6IDAsIGNvdW50OiAxLCByZXM6IHVuZGVmaW5lZCB9O1xuICAgICAgICBjdHguYW5jaG9ycy5zZXQodmFsdWUsIGRhdGEpO1xuICAgICAgICBjdHgub25DcmVhdGUgPSByZXMgPT4ge1xuICAgICAgICAgICAgZGF0YS5yZXMgPSByZXM7XG4gICAgICAgICAgICBkZWxldGUgY3R4Lm9uQ3JlYXRlO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB2YWx1ZS50b0pTT04oYXJnLCBjdHgpO1xuICAgICAgICBpZiAoY3R4Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKHJlcyk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnICYmICFjdHg/LmtlZXApXG4gICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IHsgdG9KUyB9O1xuIiwiaW1wb3J0IHsgcmVzb2x2ZUJsb2NrU2NhbGFyIH0gZnJvbSAnLi4vY29tcG9zZS9yZXNvbHZlLWJsb2NrLXNjYWxhci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRmxvd1NjYWxhciB9IGZyb20gJy4uL2NvbXBvc2UvcmVzb2x2ZS1mbG93LXNjYWxhci5qcyc7XG5pbXBvcnQgeyBZQU1MUGFyc2VFcnJvciB9IGZyb20gJy4uL2Vycm9ycy5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZUFzU2NhbGFyKHRva2VuLCBzdHJpY3QgPSB0cnVlLCBvbkVycm9yKSB7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGNvbnN0IF9vbkVycm9yID0gKHBvcywgY29kZSwgbWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdHlwZW9mIHBvcyA9PT0gJ251bWJlcicgPyBwb3MgOiBBcnJheS5pc0FycmF5KHBvcykgPyBwb3NbMF0gOiBwb3Mub2Zmc2V0O1xuICAgICAgICAgICAgaWYgKG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBZQU1MUGFyc2VFcnJvcihbb2Zmc2V0LCBvZmZzZXQgKyAxXSwgY29kZSwgbWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUZsb3dTY2FsYXIodG9rZW4sIHN0cmljdCwgX29uRXJyb3IpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUJsb2NrU2NhbGFyKHsgb3B0aW9uczogeyBzdHJpY3QgfSB9LCB0b2tlbiwgX29uRXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgc2NhbGFyIHRva2VuIHdpdGggYHZhbHVlYFxuICpcbiAqIFZhbHVlcyB0aGF0IHJlcHJlc2VudCBhbiBhY3R1YWwgc3RyaW5nIGJ1dCBtYXkgYmUgcGFyc2VkIGFzIGEgZGlmZmVyZW50IHR5cGUgc2hvdWxkIHVzZSBhIGB0eXBlYCBvdGhlciB0aGFuIGAnUExBSU4nYCxcbiAqIGFzIHRoaXMgZnVuY3Rpb24gZG9lcyBub3Qgc3VwcG9ydCBhbnkgc2NoZW1hIG9wZXJhdGlvbnMgYW5kIHdvbid0IGNoZWNrIGZvciBzdWNoIGNvbmZsaWN0cy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmFsdWUsIHdoaWNoIHdpbGwgaGF2ZSBpdHMgY29udGVudCBwcm9wZXJseSBpbmRlbnRlZC5cbiAqIEBwYXJhbSBjb250ZXh0LmVuZCBDb21tZW50cyBhbmQgd2hpdGVzcGFjZSBhZnRlciB0aGUgZW5kIG9mIHRoZSB2YWx1ZSwgb3IgYWZ0ZXIgdGhlIGJsb2NrIHNjYWxhciBoZWFkZXIuIElmIHVuZGVmaW5lZCwgYSBuZXdsaW5lIHdpbGwgYmUgYWRkZWQuXG4gKiBAcGFyYW0gY29udGV4dC5pbXBsaWNpdEtleSBCZWluZyB3aXRoaW4gYW4gaW1wbGljaXQga2V5IG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC5pbmRlbnQgVGhlIGluZGVudCBsZXZlbCBvZiB0aGUgdG9rZW4uXG4gKiBAcGFyYW0gY29udGV4dC5pbkZsb3cgSXMgdGhpcyBzY2FsYXIgd2l0aGluIGEgZmxvdyBjb2xsZWN0aW9uPyBUaGlzIG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC5vZmZzZXQgVGhlIG9mZnNldCBwb3NpdGlvbiBvZiB0aGUgdG9rZW4uXG4gKiBAcGFyYW0gY29udGV4dC50eXBlIFRoZSBwcmVmZXJyZWQgdHlwZSBvZiB0aGUgc2NhbGFyIHRva2VuLiBJZiB1bmRlZmluZWQsIHRoZSBwcmV2aW91cyB0eXBlIG9mIHRoZSBgdG9rZW5gIHdpbGwgYmUgdXNlZCwgZGVmYXVsdGluZyB0byBgJ1BMQUlOJ2AuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNjYWxhclRva2VuKHZhbHVlLCBjb250ZXh0KSB7XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSA9IGZhbHNlLCBpbmRlbnQsIGluRmxvdyA9IGZhbHNlLCBvZmZzZXQgPSAtMSwgdHlwZSA9ICdQTEFJTicgfSA9IGNvbnRleHQ7XG4gICAgY29uc3Qgc291cmNlID0gc3RyaW5naWZ5U3RyaW5nKHsgdHlwZSwgdmFsdWUgfSwge1xuICAgICAgICBpbXBsaWNpdEtleSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgPiAwID8gJyAnLnJlcGVhdChpbmRlbnQpIDogJycsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogeyBibG9ja1F1b3RlOiB0cnVlLCBsaW5lV2lkdGg6IC0xIH1cbiAgICB9KTtcbiAgICBjb25zdCBlbmQgPSBjb250ZXh0LmVuZCA/PyBbXG4gICAgICAgIHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfVxuICAgIF07XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOiB7XG4gICAgICAgICAgICBjb25zdCBoZSA9IHNvdXJjZS5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBzb3VyY2Uuc3Vic3RyaW5nKDAsIGhlKTtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBzb3VyY2Uuc3Vic3RyaW5nKGhlICsgMSkgKyAnXFxuJztcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gW1xuICAgICAgICAgICAgICAgIHsgdHlwZTogJ2Jsb2NrLXNjYWxhci1oZWFkZXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlOiBoZWFkIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoIWFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgZW5kKSlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnYmxvY2stc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHByb3BzLCBzb3VyY2U6IGJvZHkgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZG91YmxlLXF1b3RlZC1zY2FsYXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlLCBlbmQgfTtcbiAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdzaW5nbGUtcXVvdGVkLXNjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3NjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgIH1cbn1cbi8qKlxuICogU2V0IHRoZSB2YWx1ZSBvZiBgdG9rZW5gIHRvIHRoZSBnaXZlbiBzdHJpbmcgYHZhbHVlYCwgb3ZlcndyaXRpbmcgYW55IHByZXZpb3VzIGNvbnRlbnRzIGFuZCB0eXBlIHRoYXQgaXQgbWF5IGhhdmUuXG4gKlxuICogQmVzdCBlZmZvcnRzIGFyZSBtYWRlIHRvIHJldGFpbiBhbnkgY29tbWVudHMgcHJldmlvdXNseSBhc3NvY2lhdGVkIHdpdGggdGhlIGB0b2tlbmAsXG4gKiB0aG91Z2ggYWxsIGNvbnRlbnRzIHdpdGhpbiBhIGNvbGxlY3Rpb24ncyBgaXRlbXNgIHdpbGwgYmUgb3ZlcndyaXR0ZW4uXG4gKlxuICogVmFsdWVzIHRoYXQgcmVwcmVzZW50IGFuIGFjdHVhbCBzdHJpbmcgYnV0IG1heSBiZSBwYXJzZWQgYXMgYSBkaWZmZXJlbnQgdHlwZSBzaG91bGQgdXNlIGEgYHR5cGVgIG90aGVyIHRoYW4gYCdQTEFJTidgLFxuICogYXMgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGFueSBzY2hlbWEgb3BlcmF0aW9ucyBhbmQgd29uJ3QgY2hlY2sgZm9yIHN1Y2ggY29uZmxpY3RzLlxuICpcbiAqIEBwYXJhbSB0b2tlbiBBbnkgdG9rZW4uIElmIGl0IGRvZXMgbm90IGluY2x1ZGUgYW4gYGluZGVudGAgdmFsdWUsIHRoZSB2YWx1ZSB3aWxsIGJlIHN0cmluZ2lmaWVkIGFzIGlmIGl0IHdlcmUgYW4gaW1wbGljaXQga2V5LlxuICogQHBhcmFtIHZhbHVlIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlLCB3aGljaCB3aWxsIGhhdmUgaXRzIGNvbnRlbnQgcHJvcGVybHkgaW5kZW50ZWQuXG4gKiBAcGFyYW0gY29udGV4dC5hZnRlcktleSBJbiBtb3N0IGNhc2VzLCB2YWx1ZXMgYWZ0ZXIgYSBrZXkgc2hvdWxkIGhhdmUgYW4gYWRkaXRpb25hbCBsZXZlbCBvZiBpbmRlbnRhdGlvbi5cbiAqIEBwYXJhbSBjb250ZXh0LmltcGxpY2l0S2V5IEJlaW5nIHdpdGhpbiBhbiBpbXBsaWNpdCBrZXkgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LmluRmxvdyBCZWluZyB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24gbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LnR5cGUgVGhlIHByZWZlcnJlZCB0eXBlIG9mIHRoZSBzY2FsYXIgdG9rZW4uIElmIHVuZGVmaW5lZCwgdGhlIHByZXZpb3VzIHR5cGUgb2YgdGhlIGB0b2tlbmAgd2lsbCBiZSB1c2VkLCBkZWZhdWx0aW5nIHRvIGAnUExBSU4nYC5cbiAqL1xuZnVuY3Rpb24gc2V0U2NhbGFyVmFsdWUodG9rZW4sIHZhbHVlLCBjb250ZXh0ID0ge30pIHtcbiAgICBsZXQgeyBhZnRlcktleSA9IGZhbHNlLCBpbXBsaWNpdEtleSA9IGZhbHNlLCBpbkZsb3cgPSBmYWxzZSwgdHlwZSB9ID0gY29udGV4dDtcbiAgICBsZXQgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiBudWxsO1xuICAgIGlmIChhZnRlcktleSAmJiB0eXBlb2YgaW5kZW50ID09PSAnbnVtYmVyJylcbiAgICAgICAgaW5kZW50ICs9IDI7XG4gICAgaWYgKCF0eXBlKVxuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICB0eXBlID0gJ1FVT1RFX1NJTkdMRSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdRVU9URV9ET1VCTEUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IHRva2VuLnByb3BzWzBdO1xuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIudHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmxvY2sgc2NhbGFyIGhlYWRlcicpO1xuICAgICAgICAgICAgICAgIHR5cGUgPSBoZWFkZXIuc291cmNlWzBdID09PSAnPicgPyAnQkxPQ0tfRk9MREVEJyA6ICdCTE9DS19MSVRFUkFMJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdQTEFJTic7XG4gICAgICAgIH1cbiAgICBjb25zdCBzb3VyY2UgPSBzdHJpbmdpZnlTdHJpbmcoeyB0eXBlLCB2YWx1ZSB9LCB7XG4gICAgICAgIGltcGxpY2l0S2V5OiBpbXBsaWNpdEtleSB8fCBpbmRlbnQgPT09IG51bGwsXG4gICAgICAgIGluZGVudDogaW5kZW50ICE9PSBudWxsICYmIGluZGVudCA+IDAgPyAnICcucmVwZWF0KGluZGVudCkgOiAnJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiB7IGJsb2NrUXVvdGU6IHRydWUsIGxpbmVXaWR0aDogLTEgfVxuICAgIH0pO1xuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHNldEJsb2NrU2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsICdkb3VibGUtcXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCAnc2NhbGFyJyk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0QmxvY2tTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlKSB7XG4gICAgY29uc3QgaGUgPSBzb3VyY2UuaW5kZXhPZignXFxuJyk7XG4gICAgY29uc3QgaGVhZCA9IHNvdXJjZS5zdWJzdHJpbmcoMCwgaGUpO1xuICAgIGNvbnN0IGJvZHkgPSBzb3VyY2Uuc3Vic3RyaW5nKGhlICsgMSkgKyAnXFxuJztcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gdG9rZW4ucHJvcHNbMF07XG4gICAgICAgIGlmIChoZWFkZXIudHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJsb2NrIHNjYWxhciBoZWFkZXInKTtcbiAgICAgICAgaGVhZGVyLnNvdXJjZSA9IGhlYWQ7XG4gICAgICAgIHRva2VuLnNvdXJjZSA9IGJvZHk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCB7IG9mZnNldCB9ID0gdG9rZW47XG4gICAgICAgIGNvbnN0IGluZGVudCA9ICdpbmRlbnQnIGluIHRva2VuID8gdG9rZW4uaW5kZW50IDogLTE7XG4gICAgICAgIGNvbnN0IHByb3BzID0gW1xuICAgICAgICAgICAgeyB0eXBlOiAnYmxvY2stc2NhbGFyLWhlYWRlcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2U6IGhlYWQgfVxuICAgICAgICBdO1xuICAgICAgICBpZiAoIWFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgJ2VuZCcgaW4gdG9rZW4gPyB0b2tlbi5lbmQgOiB1bmRlZmluZWQpKVxuICAgICAgICAgICAgcHJvcHMucHVzaCh7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0OiAtMSwgaW5kZW50LCBzb3VyY2U6ICdcXG4nIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0b2tlbikpXG4gICAgICAgICAgICBpZiAoa2V5ICE9PSAndHlwZScgJiYga2V5ICE9PSAnb2Zmc2V0JylcbiAgICAgICAgICAgICAgICBkZWxldGUgdG9rZW5ba2V5XTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlOiAnYmxvY2stc2NhbGFyJywgaW5kZW50LCBwcm9wcywgc291cmNlOiBib2R5IH0pO1xuICAgIH1cbn1cbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgbGFzdCB0b2tlbiBpcyBhIG5ld2xpbmUgKi9cbmZ1bmN0aW9uIGFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgZW5kKSB7XG4gICAgaWYgKGVuZClcbiAgICAgICAgZm9yIChjb25zdCBzdCBvZiBlbmQpXG4gICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2goc3QpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChzdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCB0eXBlKSB7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgdG9rZW4udHlwZSA9IHR5cGU7XG4gICAgICAgICAgICB0b2tlbi5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgY29uc3QgZW5kID0gdG9rZW4ucHJvcHMuc2xpY2UoMSk7XG4gICAgICAgICAgICBsZXQgb2EgPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKHRva2VuLnByb3BzWzBdLnR5cGUgPT09ICdibG9jay1zY2FsYXItaGVhZGVyJylcbiAgICAgICAgICAgICAgICBvYSAtPSB0b2tlbi5wcm9wc1swXS5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0b2sgb2YgZW5kKVxuICAgICAgICAgICAgICAgIHRvay5vZmZzZXQgKz0gb2E7XG4gICAgICAgICAgICBkZWxldGUgdG9rZW4ucHJvcHM7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIHNvdXJjZSwgZW5kIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzoge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdG9rZW4ub2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IG5sID0geyB0eXBlOiAnbmV3bGluZScsIG9mZnNldCwgaW5kZW50OiB0b2tlbi5pbmRlbnQsIHNvdXJjZTogJ1xcbicgfTtcbiAgICAgICAgICAgIGRlbGV0ZSB0b2tlbi5pdGVtcztcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZSwgc291cmNlLCBlbmQ6IFtubF0gfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjb25zdCBpbmRlbnQgPSAnaW5kZW50JyBpbiB0b2tlbiA/IHRva2VuLmluZGVudCA6IC0xO1xuICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gdG9rZW4gJiYgQXJyYXkuaXNBcnJheSh0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgPyB0b2tlbi5lbmQuZmlsdGVyKHN0ID0+IHN0LnR5cGUgPT09ICdzcGFjZScgfHxcbiAgICAgICAgICAgICAgICAgICAgc3QudHlwZSA9PT0gJ2NvbW1lbnQnIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModG9rZW4pKVxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICd0eXBlJyAmJiBrZXkgIT09ICdvZmZzZXQnKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdG9rZW5ba2V5XTtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZSwgaW5kZW50LCBzb3VyY2UsIGVuZCB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgY3JlYXRlU2NhbGFyVG9rZW4sIHJlc29sdmVBc1NjYWxhciwgc2V0U2NhbGFyVmFsdWUgfTtcbiIsIi8qKlxuICogU3RyaW5naWZ5IGEgQ1NUIGRvY3VtZW50LCB0b2tlbiwgb3IgY29sbGVjdGlvbiBpdGVtXG4gKlxuICogRmFpciB3YXJuaW5nOiBUaGlzIGFwcGxpZXMgbm8gdmFsaWRhdGlvbiB3aGF0c29ldmVyLCBhbmRcbiAqIHNpbXBseSBjb25jYXRlbmF0ZXMgdGhlIHNvdXJjZXMgaW4gdGhlaXIgbG9naWNhbCBvcmRlci5cbiAqL1xuY29uc3Qgc3RyaW5naWZ5ID0gKGNzdCkgPT4gJ3R5cGUnIGluIGNzdCA/IHN0cmluZ2lmeVRva2VuKGNzdCkgOiBzdHJpbmdpZnlJdGVtKGNzdCk7XG5mdW5jdGlvbiBzdHJpbmdpZnlUb2tlbih0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRvayBvZiB0b2tlbi5wcm9wcylcbiAgICAgICAgICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4odG9rKTtcbiAgICAgICAgICAgIHJldHVybiByZXMgKyB0b2tlbi5zb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRva2VuLml0ZW1zKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gdG9rZW4uc3RhcnQuc291cmNlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRva2VuLml0ZW1zKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZG9jdW1lbnQnOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gc3RyaW5naWZ5SXRlbSh0b2tlbik7XG4gICAgICAgICAgICBpZiAodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgaWYgKCdlbmQnIGluIHRva2VuICYmIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlJdGVtKHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9KSB7XG4gICAgbGV0IHJlcyA9ICcnO1xuICAgIGZvciAoY29uc3Qgc3Qgb2Ygc3RhcnQpXG4gICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgaWYgKGtleSlcbiAgICAgICAgcmVzICs9IHN0cmluZ2lmeVRva2VuKGtleSk7XG4gICAgaWYgKHNlcClcbiAgICAgICAgZm9yIChjb25zdCBzdCBvZiBzZXApXG4gICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgIGlmICh2YWx1ZSlcbiAgICAgICAgcmVzICs9IHN0cmluZ2lmeVRva2VuKHZhbHVlKTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnQgeyBzdHJpbmdpZnkgfTtcbiIsImNvbnN0IEJSRUFLID0gU3ltYm9sKCdicmVhayB2aXNpdCcpO1xuY29uc3QgU0tJUCA9IFN5bWJvbCgnc2tpcCBjaGlsZHJlbicpO1xuY29uc3QgUkVNT1ZFID0gU3ltYm9sKCdyZW1vdmUgaXRlbScpO1xuLyoqXG4gKiBBcHBseSBhIHZpc2l0b3IgdG8gYSBDU1QgZG9jdW1lbnQgb3IgaXRlbS5cbiAqXG4gKiBXYWxrcyB0aHJvdWdoIHRoZSB0cmVlIChkZXB0aC1maXJzdCkgc3RhcnRpbmcgZnJvbSB0aGUgcm9vdCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0d28gYXJndW1lbnRzIHdoZW4gZW50ZXJpbmcgZWFjaCBpdGVtOlxuICogICAtIGBpdGVtYDogVGhlIGN1cnJlbnQgaXRlbSwgd2hpY2ggaW5jbHVkZWQgdGhlIGZvbGxvd2luZyBtZW1iZXJzOlxuICogICAgIC0gYHN0YXJ0OiBTb3VyY2VUb2tlbltdYCDigJMgU291cmNlIHRva2VucyBiZWZvcmUgdGhlIGtleSBvciB2YWx1ZSxcbiAqICAgICAgIHBvc3NpYmx5IGluY2x1ZGluZyBpdHMgYW5jaG9yIG9yIHRhZy5cbiAqICAgICAtIGBrZXk/OiBUb2tlbiB8IG51bGxgIOKAkyBTZXQgZm9yIHBhaXIgdmFsdWVzLiBNYXkgdGhlbiBiZSBgbnVsbGAsIGlmXG4gKiAgICAgICB0aGUga2V5IGJlZm9yZSB0aGUgYDpgIHNlcGFyYXRvciBpcyBlbXB0eS5cbiAqICAgICAtIGBzZXA/OiBTb3VyY2VUb2tlbltdYCDigJMgU291cmNlIHRva2VucyBiZXR3ZWVuIHRoZSBrZXkgYW5kIHRoZSB2YWx1ZSxcbiAqICAgICAgIHdoaWNoIHNob3VsZCBpbmNsdWRlIHRoZSBgOmAgbWFwIHZhbHVlIGluZGljYXRvciBpZiBgdmFsdWVgIGlzIHNldC5cbiAqICAgICAtIGB2YWx1ZT86IFRva2VuYCDigJMgVGhlIHZhbHVlIG9mIGEgc2VxdWVuY2UgaXRlbSwgb3Igb2YgYSBtYXAgcGFpci5cbiAqICAgLSBgcGF0aGA6IFRoZSBzdGVwcyBmcm9tIHRoZSByb290IHRvIHRoZSBjdXJyZW50IG5vZGUsIGFzIGFuIGFycmF5IG9mXG4gKiAgICAgYFsna2V5JyB8ICd2YWx1ZScsIG51bWJlcl1gIHR1cGxlcy5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgdG9rZW4sIGNvbnRpbnVlIHdpdGhcbiAqICAgICAgbmV4dCBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBpdGVtLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYG51bWJlcmA6IFNldCB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RlcC4gVGhpcyBpcyB1c2VmdWwgZXNwZWNpYWxseSBpZlxuICogICAgIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCB0b2tlbiBoYXMgY2hhbmdlZC5cbiAqICAgLSBgZnVuY3Rpb25gOiBEZWZpbmUgdGhlIG5leHQgdmlzaXRvciBmb3IgdGhpcyBpdGVtLiBBZnRlciB0aGUgb3JpZ2luYWxcbiAqICAgICB2aXNpdG9yIGlzIGNhbGxlZCBvbiBpdGVtIGVudHJ5LCBuZXh0IHZpc2l0b3JzIGFyZSBjYWxsZWQgYWZ0ZXIgaGFuZGxpbmdcbiAqICAgICBhIG5vbi1lbXB0eSBga2V5YCBhbmQgd2hlbiBleGl0aW5nIHRoZSBpdGVtLlxuICovXG5mdW5jdGlvbiB2aXNpdChjc3QsIHZpc2l0b3IpIHtcbiAgICBpZiAoJ3R5cGUnIGluIGNzdCAmJiBjc3QudHlwZSA9PT0gJ2RvY3VtZW50JylcbiAgICAgICAgY3N0ID0geyBzdGFydDogY3N0LnN0YXJ0LCB2YWx1ZTogY3N0LnZhbHVlIH07XG4gICAgX3Zpc2l0KE9iamVjdC5mcmVlemUoW10pLCBjc3QsIHZpc2l0b3IpO1xufVxuLy8gV2l0aG91dCB0aGUgYGFzIHN5bWJvbGAgY2FzdHMsIFRTIGRlY2xhcmVzIHRoZXNlIGluIHRoZSBgdmlzaXRgXG4vLyBuYW1lc3BhY2UgdXNpbmcgYHZhcmAsIGJ1dCB0aGVuIGNvbXBsYWlucyBhYm91dCB0aGF0IGJlY2F1c2Vcbi8vIGB1bmlxdWUgc3ltYm9sYCBtdXN0IGJlIGBjb25zdGAuXG4vKiogVGVybWluYXRlIHZpc2l0IHRyYXZlcnNhbCBjb21wbGV0ZWx5ICovXG52aXNpdC5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgaXRlbSAqL1xudmlzaXQuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IGl0ZW0gKi9cbnZpc2l0LlJFTU9WRSA9IFJFTU9WRTtcbi8qKiBGaW5kIHRoZSBpdGVtIGF0IGBwYXRoYCBmcm9tIGBjc3RgIGFzIHRoZSByb290ICovXG52aXNpdC5pdGVtQXRQYXRoID0gKGNzdCwgcGF0aCkgPT4ge1xuICAgIGxldCBpdGVtID0gY3N0O1xuICAgIGZvciAoY29uc3QgW2ZpZWxkLCBpbmRleF0gb2YgcGF0aCkge1xuICAgICAgICBjb25zdCB0b2sgPSBpdGVtPy5bZmllbGRdO1xuICAgICAgICBpZiAodG9rICYmICdpdGVtcycgaW4gdG9rKSB7XG4gICAgICAgICAgICBpdGVtID0gdG9rLml0ZW1zW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbn07XG4vKipcbiAqIEdldCB0aGUgaW1tZWRpYXRlIHBhcmVudCBjb2xsZWN0aW9uIG9mIHRoZSBpdGVtIGF0IGBwYXRoYCBmcm9tIGBjc3RgIGFzIHRoZSByb290LlxuICpcbiAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgY29sbGVjdGlvbiBpcyBub3QgZm91bmQsIHdoaWNoIHNob3VsZCBuZXZlciBoYXBwZW4gaWYgdGhlIGl0ZW0gaXRzZWxmIGV4aXN0cy5cbiAqL1xudmlzaXQucGFyZW50Q29sbGVjdGlvbiA9IChjc3QsIHBhdGgpID0+IHtcbiAgICBjb25zdCBwYXJlbnQgPSB2aXNpdC5pdGVtQXRQYXRoKGNzdCwgcGF0aC5zbGljZSgwLCAtMSkpO1xuICAgIGNvbnN0IGZpZWxkID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdWzBdO1xuICAgIGNvbnN0IGNvbGwgPSBwYXJlbnQ/LltmaWVsZF07XG4gICAgaWYgKGNvbGwgJiYgJ2l0ZW1zJyBpbiBjb2xsKVxuICAgICAgICByZXR1cm4gY29sbDtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmVudCBjb2xsZWN0aW9uIG5vdCBmb3VuZCcpO1xufTtcbmZ1bmN0aW9uIF92aXNpdChwYXRoLCBpdGVtLCB2aXNpdG9yKSB7XG4gICAgbGV0IGN0cmwgPSB2aXNpdG9yKGl0ZW0sIHBhdGgpO1xuICAgIGlmICh0eXBlb2YgY3RybCA9PT0gJ3N5bWJvbCcpXG4gICAgICAgIHJldHVybiBjdHJsO1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgWydrZXknLCAndmFsdWUnXSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGl0ZW1bZmllbGRdO1xuICAgICAgICBpZiAodG9rZW4gJiYgJ2l0ZW1zJyBpbiB0b2tlbikge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbi5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gX3Zpc2l0KE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQoW1tmaWVsZCwgaV1dKSksIHRva2VuLml0ZW1zW2ldLCB2aXNpdG9yKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIHRva2VuLml0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3RybCA9PT0gJ2Z1bmN0aW9uJyAmJiBmaWVsZCA9PT0gJ2tleScpXG4gICAgICAgICAgICAgICAgY3RybCA9IGN0cmwoaXRlbSwgcGF0aCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBjdHJsID09PSAnZnVuY3Rpb24nID8gY3RybChpdGVtLCBwYXRoKSA6IGN0cmw7XG59XG5cbmV4cG9ydCB7IHZpc2l0IH07XG4iLCJleHBvcnQgeyBjcmVhdGVTY2FsYXJUb2tlbiwgcmVzb2x2ZUFzU2NhbGFyLCBzZXRTY2FsYXJWYWx1ZSB9IGZyb20gJy4vY3N0LXNjYWxhci5qcyc7XG5leHBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tICcuL2NzdC1zdHJpbmdpZnkuanMnO1xuZXhwb3J0IHsgdmlzaXQgfSBmcm9tICcuL2NzdC12aXNpdC5qcyc7XG5cbi8qKiBUaGUgYnl0ZSBvcmRlciBtYXJrICovXG5jb25zdCBCT00gPSAnXFx1e0ZFRkZ9Jztcbi8qKiBTdGFydCBvZiBkb2MtbW9kZSAqL1xuY29uc3QgRE9DVU1FTlQgPSAnXFx4MDInOyAvLyBDMDogU3RhcnQgb2YgVGV4dFxuLyoqIFVuZXhwZWN0ZWQgZW5kIG9mIGZsb3ctbW9kZSAqL1xuY29uc3QgRkxPV19FTkQgPSAnXFx4MTgnOyAvLyBDMDogQ2FuY2VsXG4vKiogTmV4dCB0b2tlbiBpcyBhIHNjYWxhciB2YWx1ZSAqL1xuY29uc3QgU0NBTEFSID0gJ1xceDFmJzsgLy8gQzA6IFVuaXQgU2VwYXJhdG9yXG4vKiogQHJldHVybnMgYHRydWVgIGlmIGB0b2tlbmAgaXMgYSBmbG93IG9yIGJsb2NrIGNvbGxlY3Rpb24gKi9cbmNvbnN0IGlzQ29sbGVjdGlvbiA9ICh0b2tlbikgPT4gISF0b2tlbiAmJiAnaXRlbXMnIGluIHRva2VuO1xuLyoqIEByZXR1cm5zIGB0cnVlYCBpZiBgdG9rZW5gIGlzIGEgZmxvdyBvciBibG9jayBzY2FsYXI7IG5vdCBhbiBhbGlhcyAqL1xuY29uc3QgaXNTY2FsYXIgPSAodG9rZW4pID0+ICEhdG9rZW4gJiZcbiAgICAodG9rZW4udHlwZSA9PT0gJ3NjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnZG91YmxlLXF1b3RlZC1zY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInKTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4vKiogR2V0IGEgcHJpbnRhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbGV4ZXIgdG9rZW4gKi9cbmZ1bmN0aW9uIHByZXR0eVRva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgICBjYXNlIEJPTTpcbiAgICAgICAgICAgIHJldHVybiAnPEJPTT4nO1xuICAgICAgICBjYXNlIERPQ1VNRU5UOlxuICAgICAgICAgICAgcmV0dXJuICc8RE9DPic7XG4gICAgICAgIGNhc2UgRkxPV19FTkQ6XG4gICAgICAgICAgICByZXR1cm4gJzxGTE9XX0VORD4nO1xuICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIHJldHVybiAnPFNDQUxBUj4nO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRva2VuKTtcbiAgICB9XG59XG4vKiogSWRlbnRpZnkgdGhlIHR5cGUgb2YgYSBsZXhlciB0b2tlbi4gTWF5IHJldHVybiBgbnVsbGAgZm9yIHVua25vd24gdG9rZW5zLiAqL1xuZnVuY3Rpb24gdG9rZW5UeXBlKHNvdXJjZSkge1xuICAgIHN3aXRjaCAoc291cmNlKSB7XG4gICAgICAgIGNhc2UgQk9NOlxuICAgICAgICAgICAgcmV0dXJuICdieXRlLW9yZGVyLW1hcmsnO1xuICAgICAgICBjYXNlIERPQ1VNRU5UOlxuICAgICAgICAgICAgcmV0dXJuICdkb2MtbW9kZSc7XG4gICAgICAgIGNhc2UgRkxPV19FTkQ6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctZXJyb3ItZW5kJztcbiAgICAgICAgY2FzZSBTQ0FMQVI6XG4gICAgICAgICAgICByZXR1cm4gJ3NjYWxhcic7XG4gICAgICAgIGNhc2UgJy0tLSc6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1zdGFydCc7XG4gICAgICAgIGNhc2UgJy4uLic6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1lbmQnO1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICdcXG4nOlxuICAgICAgICBjYXNlICdcXHJcXG4nOlxuICAgICAgICAgICAgcmV0dXJuICduZXdsaW5lJztcbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICByZXR1cm4gJ3NlcS1pdGVtLWluZCc7XG4gICAgICAgIGNhc2UgJz8nOlxuICAgICAgICAgICAgcmV0dXJuICdleHBsaWNpdC1rZXktaW5kJztcbiAgICAgICAgY2FzZSAnOic6XG4gICAgICAgICAgICByZXR1cm4gJ21hcC12YWx1ZS1pbmQnO1xuICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1tYXAtc3RhcnQnO1xuICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1tYXAtZW5kJztcbiAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctc2VxLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctc2VxLWVuZCc7XG4gICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgcmV0dXJuICdjb21tYSc7XG4gICAgfVxuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIGNhc2UgJyAnOlxuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgICAgcmV0dXJuICdzcGFjZSc7XG4gICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgcmV0dXJuICdjb21tZW50JztcbiAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICByZXR1cm4gJ2RpcmVjdGl2ZS1saW5lJztcbiAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICByZXR1cm4gJ2FsaWFzJztcbiAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICByZXR1cm4gJ2FuY2hvcic7XG4gICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgcmV0dXJuICd0YWcnO1xuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgcmV0dXJuICdzaW5nbGUtcXVvdGVkLXNjYWxhcic7XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIHJldHVybiAnZG91YmxlLXF1b3RlZC1zY2FsYXInO1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICByZXR1cm4gJ2Jsb2NrLXNjYWxhci1oZWFkZXInO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IHsgQk9NLCBET0NVTUVOVCwgRkxPV19FTkQsIFNDQUxBUiwgaXNDb2xsZWN0aW9uLCBpc1NjYWxhciwgcHJldHR5VG9rZW4sIHRva2VuVHlwZSB9O1xuIiwiaW1wb3J0IHsgQk9NLCBET0NVTUVOVCwgRkxPV19FTkQsIFNDQUxBUiB9IGZyb20gJy4vY3N0LmpzJztcblxuLypcblNUQVJUIC0+IHN0cmVhbVxuXG5zdHJlYW1cbiAgZGlyZWN0aXZlIC0+IGxpbmUtZW5kIC0+IHN0cmVhbVxuICBpbmRlbnQgKyBsaW5lLWVuZCAtPiBzdHJlYW1cbiAgW2Vsc2VdIC0+IGxpbmUtc3RhcnRcblxubGluZS1lbmRcbiAgY29tbWVudCAtPiBsaW5lLWVuZFxuICBuZXdsaW5lIC0+IC5cbiAgaW5wdXQtZW5kIC0+IEVORFxuXG5saW5lLXN0YXJ0XG4gIGRvYy1zdGFydCAtPiBkb2NcbiAgZG9jLWVuZCAtPiBzdHJlYW1cbiAgW2Vsc2VdIC0+IGluZGVudCAtPiBibG9jay1zdGFydFxuXG5ibG9jay1zdGFydFxuICBzZXEtaXRlbS1zdGFydCAtPiBibG9jay1zdGFydFxuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIFtlbHNlXSAtPiBkb2NcblxuZG9jXG4gIGxpbmUtZW5kIC0+IGxpbmUtc3RhcnRcbiAgc3BhY2VzIC0+IGRvY1xuICBhbmNob3IgLT4gZG9jXG4gIHRhZyAtPiBkb2NcbiAgZmxvdy1zdGFydCAtPiBmbG93IC0+IGRvY1xuICBmbG93LWVuZCAtPiBlcnJvciAtPiBkb2NcbiAgc2VxLWl0ZW0tc3RhcnQgLT4gZXJyb3IgLT4gZG9jXG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBlcnJvciAtPiBkb2NcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGRvY1xuICBhbGlhcyAtPiBkb2NcbiAgcXVvdGUtc3RhcnQgLT4gcXVvdGVkLXNjYWxhciAtPiBkb2NcbiAgYmxvY2stc2NhbGFyLWhlYWRlciAtPiBsaW5lLWVuZCAtPiBibG9jay1zY2FsYXIobWluKSAtPiBsaW5lLXN0YXJ0XG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIoZmFsc2UsIG1pbikgLT4gZG9jXG5cbmZsb3dcbiAgbGluZS1lbmQgLT4gZmxvd1xuICBzcGFjZXMgLT4gZmxvd1xuICBhbmNob3IgLT4gZmxvd1xuICB0YWcgLT4gZmxvd1xuICBmbG93LXN0YXJ0IC0+IGZsb3cgLT4gZmxvd1xuICBmbG93LWVuZCAtPiAuXG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGVycm9yIC0+IGZsb3dcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGZsb3dcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGZsb3dcbiAgYWxpYXMgLT4gZmxvd1xuICBxdW90ZS1zdGFydCAtPiBxdW90ZWQtc2NhbGFyIC0+IGZsb3dcbiAgY29tbWEgLT4gZmxvd1xuICBbZWxzZV0gLT4gcGxhaW4tc2NhbGFyKHRydWUsIDApIC0+IGZsb3dcblxucXVvdGVkLXNjYWxhclxuICBxdW90ZS1lbmQgLT4gLlxuICBbZWxzZV0gLT4gcXVvdGVkLXNjYWxhclxuXG5ibG9jay1zY2FsYXIobWluKVxuICBuZXdsaW5lICsgcGVlayhpbmRlbnQgPCBtaW4pIC0+IC5cbiAgW2Vsc2VdIC0+IGJsb2NrLXNjYWxhcihtaW4pXG5cbnBsYWluLXNjYWxhcihpcy1mbG93LCBtaW4pXG4gIHNjYWxhci1lbmQoaXMtZmxvdykgLT4gLlxuICBwZWVrKG5ld2xpbmUgKyAoaW5kZW50IDwgbWluKSkgLT4gLlxuICBbZWxzZV0gLT4gcGxhaW4tc2NhbGFyKG1pbilcbiovXG5mdW5jdGlvbiBpc0VtcHR5KGNoKSB7XG4gICAgc3dpdGNoIChjaCkge1xuICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgIGNhc2UgJ1xccic6XG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5jb25zdCBoZXhEaWdpdHMgPSBuZXcgU2V0KCcwMTIzNDU2Nzg5QUJDREVGYWJjZGVmJyk7XG5jb25zdCB0YWdDaGFycyA9IG5ldyBTZXQoXCIwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ei0jOy8/OkAmPSskXy4hfionKClcIik7XG5jb25zdCBmbG93SW5kaWNhdG9yQ2hhcnMgPSBuZXcgU2V0KCcsW117fScpO1xuY29uc3QgaW52YWxpZEFuY2hvckNoYXJzID0gbmV3IFNldCgnICxbXXt9XFxuXFxyXFx0Jyk7XG5jb25zdCBpc05vdEFuY2hvckNoYXIgPSAoY2gpID0+ICFjaCB8fCBpbnZhbGlkQW5jaG9yQ2hhcnMuaGFzKGNoKTtcbi8qKlxuICogU3BsaXRzIGFuIGlucHV0IHN0cmluZyBpbnRvIGxleGljYWwgdG9rZW5zLCBpLmUuIHNtYWxsZXIgc3RyaW5ncyB0aGF0IGFyZVxuICogZWFzaWx5IGlkZW50aWZpYWJsZSBieSBgdG9rZW5zLnRva2VuVHlwZSgpYC5cbiAqXG4gKiBMZXhpbmcgc3RhcnRzIGFsd2F5cyBpbiBhIFwic3RyZWFtXCIgY29udGV4dC4gSW5jb21wbGV0ZSBpbnB1dCBtYXkgYmUgYnVmZmVyZWRcbiAqIHVudGlsIGEgY29tcGxldGUgdG9rZW4gY2FuIGJlIGVtaXR0ZWQuXG4gKlxuICogSW4gYWRkaXRpb24gdG8gc2xpY2VzIG9mIHRoZSBvcmlnaW5hbCBpbnB1dCwgdGhlIGZvbGxvd2luZyBjb250cm9sIGNoYXJhY3RlcnNcbiAqIG1heSBhbHNvIGJlIGVtaXR0ZWQ6XG4gKlxuICogLSBgXFx4MDJgIChTdGFydCBvZiBUZXh0KTogQSBkb2N1bWVudCBzdGFydHMgd2l0aCB0aGUgbmV4dCB0b2tlblxuICogLSBgXFx4MThgIChDYW5jZWwpOiBVbmV4cGVjdGVkIGVuZCBvZiBmbG93LW1vZGUgKGluZGljYXRlcyBhbiBlcnJvcilcbiAqIC0gYFxceDFmYCAoVW5pdCBTZXBhcmF0b3IpOiBOZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlXG4gKiAtIGBcXHV7RkVGRn1gIChCeXRlIG9yZGVyIG1hcmspOiBFbWl0dGVkIHNlcGFyYXRlbHkgb3V0c2lkZSBkb2N1bWVudHNcbiAqL1xuY2xhc3MgTGV4ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGVuZCBvZiB0aGUgY3VycmVudCBidWZmZXIgbWFya3MgdGhlIGVuZCBvZlxuICAgICAgICAgKiBhbGwgaW5wdXRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYXRFbmQgPSBmYWxzZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV4cGxpY2l0IGluZGVudCBzZXQgaW4gYmxvY2sgc2NhbGFyIGhlYWRlciwgYXMgYW4gb2Zmc2V0IGZyb20gdGhlIGN1cnJlbnRcbiAgICAgICAgICogbWluaW11bSBpbmRlbnQsIHNvIGUuZy4gc2V0IHRvIDEgZnJvbSBhIGhlYWRlciBgfDIrYC4gU2V0IHRvIC0xIGlmIG5vdFxuICAgICAgICAgKiBleHBsaWNpdGx5IHNldC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPSAtMTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJsb2NrIHNjYWxhcnMgdGhhdCBpbmNsdWRlIGEgKyAoa2VlcCkgY2hvbXBpbmcgaW5kaWNhdG9yIGluIHRoZWlyIGhlYWRlclxuICAgICAgICAgKiBpbmNsdWRlIHRyYWlsaW5nIGVtcHR5IGxpbmVzLCB3aGljaCBhcmUgb3RoZXJ3aXNlIGV4Y2x1ZGVkIGZyb20gdGhlXG4gICAgICAgICAqIHNjYWxhcidzIGNvbnRlbnRzLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhcktlZXAgPSBmYWxzZTtcbiAgICAgICAgLyoqIEN1cnJlbnQgaW5wdXQgKi9cbiAgICAgICAgdGhpcy5idWZmZXIgPSAnJztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZsYWcgbm90aW5nIHdoZXRoZXIgdGhlIG1hcCB2YWx1ZSBpbmRpY2F0b3IgOiBjYW4gaW1tZWRpYXRlbHkgZm9sbG93IHRoaXNcbiAgICAgICAgICogbm9kZSB3aXRoaW4gYSBmbG93IGNvbnRleHQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgLyoqIENvdW50IG9mIHN1cnJvdW5kaW5nIGZsb3cgY29sbGVjdGlvbiBsZXZlbHMuICovXG4gICAgICAgIHRoaXMuZmxvd0xldmVsID0gMDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1pbmltdW0gbGV2ZWwgb2YgaW5kZW50YXRpb24gcmVxdWlyZWQgZm9yIG5leHQgbGluZXMgdG8gYmUgcGFyc2VkIGFzIGFcbiAgICAgICAgICogcGFydCBvZiB0aGUgY3VycmVudCBzY2FsYXIgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluZGVudE5leHQgPSAwO1xuICAgICAgICAvKiogSW5kZW50YXRpb24gbGV2ZWwgb2YgdGhlIGN1cnJlbnQgbGluZS4gKi9cbiAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IDA7XG4gICAgICAgIC8qKiBQb3NpdGlvbiBvZiB0aGUgbmV4dCBcXG4gY2hhcmFjdGVyLiAqL1xuICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICAvKiogU3RvcmVzIHRoZSBzdGF0ZSBvZiB0aGUgbGV4ZXIgaWYgcmVhY2hpbmcgdGhlIGVuZCBvZiBpbmNwb21wbGV0ZSBpbnB1dCAqL1xuICAgICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgICAgICAvKiogQSBwb2ludGVyIHRvIGBidWZmZXJgOyB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgbGV4ZXIuICovXG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgWUFNTCB0b2tlbnMgZnJvbSB0aGUgYHNvdXJjZWAgc3RyaW5nLiBJZiBgaW5jb21wbGV0ZWAsXG4gICAgICogYSBwYXJ0IG9mIHRoZSBsYXN0IGxpbmUgbWF5IGJlIGxlZnQgYXMgYSBidWZmZXIgZm9yIHRoZSBuZXh0IGNhbGwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGdlbmVyYXRvciBvZiBsZXhpY2FsIHRva2Vuc1xuICAgICAqL1xuICAgICpsZXgoc291cmNlLCBpbmNvbXBsZXRlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgIT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcignc291cmNlIGlzIG5vdCBhIHN0cmluZycpO1xuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSB0aGlzLmJ1ZmZlciA/IHRoaXMuYnVmZmVyICsgc291cmNlIDogc291cmNlO1xuICAgICAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF0RW5kID0gIWluY29tcGxldGU7XG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5uZXh0ID8/ICdzdHJlYW0nO1xuICAgICAgICB3aGlsZSAobmV4dCAmJiAoaW5jb21wbGV0ZSB8fCB0aGlzLmhhc0NoYXJzKDEpKSlcbiAgICAgICAgICAgIG5leHQgPSB5aWVsZCogdGhpcy5wYXJzZU5leHQobmV4dCk7XG4gICAgfVxuICAgIGF0TGluZUVuZCgpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcztcbiAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JylcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgaWYgKCFjaCB8fCBjaCA9PT0gJyMnIHx8IGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAoY2ggPT09ICdcXHInKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW2kgKyAxXSA9PT0gJ1xcbic7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY2hhckF0KG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW3RoaXMucG9zICsgbl07XG4gICAgfVxuICAgIGNvbnRpbnVlU2NhbGFyKG9mZnNldCkge1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICBpZiAodGhpcy5pbmRlbnROZXh0ID4gMCkge1xuICAgICAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoY2ggPT09ICcgJylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraW5kZW50ICsgb2Zmc2V0XTtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5idWZmZXJbaW5kZW50ICsgb2Zmc2V0ICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nIHx8ICghbmV4dCAmJiAhdGhpcy5hdEVuZCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXQgKyBpbmRlbnQgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoID09PSAnXFxuJyB8fCBpbmRlbnQgPj0gdGhpcy5pbmRlbnROZXh0IHx8ICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgPyBvZmZzZXQgKyBpbmRlbnRcbiAgICAgICAgICAgICAgICA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnLicpIHtcbiAgICAgICAgICAgIGNvbnN0IGR0ID0gdGhpcy5idWZmZXIuc3Vic3RyKG9mZnNldCwgMyk7XG4gICAgICAgICAgICBpZiAoKGR0ID09PSAnLS0tJyB8fCBkdCA9PT0gJy4uLicpICYmIGlzRW1wdHkodGhpcy5idWZmZXJbb2Zmc2V0ICsgM10pKVxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH1cbiAgICBnZXRMaW5lKCkge1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5saW5lRW5kUG9zO1xuICAgICAgICBpZiAodHlwZW9mIGVuZCAhPT0gJ251bWJlcicgfHwgKGVuZCAhPT0gLTEgJiYgZW5kIDwgdGhpcy5wb3MpKSB7XG4gICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcXG4nLCB0aGlzLnBvcyk7XG4gICAgICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBlbmQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdEVuZCA/IHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcykgOiBudWxsO1xuICAgICAgICBpZiAodGhpcy5idWZmZXJbZW5kIC0gMV0gPT09ICdcXHInKVxuICAgICAgICAgICAgZW5kIC09IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcodGhpcy5wb3MsIGVuZCk7XG4gICAgfVxuICAgIGhhc0NoYXJzKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zICsgbiA8PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgfVxuICAgIHNldE5leHQoc3RhdGUpIHtcbiAgICAgICAgdGhpcy5idWZmZXIgPSB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIHRoaXMubmV4dCA9IHN0YXRlO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcGVlayhuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgIH1cbiAgICAqcGFyc2VOZXh0KG5leHQpIHtcbiAgICAgICAgc3dpdGNoIChuZXh0KSB7XG4gICAgICAgICAgICBjYXNlICdzdHJlYW0nOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVN0cmVhbSgpO1xuICAgICAgICAgICAgY2FzZSAnbGluZS1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTdGFydCgpO1xuICAgICAgICAgICAgY2FzZSAnZG9jJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VEb2N1bWVudCgpO1xuICAgICAgICAgICAgY2FzZSAnZmxvdyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlRmxvd0NvbGxlY3Rpb24oKTtcbiAgICAgICAgICAgIGNhc2UgJ3F1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVF1b3RlZFNjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAncGxhaW4tc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZVN0cmVhbSgpIHtcbiAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdzdHJlYW0nKTtcbiAgICAgICAgaWYgKGxpbmVbMF0gPT09IEJPTSkge1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lWzBdID09PSAnJScpIHtcbiAgICAgICAgICAgIGxldCBkaXJFbmQgPSBsaW5lLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCBjcyA9IGxpbmUuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgd2hpbGUgKGNzICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoID0gbGluZVtjcyAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgICAgICBkaXJFbmQgPSBjcyAtIDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3MgPSBsaW5lLmluZGV4T2YoJyMnLCBjcyArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ggPSBsaW5lW2RpckVuZCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgZGlyRW5kIC09IDE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG4gPSAoeWllbGQqIHRoaXMucHVzaENvdW50KGRpckVuZCkpICsgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7IC8vIHBvc3NpYmxlIGNvbW1lbnRcbiAgICAgICAgICAgIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdExpbmVFbmQoKSkge1xuICAgICAgICAgICAgY29uc3Qgc3AgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gc3ApO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBET0NVTUVOVDtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZUxpbmVTdGFydCgpIHtcbiAgICAgICAgY29uc3QgY2ggPSB0aGlzLmNoYXJBdCgwKTtcbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2xpbmUtc3RhcnQnKTtcbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kICYmICF0aGlzLmhhc0NoYXJzKDQpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2xpbmUtc3RhcnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnBlZWsoMyk7XG4gICAgICAgICAgICBpZiAocyA9PT0gJy0tLScgJiYgaXNFbXB0eSh0aGlzLmNoYXJBdCgzKSkpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzID09PSAnLi4uJyAmJiBpc0VtcHR5KHRoaXMuY2hhckF0KDMpKSkge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3N0cmVhbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXMoZmFsc2UpO1xuICAgICAgICBpZiAodGhpcy5pbmRlbnROZXh0ID4gdGhpcy5pbmRlbnRWYWx1ZSAmJiAhaXNFbXB0eSh0aGlzLmNoYXJBdCgxKSkpXG4gICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU3RhcnQoKSB7XG4gICAgICAgIGNvbnN0IFtjaDAsIGNoMV0gPSB0aGlzLnBlZWsoMik7XG4gICAgICAgIGlmICghY2gxICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc3RhcnQnKTtcbiAgICAgICAgaWYgKChjaDAgPT09ICctJyB8fCBjaDAgPT09ICc/JyB8fCBjaDAgPT09ICc6JykgJiYgaXNFbXB0eShjaDEpKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gKHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKSkgKyAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSk7XG4gICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlICsgMTtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgKz0gbjtcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgfVxuICAgICpwYXJzZURvY3VtZW50KCkge1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICBjb25zdCBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG4gICAgICAgIGlmIChsaW5lID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnZG9jJyk7XG4gICAgICAgIGxldCBuID0geWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKTtcbiAgICAgICAgc3dpdGNoIChsaW5lW25dKSB7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgICAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgIGNhc2UgJ10nOlxuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VRdW90ZWRTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFySGVhZGVyKCk7XG4gICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTY2FsYXIoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUGxhaW5TY2FsYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcGFyc2VGbG93Q29sbGVjdGlvbigpIHtcbiAgICAgICAgbGV0IG5sLCBzcDtcbiAgICAgICAgbGV0IGluZGVudCA9IC0xO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBubCA9IHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICBpZiAobmwgPiAwKSB7XG4gICAgICAgICAgICAgICAgc3AgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gaW5kZW50ID0gc3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzcCArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICB9IHdoaWxlIChubCArIHNwID4gMCk7XG4gICAgICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdmbG93Jyk7XG4gICAgICAgIGlmICgoaW5kZW50ICE9PSAtMSAmJiBpbmRlbnQgPCB0aGlzLmluZGVudE5leHQgJiYgbGluZVswXSAhPT0gJyMnKSB8fFxuICAgICAgICAgICAgKGluZGVudCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIChsaW5lLnN0YXJ0c1dpdGgoJy0tLScpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLi4uJykpICYmXG4gICAgICAgICAgICAgICAgaXNFbXB0eShsaW5lWzNdKSkpIHtcbiAgICAgICAgICAgIC8vIEFsbG93aW5nIGZvciB0aGUgdGVybWluYWwgXSBvciB9IGF0IHRoZSBzYW1lIChyYXRoZXIgdGhhbiBncmVhdGVyKVxuICAgICAgICAgICAgLy8gaW5kZW50IGxldmVsIGFzIHRoZSBpbml0aWFsIFsgb3IgeyBpcyB0ZWNobmljYWxseSBpbnZhbGlkLCBidXRcbiAgICAgICAgICAgIC8vIGZhaWxpbmcgaGVyZSB3b3VsZCBiZSBzdXJwcmlzaW5nIHRvIHVzZXJzLlxuICAgICAgICAgICAgY29uc3QgYXRGbG93RW5kTWFya2VyID0gaW5kZW50ID09PSB0aGlzLmluZGVudE5leHQgLSAxICYmXG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPT09IDEgJiZcbiAgICAgICAgICAgICAgICAobGluZVswXSA9PT0gJ10nIHx8IGxpbmVbMF0gPT09ICd9Jyk7XG4gICAgICAgICAgICBpZiAoIWF0Rmxvd0VuZE1hcmtlcikge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9IDA7XG4gICAgICAgICAgICAgICAgeWllbGQgRkxPV19FTkQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICB3aGlsZSAobGluZVtuXSA9PT0gJywnKSB7XG4gICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKTtcbiAgICAgICAgc3dpdGNoIChsaW5lW25dKSB7XG4gICAgICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsICs9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgLT0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbG93TGV2ZWwgPyAnZmxvdycgOiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICc6Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmNoYXJBdCgxKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mbG93S2V5IHx8IGlzRW1wdHkobmV4dCkgfHwgbmV4dCA9PT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUGxhaW5TY2FsYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcGFyc2VRdW90ZWRTY2FsYXIoKSB7XG4gICAgICAgIGNvbnN0IHF1b3RlID0gdGhpcy5jaGFyQXQoMCk7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKHF1b3RlLCB0aGlzLnBvcyArIDEpO1xuICAgICAgICBpZiAocXVvdGUgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICB3aGlsZSAoZW5kICE9PSAtMSAmJiB0aGlzLmJ1ZmZlcltlbmQgKyAxXSA9PT0gXCInXCIpXG4gICAgICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZihcIidcIiwgZW5kICsgMik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBkb3VibGUtcXVvdGVcbiAgICAgICAgICAgIHdoaWxlIChlbmQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmJ1ZmZlcltlbmQgLSAxIC0gbl0gPT09ICdcXFxcJylcbiAgICAgICAgICAgICAgICAgICAgbiArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChuICUgMiA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZignXCInLCBlbmQgKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBPbmx5IGxvb2tpbmcgZm9yIG5ld2xpbmVzIHdpdGhpbiB0aGUgcXVvdGVzXG4gICAgICAgIGNvbnN0IHFiID0gdGhpcy5idWZmZXIuc3Vic3RyaW5nKDAsIGVuZCk7XG4gICAgICAgIGxldCBubCA9IHFiLmluZGV4T2YoJ1xcbicsIHRoaXMucG9zKTtcbiAgICAgICAgaWYgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gdGhpcy5jb250aW51ZVNjYWxhcihubCArIDEpO1xuICAgICAgICAgICAgICAgIGlmIChjcyA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIG5sID0gcWIuaW5kZXhPZignXFxuJywgY3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3IgY2F1c2VkIGJ5IGFuIHVuZXhwZWN0ZWQgdW5pbmRlbnRcbiAgICAgICAgICAgICAgICBlbmQgPSBubCAtIChxYltubCAtIDFdID09PSAnXFxyJyA/IDIgOiAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3F1b3RlZC1zY2FsYXInKTtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChlbmQgKyAxLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb3dMZXZlbCA/ICdmbG93JyA6ICdkb2MnO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1NjYWxhckhlYWRlcigpIHtcbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IC0xO1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IGZhbHNlO1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnKycpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhcktlZXAgPSB0cnVlO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2ggPiAnMCcgJiYgY2ggPD0gJzknKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPSBOdW1iZXIoY2gpIC0gMTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNoICE9PSAnLScpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChjaCA9PiBpc0VtcHR5KGNoKSB8fCBjaCA9PT0gJyMnKTtcbiAgICB9XG4gICAgKnBhcnNlQmxvY2tTY2FsYXIoKSB7XG4gICAgICAgIGxldCBubCA9IHRoaXMucG9zIC0gMTsgLy8gbWF5IGJlIC0xIGlmIHRoaXMucG9zID09PSAwXG4gICAgICAgIGxldCBpbmRlbnQgPSAwO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIGxvb3A6IGZvciAobGV0IGkgPSB0aGlzLnBvczsgKGNoID0gdGhpcy5idWZmZXJbaV0pOyArK2kpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgICAgICAgICAgICAgIG5sID0gaTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnXFxyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW5leHQgJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICBpZiAoaW5kZW50ID49IHRoaXMuaW5kZW50TmV4dCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IGluZGVudDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgKyAodGhpcy5pbmRlbnROZXh0ID09PSAwID8gMSA6IHRoaXMuaW5kZW50TmV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKG5sICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgbmwgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcXG4nLCBjcyk7XG4gICAgICAgICAgICB9IHdoaWxlIChubCAhPT0gLTEpO1xuICAgICAgICAgICAgaWYgKG5sID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc2NhbGFyJyk7XG4gICAgICAgICAgICAgICAgbmwgPSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJhaWxpbmcgaW5zdWZmaWNpZW50bHkgaW5kZW50ZWQgdGFicyBhcmUgaW52YWxpZC5cbiAgICAgICAgLy8gVG8gY2F0Y2ggdGhhdCBkdXJpbmcgcGFyc2luZywgd2UgaW5jbHVkZSB0aGVtIGluIHRoZSBibG9jayBzY2FsYXIgdmFsdWUuXG4gICAgICAgIGxldCBpID0gbmwgKyAxO1xuICAgICAgICBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICB3aGlsZSAoY2ggPT09ICcgJylcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFx0Jykge1xuICAgICAgICAgICAgd2hpbGUgKGNoID09PSAnXFx0JyB8fCBjaCA9PT0gJyAnIHx8IGNoID09PSAnXFxyJyB8fCBjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgbmwgPSBpIC0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghdGhpcy5ibG9ja1NjYWxhcktlZXApIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBsZXQgaSA9IG5sIC0gMTtcbiAgICAgICAgICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXHInKVxuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWy0taV07XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdENoYXIgPSBpOyAvLyBEcm9wIHRoZSBsaW5lIGlmIGxhc3QgY2hhciBub3QgbW9yZSBpbmRlbnRlZFxuICAgICAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWy0taV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxuJyAmJiBpID49IHRoaXMucG9zICYmIGkgKyAxICsgaW5kZW50ID4gbGFzdENoYXIpXG4gICAgICAgICAgICAgICAgICAgIG5sID0gaTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSB3aGlsZSAodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQgU0NBTEFSO1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChubCArIDEsIHRydWUpO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlUGxhaW5TY2FsYXIoKSB7XG4gICAgICAgIGNvbnN0IGluRmxvdyA9IHRoaXMuZmxvd0xldmVsID4gMDtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyAtIDE7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgd2hpbGUgKChjaCA9IHRoaXMuYnVmZmVyWysraV0pKSB7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICc6Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkobmV4dCkgfHwgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKG5leHQpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRW1wdHkoY2gpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoID0gJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnIycgfHwgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKG5leHQpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGkgPSBNYXRoLm1heChpLCBjcyAtIDIpOyAvLyB0byBhZHZhbmNlLCBidXQgc3RpbGwgYWNjb3VudCBmb3IgJyAjJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhjaCkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3BsYWluLXNjYWxhcicpO1xuICAgICAgICB5aWVsZCBTQ0FMQVI7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGVuZCArIDEsIHRydWUpO1xuICAgICAgICByZXR1cm4gaW5GbG93ID8gJ2Zsb3cnIDogJ2RvYyc7XG4gICAgfVxuICAgICpwdXNoQ291bnQobikge1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSBuO1xuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoVG9JbmRleChpLCBhbGxvd0VtcHR5KSB7XG4gICAgICAgIGNvbnN0IHMgPSB0aGlzLmJ1ZmZlci5zbGljZSh0aGlzLnBvcywgaSk7XG4gICAgICAgIGlmIChzKSB7XG4gICAgICAgICAgICB5aWVsZCBzO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gcy5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWxsb3dFbXB0eSlcbiAgICAgICAgICAgIHlpZWxkICcnO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hJbmRpY2F0b3JzKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuY2hhckF0KDApKSB7XG4gICAgICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKCh5aWVsZCogdGhpcy5wdXNoVGFnKCkpICtcbiAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpICtcbiAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCkpKTtcbiAgICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgICAgIHJldHVybiAoKHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpKSk7XG4gICAgICAgICAgICBjYXNlICctJzogLy8gdGhpcyBpcyBhbiBlcnJvclxuICAgICAgICAgICAgY2FzZSAnPyc6IC8vIHRoaXMgaXMgYW4gZXJyb3Igb3V0c2lkZSBmbG93IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICBjYXNlICc6Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluRmxvdyA9IHRoaXMuZmxvd0xldmVsID4gMDtcbiAgICAgICAgICAgICAgICBjb25zdCBjaDEgPSB0aGlzLmNoYXJBdCgxKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShjaDEpIHx8IChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhjaDEpKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWluRmxvdylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWUgKyAxO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZsb3dLZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgoeWllbGQqIHRoaXMucHVzaENvdW50KDEpKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoVGFnKCkge1xuICAgICAgICBpZiAodGhpcy5jaGFyQXQoMSkgPT09ICc8Jykge1xuICAgICAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyArIDI7XG4gICAgICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgICAgIHdoaWxlICghaXNFbXB0eShjaCkgJiYgY2ggIT09ICc+JylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFRvSW5kZXgoY2ggPT09ICc+JyA/IGkgKyAxIDogaSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyArIDE7XG4gICAgICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgICAgIHdoaWxlIChjaCkge1xuICAgICAgICAgICAgICAgIGlmICh0YWdDaGFycy5oYXMoY2gpKVxuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2ggPT09ICclJyAmJlxuICAgICAgICAgICAgICAgICAgICBoZXhEaWdpdHMuaGFzKHRoaXMuYnVmZmVyW2kgKyAxXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgaGV4RGlnaXRzLmhhcyh0aGlzLmJ1ZmZlcltpICsgMl0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKGkgKz0gMyldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcHVzaE5ld2xpbmUoKSB7XG4gICAgICAgIGNvbnN0IGNoID0gdGhpcy5idWZmZXJbdGhpcy5wb3NdO1xuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICdcXHInICYmIHRoaXMuY2hhckF0KDEpID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoQ291bnQoMik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFNwYWNlcyhhbGxvd1RhYnMpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyAtIDE7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICB9IHdoaWxlIChjaCA9PT0gJyAnIHx8IChhbGxvd1RhYnMgJiYgY2ggPT09ICdcXHQnKSk7XG4gICAgICAgIGNvbnN0IG4gPSBpIC0gdGhpcy5wb3M7XG4gICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgICAgeWllbGQgdGhpcy5idWZmZXIuc3Vic3RyKHRoaXMucG9zLCBuKTtcbiAgICAgICAgICAgIHRoaXMucG9zID0gaTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgKnB1c2hVbnRpbCh0ZXN0KSB7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3M7XG4gICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICB3aGlsZSAoIXRlc3QoY2gpKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFRvSW5kZXgoaSwgZmFsc2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgTGV4ZXIgfTtcbiIsIi8qKlxuICogVHJhY2tzIG5ld2xpbmVzIGR1cmluZyBwYXJzaW5nIGluIG9yZGVyIHRvIHByb3ZpZGUgYW4gZWZmaWNpZW50IEFQSSBmb3JcbiAqIGRldGVybWluaW5nIHRoZSBvbmUtaW5kZXhlZCBgeyBsaW5lLCBjb2wgfWAgcG9zaXRpb24gZm9yIGFueSBvZmZzZXRcbiAqIHdpdGhpbiB0aGUgaW5wdXQuXG4gKi9cbmNsYXNzIExpbmVDb3VudGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5saW5lU3RhcnRzID0gW107XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaG91bGQgYmUgY2FsbGVkIGluIGFzY2VuZGluZyBvcmRlci4gT3RoZXJ3aXNlLCBjYWxsXG4gICAgICAgICAqIGBsaW5lQ291bnRlci5saW5lU3RhcnRzLnNvcnQoKWAgYmVmb3JlIGNhbGxpbmcgYGxpbmVQb3MoKWAuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZE5ld0xpbmUgPSAob2Zmc2V0KSA9PiB0aGlzLmxpbmVTdGFydHMucHVzaChvZmZzZXQpO1xuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybXMgYSBiaW5hcnkgc2VhcmNoIGFuZCByZXR1cm5zIHRoZSAxLWluZGV4ZWQgeyBsaW5lLCBjb2wgfVxuICAgICAgICAgKiBwb3NpdGlvbiBvZiBgb2Zmc2V0YC4gSWYgYGxpbmUgPT09IDBgLCBgYWRkTmV3TGluZWAgaGFzIG5ldmVyIGJlZW5cbiAgICAgICAgICogY2FsbGVkIG9yIGBvZmZzZXRgIGlzIGJlZm9yZSB0aGUgZmlyc3Qga25vd24gbmV3bGluZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubGluZVBvcyA9IChvZmZzZXQpID0+IHtcbiAgICAgICAgICAgIGxldCBsb3cgPSAwO1xuICAgICAgICAgICAgbGV0IGhpZ2ggPSB0aGlzLmxpbmVTdGFydHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaWQgPSAobG93ICsgaGlnaCkgPj4gMTsgLy8gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpbmVTdGFydHNbbWlkXSA8IG9mZnNldClcbiAgICAgICAgICAgICAgICAgICAgbG93ID0gbWlkICsgMTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGhpZ2ggPSBtaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5saW5lU3RhcnRzW2xvd10gPT09IG9mZnNldClcbiAgICAgICAgICAgICAgICByZXR1cm4geyBsaW5lOiBsb3cgKyAxLCBjb2w6IDEgfTtcbiAgICAgICAgICAgIGlmIChsb3cgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogMCwgY29sOiBvZmZzZXQgfTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5saW5lU3RhcnRzW2xvdyAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogbG93LCBjb2w6IG9mZnNldCAtIHN0YXJ0ICsgMSB9O1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgTGluZUNvdW50ZXIgfTtcbiIsImltcG9ydCB7IHRva2VuVHlwZSB9IGZyb20gJy4vY3N0LmpzJztcbmltcG9ydCB7IExleGVyIH0gZnJvbSAnLi9sZXhlci5qcyc7XG5cbmZ1bmN0aW9uIGluY2x1ZGVzVG9rZW4obGlzdCwgdHlwZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSlcbiAgICAgICAgaWYgKGxpc3RbaV0udHlwZSA9PT0gdHlwZSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGZpbmROb25FbXB0eUluZGV4KGxpc3QpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgc3dpdGNoIChsaXN0W2ldLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cbmZ1bmN0aW9uIGlzRmxvd1Rva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbj8udHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0UHJldlByb3BzKHBhcmVudCkge1xuICAgIHN3aXRjaCAocGFyZW50LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5zdGFydDtcbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzoge1xuICAgICAgICAgICAgY29uc3QgaXQgPSBwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuIGl0LnNlcCA/PyBpdC5zdGFydDtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5pdGVtc1twYXJlbnQuaXRlbXMubGVuZ3RoIC0gMV0uc3RhcnQ7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgfVxufVxuLyoqIE5vdGU6IE1heSBtb2RpZnkgaW5wdXQgYXJyYXkgKi9cbmZ1bmN0aW9uIGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KSB7XG4gICAgaWYgKHByZXYubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gW107XG4gICAgbGV0IGkgPSBwcmV2Lmxlbmd0aDtcbiAgICBsb29wOiB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgc3dpdGNoIChwcmV2W2ldLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKHByZXZbKytpXT8udHlwZSA9PT0gJ3NwYWNlJykge1xuICAgICAgICAvKiBsb29wICovXG4gICAgfVxuICAgIHJldHVybiBwcmV2LnNwbGljZShpLCBwcmV2Lmxlbmd0aCk7XG59XG5mdW5jdGlvbiBmaXhGbG93U2VxSXRlbXMoZmMpIHtcbiAgICBpZiAoZmMuc3RhcnQudHlwZSA9PT0gJ2Zsb3ctc2VxLXN0YXJ0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIGZjLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaXQuc2VwICYmXG4gICAgICAgICAgICAgICAgIWl0LnZhbHVlICYmXG4gICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICdleHBsaWNpdC1rZXktaW5kJykgJiZcbiAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXQua2V5KVxuICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXQua2V5O1xuICAgICAgICAgICAgICAgIGlmIChpc0Zsb3dUb2tlbihpdC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlLmVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGl0LnZhbHVlLmVuZCwgaXQuc2VwKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUuZW5kID0gaXQuc2VwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGl0LnN0YXJ0LCBpdC5zZXApO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5zZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEEgWUFNTCBjb25jcmV0ZSBzeW50YXggdHJlZSAoQ1NUKSBwYXJzZXJcbiAqXG4gKiBgYGB0c1xuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGZvciAoY29uc3QgdG9rZW4gb2YgbmV3IFBhcnNlcigpLnBhcnNlKHNyYykpIHtcbiAqICAgLy8gdG9rZW46IFRva2VuXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUbyB1c2UgdGhlIHBhcnNlciB3aXRoIGEgdXNlci1wcm92aWRlZCBsZXhlcjpcbiAqXG4gKiBgYGB0c1xuICogZnVuY3Rpb24qIHBhcnNlKHNvdXJjZTogc3RyaW5nLCBsZXhlcjogTGV4ZXIpIHtcbiAqICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcigpXG4gKiAgIGZvciAoY29uc3QgbGV4ZW1lIG9mIGxleGVyLmxleChzb3VyY2UpKVxuICogICAgIHlpZWxkKiBwYXJzZXIubmV4dChsZXhlbWUpXG4gKiAgIHlpZWxkKiBwYXJzZXIuZW5kKClcbiAqIH1cbiAqXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIoKVxuICogZm9yIChjb25zdCB0b2tlbiBvZiBwYXJzZShzcmMsIGxleGVyKSkge1xuICogICAvLyB0b2tlbjogVG9rZW5cbiAqIH1cbiAqIGBgYFxuICovXG5jbGFzcyBQYXJzZXIge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbk5ld0xpbmUgLSBJZiBkZWZpbmVkLCBjYWxsZWQgc2VwYXJhdGVseSB3aXRoIHRoZSBzdGFydCBwb3NpdGlvbiBvZlxuICAgICAqICAgZWFjaCBuZXcgbGluZSAoaW4gYHBhcnNlKClgLCBpbmNsdWRpbmcgdGhlIHN0YXJ0IG9mIGlucHV0KS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihvbk5ld0xpbmUpIHtcbiAgICAgICAgLyoqIElmIHRydWUsIHNwYWNlIGFuZCBzZXF1ZW5jZSBpbmRpY2F0b3JzIGNvdW50IGFzIGluZGVudGF0aW9uICovXG4gICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgLyoqIElmIHRydWUsIG5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWUgKi9cbiAgICAgICAgdGhpcy5hdFNjYWxhciA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbmRlbnRhdGlvbiBsZXZlbCAqL1xuICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgIC8qKiBDdXJyZW50IG9mZnNldCBzaW5jZSB0aGUgc3RhcnQgb2YgcGFyc2luZyAqL1xuICAgICAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgICAgIC8qKiBPbiB0aGUgc2FtZSBsaW5lIHdpdGggYSBibG9jayBtYXAga2V5ICovXG4gICAgICAgIHRoaXMub25LZXlMaW5lID0gZmFsc2U7XG4gICAgICAgIC8qKiBUb3AgaW5kaWNhdGVzIHRoZSBub2RlIHRoYXQncyBjdXJyZW50bHkgYmVpbmcgYnVpbHQgKi9cbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICAvKiogVGhlIHNvdXJjZSBvZiB0aGUgY3VycmVudCB0b2tlbiwgc2V0IGluIHBhcnNlKCkgKi9cbiAgICAgICAgdGhpcy5zb3VyY2UgPSAnJztcbiAgICAgICAgLyoqIFRoZSB0eXBlIG9mIHRoZSBjdXJyZW50IHRva2VuLCBzZXQgaW4gcGFyc2UoKSAqL1xuICAgICAgICB0aGlzLnR5cGUgPSAnJztcbiAgICAgICAgLy8gTXVzdCBiZSBkZWZpbmVkIGFmdGVyIGBuZXh0KClgXG4gICAgICAgIHRoaXMubGV4ZXIgPSBuZXcgTGV4ZXIoKTtcbiAgICAgICAgdGhpcy5vbk5ld0xpbmUgPSBvbk5ld0xpbmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBhcnNlIGBzb3VyY2VgIGFzIGEgWUFNTCBzdHJlYW0uXG4gICAgICogSWYgYGluY29tcGxldGVgLCBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEVycm9ycyBhcmUgbm90IHRocm93biwgYnV0IHlpZWxkZWQgYXMgYHsgdHlwZTogJ2Vycm9yJywgbWVzc2FnZSB9YCB0b2tlbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGdlbmVyYXRvciBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGVhY2ggZGlyZWN0aXZlLCBkb2N1bWVudCwgYW5kIG90aGVyIHN0cnVjdHVyZS5cbiAgICAgKi9cbiAgICAqcGFyc2Uoc291cmNlLCBpbmNvbXBsZXRlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lICYmIHRoaXMub2Zmc2V0ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUoMCk7XG4gICAgICAgIGZvciAoY29uc3QgbGV4ZW1lIG9mIHRoaXMubGV4ZXIubGV4KHNvdXJjZSwgaW5jb21wbGV0ZSkpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5uZXh0KGxleGVtZSk7XG4gICAgICAgIGlmICghaW5jb21wbGV0ZSlcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLmVuZCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZHZhbmNlIHRoZSBwYXJzZXIgYnkgdGhlIGBzb3VyY2VgIG9mIG9uZSBsZXhpY2FsIHRva2VuLlxuICAgICAqL1xuICAgICpuZXh0KHNvdXJjZSkge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgaWYgKHRoaXMuYXRTY2FsYXIpIHtcbiAgICAgICAgICAgIHRoaXMuYXRTY2FsYXIgPSBmYWxzZTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IHRva2VuVHlwZShzb3VyY2UpO1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgTm90IGEgWUFNTCB0b2tlbjogJHtzb3VyY2V9YDtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh7IHR5cGU6ICdlcnJvcicsIG9mZnNldDogdGhpcy5vZmZzZXQsIG1lc3NhZ2UsIHNvdXJjZSB9KTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3NjYWxhcicpIHtcbiAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmF0U2NhbGFyID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICdzY2FsYXInO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBzb3VyY2UubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdE5ld0xpbmUgJiYgc291cmNlWzBdID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdE5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkb2MtbW9kZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1lcnJvci1lbmQnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqIENhbGwgYXQgZW5kIG9mIGlucHV0IHRvIHB1c2ggb3V0IGFueSByZW1haW5pbmcgY29uc3RydWN0aW9ucyAqL1xuICAgICplbmQoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICB9XG4gICAgZ2V0IHNvdXJjZVRva2VuKCkge1xuICAgICAgICBjb25zdCBzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gc3Q7XG4gICAgfVxuICAgICpzdGVwKCkge1xuICAgICAgICBjb25zdCB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkb2MtZW5kJyAmJiAoIXRvcCB8fCB0b3AudHlwZSAhPT0gJ2RvYy1lbmQnKSkge1xuICAgICAgICAgICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2RvYy1lbmQnLFxuICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0b3ApXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuc3RyZWFtKCk7XG4gICAgICAgIHN3aXRjaCAodG9wLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZG9jdW1lbnQodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnNjYWxhcih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tTY2FsYXIodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrTWFwKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja1NlcXVlbmNlKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5mbG93Q29sbGVjdGlvbih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmRvY3VtZW50RW5kKHRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgfVxuICAgIHBlZWsobikge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIG5dO1xuICAgIH1cbiAgICAqcG9wKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gZXJyb3IgPz8gdGhpcy5zdGFjay5wb3AoKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnVHJpZWQgdG8gcG9wIGFuIGVtcHR5IHN0YWNrJztcbiAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2Vycm9yJywgb2Zmc2V0OiB0aGlzLm9mZnNldCwgc291cmNlOiAnJywgbWVzc2FnZSB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJykge1xuICAgICAgICAgICAgICAgIC8vIEJsb2NrIHNjYWxhcnMgdXNlIHRoZWlyIHBhcmVudCByYXRoZXIgdGhhbiBoZWFkZXIgaW5kZW50XG4gICAgICAgICAgICAgICAgdG9rZW4uaW5kZW50ID0gJ2luZGVudCcgaW4gdG9wID8gdG9wLmluZGVudCA6IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJyAmJiB0b3AudHlwZSA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBhbGwgaW5kZW50IGZvciB0b3AtbGV2ZWwgZmxvdyBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgICAgIHRva2VuLmluZGVudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpXG4gICAgICAgICAgICAgICAgZml4Rmxvd1NlcUl0ZW1zKHRva2VuKTtcbiAgICAgICAgICAgIHN3aXRjaCAodG9wLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICAgICAgICAgIHRvcC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgICAgICB0b3AucHJvcHMucHVzaCh0b2tlbik7IC8vIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gIWl0LmV4cGxpY2l0S2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIHZhbHVlOiB0b2tlbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AodG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stc2VxJykgJiZcbiAgICAgICAgICAgICAgICAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IHRva2VuLml0ZW1zW3Rva2VuLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0ICYmXG4gICAgICAgICAgICAgICAgICAgICFsYXN0LnNlcCAmJlxuICAgICAgICAgICAgICAgICAgICAhbGFzdC52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICBsYXN0LnN0YXJ0Lmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vbkVtcHR5SW5kZXgobGFzdC5zdGFydCkgPT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgICh0b2tlbi5pbmRlbnQgPT09IDAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Quc3RhcnQuZXZlcnkoc3QgPT4gc3QudHlwZSAhPT0gJ2NvbW1lbnQnIHx8IHN0LmluZGVudCA8IHRva2VuLmluZGVudCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5lbmQgPSBsYXN0LnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBsYXN0LnN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICB0b2tlbi5pdGVtcy5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAqc3RyZWFtKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlLWxpbmUnOlxuICAgICAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2RpcmVjdGl2ZScsIG9mZnNldDogdGhpcy5vZmZzZXQsIHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNvdXJjZVRva2VuO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1tb2RlJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkb2N1bWVudCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RvYy1zdGFydCcpXG4gICAgICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChkb2MpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkICR7dGhpcy50eXBlfSB0b2tlbiBpbiBZQU1MIHN0cmVhbWAsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgfVxuICAgICpkb2N1bWVudChkb2MpIHtcbiAgICAgICAgaWYgKGRvYy52YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5saW5lRW5kKGRvYyk7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbmROb25FbXB0eUluZGV4KGRvYy5zdGFydCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKGRvYyk7XG4gICAgICAgIGlmIChidilcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCAke3RoaXMudHlwZX0gdG9rZW4gaW4gWUFNTCBkb2N1bWVudGAsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqc2NhbGFyKHNjYWxhcikge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHModGhpcy5wZWVrKDIpKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgbGV0IHNlcDtcbiAgICAgICAgICAgIGlmIChzY2FsYXIuZW5kKSB7XG4gICAgICAgICAgICAgICAgc2VwID0gc2NhbGFyLmVuZDtcbiAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc2NhbGFyLmVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZXAgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBzY2FsYXIub2Zmc2V0LFxuICAgICAgICAgICAgICAgIGluZGVudDogc2NhbGFyLmluZGVudCxcbiAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogc2NhbGFyLCBzZXAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubGluZUVuZChzY2FsYXIpO1xuICAgIH1cbiAgICAqYmxvY2tTY2FsYXIoc2NhbGFyKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHNjYWxhci5wcm9wcy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgc2NhbGFyLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgICAgICAgICAgICAgIC8vIGJsb2NrLXNjYWxhciBzb3VyY2UgaW5jbHVkZXMgdHJhaWxpbmcgbmV3bGluZVxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJywgbmwpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqYmxvY2tNYXAobWFwKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gaXQuc2VwIGlzIHRydWUtaXNoIGlmIHBhaXIgYWxyZWFkeSBoYXMga2V5IG9yIDogc2VwYXJhdG9yXG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiBpdC52YWx1ZSA/IGl0LnZhbHVlLmVuZCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IEFycmF5LmlzQXJyYXkoZW5kKSA/IGVuZFtlbmQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Py50eXBlID09PSAnY29tbWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ/LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIG1hcC5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID49IG1hcC5pbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGF0TWFwSW5kZW50ID0gIXRoaXMub25LZXlMaW5lICYmIHRoaXMuaW5kZW50ID09PSBtYXAuaW5kZW50O1xuICAgICAgICAgICAgY29uc3QgYXROZXh0SXRlbSA9IGF0TWFwSW5kZW50ICYmXG4gICAgICAgICAgICAgICAgKGl0LnNlcCB8fCBpdC5leHBsaWNpdEtleSkgJiZcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgIT09ICdzZXEtaXRlbS1pbmQnO1xuICAgICAgICAgICAgLy8gRm9yIGVtcHR5IG5vZGVzLCBhc3NpZ24gbmV3bGluZS1zZXBhcmF0ZWQgbm90IGluZGVudGVkIGVtcHR5IHRva2VucyB0byBmb2xsb3dpbmcgbm9kZVxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gW107XG4gICAgICAgICAgICBpZiAoYXROZXh0SXRlbSAmJiBpdC5zZXAgJiYgIWl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmwgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0LnNlcC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdCA9IGl0LnNlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LmluZGVudCA+IG1hcC5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+PSAyKVxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGl0LnNlcC5zcGxpY2UobmxbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwICYmICFpdC5leHBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LmV4cGxpY2l0S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwgZXhwbGljaXRLZXk6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSwgZXhwbGljaXRLZXk6IHRydWUgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXQuZXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICduZXdsaW5lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMoaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0Zsb3dUb2tlbihpdC5rZXkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMoaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXAgPSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlIGd1YXJkIGlzIHdyb25nIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgaXQua2V5LCBkZWxldGUgaXQuc2VwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleSwgc2VwIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGFydC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90IGFjdHVhbGx5IGF0IG5leHQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcCA9IGl0LnNlcC5jb25jYXQoc3RhcnQsIHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnZhbHVlIHx8IGF0TmV4dEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbXSwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcyA9IHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXROZXh0SXRlbSB8fCBpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChmcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUobWFwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXRNYXBJbmRlbnQgJiYgYnYudHlwZSAhPT0gJ2Jsb2NrLXNlcScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgIH1cbiAgICAqYmxvY2tTZXF1ZW5jZShzZXEpIHtcbiAgICAgICAgY29uc3QgaXQgPSBzZXEuaXRlbXNbc2VxLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9ICdlbmQnIGluIGl0LnZhbHVlID8gaXQudmFsdWUuZW5kIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gQXJyYXkuaXNBcnJheShlbmQpID8gZW5kW2VuZC5sZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3Q/LnR5cGUgPT09ICdjb21tZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZD8ucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0SW5kZW50ZWRDb21tZW50KGl0LnN0YXJ0LCBzZXEuaW5kZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IHNlcS5pdGVtc1tzZXEuaXRlbXMubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSBwcmV2Py52YWx1ZT8uZW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZW5kKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVuZCwgaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlIHx8IHRoaXMuaW5kZW50IDw9IHNlcS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRlbnQgIT09IHNlcS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSB8fCBpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnc2VxLWl0ZW0taW5kJykpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA+IHNlcS5pbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoc2VxKTtcbiAgICAgICAgICAgIGlmIChidikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgICpmbG93Q29sbGVjdGlvbihmYykge1xuICAgICAgICBjb25zdCBpdCA9IGZjLml0ZW1zW2ZjLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZmxvdy1lcnJvci1lbmQnKSB7XG4gICAgICAgICAgICBsZXQgdG9wO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgICAgIH0gd2hpbGUgKHRvcCAmJiB0b3AudHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZjLmVuZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSB0aGlzLmZsb3dTY2FsYXIodGhpcy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChmcyk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LW1hcC1lbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLWVuZCc6XG4gICAgICAgICAgICAgICAgICAgIGZjLmVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKGZjKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBpZiAoYnYpXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGVlaygyKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnQudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgJiZcbiAgICAgICAgICAgICAgICAoKHRoaXMudHlwZSA9PT0gJ21hcC12YWx1ZS1pbmQnICYmIHBhcmVudC5pbmRlbnQgPT09IGZjLmluZGVudCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMudHlwZSA9PT0gJ25ld2xpbmUnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhcGFyZW50Lml0ZW1zW3BhcmVudC5pdGVtcy5sZW5ndGggLSAxXS5zZXApKSkge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gJ21hcC12YWx1ZS1pbmQnICYmXG4gICAgICAgICAgICAgICAgcGFyZW50LnR5cGUgIT09ICdmbG93LWNvbGxlY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIGZpeEZsb3dTZXFJdGVtcyhmYyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VwID0gZmMuZW5kLnNwbGljZSgxLCBmYy5lbmQubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGZjLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBmYywgc2VwIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdID0gbWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMubGluZUVuZChmYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmxvd1NjYWxhcih0eXBlKSB7XG4gICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSkge1xuICAgICAgICAgICAgbGV0IG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJykgKyAxO1xuICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBubCk7XG4gICAgICAgICAgICAgICAgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nLCBubCkgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgfVxuICAgIHN0YXJ0QmxvY2tWYWx1ZShwYXJlbnQpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyLWhlYWRlcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLXNjYWxhcicsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiBbdGhpcy5zb3VyY2VUb2tlbl0sXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJydcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnZmxvdy1tYXAtc3RhcnQnOlxuICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtc3RhcnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdmbG93LWNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5zb3VyY2VUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLXNlcScsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGV4cGxpY2l0S2V5OiB0cnVlIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgYXRJbmRlbnRlZENvbW1lbnQoc3RhcnQsIGluZGVudCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnY29tbWVudCcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA8PSBpbmRlbnQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBzdGFydC5ldmVyeShzdCA9PiBzdC50eXBlID09PSAnbmV3bGluZScgfHwgc3QudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgfVxuICAgICpkb2N1bWVudEVuZChkb2NFbmQpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ2RvYy1tb2RlJykge1xuICAgICAgICAgICAgaWYgKGRvY0VuZC5lbmQpXG4gICAgICAgICAgICAgICAgZG9jRW5kLmVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRvY0VuZC5lbmQgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKmxpbmVFbmQodG9rZW4pIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdkb2MtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LW1hcC1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gYWxsIG90aGVyIHZhbHVlcyBhcmUgZXJyb3JzXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbmQgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgUGFyc2VyIH07XG4iLCJpbXBvcnQgeyBDb21wb3NlciB9IGZyb20gJy4vY29tcG9zZS9jb21wb3Nlci5qcyc7XG5pbXBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4vZG9jL0RvY3VtZW50LmpzJztcbmltcG9ydCB7IHByZXR0aWZ5RXJyb3IsIFlBTUxQYXJzZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMuanMnO1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJy4vbG9nLmpzJztcbmltcG9ydCB7IExpbmVDb3VudGVyIH0gZnJvbSAnLi9wYXJzZS9saW5lLWNvdW50ZXIuanMnO1xuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSAnLi9wYXJzZS9wYXJzZXIuanMnO1xuXG5mdW5jdGlvbiBwYXJzZU9wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnN0IHByZXR0eUVycm9ycyA9IG9wdGlvbnMucHJldHR5RXJyb3JzICE9PSBmYWxzZTtcbiAgICBjb25zdCBsaW5lQ291bnRlciA9IG9wdGlvbnMubGluZUNvdW50ZXIgfHwgKHByZXR0eUVycm9ycyAmJiBuZXcgTGluZUNvdW50ZXIoKSkgfHwgbnVsbDtcbiAgICByZXR1cm4geyBsaW5lQ291bnRlciwgcHJldHR5RXJyb3JzIH07XG59XG4vKipcbiAqIFBhcnNlIHRoZSBpbnB1dCBhcyBhIHN0cmVhbSBvZiBZQU1MIGRvY3VtZW50cy5cbiAqXG4gKiBEb2N1bWVudHMgc2hvdWxkIGJlIHNlcGFyYXRlZCBmcm9tIGVhY2ggb3RoZXIgYnkgYC4uLmAgb3IgYC0tLWAgbWFya2VyIGxpbmVzLlxuICpcbiAqIEByZXR1cm5zIElmIGFuIGVtcHR5IGBkb2NzYCBhcnJheSBpcyByZXR1cm5lZCwgaXQgd2lsbCBiZSBvZiB0eXBlXG4gKiAgIEVtcHR5U3RyZWFtIGFuZCBjb250YWluIGFkZGl0aW9uYWwgc3RyZWFtIGluZm9ybWF0aW9uLiBJblxuICogICBUeXBlU2NyaXB0LCB5b3Ugc2hvdWxkIHVzZSBgJ2VtcHR5JyBpbiBkb2NzYCBhcyBhIHR5cGUgZ3VhcmQgZm9yIGl0LlxuICovXG5mdW5jdGlvbiBwYXJzZUFsbERvY3VtZW50cyhzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyID0gbmV3IENvbXBvc2VyKG9wdGlvbnMpO1xuICAgIGNvbnN0IGRvY3MgPSBBcnJheS5mcm9tKGNvbXBvc2VyLmNvbXBvc2UocGFyc2VyLnBhcnNlKHNvdXJjZSkpKTtcbiAgICBpZiAocHJldHR5RXJyb3JzICYmIGxpbmVDb3VudGVyKVxuICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBkb2NzKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLmZvckVhY2gocHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgICAgICBkb2Mud2FybmluZ3MuZm9yRWFjaChwcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgfVxuICAgIGlmIChkb2NzLmxlbmd0aCA+IDApXG4gICAgICAgIHJldHVybiBkb2NzO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKFtdLCB7IGVtcHR5OiB0cnVlIH0sIGNvbXBvc2VyLnN0cmVhbUluZm8oKSk7XG59XG4vKiogUGFyc2UgYW4gaW5wdXQgc3RyaW5nIGludG8gYSBzaW5nbGUgWUFNTC5Eb2N1bWVudCAqL1xuZnVuY3Rpb24gcGFyc2VEb2N1bWVudChzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyID0gbmV3IENvbXBvc2VyKG9wdGlvbnMpO1xuICAgIC8vIGBkb2NgIGlzIGFsd2F5cyBzZXQgYnkgY29tcG9zZS5lbmQodHJ1ZSkgYXQgdGhlIHZlcnkgbGF0ZXN0XG4gICAgbGV0IGRvYyA9IG51bGw7XG4gICAgZm9yIChjb25zdCBfZG9jIG9mIGNvbXBvc2VyLmNvbXBvc2UocGFyc2VyLnBhcnNlKHNvdXJjZSksIHRydWUsIHNvdXJjZS5sZW5ndGgpKSB7XG4gICAgICAgIGlmICghZG9jKVxuICAgICAgICAgICAgZG9jID0gX2RvYztcbiAgICAgICAgZWxzZSBpZiAoZG9jLm9wdGlvbnMubG9nTGV2ZWwgIT09ICdzaWxlbnQnKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLnB1c2gobmV3IFlBTUxQYXJzZUVycm9yKF9kb2MucmFuZ2Uuc2xpY2UoMCwgMiksICdNVUxUSVBMRV9ET0NTJywgJ1NvdXJjZSBjb250YWlucyBtdWx0aXBsZSBkb2N1bWVudHM7IHBsZWFzZSB1c2UgWUFNTC5wYXJzZUFsbERvY3VtZW50cygpJykpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByZXR0eUVycm9ycyAmJiBsaW5lQ291bnRlcikge1xuICAgICAgICBkb2MuZXJyb3JzLmZvckVhY2gocHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgIGRvYy53YXJuaW5ncy5mb3JFYWNoKHByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgIH1cbiAgICByZXR1cm4gZG9jO1xufVxuZnVuY3Rpb24gcGFyc2Uoc3JjLCByZXZpdmVyLCBvcHRpb25zKSB7XG4gICAgbGV0IF9yZXZpdmVyID0gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBfcmV2aXZlciA9IHJldml2ZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXZpdmVyICYmIHR5cGVvZiByZXZpdmVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRpb25zID0gcmV2aXZlcjtcbiAgICB9XG4gICAgY29uc3QgZG9jID0gcGFyc2VEb2N1bWVudChzcmMsIG9wdGlvbnMpO1xuICAgIGlmICghZG9jKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBkb2Mud2FybmluZ3MuZm9yRWFjaCh3YXJuaW5nID0+IHdhcm4oZG9jLm9wdGlvbnMubG9nTGV2ZWwsIHdhcm5pbmcpKTtcbiAgICBpZiAoZG9jLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChkb2Mub3B0aW9ucy5sb2dMZXZlbCAhPT0gJ3NpbGVudCcpXG4gICAgICAgICAgICB0aHJvdyBkb2MuZXJyb3JzWzBdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkb2MuZXJyb3JzID0gW107XG4gICAgfVxuICAgIHJldHVybiBkb2MudG9KUyhPYmplY3QuYXNzaWduKHsgcmV2aXZlcjogX3Jldml2ZXIgfSwgb3B0aW9ucykpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlLCByZXBsYWNlciwgb3B0aW9ucykge1xuICAgIGxldCBfcmVwbGFjZXIgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicgfHwgQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICBvcHRpb25zID0gcmVwbGFjZXI7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLmxlbmd0aDtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgucm91bmQob3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMgPSBpbmRlbnQgPCAxID8gdW5kZWZpbmVkIDogaW5kZW50ID4gOCA/IHsgaW5kZW50OiA4IH0gOiB7IGluZGVudCB9O1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB7IGtlZXBVbmRlZmluZWQgfSA9IG9wdGlvbnMgPz8gcmVwbGFjZXIgPz8ge307XG4gICAgICAgIGlmICgha2VlcFVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRG9jdW1lbnQodmFsdWUsIF9yZXBsYWNlciwgb3B0aW9ucykudG9TdHJpbmcob3B0aW9ucyk7XG59XG5cbmV4cG9ydCB7IHBhcnNlLCBwYXJzZUFsbERvY3VtZW50cywgcGFyc2VEb2N1bWVudCwgc3RyaW5naWZ5IH07XG4iLCJpbXBvcnQgeyBNQVAsIFNDQUxBUiwgU0VRIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi9jb21tb24vbWFwLmpzJztcbmltcG9ydCB7IHNlcSB9IGZyb20gJy4vY29tbW9uL3NlcS5qcyc7XG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tICcuL2NvbW1vbi9zdHJpbmcuanMnO1xuaW1wb3J0IHsgZ2V0VGFncywgY29yZUtub3duVGFncyB9IGZyb20gJy4vdGFncy5qcyc7XG5cbmNvbnN0IHNvcnRNYXBFbnRyaWVzQnlLZXkgPSAoYSwgYikgPT4gYS5rZXkgPCBiLmtleSA/IC0xIDogYS5rZXkgPiBiLmtleSA/IDEgOiAwO1xuY2xhc3MgU2NoZW1hIHtcbiAgICBjb25zdHJ1Y3Rvcih7IGNvbXBhdCwgY3VzdG9tVGFncywgbWVyZ2UsIHJlc29sdmVLbm93blRhZ3MsIHNjaGVtYSwgc29ydE1hcEVudHJpZXMsIHRvU3RyaW5nRGVmYXVsdHMgfSkge1xuICAgICAgICB0aGlzLmNvbXBhdCA9IEFycmF5LmlzQXJyYXkoY29tcGF0KVxuICAgICAgICAgICAgPyBnZXRUYWdzKGNvbXBhdCwgJ2NvbXBhdCcpXG4gICAgICAgICAgICA6IGNvbXBhdFxuICAgICAgICAgICAgICAgID8gZ2V0VGFncyhudWxsLCBjb21wYXQpXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICB0aGlzLm1lcmdlID0gISFtZXJnZTtcbiAgICAgICAgdGhpcy5uYW1lID0gKHR5cGVvZiBzY2hlbWEgPT09ICdzdHJpbmcnICYmIHNjaGVtYSkgfHwgJ2NvcmUnO1xuICAgICAgICB0aGlzLmtub3duVGFncyA9IHJlc29sdmVLbm93blRhZ3MgPyBjb3JlS25vd25UYWdzIDoge307XG4gICAgICAgIHRoaXMudGFncyA9IGdldFRhZ3MoY3VzdG9tVGFncywgdGhpcy5uYW1lKTtcbiAgICAgICAgdGhpcy50b1N0cmluZ09wdGlvbnMgPSB0b1N0cmluZ0RlZmF1bHRzID8/IG51bGw7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBNQVAsIHsgdmFsdWU6IG1hcCB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFNDQUxBUiwgeyB2YWx1ZTogc3RyaW5nIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgU0VRLCB7IHZhbHVlOiBzZXEgfSk7XG4gICAgICAgIC8vIFVzZWQgYnkgY3JlYXRlTWFwKClcbiAgICAgICAgdGhpcy5zb3J0TWFwRW50cmllcyA9XG4gICAgICAgICAgICB0eXBlb2Ygc29ydE1hcEVudHJpZXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICA/IHNvcnRNYXBFbnRyaWVzXG4gICAgICAgICAgICAgICAgOiBzb3J0TWFwRW50cmllcyA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICA/IHNvcnRNYXBFbnRyaWVzQnlLZXlcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoU2NoZW1hLnByb3RvdHlwZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBjb3B5LnRhZ3MgPSB0aGlzLnRhZ3Muc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBTY2hlbWEgfTtcbiIsImltcG9ydCB7IGlzTWFwIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnO1xuXG5jb25zdCBtYXAgPSB7XG4gICAgY29sbGVjdGlvbjogJ21hcCcsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBub2RlQ2xhc3M6IFlBTUxNYXAsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bWFwJyxcbiAgICByZXNvbHZlKG1hcCwgb25FcnJvcikge1xuICAgICAgICBpZiAoIWlzTWFwKG1hcCkpXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIG1hcHBpbmcgZm9yIHRoaXMgdGFnJyk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBvYmosIGN0eCkgPT4gWUFNTE1hcC5mcm9tKHNjaGVtYSwgb2JqLCBjdHgpXG59O1xuXG5leHBvcnQgeyBtYXAgfTtcbiIsImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmNvbnN0IG51bGxUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09IG51bGwsXG4gICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFNjYWxhcihudWxsKSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLFxuICAgIHRlc3Q6IC9eKD86fnxbTm5ddWxsfE5VTEwpPyQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIobnVsbCksXG4gICAgc3RyaW5naWZ5OiAoeyBzb3VyY2UgfSwgY3R4KSA9PiB0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyAmJiBudWxsVGFnLnRlc3QudGVzdChzb3VyY2UpXG4gICAgICAgID8gc291cmNlXG4gICAgICAgIDogY3R4Lm9wdGlvbnMubnVsbFN0clxufTtcblxuZXhwb3J0IHsgbnVsbFRhZyB9O1xuIiwiaW1wb3J0IHsgaXNTZXEgfSBmcm9tICcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5cbmNvbnN0IHNlcSA9IHtcbiAgICBjb2xsZWN0aW9uOiAnc2VxJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG5vZGVDbGFzczogWUFNTFNlcSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnLFxuICAgIHJlc29sdmUoc2VxLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICghaXNTZXEoc2VxKSlcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgc2VxdWVuY2UgZm9yIHRoaXMgdGFnJyk7XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBvYmosIGN0eCkgPT4gWUFNTFNlcS5mcm9tKHNjaGVtYSwgb2JqLCBjdHgpXG59O1xuXG5leHBvcnQgeyBzZXEgfTtcbiIsImltcG9ydCB7IHN0cmluZ2lmeVN0cmluZyB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMnO1xuXG5jb25zdCBzdHJpbmcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgIHJlc29sdmU6IHN0ciA9PiBzdHIsXG4gICAgc3RyaW5naWZ5KGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBjdHggPSBPYmplY3QuYXNzaWduKHsgYWN0dWFsU3RyaW5nOiB0cnVlIH0sIGN0eCk7XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG59O1xuXG5leHBvcnQgeyBzdHJpbmcgfTtcbiIsImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmNvbnN0IGJvb2xUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpbVHRdcnVlfFRSVUV8W0ZmXWFsc2V8RkFMU0UpJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IG5ldyBTY2FsYXIoc3RyWzBdID09PSAndCcgfHwgc3RyWzBdID09PSAnVCcpLFxuICAgIHN0cmluZ2lmeSh7IHNvdXJjZSwgdmFsdWUgfSwgY3R4KSB7XG4gICAgICAgIGlmIChzb3VyY2UgJiYgYm9vbFRhZy50ZXN0LnRlc3Qoc291cmNlKSkge1xuICAgICAgICAgICAgY29uc3Qgc3YgPSBzb3VyY2VbMF0gPT09ICd0JyB8fCBzb3VyY2VbMF0gPT09ICdUJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gc3YpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWUgPyBjdHgub3B0aW9ucy50cnVlU3RyIDogY3R4Lm9wdGlvbnMuZmFsc2VTdHI7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgYm9vbFRhZyB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG5jb25zdCBmbG9hdE5hTiA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXig/OlstK10/XFwuKD86aW5mfEluZnxJTkYpfFxcLm5hbnxcXC5OYU58XFwuTkFOKSQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBzdHIuc2xpY2UoLTMpLnRvTG93ZXJDYXNlKCkgPT09ICduYW4nXG4gICAgICAgID8gTmFOXG4gICAgICAgIDogc3RyWzBdID09PSAnLSdcbiAgICAgICAgICAgID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gICAgICAgICAgICA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGZsb2F0RXhwID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ0VYUCcsXG4gICAgdGVzdDogL15bLStdPyg/OlxcLlswLTldK3xbMC05XSsoPzpcXC5bMC05XSopPylbZUVdWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VGbG9hdChzdHIpLFxuICAgIHN0cmluZ2lmeShub2RlKSB7XG4gICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihub2RlLnZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKG51bSkgPyBudW0udG9FeHBvbmVudGlhbCgpIDogc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIH1cbn07XG5jb25zdCBmbG9hdCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldK1xcLlswLTldKikkLyxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhcihwYXJzZUZsb2F0KHN0cikpO1xuICAgICAgICBjb25zdCBkb3QgPSBzdHIuaW5kZXhPZignLicpO1xuICAgICAgICBpZiAoZG90ICE9PSAtMSAmJiBzdHJbc3RyLmxlbmd0aCAtIDFdID09PSAnMCcpXG4gICAgICAgICAgICBub2RlLm1pbkZyYWN0aW9uRGlnaXRzID0gc3RyLmxlbmd0aCAtIGRvdCAtIDE7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXJcbn07XG5cbmV4cG9ydCB7IGZsb2F0LCBmbG9hdEV4cCwgZmxvYXROYU4gfTtcbiIsImltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG5jb25zdCBpbnRJZGVudGlmeSA9ICh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbmNvbnN0IGludFJlc29sdmUgPSAoc3RyLCBvZmZzZXQsIHJhZGl4LCB7IGludEFzQmlnSW50IH0pID0+IChpbnRBc0JpZ0ludCA/IEJpZ0ludChzdHIpIDogcGFyc2VJbnQoc3RyLnN1YnN0cmluZyhvZmZzZXQpLCByYWRpeCkpO1xuZnVuY3Rpb24gaW50U3RyaW5naWZ5KG5vZGUsIHJhZGl4LCBwcmVmaXgpIHtcbiAgICBjb25zdCB7IHZhbHVlIH0gPSBub2RlO1xuICAgIGlmIChpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMClcbiAgICAgICAgcmV0dXJuIHByZWZpeCArIHZhbHVlLnRvU3RyaW5nKHJhZGl4KTtcbiAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xufVxuY29uc3QgaW50T2N0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMCxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnT0NUJyxcbiAgICB0ZXN0OiAvXjBvWzAtN10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDgsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCA4LCAnMG8nKVxufTtcbmNvbnN0IGludCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMCwgMTAsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBpbnRIZXggPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdIRVgnLFxuICAgIHRlc3Q6IC9eMHhbMC05YS1mQS1GXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMTYsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAxNiwgJzB4Jylcbn07XG5cbmV4cG9ydCB7IGludCwgaW50SGV4LCBpbnRPY3QgfTtcbiIsImltcG9ydCB7IG1hcCB9IGZyb20gJy4uL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgbnVsbFRhZyB9IGZyb20gJy4uL2NvbW1vbi9udWxsLmpzJztcbmltcG9ydCB7IHNlcSB9IGZyb20gJy4uL2NvbW1vbi9zZXEuanMnO1xuaW1wb3J0IHsgc3RyaW5nIH0gZnJvbSAnLi4vY29tbW9uL3N0cmluZy5qcyc7XG5pbXBvcnQgeyBib29sVGFnIH0gZnJvbSAnLi9ib29sLmpzJztcbmltcG9ydCB7IGZsb2F0TmFOLCBmbG9hdEV4cCwgZmxvYXQgfSBmcm9tICcuL2Zsb2F0LmpzJztcbmltcG9ydCB7IGludE9jdCwgaW50LCBpbnRIZXggfSBmcm9tICcuL2ludC5qcyc7XG5cbmNvbnN0IHNjaGVtYSA9IFtcbiAgICBtYXAsXG4gICAgc2VxLFxuICAgIHN0cmluZyxcbiAgICBudWxsVGFnLFxuICAgIGJvb2xUYWcsXG4gICAgaW50T2N0LFxuICAgIGludCxcbiAgICBpbnRIZXgsXG4gICAgZmxvYXROYU4sXG4gICAgZmxvYXRFeHAsXG4gICAgZmxvYXRcbl07XG5cbmV4cG9ydCB7IHNjaGVtYSB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IG1hcCB9IGZyb20gJy4uL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi4vY29tbW9uL3NlcS5qcyc7XG5cbmZ1bmN0aW9uIGludElkZW50aWZ5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgfHwgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSk7XG59XG5jb25zdCBzdHJpbmdpZnlKU09OID0gKHsgdmFsdWUgfSkgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuY29uc3QganNvblNjYWxhcnMgPSBbXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyxcbiAgICAgICAgcmVzb2x2ZTogc3RyID0+IHN0cixcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PSBudWxsLFxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgU2NhbGFyKG51bGwpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJyxcbiAgICAgICAgdGVzdDogL15udWxsJC8sXG4gICAgICAgIHJlc29sdmU6ICgpID0+IG51bGwsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgICAgICB0ZXN0OiAvXnRydWV8ZmFsc2UkLyxcbiAgICAgICAgcmVzb2x2ZTogc3RyID0+IHN0ciA9PT0gJ3RydWUnLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgICAgICB0ZXN0OiAvXi0/KD86MHxbMS05XVswLTldKikkLyxcbiAgICAgICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIHsgaW50QXNCaWdJbnQgfSkgPT4gaW50QXNCaWdJbnQgPyBCaWdJbnQoc3RyKSA6IHBhcnNlSW50KHN0ciwgMTApLFxuICAgICAgICBzdHJpbmdpZnk6ICh7IHZhbHVlIH0pID0+IGludElkZW50aWZ5KHZhbHVlKSA/IHZhbHVlLnRvU3RyaW5nKCkgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICAgICAgdGVzdDogL14tPyg/OjB8WzEtOV1bMC05XSopKD86XFwuWzAtOV0qKT8oPzpbZUVdWy0rXT9bMC05XSspPyQvLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VGbG9hdChzdHIpLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9XG5dO1xuY29uc3QganNvbkVycm9yID0ge1xuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAnJyxcbiAgICB0ZXN0OiAvXi8sXG4gICAgcmVzb2x2ZShzdHIsIG9uRXJyb3IpIHtcbiAgICAgICAgb25FcnJvcihgVW5yZXNvbHZlZCBwbGFpbiBzY2FsYXIgJHtKU09OLnN0cmluZ2lmeShzdHIpfWApO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbn07XG5jb25zdCBzY2hlbWEgPSBbbWFwLCBzZXFdLmNvbmNhdChqc29uU2NhbGFycywganNvbkVycm9yKTtcblxuZXhwb3J0IHsgc2NoZW1hIH07XG4iLCJpbXBvcnQgeyBtYXAgfSBmcm9tICcuL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgbnVsbFRhZyB9IGZyb20gJy4vY29tbW9uL251bGwuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi9jb21tb24vc2VxLmpzJztcbmltcG9ydCB7IHN0cmluZyB9IGZyb20gJy4vY29tbW9uL3N0cmluZy5qcyc7XG5pbXBvcnQgeyBib29sVGFnIH0gZnJvbSAnLi9jb3JlL2Jvb2wuanMnO1xuaW1wb3J0IHsgZmxvYXQsIGZsb2F0RXhwLCBmbG9hdE5hTiB9IGZyb20gJy4vY29yZS9mbG9hdC5qcyc7XG5pbXBvcnQgeyBpbnQsIGludEhleCwgaW50T2N0IH0gZnJvbSAnLi9jb3JlL2ludC5qcyc7XG5pbXBvcnQgeyBzY2hlbWEgfSBmcm9tICcuL2NvcmUvc2NoZW1hLmpzJztcbmltcG9ydCB7IHNjaGVtYSBhcyBzY2hlbWEkMSB9IGZyb20gJy4vanNvbi9zY2hlbWEuanMnO1xuaW1wb3J0IHsgYmluYXJ5IH0gZnJvbSAnLi95YW1sLTEuMS9iaW5hcnkuanMnO1xuaW1wb3J0IHsgb21hcCB9IGZyb20gJy4veWFtbC0xLjEvb21hcC5qcyc7XG5pbXBvcnQgeyBwYWlycyB9IGZyb20gJy4veWFtbC0xLjEvcGFpcnMuanMnO1xuaW1wb3J0IHsgc2NoZW1hIGFzIHNjaGVtYSQyIH0gZnJvbSAnLi95YW1sLTEuMS9zY2hlbWEuanMnO1xuaW1wb3J0IHsgc2V0IH0gZnJvbSAnLi95YW1sLTEuMS9zZXQuanMnO1xuaW1wb3J0IHsgdGltZXN0YW1wLCBmbG9hdFRpbWUsIGludFRpbWUgfSBmcm9tICcuL3lhbWwtMS4xL3RpbWVzdGFtcC5qcyc7XG5cbmNvbnN0IHNjaGVtYXMgPSBuZXcgTWFwKFtcbiAgICBbJ2NvcmUnLCBzY2hlbWFdLFxuICAgIFsnZmFpbHNhZmUnLCBbbWFwLCBzZXEsIHN0cmluZ11dLFxuICAgIFsnanNvbicsIHNjaGVtYSQxXSxcbiAgICBbJ3lhbWwxMScsIHNjaGVtYSQyXSxcbiAgICBbJ3lhbWwtMS4xJywgc2NoZW1hJDJdXG5dKTtcbmNvbnN0IHRhZ3NCeU5hbWUgPSB7XG4gICAgYmluYXJ5LFxuICAgIGJvb2w6IGJvb2xUYWcsXG4gICAgZmxvYXQsXG4gICAgZmxvYXRFeHAsXG4gICAgZmxvYXROYU4sXG4gICAgZmxvYXRUaW1lLFxuICAgIGludCxcbiAgICBpbnRIZXgsXG4gICAgaW50T2N0LFxuICAgIGludFRpbWUsXG4gICAgbWFwLFxuICAgIG51bGw6IG51bGxUYWcsXG4gICAgb21hcCxcbiAgICBwYWlycyxcbiAgICBzZXEsXG4gICAgc2V0LFxuICAgIHRpbWVzdGFtcFxufTtcbmNvbnN0IGNvcmVLbm93blRhZ3MgPSB7XG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeSc6IGJpbmFyeSxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6b21hcCc6IG9tYXAsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJzogcGFpcnMsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOnNldCc6IHNldCxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wJzogdGltZXN0YW1wXG59O1xuZnVuY3Rpb24gZ2V0VGFncyhjdXN0b21UYWdzLCBzY2hlbWFOYW1lKSB7XG4gICAgbGV0IHRhZ3MgPSBzY2hlbWFzLmdldChzY2hlbWFOYW1lKTtcbiAgICBpZiAoIXRhZ3MpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VzdG9tVGFncykpXG4gICAgICAgICAgICB0YWdzID0gW107XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IEFycmF5LmZyb20oc2NoZW1hcy5rZXlzKCkpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4ga2V5ICE9PSAneWFtbDExJylcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PiBKU09OLnN0cmluZ2lmeShrZXkpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHNjaGVtYSBcIiR7c2NoZW1hTmFtZX1cIjsgdXNlIG9uZSBvZiAke2tleXN9IG9yIGRlZmluZSBjdXN0b21UYWdzIGFycmF5YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY3VzdG9tVGFncykpIHtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgY3VzdG9tVGFncylcbiAgICAgICAgICAgIHRhZ3MgPSB0YWdzLmNvbmNhdCh0YWcpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgY3VzdG9tVGFncyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0YWdzID0gY3VzdG9tVGFncyh0YWdzLnNsaWNlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGFncy5tYXAodGFnID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YWcgIT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICAgICAgY29uc3QgdGFnT2JqID0gdGFnc0J5TmFtZVt0YWddO1xuICAgICAgICBpZiAodGFnT2JqKVxuICAgICAgICAgICAgcmV0dXJuIHRhZ09iajtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRhZ3NCeU5hbWUpXG4gICAgICAgICAgICAubWFwKGtleSA9PiBKU09OLnN0cmluZ2lmeShrZXkpKVxuICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBjdXN0b20gdGFnIFwiJHt0YWd9XCI7IHVzZSBvbmUgb2YgJHtrZXlzfWApO1xuICAgIH0pO1xufVxuXG5leHBvcnQgeyBjb3JlS25vd25UYWdzLCBnZXRUYWdzIH07XG4iLCJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5U3RyaW5nIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcyc7XG5cbmNvbnN0IGJpbmFyeSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5LCAvLyBCdWZmZXIgaW5oZXJpdHMgZnJvbSBVaW50OEFycmF5XG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6YmluYXJ5JyxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgQnVmZmVyIGluIG5vZGUgYW5kIGFuIFVpbnQ4QXJyYXkgaW4gYnJvd3NlcnNcbiAgICAgKlxuICAgICAqIFRvIHVzZSB0aGUgcmVzdWx0aW5nIGJ1ZmZlciBhcyBhbiBpbWFnZSwgeW91J2xsIHdhbnQgdG8gZG8gc29tZXRoaW5nIGxpa2U6XG4gICAgICpcbiAgICAgKiAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnVmZmVyXSwgeyB0eXBlOiAnaW1hZ2UvanBlZycgfSlcbiAgICAgKiAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwaG90bycpLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYilcbiAgICAgKi9cbiAgICByZXNvbHZlKHNyYywgb25FcnJvcikge1xuICAgICAgICBpZiAodHlwZW9mIEJ1ZmZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHNyYywgJ2Jhc2U2NCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBhdG9iID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBPbiBJRSAxMSwgYXRvYigpIGNhbid0IGhhbmRsZSBuZXdsaW5lc1xuICAgICAgICAgICAgY29uc3Qgc3RyID0gYXRvYihzcmMucmVwbGFjZSgvW1xcblxccl0vZywgJycpKTtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHN0ci5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgYnVmZmVyW2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgb25FcnJvcignVGhpcyBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IHJlYWRpbmcgYmluYXJ5IHRhZ3M7IGVpdGhlciBCdWZmZXIgb3IgYXRvYiBpcyByZXF1aXJlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNyYztcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc3RyaW5naWZ5KHsgY29tbWVudCwgdHlwZSwgdmFsdWUgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IHZhbHVlOyAvLyBjaGVja2VkIGVhcmxpZXIgYnkgYmluYXJ5LmlkZW50aWZ5KClcbiAgICAgICAgbGV0IHN0cjtcbiAgICAgICAgaWYgKHR5cGVvZiBCdWZmZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHN0ciA9XG4gICAgICAgICAgICAgICAgYnVmIGluc3RhbmNlb2YgQnVmZmVyXG4gICAgICAgICAgICAgICAgICAgID8gYnVmLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICAgICAgICAgICAgICA6IEJ1ZmZlci5mcm9tKGJ1Zi5idWZmZXIpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbGV0IHMgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIHMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pO1xuICAgICAgICAgICAgc3RyID0gYnRvYShzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IHdyaXRpbmcgYmluYXJ5IHRhZ3M7IGVpdGhlciBCdWZmZXIgb3IgYnRvYSBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdHlwZSlcbiAgICAgICAgICAgIHR5cGUgPSBTY2FsYXIuQkxPQ0tfTElURVJBTDtcbiAgICAgICAgaWYgKHR5cGUgIT09IFNjYWxhci5RVU9URV9ET1VCTEUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVXaWR0aCA9IE1hdGgubWF4KGN0eC5vcHRpb25zLmxpbmVXaWR0aCAtIGN0eC5pbmRlbnQubGVuZ3RoLCBjdHgub3B0aW9ucy5taW5Db250ZW50V2lkdGgpO1xuICAgICAgICAgICAgY29uc3QgbiA9IE1hdGguY2VpbChzdHIubGVuZ3RoIC8gbGluZVdpZHRoKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gbmV3IEFycmF5KG4pO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIG8gPSAwOyBpIDwgbjsgKytpLCBvICs9IGxpbmVXaWR0aCkge1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gc3RyLnN1YnN0cihvLCBsaW5lV2lkdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyID0gbGluZXMuam9pbih0eXBlID09PSBTY2FsYXIuQkxPQ0tfTElURVJBTCA/ICdcXG4nIDogJyAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3RyaW5nKHsgY29tbWVudCwgdHlwZSwgdmFsdWU6IHN0ciB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IGJpbmFyeSB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcblxuZnVuY3Rpb24gYm9vbFN0cmluZ2lmeSh7IHZhbHVlLCBzb3VyY2UgfSwgY3R4KSB7XG4gICAgY29uc3QgYm9vbE9iaiA9IHZhbHVlID8gdHJ1ZVRhZyA6IGZhbHNlVGFnO1xuICAgIGlmIChzb3VyY2UgJiYgYm9vbE9iai50ZXN0LnRlc3Qoc291cmNlKSlcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICByZXR1cm4gdmFsdWUgPyBjdHgub3B0aW9ucy50cnVlU3RyIDogY3R4Lm9wdGlvbnMuZmFsc2VTdHI7XG59XG5jb25zdCB0cnVlVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86WXx5fFtZeV1lc3xZRVN8W1R0XXJ1ZXxUUlVFfFtPb11ufE9OKSQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIodHJ1ZSksXG4gICAgc3RyaW5naWZ5OiBib29sU3RyaW5naWZ5XG59O1xuY29uc3QgZmFsc2VUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09PSBmYWxzZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86TnxufFtObl1vfE5PfFtGZl1hbHNlfEZBTFNFfFtPb11mZnxPRkYpJC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhcihmYWxzZSksXG4gICAgc3RyaW5naWZ5OiBib29sU3RyaW5naWZ5XG59O1xuXG5leHBvcnQgeyBmYWxzZVRhZywgdHJ1ZVRhZyB9O1xuIiwiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG5jb25zdCBmbG9hdE5hTiA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXig/OlstK10/XFwuKD86aW5mfEluZnxJTkYpfFxcLm5hbnxcXC5OYU58XFwuTkFOKSQvLFxuICAgIHJlc29sdmU6IChzdHIpID0+IHN0ci5zbGljZSgtMykudG9Mb3dlckNhc2UoKSA9PT0gJ25hbidcbiAgICAgICAgPyBOYU5cbiAgICAgICAgOiBzdHJbMF0gPT09ICctJ1xuICAgICAgICAgICAgPyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFlcbiAgICAgICAgICAgIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgZmxvYXRFeHAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnRVhQJyxcbiAgICB0ZXN0OiAvXlstK10/KD86WzAtOV1bMC05X10qKT8oPzpcXC5bMC05X10qKT9bZUVdWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiAoc3RyKSA9PiBwYXJzZUZsb2F0KHN0ci5yZXBsYWNlKC9fL2csICcnKSksXG4gICAgc3RyaW5naWZ5KG5vZGUpIHtcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKG5vZGUudmFsdWUpO1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobnVtKSA/IG51bS50b0V4cG9uZW50aWFsKCkgOiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgfVxufTtcbmNvbnN0IGZsb2F0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpbMC05XVswLTlfXSopP1xcLlswLTlfXSokLyxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhcihwYXJzZUZsb2F0KHN0ci5yZXBsYWNlKC9fL2csICcnKSkpO1xuICAgICAgICBjb25zdCBkb3QgPSBzdHIuaW5kZXhPZignLicpO1xuICAgICAgICBpZiAoZG90ICE9PSAtMSkge1xuICAgICAgICAgICAgY29uc3QgZiA9IHN0ci5zdWJzdHJpbmcoZG90ICsgMSkucmVwbGFjZSgvXy9nLCAnJyk7XG4gICAgICAgICAgICBpZiAoZltmLmxlbmd0aCAtIDFdID09PSAnMCcpXG4gICAgICAgICAgICAgICAgbm9kZS5taW5GcmFjdGlvbkRpZ2l0cyA9IGYubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXJcbn07XG5cbmV4cG9ydCB7IGZsb2F0LCBmbG9hdEV4cCwgZmxvYXROYU4gfTtcbiIsImltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG5jb25zdCBpbnRJZGVudGlmeSA9ICh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbmZ1bmN0aW9uIGludFJlc29sdmUoc3RyLCBvZmZzZXQsIHJhZGl4LCB7IGludEFzQmlnSW50IH0pIHtcbiAgICBjb25zdCBzaWduID0gc3RyWzBdO1xuICAgIGlmIChzaWduID09PSAnLScgfHwgc2lnbiA9PT0gJysnKVxuICAgICAgICBvZmZzZXQgKz0gMTtcbiAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKG9mZnNldCkucmVwbGFjZSgvXy9nLCAnJyk7XG4gICAgaWYgKGludEFzQmlnSW50KSB7XG4gICAgICAgIHN3aXRjaCAocmFkaXgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBzdHIgPSBgMGIke3N0cn1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIHN0ciA9IGAwbyR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgIHN0ciA9IGAweCR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbiA9IEJpZ0ludChzdHIpO1xuICAgICAgICByZXR1cm4gc2lnbiA9PT0gJy0nID8gQmlnSW50KC0xKSAqIG4gOiBuO1xuICAgIH1cbiAgICBjb25zdCBuID0gcGFyc2VJbnQoc3RyLCByYWRpeCk7XG4gICAgcmV0dXJuIHNpZ24gPT09ICctJyA/IC0xICogbiA6IG47XG59XG5mdW5jdGlvbiBpbnRTdHJpbmdpZnkobm9kZSwgcmFkaXgsIHByZWZpeCkge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgaWYgKGludElkZW50aWZ5KHZhbHVlKSkge1xuICAgICAgICBjb25zdCBzdHIgPSB2YWx1ZS50b1N0cmluZyhyYWRpeCk7XG4gICAgICAgIHJldHVybiB2YWx1ZSA8IDAgPyAnLScgKyBwcmVmaXggKyBzdHIuc3Vic3RyKDEpIDogcHJlZml4ICsgc3RyO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xufVxuY29uc3QgaW50QmluID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnQklOJyxcbiAgICB0ZXN0OiAvXlstK10/MGJbMC0xX10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDIsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAyLCAnMGInKVxufTtcbmNvbnN0IGludE9jdCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ09DVCcsXG4gICAgdGVzdDogL15bLStdPzBbMC03X10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDEsIDgsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCA4LCAnMCcpXG59O1xuY29uc3QgaW50ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKiQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAwLCAxMCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGludEhleCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ0hFWCcsXG4gICAgdGVzdDogL15bLStdPzB4WzAtOWEtZkEtRl9dKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCAxNiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDE2LCAnMHgnKVxufTtcblxuZXhwb3J0IHsgaW50LCBpbnRCaW4sIGludEhleCwgaW50T2N0IH07XG4iLCJpbXBvcnQgeyBpc1NjYWxhciwgaXNQYWlyIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4uLy4uL25vZGVzL3RvSlMuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZVBhaXJzLCBjcmVhdGVQYWlycyB9IGZyb20gJy4vcGFpcnMuanMnO1xuXG5jbGFzcyBZQU1MT01hcCBleHRlbmRzIFlBTUxTZXEge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFkZCA9IFlBTUxNYXAucHJvdG90eXBlLmFkZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRlbGV0ZSA9IFlBTUxNYXAucHJvdG90eXBlLmRlbGV0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmdldCA9IFlBTUxNYXAucHJvdG90eXBlLmdldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhcyA9IFlBTUxNYXAucHJvdG90eXBlLmhhcy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNldCA9IFlBTUxNYXAucHJvdG90eXBlLnNldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRhZyA9IFlBTUxPTWFwLnRhZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSWYgYGN0eGAgaXMgZ2l2ZW4sIHRoZSByZXR1cm4gdHlwZSBpcyBhY3R1YWxseSBgTWFwPHVua25vd24sIHVua25vd24+YCxcbiAgICAgKiBidXQgVHlwZVNjcmlwdCB3b24ndCBhbGxvdyB3aWRlbmluZyB0aGUgc2lnbmF0dXJlIG9mIGEgY2hpbGQgbWV0aG9kLlxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8pO1xuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBsZXQga2V5LCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChpc1BhaXIocGFpcikpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSB0b0pTKHBhaXIua2V5LCAnJywgY3R4KTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRvSlMocGFpci52YWx1ZSwga2V5LCBjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gdG9KUyhwYWlyLCAnJywgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXAuaGFzKGtleSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5cycpO1xuICAgICAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgcGFpcnMgPSBjcmVhdGVQYWlycyhzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpO1xuICAgICAgICBjb25zdCBvbWFwID0gbmV3IHRoaXMoKTtcbiAgICAgICAgb21hcC5pdGVtcyA9IHBhaXJzLml0ZW1zO1xuICAgICAgICByZXR1cm4gb21hcDtcbiAgICB9XG59XG5ZQU1MT01hcC50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6b21hcCc7XG5jb25zdCBvbWFwID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIE1hcCxcbiAgICBub2RlQ2xhc3M6IFlBTUxPTWFwLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnLFxuICAgIHJlc29sdmUoc2VxLCBvbkVycm9yKSB7XG4gICAgICAgIGNvbnN0IHBhaXJzID0gcmVzb2x2ZVBhaXJzKHNlcSwgb25FcnJvcik7XG4gICAgICAgIGNvbnN0IHNlZW5LZXlzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgeyBrZXkgfSBvZiBwYWlycy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VlbktleXMuaW5jbHVkZXMoa2V5LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGBPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5czogJHtrZXkudmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWVuS2V5cy5wdXNoKGtleS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBZQU1MT01hcCgpLCBwYWlycyk7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSA9PiBZQU1MT01hcC5mcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eClcbn07XG5cbmV4cG9ydCB7IFlBTUxPTWFwLCBvbWFwIH07XG4iLCJpbXBvcnQgeyBpc1NlcSwgaXNQYWlyLCBpc01hcCB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIsIGNyZWF0ZVBhaXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVQYWlycyhzZXEsIG9uRXJyb3IpIHtcbiAgICBpZiAoaXNTZXEoc2VxKSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlcS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSBzZXEuaXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoaXNQYWlyKGl0ZW0pKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNNYXAoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5pdGVtcy5sZW5ndGggPiAxKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdFYWNoIHBhaXIgbXVzdCBoYXZlIGl0cyBvd24gc2VxdWVuY2UgaW5kaWNhdG9yJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFpciA9IGl0ZW0uaXRlbXNbMF0gfHwgbmV3IFBhaXIobmV3IFNjYWxhcihudWxsKSk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudEJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgcGFpci5rZXkuY29tbWVudEJlZm9yZSA9IHBhaXIua2V5LmNvbW1lbnRCZWZvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7aXRlbS5jb21tZW50QmVmb3JlfVxcbiR7cGFpci5rZXkuY29tbWVudEJlZm9yZX1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNuID0gcGFpci52YWx1ZSA/PyBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICAgICAgY24uY29tbWVudCA9IGNuLmNvbW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7aXRlbS5jb21tZW50fVxcbiR7Y24uY29tbWVudH1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXRlbSA9IHBhaXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXEuaXRlbXNbaV0gPSBpc1BhaXIoaXRlbSkgPyBpdGVtIDogbmV3IFBhaXIoaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZVxuICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIHNlcXVlbmNlIGZvciB0aGlzIHRhZycpO1xuICAgIHJldHVybiBzZXE7XG59XG5mdW5jdGlvbiBjcmVhdGVQYWlycyhzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgY29uc3QgcGFpcnMgPSBuZXcgWUFNTFNlcShzY2hlbWEpO1xuICAgIHBhaXJzLnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycyc7XG4gICAgbGV0IGkgPSAwO1xuICAgIGlmIChpdGVyYWJsZSAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXJhYmxlKSlcbiAgICAgICAgZm9yIChsZXQgaXQgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgaXQgPSByZXBsYWNlci5jYWxsKGl0ZXJhYmxlLCBTdHJpbmcoaSsrKSwgaXQpO1xuICAgICAgICAgICAgbGV0IGtleSwgdmFsdWU7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpdCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGl0WzBdO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGl0WzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFtrZXksIHZhbHVlXSB0dXBsZTogJHtpdH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ICYmIGl0IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGl0KTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0ga2V5c1swXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpdFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgdHVwbGUgd2l0aCBvbmUga2V5LCBub3QgJHtrZXlzLmxlbmd0aH0ga2V5c2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IGl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFpcnMuaXRlbXMucHVzaChjcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkpO1xuICAgICAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xufVxuY29uc3QgcGFpcnMgPSB7XG4gICAgY29sbGVjdGlvbjogJ3NlcScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnLFxuICAgIHJlc29sdmU6IHJlc29sdmVQYWlycyxcbiAgICBjcmVhdGVOb2RlOiBjcmVhdGVQYWlyc1xufTtcblxuZXhwb3J0IHsgY3JlYXRlUGFpcnMsIHBhaXJzLCByZXNvbHZlUGFpcnMgfTtcbiIsImltcG9ydCB7IG1hcCB9IGZyb20gJy4uL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgbnVsbFRhZyB9IGZyb20gJy4uL2NvbW1vbi9udWxsLmpzJztcbmltcG9ydCB7IHNlcSB9IGZyb20gJy4uL2NvbW1vbi9zZXEuanMnO1xuaW1wb3J0IHsgc3RyaW5nIH0gZnJvbSAnLi4vY29tbW9uL3N0cmluZy5qcyc7XG5pbXBvcnQgeyBiaW5hcnkgfSBmcm9tICcuL2JpbmFyeS5qcyc7XG5pbXBvcnQgeyB0cnVlVGFnLCBmYWxzZVRhZyB9IGZyb20gJy4vYm9vbC5qcyc7XG5pbXBvcnQgeyBmbG9hdE5hTiwgZmxvYXRFeHAsIGZsb2F0IH0gZnJvbSAnLi9mbG9hdC5qcyc7XG5pbXBvcnQgeyBpbnRCaW4sIGludE9jdCwgaW50LCBpbnRIZXggfSBmcm9tICcuL2ludC5qcyc7XG5pbXBvcnQgeyBvbWFwIH0gZnJvbSAnLi9vbWFwLmpzJztcbmltcG9ydCB7IHBhaXJzIH0gZnJvbSAnLi9wYWlycy5qcyc7XG5pbXBvcnQgeyBzZXQgfSBmcm9tICcuL3NldC5qcyc7XG5pbXBvcnQgeyBpbnRUaW1lLCBmbG9hdFRpbWUsIHRpbWVzdGFtcCB9IGZyb20gJy4vdGltZXN0YW1wLmpzJztcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcCxcbiAgICBzZXEsXG4gICAgc3RyaW5nLFxuICAgIG51bGxUYWcsXG4gICAgdHJ1ZVRhZyxcbiAgICBmYWxzZVRhZyxcbiAgICBpbnRCaW4sXG4gICAgaW50T2N0LFxuICAgIGludCxcbiAgICBpbnRIZXgsXG4gICAgZmxvYXROYU4sXG4gICAgZmxvYXRFeHAsXG4gICAgZmxvYXQsXG4gICAgYmluYXJ5LFxuICAgIG9tYXAsXG4gICAgcGFpcnMsXG4gICAgc2V0LFxuICAgIGludFRpbWUsXG4gICAgZmxvYXRUaW1lLFxuICAgIHRpbWVzdGFtcFxuXTtcblxuZXhwb3J0IHsgc2NoZW1hIH07XG4iLCJpbXBvcnQgeyBpc01hcCwgaXNQYWlyLCBpc1NjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIsIGNyZWF0ZVBhaXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IFlBTUxNYXAsIGZpbmRQYWlyIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5cbmNsYXNzIFlBTUxTZXQgZXh0ZW5kcyBZQU1MTWFwIHtcbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoc2NoZW1hKTtcbiAgICAgICAgdGhpcy50YWcgPSBZQU1MU2V0LnRhZztcbiAgICB9XG4gICAgYWRkKGtleSkge1xuICAgICAgICBsZXQgcGFpcjtcbiAgICAgICAgaWYgKGlzUGFpcihrZXkpKVxuICAgICAgICAgICAgcGFpciA9IGtleTtcbiAgICAgICAgZWxzZSBpZiAoa2V5ICYmXG4gICAgICAgICAgICB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgJ2tleScgaW4ga2V5ICYmXG4gICAgICAgICAgICAndmFsdWUnIGluIGtleSAmJlxuICAgICAgICAgICAga2V5LnZhbHVlID09PSBudWxsKVxuICAgICAgICAgICAgcGFpciA9IG5ldyBQYWlyKGtleS5rZXksIG51bGwpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYWlyID0gbmV3IFBhaXIoa2V5LCBudWxsKTtcbiAgICAgICAgY29uc3QgcHJldiA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIHBhaXIua2V5KTtcbiAgICAgICAgaWYgKCFwcmV2KVxuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKHBhaXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJZiBga2VlcFBhaXJgIGlzIGB0cnVlYCwgcmV0dXJucyB0aGUgUGFpciBtYXRjaGluZyBga2V5YC5cbiAgICAgKiBPdGhlcndpc2UsIHJldHVybnMgdGhlIHZhbHVlIG9mIHRoYXQgUGFpcidzIGtleS5cbiAgICAgKi9cbiAgICBnZXQoa2V5LCBrZWVwUGFpcikge1xuICAgICAgICBjb25zdCBwYWlyID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgcmV0dXJuICFrZWVwUGFpciAmJiBpc1BhaXIocGFpcilcbiAgICAgICAgICAgID8gaXNTY2FsYXIocGFpci5rZXkpXG4gICAgICAgICAgICAgICAgPyBwYWlyLmtleS52YWx1ZVxuICAgICAgICAgICAgICAgIDogcGFpci5rZXlcbiAgICAgICAgICAgIDogcGFpcjtcbiAgICB9XG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBib29sZWFuIHZhbHVlIGZvciBzZXQoa2V5LCB2YWx1ZSkgaW4gYSBZQU1MIHNldCwgbm90ICR7dHlwZW9mIHZhbHVlfWApO1xuICAgICAgICBjb25zdCBwcmV2ID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgaWYgKHByZXYgJiYgIXZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnNwbGljZSh0aGlzLml0ZW1zLmluZGV4T2YocHJldiksIDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFwcmV2ICYmIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2gobmV3IFBhaXIoa2V5KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8sIGN0eCwgU2V0KTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5oYXNBbGxOdWxsVmFsdWVzKHRydWUpKVxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBhbGxOdWxsVmFsdWVzOiB0cnVlIH0pLCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXQgaXRlbXMgbXVzdCBhbGwgaGF2ZSBudWxsIHZhbHVlcycpO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzZXQgPSBuZXcgdGhpcyhzY2hlbWEpO1xuICAgICAgICBpZiAoaXRlcmFibGUgJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyYWJsZSkpXG4gICAgICAgICAgICBmb3IgKGxldCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbChpdGVyYWJsZSwgdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZXQuaXRlbXMucHVzaChjcmVhdGVQYWlyKHZhbHVlLCBudWxsLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldDtcbiAgICB9XG59XG5ZQU1MU2V0LnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnO1xuY29uc3Qgc2V0ID0ge1xuICAgIGNvbGxlY3Rpb246ICdtYXAnLFxuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIFNldCxcbiAgICBub2RlQ2xhc3M6IFlBTUxTZXQsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c2V0JyxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSA9PiBZQU1MU2V0LmZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSxcbiAgICByZXNvbHZlKG1hcCwgb25FcnJvcikge1xuICAgICAgICBpZiAoaXNNYXAobWFwKSkge1xuICAgICAgICAgICAgaWYgKG1hcC5oYXNBbGxOdWxsVmFsdWVzKHRydWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBZQU1MU2V0KCksIG1hcCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb25FcnJvcignU2V0IGl0ZW1zIG11c3QgYWxsIGhhdmUgbnVsbCB2YWx1ZXMnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIG1hcHBpbmcgZm9yIHRoaXMgdGFnJyk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgWUFNTFNldCwgc2V0IH07XG4iLCJpbXBvcnQgeyBzdHJpbmdpZnlOdW1iZXIgfSBmcm9tICcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJztcblxuLyoqIEludGVybmFsIHR5cGVzIGhhbmRsZSBiaWdpbnQgYXMgbnVtYmVyLCBiZWNhdXNlIFRTIGNhbid0IGZpZ3VyZSBpdCBvdXQuICovXG5mdW5jdGlvbiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgYXNCaWdJbnQpIHtcbiAgICBjb25zdCBzaWduID0gc3RyWzBdO1xuICAgIGNvbnN0IHBhcnRzID0gc2lnbiA9PT0gJy0nIHx8IHNpZ24gPT09ICcrJyA/IHN0ci5zdWJzdHJpbmcoMSkgOiBzdHI7XG4gICAgY29uc3QgbnVtID0gKG4pID0+IGFzQmlnSW50ID8gQmlnSW50KG4pIDogTnVtYmVyKG4pO1xuICAgIGNvbnN0IHJlcyA9IHBhcnRzXG4gICAgICAgIC5yZXBsYWNlKC9fL2csICcnKVxuICAgICAgICAuc3BsaXQoJzonKVxuICAgICAgICAucmVkdWNlKChyZXMsIHApID0+IHJlcyAqIG51bSg2MCkgKyBudW0ocCksIG51bSgwKSk7XG4gICAgcmV0dXJuIChzaWduID09PSAnLScgPyBudW0oLTEpICogcmVzIDogcmVzKTtcbn1cbi8qKlxuICogaGhoaDptbTpzcy5zc3NcbiAqXG4gKiBJbnRlcm5hbCB0eXBlcyBoYW5kbGUgYmlnaW50IGFzIG51bWJlciwgYmVjYXVzZSBUUyBjYW4ndCBmaWd1cmUgaXQgb3V0LlxuICovXG5mdW5jdGlvbiBzdHJpbmdpZnlTZXhhZ2VzaW1hbChub2RlKSB7XG4gICAgbGV0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgbGV0IG51bSA9IChuKSA9PiBuO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnKVxuICAgICAgICBudW0gPSBuID0+IEJpZ0ludChuKTtcbiAgICBlbHNlIGlmIChpc05hTih2YWx1ZSkgfHwgIWlzRmluaXRlKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeU51bWJlcihub2RlKTtcbiAgICBsZXQgc2lnbiA9ICcnO1xuICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgc2lnbiA9ICctJztcbiAgICAgICAgdmFsdWUgKj0gbnVtKC0xKTtcbiAgICB9XG4gICAgY29uc3QgXzYwID0gbnVtKDYwKTtcbiAgICBjb25zdCBwYXJ0cyA9IFt2YWx1ZSAlIF82MF07IC8vIHNlY29uZHMsIGluY2x1ZGluZyBtc1xuICAgIGlmICh2YWx1ZSA8IDYwKSB7XG4gICAgICAgIHBhcnRzLnVuc2hpZnQoMCk7IC8vIGF0IGxlYXN0IG9uZSA6IGlzIHJlcXVpcmVkXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YWx1ZSA9ICh2YWx1ZSAtIHBhcnRzWzBdKSAvIF82MDtcbiAgICAgICAgcGFydHMudW5zaGlmdCh2YWx1ZSAlIF82MCk7IC8vIG1pbnV0ZXNcbiAgICAgICAgaWYgKHZhbHVlID49IDYwKSB7XG4gICAgICAgICAgICB2YWx1ZSA9ICh2YWx1ZSAtIHBhcnRzWzBdKSAvIF82MDtcbiAgICAgICAgICAgIHBhcnRzLnVuc2hpZnQodmFsdWUpOyAvLyBob3Vyc1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoc2lnbiArXG4gICAgICAgIHBhcnRzXG4gICAgICAgICAgICAubWFwKG4gPT4gU3RyaW5nKG4pLnBhZFN0YXJ0KDIsICcwJykpXG4gICAgICAgICAgICAuam9pbignOicpXG4gICAgICAgICAgICAucmVwbGFjZSgvMDAwMDAwXFxkKiQvLCAnJykgLy8gJSA2MCBtYXkgaW50cm9kdWNlIGVycm9yXG4gICAgKTtcbn1cbmNvbnN0IGludFRpbWUgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgfHwgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ1RJTUUnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCB7IGludEFzQmlnSW50IH0pID0+IHBhcnNlU2V4YWdlc2ltYWwoc3RyLCBpbnRBc0JpZ0ludCksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlTZXhhZ2VzaW1hbFxufTtcbmNvbnN0IGZsb2F0VGltZSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICBmb3JtYXQ6ICdUSU1FJyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKStcXC5bMC05X10qJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IHBhcnNlU2V4YWdlc2ltYWwoc3RyLCBmYWxzZSksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlTZXhhZ2VzaW1hbFxufTtcbmNvbnN0IHRpbWVzdGFtcCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wJyxcbiAgICAvLyBJZiB0aGUgdGltZSB6b25lIGlzIG9taXR0ZWQsIHRoZSB0aW1lc3RhbXAgaXMgYXNzdW1lZCB0byBiZSBzcGVjaWZpZWQgaW4gVVRDLiBUaGUgdGltZSBwYXJ0XG4gICAgLy8gbWF5IGJlIG9taXR0ZWQgYWx0b2dldGhlciwgcmVzdWx0aW5nIGluIGEgZGF0ZSBmb3JtYXQuIEluIHN1Y2ggYSBjYXNlLCB0aGUgdGltZSBwYXJ0IGlzXG4gICAgLy8gYXNzdW1lZCB0byBiZSAwMDowMDowMFogKHN0YXJ0IG9mIGRheSwgVVRDKS5cbiAgICB0ZXN0OiBSZWdFeHAoJ14oWzAtOV17NH0pLShbMC05XXsxLDJ9KS0oWzAtOV17MSwyfSknICsgLy8gWVlZWS1NbS1EZFxuICAgICAgICAnKD86JyArIC8vIHRpbWUgaXMgb3B0aW9uYWxcbiAgICAgICAgJyg/OnR8VHxbIFxcXFx0XSspJyArIC8vIHQgfCBUIHwgd2hpdGVzcGFjZVxuICAgICAgICAnKFswLTldezEsMn0pOihbMC05XXsxLDJ9KTooWzAtOV17MSwyfShcXFxcLlswLTldKyk/KScgKyAvLyBIaDpNbTpTcyguc3MpP1xuICAgICAgICAnKD86WyBcXFxcdF0qKFp8Wy0rXVswMTJdP1swLTldKD86OlswLTldezJ9KT8pKT8nICsgLy8gWiB8ICs1IHwgLTAzOjMwXG4gICAgICAgICcpPyQnKSxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHN0ci5tYXRjaCh0aW1lc3RhbXAudGVzdCk7XG4gICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJyEhdGltZXN0YW1wIGV4cGVjdHMgYSBkYXRlLCBzdGFydGluZyB3aXRoIHl5eXktbW0tZGQnKTtcbiAgICAgICAgY29uc3QgWywgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmRdID0gbWF0Y2gubWFwKE51bWJlcik7XG4gICAgICAgIGNvbnN0IG1pbGxpc2VjID0gbWF0Y2hbN10gPyBOdW1iZXIoKG1hdGNoWzddICsgJzAwJykuc3Vic3RyKDEsIDMpKSA6IDA7XG4gICAgICAgIGxldCBkYXRlID0gRGF0ZS5VVEMoeWVhciwgbW9udGggLSAxLCBkYXksIGhvdXIgfHwgMCwgbWludXRlIHx8IDAsIHNlY29uZCB8fCAwLCBtaWxsaXNlYyk7XG4gICAgICAgIGNvbnN0IHR6ID0gbWF0Y2hbOF07XG4gICAgICAgIGlmICh0eiAmJiB0eiAhPT0gJ1onKSB7XG4gICAgICAgICAgICBsZXQgZCA9IHBhcnNlU2V4YWdlc2ltYWwodHosIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkKSA8IDMwKVxuICAgICAgICAgICAgICAgIGQgKj0gNjA7XG4gICAgICAgICAgICBkYXRlIC09IDYwMDAwICogZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZSk7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6ICh7IHZhbHVlIH0pID0+IHZhbHVlLnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvKChUMDA6MDApPzowMCk/XFwuMDAwWiQvLCAnJylcbn07XG5cbmV4cG9ydCB7IGZsb2F0VGltZSwgaW50VGltZSwgdGltZXN0YW1wIH07XG4iLCJjb25zdCBGT0xEX0ZMT1cgPSAnZmxvdyc7XG5jb25zdCBGT0xEX0JMT0NLID0gJ2Jsb2NrJztcbmNvbnN0IEZPTERfUVVPVEVEID0gJ3F1b3RlZCc7XG4vKipcbiAqIFRyaWVzIHRvIGtlZXAgaW5wdXQgYXQgdXAgdG8gYGxpbmVXaWR0aGAgY2hhcmFjdGVycywgc3BsaXR0aW5nIG9ubHkgb24gc3BhY2VzXG4gKiBub3QgZm9sbG93ZWQgYnkgbmV3bGluZXMgb3Igc3BhY2VzIHVubGVzcyBgbW9kZWAgaXMgYCdxdW90ZWQnYC4gTGluZXMgYXJlXG4gKiB0ZXJtaW5hdGVkIHdpdGggYFxcbmAgYW5kIHN0YXJ0ZWQgd2l0aCBgaW5kZW50YC5cbiAqL1xuZnVuY3Rpb24gZm9sZEZsb3dMaW5lcyh0ZXh0LCBpbmRlbnQsIG1vZGUgPSAnZmxvdycsIHsgaW5kZW50QXRTdGFydCwgbGluZVdpZHRoID0gODAsIG1pbkNvbnRlbnRXaWR0aCA9IDIwLCBvbkZvbGQsIG9uT3ZlcmZsb3cgfSA9IHt9KSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMClcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgY29uc3QgZW5kU3RlcCA9IE1hdGgubWF4KDEgKyBtaW5Db250ZW50V2lkdGgsIDEgKyBsaW5lV2lkdGggLSBpbmRlbnQubGVuZ3RoKTtcbiAgICBpZiAodGV4dC5sZW5ndGggPD0gZW5kU3RlcClcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgY29uc3QgZm9sZHMgPSBbXTtcbiAgICBjb25zdCBlc2NhcGVkRm9sZHMgPSB7fTtcbiAgICBsZXQgZW5kID0gbGluZVdpZHRoIC0gaW5kZW50Lmxlbmd0aDtcbiAgICBpZiAodHlwZW9mIGluZGVudEF0U3RhcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChpbmRlbnRBdFN0YXJ0ID4gbGluZVdpZHRoIC0gTWF0aC5tYXgoMiwgbWluQ29udGVudFdpZHRoKSlcbiAgICAgICAgICAgIGZvbGRzLnB1c2goMCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVuZCA9IGxpbmVXaWR0aCAtIGluZGVudEF0U3RhcnQ7XG4gICAgfVxuICAgIGxldCBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgcHJldiA9IHVuZGVmaW5lZDtcbiAgICBsZXQgb3ZlcmZsb3cgPSBmYWxzZTtcbiAgICBsZXQgaSA9IC0xO1xuICAgIGxldCBlc2NTdGFydCA9IC0xO1xuICAgIGxldCBlc2NFbmQgPSAtMTtcbiAgICBpZiAobW9kZSA9PT0gRk9MRF9CTE9DSykge1xuICAgICAgICBpID0gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudC5sZW5ndGgpO1xuICAgICAgICBpZiAoaSAhPT0gLTEpXG4gICAgICAgICAgICBlbmQgPSBpICsgZW5kU3RlcDtcbiAgICB9XG4gICAgZm9yIChsZXQgY2g7IChjaCA9IHRleHRbKGkgKz0gMSldKTspIHtcbiAgICAgICAgaWYgKG1vZGUgPT09IEZPTERfUVVPVEVEICYmIGNoID09PSAnXFxcXCcpIHtcbiAgICAgICAgICAgIGVzY1N0YXJ0ID0gaTtcbiAgICAgICAgICAgIHN3aXRjaCAodGV4dFtpICsgMV0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd4JzpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAzO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd1JzpcbiAgICAgICAgICAgICAgICAgICAgaSArPSA1O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdVJzpcbiAgICAgICAgICAgICAgICAgICAgaSArPSA5O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlc2NFbmQgPSBpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSBGT0xEX0JMT0NLKVxuICAgICAgICAgICAgICAgIGkgPSBjb25zdW1lTW9yZUluZGVudGVkTGluZXModGV4dCwgaSwgaW5kZW50Lmxlbmd0aCk7XG4gICAgICAgICAgICBlbmQgPSBpICsgaW5kZW50Lmxlbmd0aCArIGVuZFN0ZXA7XG4gICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnICYmXG4gICAgICAgICAgICAgICAgcHJldiAmJlxuICAgICAgICAgICAgICAgIHByZXYgIT09ICcgJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgIT09ICdcXG4nICYmXG4gICAgICAgICAgICAgICAgcHJldiAhPT0gJ1xcdCcpIHtcbiAgICAgICAgICAgICAgICAvLyBzcGFjZSBzdXJyb3VuZGVkIGJ5IG5vbi1zcGFjZSBjYW4gYmUgcmVwbGFjZWQgd2l0aCBuZXdsaW5lICsgaW5kZW50XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRleHRbaSArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0ICYmIG5leHQgIT09ICcgJyAmJiBuZXh0ICE9PSAnXFxuJyAmJiBuZXh0ICE9PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgc3BsaXQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGkgPj0gZW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRzLnB1c2goc3BsaXQpO1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzcGxpdCArIGVuZFN0ZXA7XG4gICAgICAgICAgICAgICAgICAgIHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGl0ZS1zcGFjZSBjb2xsZWN0ZWQgYXQgZW5kIG1heSBzdHJldGNoIHBhc3QgbGluZVdpZHRoXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwcmV2ID09PSAnICcgfHwgcHJldiA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYgPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoID0gdGV4dFsoaSArPSAxKV07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gQWNjb3VudCBmb3IgbmV3bGluZSBlc2NhcGUsIGJ1dCBkb24ndCBicmVhayBwcmVjZWRpbmcgZXNjYXBlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGogPSBpID4gZXNjRW5kICsgMSA/IGkgLSAyIDogZXNjU3RhcnQgLSAxO1xuICAgICAgICAgICAgICAgICAgICAvLyBCYWlsIG91dCBpZiBsaW5lV2lkdGggJiBtaW5Db250ZW50V2lkdGggYXJlIHNob3J0ZXIgdGhhbiBhbiBlc2NhcGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChlc2NhcGVkRm9sZHNbal0pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgZm9sZHMucHVzaChqKTtcbiAgICAgICAgICAgICAgICAgICAgZXNjYXBlZEZvbGRzW2pdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gaiArIGVuZFN0ZXA7XG4gICAgICAgICAgICAgICAgICAgIHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcmV2ID0gY2g7XG4gICAgfVxuICAgIGlmIChvdmVyZmxvdyAmJiBvbk92ZXJmbG93KVxuICAgICAgICBvbk92ZXJmbG93KCk7XG4gICAgaWYgKGZvbGRzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgaWYgKG9uRm9sZClcbiAgICAgICAgb25Gb2xkKCk7XG4gICAgbGV0IHJlcyA9IHRleHQuc2xpY2UoMCwgZm9sZHNbMF0pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm9sZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgZm9sZCA9IGZvbGRzW2ldO1xuICAgICAgICBjb25zdCBlbmQgPSBmb2xkc1tpICsgMV0gfHwgdGV4dC5sZW5ndGg7XG4gICAgICAgIGlmIChmb2xkID09PSAwKVxuICAgICAgICAgICAgcmVzID0gYFxcbiR7aW5kZW50fSR7dGV4dC5zbGljZSgwLCBlbmQpfWA7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09IEZPTERfUVVPVEVEICYmIGVzY2FwZWRGb2xkc1tmb2xkXSlcbiAgICAgICAgICAgICAgICByZXMgKz0gYCR7dGV4dFtmb2xkXX1cXFxcYDtcbiAgICAgICAgICAgIHJlcyArPSBgXFxuJHtpbmRlbnR9JHt0ZXh0LnNsaWNlKGZvbGQgKyAxLCBlbmQpfWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cbi8qKlxuICogUHJlc3VtZXMgYGkgKyAxYCBpcyBhdCB0aGUgc3RhcnQgb2YgYSBsaW5lXG4gKiBAcmV0dXJucyBpbmRleCBvZiBsYXN0IG5ld2xpbmUgaW4gbW9yZS1pbmRlbnRlZCBibG9ja1xuICovXG5mdW5jdGlvbiBjb25zdW1lTW9yZUluZGVudGVkTGluZXModGV4dCwgaSwgaW5kZW50KSB7XG4gICAgbGV0IGVuZCA9IGk7XG4gICAgbGV0IHN0YXJ0ID0gaSArIDE7XG4gICAgbGV0IGNoID0gdGV4dFtzdGFydF07XG4gICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKSB7XG4gICAgICAgIGlmIChpIDwgc3RhcnQgKyBpbmRlbnQpIHtcbiAgICAgICAgICAgIGNoID0gdGV4dFsrK2ldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGNoID0gdGV4dFsrK2ldO1xuICAgICAgICAgICAgfSB3aGlsZSAoY2ggJiYgY2ggIT09ICdcXG4nKTtcbiAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgY2ggPSB0ZXh0W3N0YXJ0XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZW5kO1xufVxuXG5leHBvcnQgeyBGT0xEX0JMT0NLLCBGT0xEX0ZMT1csIEZPTERfUVVPVEVELCBmb2xkRmxvd0xpbmVzIH07XG4iLCJpbXBvcnQgeyBhbmNob3JJc1ZhbGlkIH0gZnJvbSAnLi4vZG9jL2FuY2hvcnMuanMnO1xuaW1wb3J0IHsgaXNQYWlyLCBpc0FsaWFzLCBpc05vZGUsIGlzU2NhbGFyLCBpc0NvbGxlY3Rpb24gfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeVN0cmluZyB9IGZyb20gJy4vc3RyaW5naWZ5U3RyaW5nLmpzJztcblxuZnVuY3Rpb24gY3JlYXRlU3RyaW5naWZ5Q29udGV4dChkb2MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBvcHQgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgYmxvY2tRdW90ZTogdHJ1ZSxcbiAgICAgICAgY29tbWVudFN0cmluZzogc3RyaW5naWZ5Q29tbWVudCxcbiAgICAgICAgZGVmYXVsdEtleVR5cGU6IG51bGwsXG4gICAgICAgIGRlZmF1bHRTdHJpbmdUeXBlOiAnUExBSU4nLFxuICAgICAgICBkaXJlY3RpdmVzOiBudWxsLFxuICAgICAgICBkb3VibGVRdW90ZWRBc0pTT046IGZhbHNlLFxuICAgICAgICBkb3VibGVRdW90ZWRNaW5NdWx0aUxpbmVMZW5ndGg6IDQwLFxuICAgICAgICBmYWxzZVN0cjogJ2ZhbHNlJyxcbiAgICAgICAgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiB0cnVlLFxuICAgICAgICBpbmRlbnRTZXE6IHRydWUsXG4gICAgICAgIGxpbmVXaWR0aDogODAsXG4gICAgICAgIG1pbkNvbnRlbnRXaWR0aDogMjAsXG4gICAgICAgIG51bGxTdHI6ICdudWxsJyxcbiAgICAgICAgc2ltcGxlS2V5czogZmFsc2UsXG4gICAgICAgIHNpbmdsZVF1b3RlOiBudWxsLFxuICAgICAgICB0cnVlU3RyOiAndHJ1ZScsXG4gICAgICAgIHZlcmlmeUFsaWFzT3JkZXI6IHRydWVcbiAgICB9LCBkb2Muc2NoZW1hLnRvU3RyaW5nT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgbGV0IGluRmxvdztcbiAgICBzd2l0Y2ggKG9wdC5jb2xsZWN0aW9uU3R5bGUpIHtcbiAgICAgICAgY2FzZSAnYmxvY2snOlxuICAgICAgICAgICAgaW5GbG93ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmxvdyc6XG4gICAgICAgICAgICBpbkZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpbkZsb3cgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBhbmNob3JzOiBuZXcgU2V0KCksXG4gICAgICAgIGRvYyxcbiAgICAgICAgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiBvcHQuZmxvd0NvbGxlY3Rpb25QYWRkaW5nID8gJyAnIDogJycsXG4gICAgICAgIGluZGVudDogJycsXG4gICAgICAgIGluZGVudFN0ZXA6IHR5cGVvZiBvcHQuaW5kZW50ID09PSAnbnVtYmVyJyA/ICcgJy5yZXBlYXQob3B0LmluZGVudCkgOiAnICAnLFxuICAgICAgICBpbkZsb3csXG4gICAgICAgIG9wdGlvbnM6IG9wdFxuICAgIH07XG59XG5mdW5jdGlvbiBnZXRUYWdPYmplY3QodGFncywgaXRlbSkge1xuICAgIGlmIChpdGVtLnRhZykge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHRhZ3MuZmlsdGVyKHQgPT4gdC50YWcgPT09IGl0ZW0udGFnKTtcbiAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDApXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2guZmluZCh0ID0+IHQuZm9ybWF0ID09PSBpdGVtLmZvcm1hdCkgPz8gbWF0Y2hbMF07XG4gICAgfVxuICAgIGxldCB0YWdPYmogPSB1bmRlZmluZWQ7XG4gICAgbGV0IG9iajtcbiAgICBpZiAoaXNTY2FsYXIoaXRlbSkpIHtcbiAgICAgICAgb2JqID0gaXRlbS52YWx1ZTtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQuaWRlbnRpZnk/LihvYmopKTtcbiAgICAgICAgdGFnT2JqID1cbiAgICAgICAgICAgIG1hdGNoLmZpbmQodCA9PiB0LmZvcm1hdCA9PT0gaXRlbS5mb3JtYXQpID8/IG1hdGNoLmZpbmQodCA9PiAhdC5mb3JtYXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb2JqID0gaXRlbTtcbiAgICAgICAgdGFnT2JqID0gdGFncy5maW5kKHQgPT4gdC5ub2RlQ2xhc3MgJiYgb2JqIGluc3RhbmNlb2YgdC5ub2RlQ2xhc3MpO1xuICAgIH1cbiAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICBjb25zdCBuYW1lID0gb2JqPy5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyB0eXBlb2Ygb2JqO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRhZyBub3QgcmVzb2x2ZWQgZm9yICR7bmFtZX0gdmFsdWVgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhZ09iajtcbn1cbi8vIG5lZWRzIHRvIGJlIGNhbGxlZCBiZWZvcmUgdmFsdWUgc3RyaW5naWZpZXIgdG8gYWxsb3cgZm9yIGNpcmN1bGFyIGFuY2hvciByZWZzXG5mdW5jdGlvbiBzdHJpbmdpZnlQcm9wcyhub2RlLCB0YWdPYmosIHsgYW5jaG9ycywgZG9jIH0pIHtcbiAgICBpZiAoIWRvYy5kaXJlY3RpdmVzKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgY29uc3QgcHJvcHMgPSBbXTtcbiAgICBjb25zdCBhbmNob3IgPSAoaXNTY2FsYXIobm9kZSkgfHwgaXNDb2xsZWN0aW9uKG5vZGUpKSAmJiBub2RlLmFuY2hvcjtcbiAgICBpZiAoYW5jaG9yICYmIGFuY2hvcklzVmFsaWQoYW5jaG9yKSkge1xuICAgICAgICBhbmNob3JzLmFkZChhbmNob3IpO1xuICAgICAgICBwcm9wcy5wdXNoKGAmJHthbmNob3J9YCk7XG4gICAgfVxuICAgIGNvbnN0IHRhZyA9IG5vZGUudGFnID8gbm9kZS50YWcgOiB0YWdPYmouZGVmYXVsdCA/IG51bGwgOiB0YWdPYmoudGFnO1xuICAgIGlmICh0YWcpXG4gICAgICAgIHByb3BzLnB1c2goZG9jLmRpcmVjdGl2ZXMudGFnU3RyaW5nKHRhZykpO1xuICAgIHJldHVybiBwcm9wcy5qb2luKCcgJyk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnkoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgaWYgKGlzUGFpcihpdGVtKSlcbiAgICAgICAgcmV0dXJuIGl0ZW0udG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICBpZiAoaXNBbGlhcyhpdGVtKSkge1xuICAgICAgICBpZiAoY3R4LmRvYy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udG9TdHJpbmcoY3R4KTtcbiAgICAgICAgaWYgKGN0eC5yZXNvbHZlZEFsaWFzZXM/LmhhcyhpdGVtKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IHN0cmluZ2lmeSBjaXJjdWxhciBzdHJ1Y3R1cmUgd2l0aG91dCBhbGlhcyBub2Rlc2ApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGN0eC5yZXNvbHZlZEFsaWFzZXMpXG4gICAgICAgICAgICAgICAgY3R4LnJlc29sdmVkQWxpYXNlcy5hZGQoaXRlbSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY3R4LnJlc29sdmVkQWxpYXNlcyA9IG5ldyBTZXQoW2l0ZW1dKTtcbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnJlc29sdmUoY3R4LmRvYyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IHRhZ09iaiA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBub2RlID0gaXNOb2RlKGl0ZW0pXG4gICAgICAgID8gaXRlbVxuICAgICAgICA6IGN0eC5kb2MuY3JlYXRlTm9kZShpdGVtLCB7IG9uVGFnT2JqOiBvID0+ICh0YWdPYmogPSBvKSB9KTtcbiAgICBpZiAoIXRhZ09iailcbiAgICAgICAgdGFnT2JqID0gZ2V0VGFnT2JqZWN0KGN0eC5kb2Muc2NoZW1hLnRhZ3MsIG5vZGUpO1xuICAgIGNvbnN0IHByb3BzID0gc3RyaW5naWZ5UHJvcHMobm9kZSwgdGFnT2JqLCBjdHgpO1xuICAgIGlmIChwcm9wcy5sZW5ndGggPiAwKVxuICAgICAgICBjdHguaW5kZW50QXRTdGFydCA9IChjdHguaW5kZW50QXRTdGFydCA/PyAwKSArIHByb3BzLmxlbmd0aCArIDE7XG4gICAgY29uc3Qgc3RyID0gdHlwZW9mIHRhZ09iai5zdHJpbmdpZnkgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB0YWdPYmouc3RyaW5naWZ5KG5vZGUsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgOiBpc1NjYWxhcihub2RlKVxuICAgICAgICAgICAgPyBzdHJpbmdpZnlTdHJpbmcobm9kZSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgOiBub2RlLnRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgaWYgKCFwcm9wcylcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICByZXR1cm4gaXNTY2FsYXIobm9kZSkgfHwgc3RyWzBdID09PSAneycgfHwgc3RyWzBdID09PSAnWydcbiAgICAgICAgPyBgJHtwcm9wc30gJHtzdHJ9YFxuICAgICAgICA6IGAke3Byb3BzfVxcbiR7Y3R4LmluZGVudH0ke3N0cn1gO1xufVxuXG5leHBvcnQgeyBjcmVhdGVTdHJpbmdpZnlDb250ZXh0LCBzdHJpbmdpZnkgfTtcbiIsImltcG9ydCB7IGlzTm9kZSwgaXNQYWlyIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuaW1wb3J0IHsgbGluZUNvbW1lbnQsIGluZGVudENvbW1lbnQgfSBmcm9tICcuL3N0cmluZ2lmeUNvbW1lbnQuanMnO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlDb2xsZWN0aW9uKGNvbGxlY3Rpb24sIGN0eCwgb3B0aW9ucykge1xuICAgIGNvbnN0IGZsb3cgPSBjdHguaW5GbG93ID8/IGNvbGxlY3Rpb24uZmxvdztcbiAgICBjb25zdCBzdHJpbmdpZnkgPSBmbG93ID8gc3RyaW5naWZ5Rmxvd0NvbGxlY3Rpb24gOiBzdHJpbmdpZnlCbG9ja0NvbGxlY3Rpb247XG4gICAgcmV0dXJuIHN0cmluZ2lmeShjb2xsZWN0aW9uLCBjdHgsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5QmxvY2tDb2xsZWN0aW9uKHsgY29tbWVudCwgaXRlbXMgfSwgY3R4LCB7IGJsb2NrSXRlbVByZWZpeCwgZmxvd0NoYXJzLCBpdGVtSW5kZW50LCBvbkNob21wS2VlcCwgb25Db21tZW50IH0pIHtcbiAgICBjb25zdCB7IGluZGVudCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSA9IGN0eDtcbiAgICBjb25zdCBpdGVtQ3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7IGluZGVudDogaXRlbUluZGVudCwgdHlwZTogbnVsbCB9KTtcbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7IC8vIGZsYWcgZm9yIHRoZSBwcmVjZWRpbmcgbm9kZSdzIHN0YXR1c1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgIGxldCBjb21tZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGlzTm9kZShpdGVtKSkge1xuICAgICAgICAgICAgaWYgKCFjaG9tcEtlZXAgJiYgaXRlbS5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaXRlbS5jb21tZW50QmVmb3JlLCBjaG9tcEtlZXApO1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudClcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaXRlbS5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzUGFpcihpdGVtKSkge1xuICAgICAgICAgICAgY29uc3QgaWsgPSBpc05vZGUoaXRlbS5rZXkpID8gaXRlbS5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGlrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjaG9tcEtlZXAgJiYgaWsuc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaWsuY29tbWVudEJlZm9yZSwgY2hvbXBLZWVwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IHN0ciA9IHN0cmluZ2lmeShpdGVtLCBpdGVtQ3R4LCAoKSA9PiAoY29tbWVudCA9IG51bGwpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGl0ZW1JbmRlbnQsIGNvbW1lbnRTdHJpbmcoY29tbWVudCkpO1xuICAgICAgICBpZiAoY2hvbXBLZWVwICYmIGNvbW1lbnQpXG4gICAgICAgICAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICAgICAgbGluZXMucHVzaChibG9ja0l0ZW1QcmVmaXggKyBzdHIpO1xuICAgIH1cbiAgICBsZXQgc3RyO1xuICAgIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc3RyID0gZmxvd0NoYXJzLnN0YXJ0ICsgZmxvd0NoYXJzLmVuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0ciA9IGxpbmVzWzBdO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lID0gbGluZXNbaV07XG4gICAgICAgICAgICBzdHIgKz0gbGluZSA/IGBcXG4ke2luZGVudH0ke2xpbmV9YCA6ICdcXG4nO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIHN0ciArPSAnXFxuJyArIGluZGVudENvbW1lbnQoY29tbWVudFN0cmluZyhjb21tZW50KSwgaW5kZW50KTtcbiAgICAgICAgaWYgKG9uQ29tbWVudClcbiAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjaG9tcEtlZXAgJiYgb25DaG9tcEtlZXApXG4gICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgcmV0dXJuIHN0cjtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUZsb3dDb2xsZWN0aW9uKHsgaXRlbXMgfSwgY3R4LCB7IGZsb3dDaGFycywgaXRlbUluZGVudCB9KSB7XG4gICAgY29uc3QgeyBpbmRlbnQsIGluZGVudFN0ZXAsIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogZmNQYWRkaW5nLCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcgfSB9ID0gY3R4O1xuICAgIGl0ZW1JbmRlbnQgKz0gaW5kZW50U3RlcDtcbiAgICBjb25zdCBpdGVtQ3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7XG4gICAgICAgIGluZGVudDogaXRlbUluZGVudCxcbiAgICAgICAgaW5GbG93OiB0cnVlLFxuICAgICAgICB0eXBlOiBudWxsXG4gICAgfSk7XG4gICAgbGV0IHJlcU5ld2xpbmUgPSBmYWxzZTtcbiAgICBsZXQgbGluZXNBdFZhbHVlID0gMDtcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICBsZXQgY29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmIChpc05vZGUoaXRlbSkpIHtcbiAgICAgICAgICAgIGlmIChpdGVtLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpdGVtLmNvbW1lbnRCZWZvcmUsIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGl0ZW0uY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1BhaXIoaXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlrID0gaXNOb2RlKGl0ZW0ua2V5KSA/IGl0ZW0ua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpaykge1xuICAgICAgICAgICAgICAgIGlmIChpay5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpay5jb21tZW50QmVmb3JlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlrLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaXYgPSBpc05vZGUoaXRlbS52YWx1ZSkgPyBpdGVtLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpdikge1xuICAgICAgICAgICAgICAgIGlmIChpdi5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gaXYuY29tbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoaXYuY29tbWVudEJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpdGVtLnZhbHVlID09IG51bGwgJiYgaWs/LmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaWsuY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICBsZXQgc3RyID0gc3RyaW5naWZ5KGl0ZW0sIGl0ZW1DdHgsICgpID0+IChjb21tZW50ID0gbnVsbCkpO1xuICAgICAgICBpZiAoaSA8IGl0ZW1zLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICBzdHIgKz0gJywnO1xuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGl0ZW1JbmRlbnQsIGNvbW1lbnRTdHJpbmcoY29tbWVudCkpO1xuICAgICAgICBpZiAoIXJlcU5ld2xpbmUgJiYgKGxpbmVzLmxlbmd0aCA+IGxpbmVzQXRWYWx1ZSB8fCBzdHIuaW5jbHVkZXMoJ1xcbicpKSlcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICBsaW5lcy5wdXNoKHN0cik7XG4gICAgICAgIGxpbmVzQXRWYWx1ZSA9IGxpbmVzLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSBmbG93Q2hhcnM7XG4gICAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gc3RhcnQgKyBlbmQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoIXJlcU5ld2xpbmUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IGxpbmVzLnJlZHVjZSgoc3VtLCBsaW5lKSA9PiBzdW0gKyBsaW5lLmxlbmd0aCArIDIsIDIpO1xuICAgICAgICAgICAgcmVxTmV3bGluZSA9IGN0eC5vcHRpb25zLmxpbmVXaWR0aCA+IDAgJiYgbGVuID4gY3R4Lm9wdGlvbnMubGluZVdpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXFOZXdsaW5lKSB7XG4gICAgICAgICAgICBsZXQgc3RyID0gc3RhcnQ7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpXG4gICAgICAgICAgICAgICAgc3RyICs9IGxpbmUgPyBgXFxuJHtpbmRlbnRTdGVwfSR7aW5kZW50fSR7bGluZX1gIDogJ1xcbic7XG4gICAgICAgICAgICByZXR1cm4gYCR7c3RyfVxcbiR7aW5kZW50fSR7ZW5kfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7c3RhcnR9JHtmY1BhZGRpbmd9JHtsaW5lcy5qb2luKCcgJyl9JHtmY1BhZGRpbmd9JHtlbmR9YDtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGFkZENvbW1lbnRCZWZvcmUoeyBpbmRlbnQsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0sIGxpbmVzLCBjb21tZW50LCBjaG9tcEtlZXApIHtcbiAgICBpZiAoY29tbWVudCAmJiBjaG9tcEtlZXApXG4gICAgICAgIGNvbW1lbnQgPSBjb21tZW50LnJlcGxhY2UoL15cXG4rLywgJycpO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIGNvbnN0IGljID0gaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGNvbW1lbnQpLCBpbmRlbnQpO1xuICAgICAgICBsaW5lcy5wdXNoKGljLnRyaW1TdGFydCgpKTsgLy8gQXZvaWQgZG91YmxlIGluZGVudCBvbiBmaXJzdCBsaW5lXG4gICAgfVxufVxuXG5leHBvcnQgeyBzdHJpbmdpZnlDb2xsZWN0aW9uIH07XG4iLCIvKipcbiAqIFN0cmluZ2lmaWVzIGEgY29tbWVudC5cbiAqXG4gKiBFbXB0eSBjb21tZW50IGxpbmVzIGFyZSBsZWZ0IGVtcHR5LFxuICogbGluZXMgY29uc2lzdGluZyBvZiBhIHNpbmdsZSBzcGFjZSBhcmUgcmVwbGFjZWQgYnkgYCNgLFxuICogYW5kIGFsbCBvdGhlciBsaW5lcyBhcmUgcHJlZml4ZWQgd2l0aCBhIGAjYC5cbiAqL1xuY29uc3Qgc3RyaW5naWZ5Q29tbWVudCA9IChzdHIpID0+IHN0ci5yZXBsYWNlKC9eKD8hJCkoPzogJCk/L2dtLCAnIycpO1xuZnVuY3Rpb24gaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpIHtcbiAgICBpZiAoL15cXG4rJC8udGVzdChjb21tZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQuc3Vic3RyaW5nKDEpO1xuICAgIHJldHVybiBpbmRlbnQgPyBjb21tZW50LnJlcGxhY2UoL14oPyEgKiQpL2dtLCBpbmRlbnQpIDogY29tbWVudDtcbn1cbmNvbnN0IGxpbmVDb21tZW50ID0gKHN0ciwgaW5kZW50LCBjb21tZW50KSA9PiBzdHIuZW5kc1dpdGgoJ1xcbicpXG4gICAgPyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICA6IGNvbW1lbnQuaW5jbHVkZXMoJ1xcbicpXG4gICAgICAgID8gJ1xcbicgKyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICAgICAgOiAoc3RyLmVuZHNXaXRoKCcgJykgPyAnJyA6ICcgJykgKyBjb21tZW50O1xuXG5leHBvcnQgeyBpbmRlbnRDb21tZW50LCBsaW5lQ29tbWVudCwgc3RyaW5naWZ5Q29tbWVudCB9O1xuIiwiaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RyaW5naWZ5Q29udGV4dCwgc3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuaW1wb3J0IHsgaW5kZW50Q29tbWVudCwgbGluZUNvbW1lbnQgfSBmcm9tICcuL3N0cmluZ2lmeUNvbW1lbnQuanMnO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlEb2N1bWVudChkb2MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGxldCBoYXNEaXJlY3RpdmVzID0gb3B0aW9ucy5kaXJlY3RpdmVzID09PSB0cnVlO1xuICAgIGlmIChvcHRpb25zLmRpcmVjdGl2ZXMgIT09IGZhbHNlICYmIGRvYy5kaXJlY3RpdmVzKSB7XG4gICAgICAgIGNvbnN0IGRpciA9IGRvYy5kaXJlY3RpdmVzLnRvU3RyaW5nKGRvYyk7XG4gICAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goZGlyKTtcbiAgICAgICAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0KVxuICAgICAgICAgICAgaGFzRGlyZWN0aXZlcyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChoYXNEaXJlY3RpdmVzKVxuICAgICAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBjb25zdCBjdHggPSBjcmVhdGVTdHJpbmdpZnlDb250ZXh0KGRvYywgb3B0aW9ucyk7XG4gICAgY29uc3QgeyBjb21tZW50U3RyaW5nIH0gPSBjdHgub3B0aW9ucztcbiAgICBpZiAoZG9jLmNvbW1lbnRCZWZvcmUpIHtcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCAhPT0gMSlcbiAgICAgICAgICAgIGxpbmVzLnVuc2hpZnQoJycpO1xuICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbW1lbnRCZWZvcmUpO1xuICAgICAgICBsaW5lcy51bnNoaWZ0KGluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgfVxuICAgIGxldCBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBsZXQgY29udGVudENvbW1lbnQgPSBudWxsO1xuICAgIGlmIChkb2MuY29udGVudHMpIHtcbiAgICAgICAgaWYgKGlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBpZiAoZG9jLmNvbnRlbnRzLnNwYWNlQmVmb3JlICYmIGhhc0RpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBpZiAoZG9jLmNvbnRlbnRzLmNvbW1lbnRCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbnRlbnRzLmNvbW1lbnRCZWZvcmUpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50Q29tbWVudChjcywgJycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRvcC1sZXZlbCBibG9jayBzY2FsYXJzIG5lZWQgdG8gYmUgaW5kZW50ZWQgaWYgZm9sbG93ZWQgYnkgYSBjb21tZW50XG4gICAgICAgICAgICBjdHguZm9yY2VCbG9ja0luZGVudCA9ICEhZG9jLmNvbW1lbnQ7XG4gICAgICAgICAgICBjb250ZW50Q29tbWVudCA9IGRvYy5jb250ZW50cy5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9uQ2hvbXBLZWVwID0gY29udGVudENvbW1lbnQgPyB1bmRlZmluZWQgOiAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSk7XG4gICAgICAgIGxldCBib2R5ID0gc3RyaW5naWZ5KGRvYy5jb250ZW50cywgY3R4LCAoKSA9PiAoY29udGVudENvbW1lbnQgPSBudWxsKSwgb25DaG9tcEtlZXApO1xuICAgICAgICBpZiAoY29udGVudENvbW1lbnQpXG4gICAgICAgICAgICBib2R5ICs9IGxpbmVDb21tZW50KGJvZHksICcnLCBjb21tZW50U3RyaW5nKGNvbnRlbnRDb21tZW50KSk7XG4gICAgICAgIGlmICgoYm9keVswXSA9PT0gJ3wnIHx8IGJvZHlbMF0gPT09ICc+JykgJiZcbiAgICAgICAgICAgIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnLS0tJykge1xuICAgICAgICAgICAgLy8gVG9wLWxldmVsIGJsb2NrIHNjYWxhcnMgd2l0aCBhIHByZWNlZGluZyBkb2MgbWFya2VyIG91Z2h0IHRvIHVzZSB0aGVcbiAgICAgICAgICAgIC8vIHNhbWUgbGluZSBmb3IgdGhlaXIgaGVhZGVyLlxuICAgICAgICAgICAgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPSBgLS0tICR7Ym9keX1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYm9keSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsaW5lcy5wdXNoKHN0cmluZ2lmeShkb2MuY29udGVudHMsIGN0eCkpO1xuICAgIH1cbiAgICBpZiAoZG9jLmRpcmVjdGl2ZXM/LmRvY0VuZCkge1xuICAgICAgICBpZiAoZG9jLmNvbW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNzID0gY29tbWVudFN0cmluZyhkb2MuY29tbWVudCk7XG4gICAgICAgICAgICBpZiAoY3MuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnLi4uJyk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChpbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgLi4uICR7Y3N9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCcuLi4nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGV0IGRjID0gZG9jLmNvbW1lbnQ7XG4gICAgICAgIGlmIChkYyAmJiBjaG9tcEtlZXApXG4gICAgICAgICAgICBkYyA9IGRjLnJlcGxhY2UoL15cXG4rLywgJycpO1xuICAgICAgICBpZiAoZGMpIHtcbiAgICAgICAgICAgIGlmICgoIWNob21wS2VlcCB8fCBjb250ZW50Q29tbWVudCkgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gIT09ICcnKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgbGluZXMucHVzaChpbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoZGMpLCAnJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKSArICdcXG4nO1xufVxuXG5leHBvcnQgeyBzdHJpbmdpZnlEb2N1bWVudCB9O1xuIiwiZnVuY3Rpb24gc3RyaW5naWZ5TnVtYmVyKHsgZm9ybWF0LCBtaW5GcmFjdGlvbkRpZ2l0cywgdGFnLCB2YWx1ZSB9KSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcpXG4gICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIGNvbnN0IG51bSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZSA6IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKCFpc0Zpbml0ZShudW0pKVxuICAgICAgICByZXR1cm4gaXNOYU4obnVtKSA/ICcubmFuJyA6IG51bSA8IDAgPyAnLS5pbmYnIDogJy5pbmYnO1xuICAgIGxldCBuID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGlmICghZm9ybWF0ICYmXG4gICAgICAgIG1pbkZyYWN0aW9uRGlnaXRzICYmXG4gICAgICAgICghdGFnIHx8IHRhZyA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JykgJiZcbiAgICAgICAgL15cXGQvLnRlc3QobikpIHtcbiAgICAgICAgbGV0IGkgPSBuLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGkgPCAwKSB7XG4gICAgICAgICAgICBpID0gbi5sZW5ndGg7XG4gICAgICAgICAgICBuICs9ICcuJztcbiAgICAgICAgfVxuICAgICAgICBsZXQgZCA9IG1pbkZyYWN0aW9uRGlnaXRzIC0gKG4ubGVuZ3RoIC0gaSAtIDEpO1xuICAgICAgICB3aGlsZSAoZC0tID4gMClcbiAgICAgICAgICAgIG4gKz0gJzAnO1xuICAgIH1cbiAgICByZXR1cm4gbjtcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH07XG4iLCJpbXBvcnQgeyBpc0NvbGxlY3Rpb24sIGlzTm9kZSwgaXNTY2FsYXIsIGlzU2VxIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGxpbmVDb21tZW50LCBpbmRlbnRDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcblxuZnVuY3Rpb24gc3RyaW5naWZ5UGFpcih7IGtleSwgdmFsdWUgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyBhbGxOdWxsVmFsdWVzLCBkb2MsIGluZGVudCwgaW5kZW50U3RlcCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nLCBpbmRlbnRTZXEsIHNpbXBsZUtleXMgfSB9ID0gY3R4O1xuICAgIGxldCBrZXlDb21tZW50ID0gKGlzTm9kZShrZXkpICYmIGtleS5jb21tZW50KSB8fCBudWxsO1xuICAgIGlmIChzaW1wbGVLZXlzKSB7XG4gICAgICAgIGlmIChrZXlDb21tZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dpdGggc2ltcGxlIGtleXMsIGtleSBub2RlcyBjYW5ub3QgaGF2ZSBjb21tZW50cycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NvbGxlY3Rpb24oa2V5KSB8fCAoIWlzTm9kZShrZXkpICYmIHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gJ1dpdGggc2ltcGxlIGtleXMsIGNvbGxlY3Rpb24gY2Fubm90IGJlIHVzZWQgYXMgYSBrZXkgdmFsdWUnO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IGV4cGxpY2l0S2V5ID0gIXNpbXBsZUtleXMgJiZcbiAgICAgICAgKCFrZXkgfHxcbiAgICAgICAgICAgIChrZXlDb21tZW50ICYmIHZhbHVlID09IG51bGwgJiYgIWN0eC5pbkZsb3cpIHx8XG4gICAgICAgICAgICBpc0NvbGxlY3Rpb24oa2V5KSB8fFxuICAgICAgICAgICAgKGlzU2NhbGFyKGtleSlcbiAgICAgICAgICAgICAgICA/IGtleS50eXBlID09PSBTY2FsYXIuQkxPQ0tfRk9MREVEIHx8IGtleS50eXBlID09PSBTY2FsYXIuQkxPQ0tfTElURVJBTFxuICAgICAgICAgICAgICAgIDogdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpKTtcbiAgICBjdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHtcbiAgICAgICAgYWxsTnVsbFZhbHVlczogZmFsc2UsXG4gICAgICAgIGltcGxpY2l0S2V5OiAhZXhwbGljaXRLZXkgJiYgKHNpbXBsZUtleXMgfHwgIWFsbE51bGxWYWx1ZXMpLFxuICAgICAgICBpbmRlbnQ6IGluZGVudCArIGluZGVudFN0ZXBcbiAgICB9KTtcbiAgICBsZXQga2V5Q29tbWVudERvbmUgPSBmYWxzZTtcbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgbGV0IHN0ciA9IHN0cmluZ2lmeShrZXksIGN0eCwgKCkgPT4gKGtleUNvbW1lbnREb25lID0gdHJ1ZSksICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKSk7XG4gICAgaWYgKCFleHBsaWNpdEtleSAmJiAhY3R4LmluRmxvdyAmJiBzdHIubGVuZ3RoID4gMTAyNCkge1xuICAgICAgICBpZiAoc2ltcGxlS2V5cylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2l0aCBzaW1wbGUga2V5cywgc2luZ2xlIGxpbmUgc2NhbGFyIG11c3Qgbm90IHNwYW4gbW9yZSB0aGFuIDEwMjQgY2hhcmFjdGVycycpO1xuICAgICAgICBleHBsaWNpdEtleSA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjdHguaW5GbG93KSB7XG4gICAgICAgIGlmIChhbGxOdWxsVmFsdWVzIHx8IHZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChrZXlDb21tZW50RG9uZSAmJiBvbkNvbW1lbnQpXG4gICAgICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgICAgICAgICByZXR1cm4gc3RyID09PSAnJyA/ICc/JyA6IGV4cGxpY2l0S2V5ID8gYD8gJHtzdHJ9YCA6IHN0cjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgoYWxsTnVsbFZhbHVlcyAmJiAhc2ltcGxlS2V5cykgfHwgKHZhbHVlID09IG51bGwgJiYgZXhwbGljaXRLZXkpKSB7XG4gICAgICAgIHN0ciA9IGA/ICR7c3RyfWA7XG4gICAgICAgIGlmIChrZXlDb21tZW50ICYmICFrZXlDb21tZW50RG9uZSkge1xuICAgICAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyhrZXlDb21tZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgaWYgKGtleUNvbW1lbnREb25lKVxuICAgICAgICBrZXlDb21tZW50ID0gbnVsbDtcbiAgICBpZiAoZXhwbGljaXRLZXkpIHtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKGtleUNvbW1lbnQpKTtcbiAgICAgICAgc3RyID0gYD8gJHtzdHJ9XFxuJHtpbmRlbnR9OmA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHIgPSBgJHtzdHJ9OmA7XG4gICAgICAgIGlmIChrZXlDb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyhrZXlDb21tZW50KSk7XG4gICAgfVxuICAgIGxldCB2c2IsIHZjYiwgdmFsdWVDb21tZW50O1xuICAgIGlmIChpc05vZGUodmFsdWUpKSB7XG4gICAgICAgIHZzYiA9ICEhdmFsdWUuc3BhY2VCZWZvcmU7XG4gICAgICAgIHZjYiA9IHZhbHVlLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgIHZhbHVlQ29tbWVudCA9IHZhbHVlLmNvbW1lbnQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2c2IgPSBmYWxzZTtcbiAgICAgICAgdmNiID0gbnVsbDtcbiAgICAgICAgdmFsdWVDb21tZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICB2YWx1ZSA9IGRvYy5jcmVhdGVOb2RlKHZhbHVlKTtcbiAgICB9XG4gICAgY3R4LmltcGxpY2l0S2V5ID0gZmFsc2U7XG4gICAgaWYgKCFleHBsaWNpdEtleSAmJiAha2V5Q29tbWVudCAmJiBpc1NjYWxhcih2YWx1ZSkpXG4gICAgICAgIGN0eC5pbmRlbnRBdFN0YXJ0ID0gc3RyLmxlbmd0aCArIDE7XG4gICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgaWYgKCFpbmRlbnRTZXEgJiZcbiAgICAgICAgaW5kZW50U3RlcC5sZW5ndGggPj0gMiAmJlxuICAgICAgICAhY3R4LmluRmxvdyAmJlxuICAgICAgICAhZXhwbGljaXRLZXkgJiZcbiAgICAgICAgaXNTZXEodmFsdWUpICYmXG4gICAgICAgICF2YWx1ZS5mbG93ICYmXG4gICAgICAgICF2YWx1ZS50YWcgJiZcbiAgICAgICAgIXZhbHVlLmFuY2hvcikge1xuICAgICAgICAvLyBJZiBpbmRlbnRTZXEgPT09IGZhbHNlLCBjb25zaWRlciAnLSAnIGFzIHBhcnQgb2YgaW5kZW50YXRpb24gd2hlcmUgcG9zc2libGVcbiAgICAgICAgY3R4LmluZGVudCA9IGN0eC5pbmRlbnQuc3Vic3RyaW5nKDIpO1xuICAgIH1cbiAgICBsZXQgdmFsdWVDb21tZW50RG9uZSA9IGZhbHNlO1xuICAgIGNvbnN0IHZhbHVlU3RyID0gc3RyaW5naWZ5KHZhbHVlLCBjdHgsICgpID0+ICh2YWx1ZUNvbW1lbnREb25lID0gdHJ1ZSksICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKSk7XG4gICAgbGV0IHdzID0gJyAnO1xuICAgIGlmIChrZXlDb21tZW50IHx8IHZzYiB8fCB2Y2IpIHtcbiAgICAgICAgd3MgPSB2c2IgPyAnXFxuJyA6ICcnO1xuICAgICAgICBpZiAodmNiKSB7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcodmNiKTtcbiAgICAgICAgICAgIHdzICs9IGBcXG4ke2luZGVudENvbW1lbnQoY3MsIGN0eC5pbmRlbnQpfWA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlU3RyID09PSAnJyAmJiAhY3R4LmluRmxvdykge1xuICAgICAgICAgICAgaWYgKHdzID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICB3cyA9ICdcXG5cXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd3MgKz0gYFxcbiR7Y3R4LmluZGVudH1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCFleHBsaWNpdEtleSAmJiBpc0NvbGxlY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHZzMCA9IHZhbHVlU3RyWzBdO1xuICAgICAgICBjb25zdCBubDAgPSB2YWx1ZVN0ci5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgY29uc3QgaGFzTmV3bGluZSA9IG5sMCAhPT0gLTE7XG4gICAgICAgIGNvbnN0IGZsb3cgPSBjdHguaW5GbG93ID8/IHZhbHVlLmZsb3cgPz8gdmFsdWUuaXRlbXMubGVuZ3RoID09PSAwO1xuICAgICAgICBpZiAoaGFzTmV3bGluZSB8fCAhZmxvdykge1xuICAgICAgICAgICAgbGV0IGhhc1Byb3BzTGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGhhc05ld2xpbmUgJiYgKHZzMCA9PT0gJyYnIHx8IHZzMCA9PT0gJyEnKSkge1xuICAgICAgICAgICAgICAgIGxldCBzcDAgPSB2YWx1ZVN0ci5pbmRleE9mKCcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKHZzMCA9PT0gJyYnICYmXG4gICAgICAgICAgICAgICAgICAgIHNwMCAhPT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgICAgc3AwIDwgbmwwICYmXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3RyW3NwMCArIDFdID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3AwID0gdmFsdWVTdHIuaW5kZXhPZignICcsIHNwMCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3AwID09PSAtMSB8fCBubDAgPCBzcDApXG4gICAgICAgICAgICAgICAgICAgIGhhc1Byb3BzTGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWhhc1Byb3BzTGluZSlcbiAgICAgICAgICAgICAgICB3cyA9IGBcXG4ke2N0eC5pbmRlbnR9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZVN0ciA9PT0gJycgfHwgdmFsdWVTdHJbMF0gPT09ICdcXG4nKSB7XG4gICAgICAgIHdzID0gJyc7XG4gICAgfVxuICAgIHN0ciArPSB3cyArIHZhbHVlU3RyO1xuICAgIGlmIChjdHguaW5GbG93KSB7XG4gICAgICAgIGlmICh2YWx1ZUNvbW1lbnREb25lICYmIG9uQ29tbWVudClcbiAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZUNvbW1lbnQgJiYgIXZhbHVlQ29tbWVudERvbmUpIHtcbiAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyh2YWx1ZUNvbW1lbnQpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG59XG5cbmV4cG9ydCB7IHN0cmluZ2lmeVBhaXIgfTtcbiIsImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBmb2xkRmxvd0xpbmVzLCBGT0xEX1FVT1RFRCwgRk9MRF9GTE9XLCBGT0xEX0JMT0NLIH0gZnJvbSAnLi9mb2xkRmxvd0xpbmVzLmpzJztcblxuY29uc3QgZ2V0Rm9sZE9wdGlvbnMgPSAoY3R4LCBpc0Jsb2NrKSA9PiAoe1xuICAgIGluZGVudEF0U3RhcnQ6IGlzQmxvY2sgPyBjdHguaW5kZW50Lmxlbmd0aCA6IGN0eC5pbmRlbnRBdFN0YXJ0LFxuICAgIGxpbmVXaWR0aDogY3R4Lm9wdGlvbnMubGluZVdpZHRoLFxuICAgIG1pbkNvbnRlbnRXaWR0aDogY3R4Lm9wdGlvbnMubWluQ29udGVudFdpZHRoXG59KTtcbi8vIEFsc28gY2hlY2tzIGZvciBsaW5lcyBzdGFydGluZyB3aXRoICUsIGFzIHBhcnNpbmcgdGhlIG91dHB1dCBhcyBZQU1MIDEuMSB3aWxsXG4vLyBwcmVzdW1lIHRoYXQncyBzdGFydGluZyBhIG5ldyBkb2N1bWVudC5cbmNvbnN0IGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIgPSAoc3RyKSA9PiAvXiglfC0tLXxcXC5cXC5cXC4pL20udGVzdChzdHIpO1xuZnVuY3Rpb24gbGluZUxlbmd0aE92ZXJMaW1pdChzdHIsIGxpbmVXaWR0aCwgaW5kZW50TGVuZ3RoKSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGxpbWl0ID0gbGluZVdpZHRoIC0gaW5kZW50TGVuZ3RoO1xuICAgIGNvbnN0IHN0ckxlbiA9IHN0ci5sZW5ndGg7XG4gICAgaWYgKHN0ckxlbiA8PSBsaW1pdClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwLCBzdGFydCA9IDA7IGkgPCBzdHJMZW47ICsraSkge1xuICAgICAgICBpZiAoc3RyW2ldID09PSAnXFxuJykge1xuICAgICAgICAgICAgaWYgKGkgLSBzdGFydCA+IGxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGlmIChzdHJMZW4gLSBzdGFydCA8PSBsaW1pdClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBkb3VibGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgaWYgKGN0eC5vcHRpb25zLmRvdWJsZVF1b3RlZEFzSlNPTilcbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSB9ID0gY3R4O1xuICAgIGNvbnN0IG1pbk11bHRpTGluZUxlbmd0aCA9IGN0eC5vcHRpb25zLmRvdWJsZVF1b3RlZE1pbk11bHRpTGluZUxlbmd0aDtcbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8IChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGxldCBzdGFydCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDAsIGNoID0ganNvbltpXTsgY2g7IGNoID0ganNvblsrK2ldKSB7XG4gICAgICAgIGlmIChjaCA9PT0gJyAnICYmIGpzb25baSArIDFdID09PSAnXFxcXCcgJiYganNvbltpICsgMl0gPT09ICduJykge1xuICAgICAgICAgICAgLy8gc3BhY2UgYmVmb3JlIG5ld2xpbmUgbmVlZHMgdG8gYmUgZXNjYXBlZCB0byBub3QgYmUgZm9sZGVkXG4gICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSkgKyAnXFxcXCAnO1xuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgICAgY2ggPSAnXFxcXCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXFxcXCcpXG4gICAgICAgICAgICBzd2l0Y2ggKGpzb25baSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBqc29uLnN1YnN0cihpICsgMiwgNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDAwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcMCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMDcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxhJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwYic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXHYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDFiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwODUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxOJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDBhMCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXF8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcyMDI4JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcTCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzIwMjknOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxQJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUuc3Vic3RyKDAsIDIpID09PSAnMDAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxceCcgKyBjb2RlLnN1YnN0cigyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc3Vic3RyKGksIDYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICduJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyAyXSA9PT0gJ1wiJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5sZW5ndGggPCBtaW5NdWx0aUxpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvbGRpbmcgd2lsbCBlYXQgZmlyc3QgbmV3bGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpICsgJ1xcblxcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoanNvbltpICsgMl0gPT09ICdcXFxcJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDNdID09PSAnbicgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyA0XSAhPT0gJ1wiJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW5kZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3BhY2UgYWZ0ZXIgbmV3bGluZSBuZWVkcyB0byBiZSBlc2NhcGVkIHRvIG5vdCBiZSBmb2xkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uW2kgKyAyXSA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgc3RyID0gc3RhcnQgPyBzdHIgKyBqc29uLnNsaWNlKHN0YXJ0KSA6IGpzb247XG4gICAgcmV0dXJuIGltcGxpY2l0S2V5XG4gICAgICAgID8gc3RyXG4gICAgICAgIDogZm9sZEZsb3dMaW5lcyhzdHIsIGluZGVudCwgRk9MRF9RVU9URUQsIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHNpbmdsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgaWYgKGN0eC5vcHRpb25zLnNpbmdsZVF1b3RlID09PSBmYWxzZSB8fFxuICAgICAgICAoY3R4LmltcGxpY2l0S2V5ICYmIHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkgfHxcbiAgICAgICAgL1sgXFx0XVxcbnxcXG5bIFxcdF0vLnRlc3QodmFsdWUpIC8vIHNpbmdsZSBxdW90ZWQgc3RyaW5nIGNhbid0IGhhdmUgbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGFyb3VuZCBuZXdsaW5lXG4gICAgKVxuICAgICAgICByZXR1cm4gZG91YmxlUXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHwgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBjb25zdCByZXMgPSBcIidcIiArIHZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKS5yZXBsYWNlKC9cXG4rL2csIGAkJlxcbiR7aW5kZW50fWApICsgXCInXCI7XG4gICAgcmV0dXJuIGN0eC5pbXBsaWNpdEtleVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IGZvbGRGbG93TGluZXMocmVzLCBpbmRlbnQsIEZPTERfRkxPVywgZ2V0Rm9sZE9wdGlvbnMoY3R4LCBmYWxzZSkpO1xufVxuZnVuY3Rpb24gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpIHtcbiAgICBjb25zdCB7IHNpbmdsZVF1b3RlIH0gPSBjdHgub3B0aW9ucztcbiAgICBsZXQgcXM7XG4gICAgaWYgKHNpbmdsZVF1b3RlID09PSBmYWxzZSlcbiAgICAgICAgcXMgPSBkb3VibGVRdW90ZWRTdHJpbmc7XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGhhc0RvdWJsZSA9IHZhbHVlLmluY2x1ZGVzKCdcIicpO1xuICAgICAgICBjb25zdCBoYXNTaW5nbGUgPSB2YWx1ZS5pbmNsdWRlcyhcIidcIik7XG4gICAgICAgIGlmIChoYXNEb3VibGUgJiYgIWhhc1NpbmdsZSlcbiAgICAgICAgICAgIHFzID0gc2luZ2xlUXVvdGVkU3RyaW5nO1xuICAgICAgICBlbHNlIGlmIChoYXNTaW5nbGUgJiYgIWhhc0RvdWJsZSlcbiAgICAgICAgICAgIHFzID0gZG91YmxlUXVvdGVkU3RyaW5nO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBxcyA9IHNpbmdsZVF1b3RlID8gc2luZ2xlUXVvdGVkU3RyaW5nIDogZG91YmxlUXVvdGVkU3RyaW5nO1xuICAgIH1cbiAgICByZXR1cm4gcXModmFsdWUsIGN0eCk7XG59XG4vLyBUaGUgbmVnYXRpdmUgbG9va2JlaGluZCBhdm9pZHMgYSBwb2x5bm9taWFsIHNlYXJjaCxcbi8vIGJ1dCBpc24ndCBzdXBwb3J0ZWQgeWV0IG9uIFNhZmFyaTogaHR0cHM6Ly9jYW5pdXNlLmNvbS9qcy1yZWdleHAtbG9va2JlaGluZFxubGV0IGJsb2NrRW5kTmV3bGluZXM7XG50cnkge1xuICAgIGJsb2NrRW5kTmV3bGluZXMgPSBuZXcgUmVnRXhwKCcoXnwoPzwhXFxuKSlcXG4rKD8hXFxufCQpJywgJ2cnKTtcbn1cbmNhdGNoIHtcbiAgICBibG9ja0VuZE5ld2xpbmVzID0gL1xcbisoPyFcXG58JCkvZztcbn1cbmZ1bmN0aW9uIGJsb2NrU3RyaW5nKHsgY29tbWVudCwgdHlwZSwgdmFsdWUgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyBibG9ja1F1b3RlLCBjb21tZW50U3RyaW5nLCBsaW5lV2lkdGggfSA9IGN0eC5vcHRpb25zO1xuICAgIC8vIDEuIEJsb2NrIGNhbid0IGVuZCBpbiB3aGl0ZXNwYWNlIHVubGVzcyB0aGUgbGFzdCBsaW5lIGlzIG5vbi1lbXB0eS5cbiAgICAvLyAyLiBTdHJpbmdzIGNvbnNpc3Rpbmcgb2Ygb25seSB3aGl0ZXNwYWNlIGFyZSBiZXN0IHJlbmRlcmVkIGV4cGxpY2l0bHkuXG4gICAgaWYgKCFibG9ja1F1b3RlIHx8IC9cXG5bXFx0IF0rJC8udGVzdCh2YWx1ZSkgfHwgL15cXHMqJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICB9XG4gICAgY29uc3QgaW5kZW50ID0gY3R4LmluZGVudCB8fFxuICAgICAgICAoY3R4LmZvcmNlQmxvY2tJbmRlbnQgfHwgY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkgPyAnICAnIDogJycpO1xuICAgIGNvbnN0IGxpdGVyYWwgPSBibG9ja1F1b3RlID09PSAnbGl0ZXJhbCdcbiAgICAgICAgPyB0cnVlXG4gICAgICAgIDogYmxvY2tRdW90ZSA9PT0gJ2ZvbGRlZCcgfHwgdHlwZSA9PT0gU2NhbGFyLkJMT0NLX0ZPTERFRFxuICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgOiB0eXBlID09PSBTY2FsYXIuQkxPQ0tfTElURVJBTFxuICAgICAgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgICAgIDogIWxpbmVMZW5ndGhPdmVyTGltaXQodmFsdWUsIGxpbmVXaWR0aCwgaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIGxpdGVyYWwgPyAnfFxcbicgOiAnPlxcbic7XG4gICAgLy8gZGV0ZXJtaW5lIGNob21waW5nIGZyb20gd2hpdGVzcGFjZSBhdCB2YWx1ZSBlbmRcbiAgICBsZXQgY2hvbXA7XG4gICAgbGV0IGVuZFN0YXJ0O1xuICAgIGZvciAoZW5kU3RhcnQgPSB2YWx1ZS5sZW5ndGg7IGVuZFN0YXJ0ID4gMDsgLS1lbmRTdGFydCkge1xuICAgICAgICBjb25zdCBjaCA9IHZhbHVlW2VuZFN0YXJ0IC0gMV07XG4gICAgICAgIGlmIChjaCAhPT0gJ1xcbicgJiYgY2ggIT09ICdcXHQnICYmIGNoICE9PSAnICcpXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IGVuZCA9IHZhbHVlLnN1YnN0cmluZyhlbmRTdGFydCk7XG4gICAgY29uc3QgZW5kTmxQb3MgPSBlbmQuaW5kZXhPZignXFxuJyk7XG4gICAgaWYgKGVuZE5sUG9zID09PSAtMSkge1xuICAgICAgICBjaG9tcCA9ICctJzsgLy8gc3RyaXBcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUgPT09IGVuZCB8fCBlbmRObFBvcyAhPT0gZW5kLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgY2hvbXAgPSAnKyc7IC8vIGtlZXBcbiAgICAgICAgaWYgKG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNob21wID0gJyc7IC8vIGNsaXBcbiAgICB9XG4gICAgaWYgKGVuZCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDAsIC1lbmQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGVuZFtlbmQubGVuZ3RoIC0gMV0gPT09ICdcXG4nKVxuICAgICAgICAgICAgZW5kID0gZW5kLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgZW5kID0gZW5kLnJlcGxhY2UoYmxvY2tFbmROZXdsaW5lcywgYCQmJHtpbmRlbnR9YCk7XG4gICAgfVxuICAgIC8vIGRldGVybWluZSBpbmRlbnQgaW5kaWNhdG9yIGZyb20gd2hpdGVzcGFjZSBhdCB2YWx1ZSBzdGFydFxuICAgIGxldCBzdGFydFdpdGhTcGFjZSA9IGZhbHNlO1xuICAgIGxldCBzdGFydEVuZDtcbiAgICBsZXQgc3RhcnRObFBvcyA9IC0xO1xuICAgIGZvciAoc3RhcnRFbmQgPSAwOyBzdGFydEVuZCA8IHZhbHVlLmxlbmd0aDsgKytzdGFydEVuZCkge1xuICAgICAgICBjb25zdCBjaCA9IHZhbHVlW3N0YXJ0RW5kXTtcbiAgICAgICAgaWYgKGNoID09PSAnICcpXG4gICAgICAgICAgICBzdGFydFdpdGhTcGFjZSA9IHRydWU7XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHN0YXJ0TmxQb3MgPSBzdGFydEVuZDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBzdGFydCA9IHZhbHVlLnN1YnN0cmluZygwLCBzdGFydE5sUG9zIDwgc3RhcnRFbmQgPyBzdGFydE5sUG9zICsgMSA6IHN0YXJ0RW5kKTtcbiAgICBpZiAoc3RhcnQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoc3RhcnQubGVuZ3RoKTtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5yZXBsYWNlKC9cXG4rL2csIGAkJiR7aW5kZW50fWApO1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnRTaXplID0gaW5kZW50ID8gJzInIDogJzEnOyAvLyByb290IGlzIGF0IC0xXG4gICAgbGV0IGhlYWRlciA9IChsaXRlcmFsID8gJ3wnIDogJz4nKSArIChzdGFydFdpdGhTcGFjZSA/IGluZGVudFNpemUgOiAnJykgKyBjaG9tcDtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBoZWFkZXIgKz0gJyAnICsgY29tbWVudFN0cmluZyhjb21tZW50LnJlcGxhY2UoLyA/W1xcclxcbl0rL2csICcgJykpO1xuICAgICAgICBpZiAob25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGlmIChsaXRlcmFsKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICAgICAgcmV0dXJuIGAke2hlYWRlcn1cXG4ke2luZGVudH0ke3N0YXJ0fSR7dmFsdWV9JHtlbmR9YDtcbiAgICB9XG4gICAgdmFsdWUgPSB2YWx1ZVxuICAgICAgICAucmVwbGFjZSgvXFxuKy9nLCAnXFxuJCYnKVxuICAgICAgICAucmVwbGFjZSgvKD86XnxcXG4pKFtcXHQgXS4qKSg/OihbXFxuXFx0IF0qKVxcbig/IVtcXG5cXHQgXSkpPy9nLCAnJDEkMicpIC8vIG1vcmUtaW5kZW50ZWQgbGluZXMgYXJlbid0IGZvbGRlZFxuICAgICAgICAvLyAgICAgICAgICAgICAgICBeIG1vcmUtaW5kLiBeIGVtcHR5ICAgICBeIGNhcHR1cmUgbmV4dCBlbXB0eSBsaW5lcyBvbmx5IGF0IGVuZCBvZiBpbmRlbnRcbiAgICAgICAgLnJlcGxhY2UoL1xcbisvZywgYCQmJHtpbmRlbnR9YCk7XG4gICAgY29uc3QgYm9keSA9IGZvbGRGbG93TGluZXMoYCR7c3RhcnR9JHt2YWx1ZX0ke2VuZH1gLCBpbmRlbnQsIEZPTERfQkxPQ0ssIGdldEZvbGRPcHRpb25zKGN0eCwgdHJ1ZSkpO1xuICAgIHJldHVybiBgJHtoZWFkZXJ9XFxuJHtpbmRlbnR9JHtib2R5fWA7XG59XG5mdW5jdGlvbiBwbGFpblN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IHR5cGUsIHZhbHVlIH0gPSBpdGVtO1xuICAgIGNvbnN0IHsgYWN0dWFsU3RyaW5nLCBpbXBsaWNpdEtleSwgaW5kZW50LCBpbmRlbnRTdGVwLCBpbkZsb3cgfSA9IGN0eDtcbiAgICBpZiAoKGltcGxpY2l0S2V5ICYmIHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkgfHxcbiAgICAgICAgKGluRmxvdyAmJiAvW1tcXF17fSxdLy50ZXN0KHZhbHVlKSkpIHtcbiAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICB9XG4gICAgaWYgKCF2YWx1ZSB8fFxuICAgICAgICAvXltcXG5cXHQgLFtcXF17fSMmKiF8PidcIiVAYF18Xls/LV0kfF5bPy1dWyBcXHRdfFtcXG46XVsgXFx0XXxbIFxcdF1cXG58W1xcblxcdCBdI3xbXFxuXFx0IDpdJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgLy8gbm90IGFsbG93ZWQ6XG4gICAgICAgIC8vIC0gZW1wdHkgc3RyaW5nLCAnLScgb3IgJz8nXG4gICAgICAgIC8vIC0gc3RhcnQgd2l0aCBhbiBpbmRpY2F0b3IgY2hhcmFjdGVyIChleGNlcHQgWz86LV0pIG9yIC9bPy1dIC9cbiAgICAgICAgLy8gLSAnXFxuICcsICc6ICcgb3IgJyBcXG4nIGFueXdoZXJlXG4gICAgICAgIC8vIC0gJyMnIG5vdCBwcmVjZWRlZCBieSBhIG5vbi1zcGFjZSBjaGFyXG4gICAgICAgIC8vIC0gZW5kIHdpdGggJyAnIG9yICc6J1xuICAgICAgICByZXR1cm4gaW1wbGljaXRLZXkgfHwgaW5GbG93IHx8ICF2YWx1ZS5pbmNsdWRlcygnXFxuJylcbiAgICAgICAgICAgID8gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpXG4gICAgICAgICAgICA6IGJsb2NrU3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxuICAgIGlmICghaW1wbGljaXRLZXkgJiZcbiAgICAgICAgIWluRmxvdyAmJlxuICAgICAgICB0eXBlICE9PSBTY2FsYXIuUExBSU4gJiZcbiAgICAgICAgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgIC8vIFdoZXJlIGFsbG93ZWQgJiB0eXBlIG5vdCBzZXQgZXhwbGljaXRseSwgcHJlZmVyIGJsb2NrIHN0eWxlIGZvciBtdWx0aWxpbmUgc3RyaW5nc1xuICAgICAgICByZXR1cm4gYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG4gICAgaWYgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpKSB7XG4gICAgICAgIGlmIChpbmRlbnQgPT09ICcnKSB7XG4gICAgICAgICAgICBjdHguZm9yY2VCbG9ja0luZGVudCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbXBsaWNpdEtleSAmJiBpbmRlbnQgPT09IGluZGVudFN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc3RyID0gdmFsdWUucmVwbGFjZSgvXFxuKy9nLCBgJCZcXG4ke2luZGVudH1gKTtcbiAgICAvLyBWZXJpZnkgdGhhdCBvdXRwdXQgd2lsbCBiZSBwYXJzZWQgYXMgYSBzdHJpbmcsIGFzIGUuZy4gcGxhaW4gbnVtYmVycyBhbmRcbiAgICAvLyBib29sZWFucyBnZXQgcGFyc2VkIHdpdGggdGhvc2UgdHlwZXMgaW4gdjEuMiAoZS5nLiAnNDInLCAndHJ1ZScgJiAnMC45ZS0zJyksXG4gICAgLy8gYW5kIG90aGVycyBpbiB2MS4xLlxuICAgIGlmIChhY3R1YWxTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVzdCA9ICh0YWcpID0+IHRhZy5kZWZhdWx0ICYmIHRhZy50YWcgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInICYmIHRhZy50ZXN0Py50ZXN0KHN0cik7XG4gICAgICAgIGNvbnN0IHsgY29tcGF0LCB0YWdzIH0gPSBjdHguZG9jLnNjaGVtYTtcbiAgICAgICAgaWYgKHRhZ3Muc29tZSh0ZXN0KSB8fCBjb21wYXQ/LnNvbWUodGVzdCkpXG4gICAgICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICByZXR1cm4gaW1wbGljaXRLZXlcbiAgICAgICAgPyBzdHJcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzKHN0ciwgaW5kZW50LCBGT0xEX0ZMT1csIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeVN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5LCBpbkZsb3cgfSA9IGN0eDtcbiAgICBjb25zdCBzcyA9IHR5cGVvZiBpdGVtLnZhbHVlID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGl0ZW1cbiAgICAgICAgOiBPYmplY3QuYXNzaWduKHt9LCBpdGVtLCB7IHZhbHVlOiBTdHJpbmcoaXRlbS52YWx1ZSkgfSk7XG4gICAgbGV0IHsgdHlwZSB9ID0gaXRlbTtcbiAgICBpZiAodHlwZSAhPT0gU2NhbGFyLlFVT1RFX0RPVUJMRSkge1xuICAgICAgICAvLyBmb3JjZSBkb3VibGUgcXVvdGVzIG9uIGNvbnRyb2wgY2hhcmFjdGVycyAmIHVucGFpcmVkIHN1cnJvZ2F0ZXNcbiAgICAgICAgaWYgKC9bXFx4MDAtXFx4MDhcXHgwYi1cXHgxZlxceDdmLVxceDlmXFx1e0Q4MDB9LVxcdXtERkZGfV0vdS50ZXN0KHNzLnZhbHVlKSlcbiAgICAgICAgICAgIHR5cGUgPSBTY2FsYXIuUVVPVEVfRE9VQkxFO1xuICAgIH1cbiAgICBjb25zdCBfc3RyaW5naWZ5ID0gKF90eXBlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLkJMT0NLX0ZPTERFRDpcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLkJMT0NLX0xJVEVSQUw6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGltcGxpY2l0S2V5IHx8IGluRmxvd1xuICAgICAgICAgICAgICAgICAgICA/IHF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KSAvLyBibG9ja3MgYXJlIG5vdCB2YWxpZCBpbnNpZGUgZmxvdyBjb250YWluZXJzXG4gICAgICAgICAgICAgICAgICAgIDogYmxvY2tTdHJpbmcoc3MsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5RVU9URV9ET1VCTEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdWJsZVF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlFVT1RFX1NJTkdMRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gc2luZ2xlUXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuUExBSU46XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBsYWluU3RyaW5nKHNzLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgbGV0IHJlcyA9IF9zdHJpbmdpZnkodHlwZSk7XG4gICAgaWYgKHJlcyA9PT0gbnVsbCkge1xuICAgICAgICBjb25zdCB7IGRlZmF1bHRLZXlUeXBlLCBkZWZhdWx0U3RyaW5nVHlwZSB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgICAgIGNvbnN0IHQgPSAoaW1wbGljaXRLZXkgJiYgZGVmYXVsdEtleVR5cGUpIHx8IGRlZmF1bHRTdHJpbmdUeXBlO1xuICAgICAgICByZXMgPSBfc3RyaW5naWZ5KHQpO1xuICAgICAgICBpZiAocmVzID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBkZWZhdWx0IHN0cmluZyB0eXBlICR7dH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5U3RyaW5nIH07XG4iLCJpbXBvcnQgeyBpc0RvY3VtZW50LCBpc05vZGUsIGlzUGFpciwgaXNDb2xsZWN0aW9uLCBpc01hcCwgaXNTZXEsIGlzU2NhbGFyLCBpc0FsaWFzIH0gZnJvbSAnLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5cbmNvbnN0IEJSRUFLID0gU3ltYm9sKCdicmVhayB2aXNpdCcpO1xuY29uc3QgU0tJUCA9IFN5bWJvbCgnc2tpcCBjaGlsZHJlbicpO1xuY29uc3QgUkVNT1ZFID0gU3ltYm9sKCdyZW1vdmUgbm9kZScpO1xuLyoqXG4gKiBBcHBseSBhIHZpc2l0b3IgdG8gYW4gQVNUIG5vZGUgb3IgZG9jdW1lbnQuXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gYG5vZGVgLCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICAgLSBga2V5YDogRm9yIHNlcXVlbmNlIHZhbHVlcyBhbmQgbWFwIGBQYWlyYCwgdGhlIG5vZGUncyBpbmRleCBpbiB0aGVcbiAqICAgICBjb2xsZWN0aW9uLiBXaXRoaW4gYSBgUGFpcmAsIGAna2V5J2Agb3IgYCd2YWx1ZSdgLCBjb3JyZXNwb25kaW5nbHkuXG4gKiAgICAgYG51bGxgIGZvciB0aGUgcm9vdCBub2RlLlxuICogICAtIGBub2RlYDogVGhlIGN1cnJlbnQgbm9kZS5cbiAqICAgLSBgcGF0aGA6IFRoZSBhbmNlc3RyeSBvZiB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBjb250aW51ZSB3aXRoIG5leHRcbiAqICAgICBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYE5vZGVgOiBSZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgYnkgdmlzaXRpbmcgaXRcbiAqICAgLSBgbnVtYmVyYDogV2hpbGUgaXRlcmF0aW5nIHRoZSBpdGVtcyBvZiBhIHNlcXVlbmNlIG9yIG1hcCwgc2V0IHRoZSBpbmRleFxuICogICAgIG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWYgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiAgICAgbm9kZSBoYXMgY2hhbmdlZC5cbiAqXG4gKiBJZiBgdmlzaXRvcmAgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYWxsIHZhbHVlc1xuICogZW5jb3VudGVyZWQgaW4gdGhlIHRyZWUsIGluY2x1ZGluZyBlLmcuIGBudWxsYCB2YWx1ZXMuIEFsdGVybmF0aXZlbHksXG4gKiBzZXBhcmF0ZSB2aXNpdG9yIGZ1bmN0aW9ucyBtYXkgYmUgZGVmaW5lZCBmb3IgZWFjaCBgTWFwYCwgYFBhaXJgLCBgU2VxYCxcbiAqIGBBbGlhc2AgYW5kIGBTY2FsYXJgIG5vZGUuIFRvIGRlZmluZSB0aGUgc2FtZSB2aXNpdG9yIGZ1bmN0aW9uIGZvciBtb3JlIHRoYW5cbiAqIG9uZSBub2RlIHR5cGUsIHVzZSB0aGUgYENvbGxlY3Rpb25gIChtYXAgYW5kIHNlcSksIGBWYWx1ZWAgKG1hcCwgc2VxICYgc2NhbGFyKVxuICogYW5kIGBOb2RlYCAoYWxpYXMsIG1hcCwgc2VxICYgc2NhbGFyKSB0YXJnZXRzLiBPZiBhbGwgdGhlc2UsIG9ubHkgdGhlIG1vc3RcbiAqIHNwZWNpZmljIGRlZmluZWQgb25lIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBub2RlLlxuICovXG5mdW5jdGlvbiB2aXNpdChub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IHZpc2l0XyhudWxsLCBub2RlLmNvbnRlbnRzLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbbm9kZV0pKTtcbiAgICAgICAgaWYgKGNkID09PSBSRU1PVkUpXG4gICAgICAgICAgICBub2RlLmNvbnRlbnRzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB2aXNpdF8obnVsbCwgbm9kZSwgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW10pKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXQuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0LlNLSVAgPSBTS0lQO1xuLyoqIFJlbW92ZSB0aGUgY3VycmVudCBub2RlICovXG52aXNpdC5SRU1PVkUgPSBSRU1PVkU7XG5mdW5jdGlvbiB2aXNpdF8oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlzTm9kZShjdHJsKSB8fCBpc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0XyhrZXksIGN0cmwsIHZpc2l0b3IsIHBhdGgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGN0cmwgIT09ICdzeW1ib2wnKSB7XG4gICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gdmlzaXRfKGksIG5vZGUuaXRlbXNbaV0sIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBjb25zdCBjayA9IHZpc2l0Xygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gdmlzaXRfKCd2YWx1ZScsIG5vZGUudmFsdWUsIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGN2ID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjdiA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUudmFsdWUgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHJsO1xufVxuLyoqXG4gKiBBcHBseSBhbiBhc3luYyB2aXNpdG9yIHRvIGFuIEFTVCBub2RlIG9yIGRvY3VtZW50LlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIGBub2RlYCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0aHJlZSBhcmd1bWVudHM6XG4gKiAgIC0gYGtleWA6IEZvciBzZXF1ZW5jZSB2YWx1ZXMgYW5kIG1hcCBgUGFpcmAsIHRoZSBub2RlJ3MgaW5kZXggaW4gdGhlXG4gKiAgICAgY29sbGVjdGlvbi4gV2l0aGluIGEgYFBhaXJgLCBgJ2tleSdgIG9yIGAndmFsdWUnYCwgY29ycmVzcG9uZGluZ2x5LlxuICogICAgIGBudWxsYCBmb3IgdGhlIHJvb3Qgbm9kZS5cbiAqICAgLSBgbm9kZWA6IFRoZSBjdXJyZW50IG5vZGUuXG4gKiAgIC0gYHBhdGhgOiBUaGUgYW5jZXN0cnkgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgUHJvbWlzZWA6IE11c3QgcmVzb2x2ZSB0byBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWx1ZXNcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSwgY29udGludWUgd2l0aCBuZXh0XG4gKiAgICAgc2libGluZ1xuICogICAtIGB2aXNpdC5CUkVBS2A6IFRlcm1pbmF0ZSB0cmF2ZXJzYWwgY29tcGxldGVseVxuICogICAtIGB2aXNpdC5SRU1PVkVgOiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSB3aXRoIHRoZSBuZXh0IG9uZVxuICogICAtIGBOb2RlYDogUmVwbGFjZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIGJ5IHZpc2l0aW5nIGl0XG4gKiAgIC0gYG51bWJlcmA6IFdoaWxlIGl0ZXJhdGluZyB0aGUgaXRlbXMgb2YgYSBzZXF1ZW5jZSBvciBtYXAsIHNldCB0aGUgaW5kZXhcbiAqICAgICBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudFxuICogICAgIG5vZGUgaGFzIGNoYW5nZWQuXG4gKlxuICogSWYgYHZpc2l0b3JgIGlzIGEgc2luZ2xlIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGFsbCB2YWx1ZXNcbiAqIGVuY291bnRlcmVkIGluIHRoZSB0cmVlLCBpbmNsdWRpbmcgZS5nLiBgbnVsbGAgdmFsdWVzLiBBbHRlcm5hdGl2ZWx5LFxuICogc2VwYXJhdGUgdmlzaXRvciBmdW5jdGlvbnMgbWF5IGJlIGRlZmluZWQgZm9yIGVhY2ggYE1hcGAsIGBQYWlyYCwgYFNlcWAsXG4gKiBgQWxpYXNgIGFuZCBgU2NhbGFyYCBub2RlLiBUbyBkZWZpbmUgdGhlIHNhbWUgdmlzaXRvciBmdW5jdGlvbiBmb3IgbW9yZSB0aGFuXG4gKiBvbmUgbm9kZSB0eXBlLCB1c2UgdGhlIGBDb2xsZWN0aW9uYCAobWFwIGFuZCBzZXEpLCBgVmFsdWVgIChtYXAsIHNlcSAmIHNjYWxhcilcbiAqIGFuZCBgTm9kZWAgKGFsaWFzLCBtYXAsIHNlcSAmIHNjYWxhcikgdGFyZ2V0cy4gT2YgYWxsIHRoZXNlLCBvbmx5IHRoZSBtb3N0XG4gKiBzcGVjaWZpYyBkZWZpbmVkIG9uZSB3aWxsIGJlIHVzZWQgZm9yIGVhY2ggbm9kZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luYyhub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUuY29udGVudHMsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtub2RlXSkpO1xuICAgICAgICBpZiAoY2QgPT09IFJFTU9WRSlcbiAgICAgICAgICAgIG5vZGUuY29udGVudHMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtdKSk7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0QXN5bmMuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuUkVNT1ZFID0gUkVNT1ZFO1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luY18oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGF3YWl0IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlzTm9kZShjdHJsKSB8fCBpc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0QXN5bmNfKGtleSwgY3RybCwgdmlzaXRvciwgcGF0aCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY3RybCAhPT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBhd2FpdCB2aXNpdEFzeW5jXyhpLCBub2RlLml0ZW1zW2ldLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzUGFpcihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgY29uc3QgY2sgPSBhd2FpdCB2aXNpdEFzeW5jXygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gYXdhaXQgdmlzaXRBc3luY18oJ3ZhbHVlJywgbm9kZS52YWx1ZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY3YgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGN2ID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0cmw7XG59XG5mdW5jdGlvbiBpbml0VmlzaXRvcih2aXNpdG9yKSB7XG4gICAgaWYgKHR5cGVvZiB2aXNpdG9yID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAodmlzaXRvci5Db2xsZWN0aW9uIHx8IHZpc2l0b3IuTm9kZSB8fCB2aXNpdG9yLlZhbHVlKSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBBbGlhczogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBTY2FsYXI6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Ob2RlXG4gICAgICAgIH0sIHZpc2l0b3IuVmFsdWUgJiYge1xuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2NhbGFyOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLlZhbHVlXG4gICAgICAgIH0sIHZpc2l0b3IuQ29sbGVjdGlvbiAmJiB7XG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuQ29sbGVjdGlvbixcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Db2xsZWN0aW9uXG4gICAgICAgIH0sIHZpc2l0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdmlzaXRvcjtcbn1cbmZ1bmN0aW9uIGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCkge1xuICAgIGlmICh0eXBlb2YgdmlzaXRvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHZpc2l0b3Ioa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNNYXAobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLk1hcD8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlzU2VxKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5TZXE/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc1BhaXIobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlBhaXI/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc1NjYWxhcihub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuU2NhbGFyPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNBbGlhcyhub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuQWxpYXM/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiByZXBsYWNlTm9kZShrZXksIHBhdGgsIG5vZGUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gICAgaWYgKGlzQ29sbGVjdGlvbihwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5pdGVtc1trZXldID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQYWlyKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2tleScpXG4gICAgICAgICAgICBwYXJlbnQua2V5ID0gbm9kZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFyZW50LnZhbHVlID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNEb2N1bWVudChwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5jb250ZW50cyA9IG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwdCA9IGlzQWxpYXMocGFyZW50KSA/ICdhbGlhcycgOiAnc2NhbGFyJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVwbGFjZSBub2RlIHdpdGggJHtwdH0gcGFyZW50YCk7XG4gICAgfVxufVxuXG5leHBvcnQgeyB2aXNpdCwgdmlzaXRBc3luYyB9O1xuIiwiLy8gYGV4cG9ydCAqIGFzIGRlZmF1bHQgZnJvbSAuLi5gIGZhaWxzIG9uIFdlYnBhY2sgdjRcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9lZW1lbGkveWFtbC9pc3N1ZXMvMjI4XG5pbXBvcnQgKiBhcyBZQU1MIGZyb20gJy4vZGlzdC9pbmRleC5qcydcbmV4cG9ydCBkZWZhdWx0IFlBTUxcbmV4cG9ydCAqIGZyb20gJy4vZGlzdC9pbmRleC5qcydcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvcGRsX3ZpZXdlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==