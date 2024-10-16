import {stringify} from 'yaml';
import {PdlBlocks, PdlBlock, Join} from './pdl_ast';
import {match, P} from 'ts-pattern';
import {map_block_children} from './pdl_ast_utils';

export function show_output(data: PdlBlocks) {
  const div = document.createElement('div');
  div.classList.add('pdl_block');
  match(data)
    .with(P.union(P.string, P.number), output => {
      div.innerHTML = htmlize(output);
    })
    .with({contribute: P.union([], ['context'])}, () => {
      div.classList.add('pdl_show_result_false');
      div.innerHTML = '☐';
    })
    .with({result: P.string}, data => {
      div.innerHTML = htmlize(data.result);
    })
    .with({result: P._}, data => {
      const code = document.createElement('pre');
      code.innerHTML = htmlize(data.result);
      div.appendChild(code);
    })
    .otherwise(() => {
      div.innerHTML = '☐';
    });
  switch_div_on_click(div, show_program, data);
  return div;
}

export function show_program(blocks: PdlBlocks) {
  return show_lastOf(blocks);
}

// export function show_blocks(iteration_type: IterationType, blocks: PdlBlocks) {
//   return match(iteration_type)
//     .with('text', _ => show_text(blocks))
//     .with('lastOf', _ => show_lastOf(blocks))
//     .with('array', _ => show_array(blocks))
//     .exhaustive();
// }

export function show_text(
  blocks: PdlBlocks[] | PdlBlocks,
  join_str: string | undefined
) {
  const doc_fragment = document.createDocumentFragment();
  const join_child = document.createElement('div');
  join_child.innerHTML = join_str ?? '';
  match(blocks)
    .with(P.array(P._), data => {
      let first = true;
      for (const doc of data) {
        if (first) {
          first = false;
        } else {
          doc_fragment.appendChild(join_child);
        }
        const child = show_program(doc);
        doc_fragment.appendChild(child);
      }
    })
    .otherwise(block => {
      const child = show_block(block);
      doc_fragment.appendChild(child);
    });
  return doc_fragment;
}

export function show_lastOf(blocks: PdlBlocks[] | PdlBlock) {
  const doc_fragment = document.createDocumentFragment();
  match(blocks)
    .with(P.array(P._), data => {
      if (data.length > 0) {
        for (const doc of data.slice(0, -1)) {
          const child = document.createElement('div');
          child.classList.add('pdl_show_result_false');
          const child_body = show_program(doc);
          child.appendChild(child_body);
          doc_fragment.appendChild(child);
        }
        const child = show_program(data[data.length - 1]);
        doc_fragment.appendChild(child);
      }
    })
    .otherwise(block => {
      const child = show_block(block);
      doc_fragment.appendChild(child);
    });
  return doc_fragment;
}

export function show_array(array: PdlBlocks[] | PdlBlock) {
  const doc_fragment = document.createDocumentFragment();
  const open_bracket = document.createElement('pre');
  open_bracket.innerHTML = '[';
  const comma = () => {
    const comma = document.createElement('pre');
    comma.innerHTML = ',';
    return comma;
  };
  const close_bracket = document.createElement('pre');
  close_bracket.innerHTML = ']';
  doc_fragment.appendChild(open_bracket);
  match(array)
    .with(P.array(P._), data => {
      for (const doc of data) {
        const child = show_program(doc);
        doc_fragment.appendChild(child);
        doc_fragment.appendChild(comma());
      }
    })
    .otherwise(block => {
      const child = show_block(block);
      doc_fragment.appendChild(child);
    });
  doc_fragment.appendChild(close_bracket);
  return doc_fragment;
}

export function show_object(object: {[key: string]: PdlBlocks}) {
  const doc_fragment = document.createDocumentFragment();
  const open_curly = document.createElement('pre');
  open_curly.innerHTML = '{';
  const comma = document.createElement('pre');
  comma.innerHTML = ',';
  const close_curly = document.createElement('pre');
  close_curly.innerHTML = '}';
  doc_fragment.appendChild(open_curly);
  Object.keys(object).forEach(key => {
    const key_column = document.createElement('pre');
    key_column.innerHTML = key + ':';
    doc_fragment.appendChild(key_column);
    const child = show_program(object[key]);
    doc_fragment.appendChild(child);
    doc_fragment.appendChild(comma);
  });
  doc_fragment.appendChild(close_curly);
  return doc_fragment;
}

