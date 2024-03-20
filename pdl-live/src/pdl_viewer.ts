import {stringify} from 'yaml';
import {Document as PdlDocument, Program as PdlBlock} from './pdl_ast';
import {match, P} from 'ts-pattern';
import {map_block_children} from './pdl_ast_utils';

export const hello = {
  kind: 'document',
  description: 'Hello world to call into a model',
  document: [
    'Hello,',
    {
      kind: 'model',
      model: 'ibm/granite-20b-code-instruct-v1',
      parameters:
        '{"beam_width":null,"decoding_method":"greedy","include_stop_sequence":true,"length_penalty":null,"max_new_tokens":1024,"min_new_tokens":1,"random_seed":null,"repetition_penalty":1.07,"return_options":null,"stop_sequences":["!"],"temperature":null,"time_limit":null,"top_k":null,"top_p":null,"truncate_input_tokens":null,"typical_p":null}',
      result: ' world!',
    },
  ],
  result: 'Hello, world!',
};

export const data = hello;

export function show_output(data: PdlDocument) {
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
  switch_div_on_click(div, show_document, data);
  return div;
}

export function show_document(data: PdlDocument) {
  const doc_fragment = document.createDocumentFragment();
  match(data)
    .with(P.array(P._), data => {
      for (const doc of data) {
        const child = show_document(doc);
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
  const div = document.createElement('fieldset');
  div.classList.add('pdl_block');
  switch_div_on_click(div, show_output, data);
  if (data?.show_result === false) {
    div.classList.add('pdl_show_result_false');
  }
  div.addEventListener('mouseover', e => {
    show_code(data);
    if (e.stopPropagation) e.stopPropagation();
  });
  match(data)
    .with({kind: 'model'}, data => {
      div.classList.add('pdl_model');
      div.innerHTML = htmlize(data?.result);
    })
    .with({kind: 'code'}, data => {
      div.classList.add('pdl_code');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: 'api'}, data => {
      div.classList.add('pdl_api');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: 'get'}, data => {
      div.classList.add('pdl_get');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: 'data'}, data => {
      div.classList.add('pdl_data');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: 'if'}, data => {
      div.classList.add('pdl_if');
      let if_child: DocumentFragment;
      if (!(data.if_result ?? true)) {
        if_child = show_document(data.then ?? '');
      } else {
        if_child = show_document(data.else ?? '');
      }
      div.append(if_child);
    })
    .with({kind: 'read'}, data => {
      // TODO
      div.classList.add('pdl_read');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: 'include'}, data => {
      // TODO
      div.classList.add('pdl_include');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: 'function'}, data => {
      // TODO
      div.classList.add('pdl_function');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: 'call'}, data => {
      // TODO
      div.classList.add('pdl_call');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: 'document'}, data => {
      div.classList.add('pdl_document');
      const doc_child = show_document(data.document);
      div.appendChild(doc_child);
    })
    .with({kind: 'repeat'}, data => {
      div.classList.add('pdl_repeat');
      const body = show_loop_trace(data.trace ?? []);
      div.appendChild(body);
    })
    .with({kind: 'repeat_until'}, data => {
      div.classList.add('pdl_repeat_until');
      const body = show_loop_trace(data.trace ?? []);
      div.appendChild(body);
    })
    .with({kind: 'for'}, data => {
      div.classList.add('pdl_for');
      const body = show_loop_trace(data.trace ?? []);
      div.appendChild(body);
    })
    .with({kind: 'empty'}, () => {
      div.classList.add('pdl_empty');
      div.innerHTML = htmlize('');
    })
    .with({kind: 'error'}, data => {
      div.classList.add('pdl_error');
      div.innerHTML = htmlize(data.result);
    })
    .with({kind: undefined}, () => {
      throw Error('Missing kind:\n' + stringify(data));
    })
    .exhaustive();
  add_def(div, data);
  return div;
}

export function show_loop_trace(trace: PdlDocument[]) {
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
    const child = show_document(trace.slice(-1)[0]);
    iteration.appendChild(child);
    doc_fragment.appendChild(iteration);
  }
  return doc_fragment;
}

export function add_def(block_div: Element, data: PdlDocument) {
  match(data).with({def: P.string}, data => {
    const legend = document.createElement('legend');
    legend.innerHTML = data.def;
    block_div.appendChild(legend);
  });
}

export function show_code(data: PdlDocument) {
  const code = document.createElement('pre');
  data = document_code_cleanup(data);
  code.innerHTML = stringify(data);
  replace_div('code', code);
}

export function document_code_cleanup(data: PdlDocument): PdlDocument {
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
  // remove show_result: true
  if (new_data?.show_result) {
    new_data.show_result = undefined;
  }
  // recursive cleanup
  return map_block_children(block_code_cleanup, new_data);
}

export function replace_div(id: string, elem: Element) {
  const div = document.createElement('div');
  div.id = id;
  div.appendChild(elem);
  document.getElementById(id)?.replaceWith(div);
}

export function htmlize(x: unknown) {
  const html = match(x)
    .with(P.nullish, () => '☐')
    .with(P.string, s => (s === '' ? '☐' : s.split('\n').join('<br>')))
    .otherwise(x => JSON.stringify(x));
  return html;
}

function switch_div_on_click(
  div: Element,
  show: (data: PdlDocument) => string | Node,
  data: PdlDocument
) {
  div.addEventListener('click', e => {
    div.replaceWith(show(data));
    if (e.stopPropagation) e.stopPropagation();
  });
}
