import {stringify} from 'yaml';
import {PdlBlocks, PdlBlock} from './pdl_ast';
import {match, P} from 'ts-pattern';
import {map_block_children} from './pdl_ast_utils';

export const hello = {
  kind: 'document',
  description: 'Hello world to call into a model',
  document: [
    'Hello,',
    {
      kind: 'model',
      model: 'ibm/granite-20b-code-instruct-v2',
      parameters:
        '{"beam_width":null,"decoding_method":"greedy","include_stop_sequence":true,"length_penalty":null,"max_new_tokens":1024,"min_new_tokens":1,"random_seed":null,"repetition_penalty":1.07,"return_options":null,"stop_sequences":["!"],"temperature":null,"time_limit":null,"top_k":null,"top_p":null,"truncate_input_tokens":null,"typical_p":null}',
      result: ' world!',
    },
  ],
  result: 'Hello, world!',
};

export const data = hello;

export function show_output(data: PdlBlocks) {
  const div = document.createElement('div');
  div.classList.add('pdl_block');
  match(data)
    .with(P.string, output => {
      div.innerHTML = htmlize(output);
    })
    .with({show_result: false}, () => {
      div.classList.add('pdl_show_result_false');
      div.innerHTML = '☐';
    })
    .with({result: P.string}, data => {
      div.innerHTML = htmlize(data.result);
    })
    .otherwise(() => {
      div.innerHTML = '☐';
    });
  switch_div_on_click(div, show_blocks, data);
  return div;
}

export function show_blocks(blocks: PdlBlocks) {
  const doc_fragment = document.createDocumentFragment();
  match(blocks)
    .with(P.array(P._), data => {
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

export function show_block(data: PdlBlock) {
  if (typeof data === 'string') {
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
  if (data?.show_result === false) {
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
    .with({kind: 'api'}, data => {
      body.classList.add('pdl_api');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: 'get'}, data => {
      body.classList.add('pdl_get');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: 'data'}, data => {
      body.classList.add('pdl_data');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: 'if'}, data => {
      body.classList.add('pdl_if');
      if (data.if_result === undefined) {
        body.appendChild(show_result_or_code(data));
      } else {
        let if_child: DocumentFragment;
        if (data.if_result) {
          if_child = show_blocks(data?.then ?? '');
        } else {
          if_child = show_blocks(data?.else ?? '');
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
      // TODO
      body.classList.add('pdl_include');
      body.appendChild(show_result_or_code(data));
    })
    .with({kind: 'function'}, data => {
      // TODO
      body.classList.add('pdl_function');
      body.classList.add('pdl_show_result_false');
      const args = document.createElement('pre');
      args.innerHTML = htmlize(stringify({function: data.function}));
      body.appendChild(args);
      body.appendChild(show_blocks(data.return));
    })
    .with({kind: 'call'}, data => {
      body.classList.add('pdl_call');
      if (data.trace) {
        const args = document.createElement('pre');
        args.innerHTML = htmlize(stringify({call: data.call, args: data.args}));
        body.appendChild(args);
        body.appendChild(show_blocks(data.trace));
      } else {
        body.appendChild(show_result_or_code(data));
      }
    })
    .with({kind: 'document'}, data => {
      body.classList.add('pdl_document');
      const doc_child = show_blocks(data.document);
      body.appendChild(doc_child);
    })
    .with({kind: 'repeat'}, data => {
      body.classList.add('pdl_repeat');
      const loop_body = show_loop_trace(data?.trace ?? [data.repeat]);
      body.appendChild(loop_body);
    })
    .with({kind: 'repeat_until'}, data => {
      body.classList.add('pdl_repeat_until');
      const loop_body = show_loop_trace(data?.trace ?? [data.repeat]);
      body.appendChild(loop_body);
    })
    .with({kind: 'for'}, data => {
      body.classList.add('pdl_for');
      const loop_body = show_loop_trace(data?.trace ?? [data.repeat]);
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
    div.appendChild(show_blocks(defs[x]));
  }
  return doc_fragment;
}

export function show_loop_trace(trace: PdlBlocks[]): DocumentFragment {
  const doc_fragment = document.createDocumentFragment();
  if (trace.length > 1) {
    const dot_dot_dot = document.createElement('div');
    dot_dot_dot.innerHTML = '···';
    dot_dot_dot.addEventListener('click', e => {
      dot_dot_dot.replaceWith(show_loop_trace(trace.slice(0, -1)));
      if (e.stopPropagation) e.stopPropagation();
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
    .with(P.string, data => show_string(data))
    .with({result: P.string}, data => show_string(data.result))
    .otherwise(data => show_code(data));
  return div;
}

export function show_string(s: string) {
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
  if (typeof data === 'string') {
    return data;
  }
  // remove result
  const new_data = {...data, result: undefined};
  // remove trace
  match(new_data).with({trace: P._}, data => {
    data.trace = undefined;
  });
  // remove show_result: true
  if (new_data?.show_result) {
    new_data.show_result = undefined;
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
    .otherwise(x => htmlize(JSON.stringify(x)));
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