export function show_block(data: PdlBlock) {
  if (
    data === null ||
    typeof data === 'boolean' ||
    typeof data === 'number' ||
    typeof data === 'string'
  ) {
    return show_output(data);
  }
  const div = document.createElement('div');
  switch_div_on_click(div, show_output, data);
  div.addEventListener('mouseover', e => {
    update_code(data);
    if (e.stopPropagation) e.stopPropagation();
  });
  if (data.defs) {
    div.appendChild(show_defs(data.defs));
  }
  const body = document.createElement('fieldset');
  div.appendChild(body);
  add_def(body, data.def);
  body.classList.add('pdl_block');
  if (data?.contribute !== undefined && !data.contribute.includes('result')) {
    body.classList.add('pdl_show_result_false');
  }
  match(data)
    .with({kind: 'model'}, data => {
      body.classList.add('pdl_model');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: 'code'}, data => {
      body.classList.add('pdl_code');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: 'get'}, data => {
      body.classList.add('pdl_get');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: 'data'}, data => {
      body.classList.add('pdl_data');
      const code = document.createElement('pre');
      code.appendChild(show_result_or_code(data));
      body.appendChild(code);
    })
    .with({kind: 'if'}, data => {
      body.classList.add('pdl_if');
      if (data.if_result === undefined) {
        body.appendChild(show_result_or_code(data));
      } else {
        let if_child: DocumentFragment;
        if (data.if_result) {
          if_child = show_program(data?.then ?? '');
        } else {
          if_child = show_program(data?.else ?? '');
        }
        body.appendChild(if_child);
      }
    })
    .with({kind: 'read'}, data => {
      // TODO
      body.classList.add('pdl_read');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: 'include'}, data => {
      body.classList.add('pdl_include');
      if (data.trace) {
        body.appendChild(show_program(data.trace));
      } else {
        body.appendChild(show_result_or_code(data));
      }
    })
    .with({kind: 'function'}, _ => {
      // TODO
      body.classList.add('pdl_function');
      body.classList.add('pdl_show_result_false');
      body.innerHTML = htmlize(null);
      // const args = document.createElement('pre');
      // args.innerHTML = htmlize(stringify({function: data.function}));
      // body.appendChild(args);
      // body.appendChild(show_blocks(data.return));
    })
    .with({kind: 'call'}, data => {
      body.classList.add('pdl_call');
      if (data.trace) {
        // const args = document.createElement('pre');
        // args.innerHTML = htmlize(stringify({call: data.call, args: data.args}));
        // body.appendChild(args);
        body.appendChild(show_program(data.trace));
      } else {
        body.appendChild(show_result_or_code(data));
      }
    })
    .with({kind: 'text'}, data => {
      body.classList.add('pdl_text');
      const doc_child = show_text(data.text, undefined);
      body.appendChild(doc_child);
    })
    .with({kind: 'lastOf'}, data => {
      body.classList.add('pdl_lastOf');
      const doc_child = show_lastOf(data.lastOf);
      body.appendChild(doc_child);
    })
    .with({kind: 'array'}, data => {
      body.classList.add('pdl_array');
      const doc_child = show_array(data.array);
      body.appendChild(doc_child);
    })
    .with({kind: 'object'}, data => {
      body.classList.add('pdl_object');
      let doc_child;
      if (data.object instanceof Array) {
        doc_child = show_array(data.object);
      } else {
        doc_child = show_object(data.object);
      }
      body.appendChild(doc_child);
    })
    .with({kind: 'message'}, data => {
      body.classList.add('pdl_message');
      const role = document.createElement('pre');
      role.innerHTML = htmlize(data.role + ': ');
      body.appendChild(role);
      const doc_child = show_program(data.content);
      body.appendChild(doc_child);
    })
    .with({kind: 'repeat'}, data => {
      body.classList.add('pdl_repeat');
      const loop_body = show_loop_trace(
        data?.trace ?? [data.repeat],
        data.join
      );
      body.appendChild(loop_body);
    })
    .with({kind: 'repeat_until'}, data => {
      body.classList.add('pdl_repeat_until');
      const loop_body = show_loop_trace(
        data?.trace ?? [data.repeat],
        data.join
      );
      body.appendChild(loop_body);
    })
    .with({kind: 'for'}, data => {
      body.classList.add('pdl_for');
      const loop_body = show_loop_trace(
        data?.trace ?? [data.repeat],
        data.join
      );
      body.appendChild(loop_body);
    })
    .with({kind: 'empty'}, () => {
      body.classList.add('pdl_empty');
      body.innerHTML = htmlize('');
    })
    .with({kind: 'error'}, data => {
      body.classList.add('pdl_error');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: undefined}, () => {
      throw Error('Missing kind:\n' + htmlize(data));
    })
    .exhaustive();
  return div;
}

export function show_defs(defs: {[k: string]: PdlBlocks}): DocumentFragment {
  const doc_fragment = document.createDocumentFragment();
  for (const x in defs) {
    const div = document.createElement('fieldset');
    doc_fragment.appendChild(div);
    div.classList.add('pdl_show_result_false');
    add_def(div, x);
    div.appendChild(show_program(defs[x]));
  }
  return doc_fragment;
}

export function show_loop_trace(
  trace: PdlBlocks[],
  join_config: Join | undefined
): DocumentFragment {
  return match(join_config)
    .with(P.nullish, _ => show_text(trace, undefined))
    .with({as: P.union('text', P.nullish)}, cfg => show_text(trace, cfg?.with))
    .with({as: 'array'}, _ => show_array(trace))
    .with({as: 'lastOf'}, _ => show_lastOf(trace))
    .exhaustive();
}

export function show_loop_trace_incremental(
  trace: PdlBlocks[]
): DocumentFragment {
  const doc_fragment = document.createDocumentFragment();
  if (trace.length > 1) {
    const dot_dot_dot = document.createElement('div');
    dot_dot_dot.innerHTML = '···';
    dot_dot_dot.addEventListener('click', e => {
      dot_dot_dot.replaceWith(show_loop_trace_incremental(trace.slice(0, -1)));
      if (e.stopPropagation) e.stopPropagation();
    });
    doc_fragment.appendChild(dot_dot_dot);
  }
  if (trace.length > 0) {
    const iteration = document.createElement('div');
    iteration.classList.add('pdl_block', 'pdl_lastOf');
    const child = show_lastOf(trace.slice(-1)[0]); // TODO:
    iteration.appendChild(child);
    doc_fragment.appendChild(iteration);
  }
  return doc_fragment;
}

export function add_def(block_div: Element, name: string | null | undefined) {
  if (name) {
    const legend = document.createElement('legend');
    legend.innerHTML = name;
    block_div.appendChild(legend);
  }
}

export function show_code(blocks: PdlBlocks) {
  const code = document.createElement('pre');
  blocks = blocks_code_cleanup(blocks);
  code.innerHTML = htmlize(stringify(blocks));
  return code;
}

export function update_code(blocks: PdlBlocks) {
  const code = show_code(blocks);
  replace_div('code', code);
}

export function show_result_or_code(block: PdlBlock): Element {
  const div: Element = match(block)
    .with(P.union(P.string, P.number), data => show_value(data))
    .with({result: P._}, data => show_value(data.result))
    .otherwise(data => show_code(data));
  return div;
}

export function show_value(s: unknown) {
  const div = document.createElement('div');
  div.innerHTML = htmlize(s);
  return div;
}

export function blocks_code_cleanup(data: PdlBlocks): PdlBlocks {
  const new_data = match(data)
    .with(P.array(P._), data => data.map(block_code_cleanup))
    .otherwise(data => block_code_cleanup(data));
  return new_data;
}

export function block_code_cleanup(data: string | PdlBlock): string | PdlBlock {
  if (
    data === null ||
    typeof data === 'boolean' ||
    typeof data === 'number' ||
    typeof data === 'string'
  ) {
    return data;
  }
  // remove result
  const new_data = {...data, result: undefined};
  // remove trace
  match(new_data).with({trace: P._}, data => {
    data.trace = undefined;
  });
  // remove contribute: ["result", context]
  if (
    new_data?.contribute?.includes('result') &&
    new_data?.contribute?.includes('context')
  ) {
    new_data.contribute = undefined;
  }
  // remove empty defs list
  if (Object.keys(data?.defs ?? {}).length === 0) {
    new_data.defs = undefined;
  }
  // remove location info
  new_data.location = undefined;
  // recursive cleanup
  return map_block_children(block_code_cleanup, new_data);
}

export function replace_div(id: string, elem: Element) {
  const div = document.createElement('div');
  div.id = id;
  div.appendChild(elem);
  document.getElementById(id)?.replaceWith(div);
}

export function htmlize(x: unknown): string {
  const html = match(x)
    .with(P.nullish, () => '☐')
    .with(P.string, s => {
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
    .otherwise(x => htmlize(JSON.stringify(x, null, 2)));
  return html;
}

function switch_div_on_click(
  div: Element,
  show: (data: PdlBlocks) => string | Node,
  data: PdlBlocks
) {
  div.addEventListener('click', e => {
    div.replaceWith(show(data));
    if (e.stopPropagation) e.stopPropagation();
  });
}
