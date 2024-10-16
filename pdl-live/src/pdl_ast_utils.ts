import {PdlBlocks, PdlBlock} from './pdl_ast';
import {match, P} from 'ts-pattern';

export function map_block_children(
  f: (block: PdlBlock) => PdlBlock,
  block: PdlBlock
): PdlBlock {
  if (
    block === null ||
    typeof block === 'boolean' ||
    typeof block === 'number' ||
    typeof block === 'string'
  ) {
    return block;
  }
  let new_block: PdlBlock;
  if (block?.defs === undefined) {
    new_block = {...block};
  } else {
    const defs: {[k: string]: PdlBlocks} = {};
    for (const x in block.defs) {
      defs[x] = map_blocks(f, block.defs[x]);
    }
    new_block = {...block, defs: defs};
  }
  new_block = match(new_block)
    // .with(P.string, s => s)
    .with({kind: 'empty'}, block => block)
    .with({kind: 'function'}, block => {
      const returns = map_blocks(f, block.return);
      return {...block, return: returns};
    })
    .with({kind: 'call'}, block => block)
    .with({kind: 'model'}, block => {
      if (block.input) {
        const input = map_blocks(f, block.input);
        block = {...block, input: input};
      }
      return block;
    })
    .with({kind: 'code'}, block => {
      const code = map_blocks(f, block.code);
      return {...block, code: code};
    })
    .with({kind: 'get'}, block => block)
    .with({kind: 'data'}, block => block)
    .with({kind: 'text'}, block => {
      const text = map_blocks(f, block.text);
      return {...block, text: text};
    })
    .with({kind: 'lastOf'}, block => {
      const lastOf = map_blocks(f, block.lastOf);
      return {...block, lastOf: lastOf};
    })
    .with({kind: 'array'}, block => {
      const array = map_blocks(f, block.array);
      return {...block, array: array};
    })
    .with({kind: 'object'}, block => {
      let object;
      if (block.object instanceof Array) {
        object = block.object.map(f);
      } else {
        object = Object.fromEntries(
          Object.entries(block.object).map(([k, v]) => [k, map_blocks(f, v)])
        );
      }
      return {...block, object: object};
    })
    .with({kind: 'message'}, block => {
      const content = map_blocks(f, block.content);
      return {...block, content: content};
    })
    .with({kind: 'if'}, block => {
      const then_ = map_blocks(f, block.then);
      const else_ = block.else ? map_blocks(f, block.else) : undefined;
      return {...block, then: then_, else: else_};
    })
    .with({kind: 'repeat'}, block => {
      const repeat = map_blocks(f, block.repeat);
      return {...block, repeat: repeat};
    })
    .with({kind: 'repeat_until'}, block => {
      const repeat = map_blocks(f, block.repeat);
      return {...block, repeat: repeat};
    })
    .with({kind: 'for'}, block => {
      const repeat = map_blocks(f, block.repeat);
      return {...block, repeat: repeat};
    })
    .with({kind: 'error'}, block => {
      const doc = map_blocks(f, block.program);
      return {...block, program: doc};
    })
    .with({kind: 'read'}, block => block)
    .with({kind: 'include'}, block => block)
    .with({kind: undefined}, block => block)
    .exhaustive();
  match(new_block)
    .with({parser: {pdl: P._}}, block => {
      block.parser.pdl = map_blocks(f, block.parser.pdl);
    })
    .otherwise(() => {});
  if (block.fallback) {
    block.fallback = map_blocks(f, block.fallback);
  }
  return new_block;
}

export function map_blocks(
  f: (block: PdlBlock) => PdlBlock,
  blocks: PdlBlocks
): PdlBlocks {
  blocks = match(blocks)
    .with(P.string, s => s)
    .with(P.array(P._), sequence => sequence.map(f))
    .otherwise(block => f(block));
  return blocks;
}

export function iter_block_children(
  f: (block: PdlBlock) => void,
  block: PdlBlock
): void {
  if (
    block === null ||
    typeof block === 'boolean' ||
    typeof block === 'number' ||
    typeof block === 'string'
  ) {
    return;
  }
  if (block?.defs) {
    for (const x in block.defs) {
      iter_blocks(f, block.defs[x]);
    }
  }
  match(block)
    .with(P.string, () => {})
    .with({kind: 'empty'}, () => {})
    .with({kind: 'function'}, block => {
      iter_blocks(f, block.return);
    })
    .with({kind: 'call'}, () => {})
    .with({kind: 'model'}, block => {
      if (block.input) iter_blocks(f, block.input);
    })
    .with({kind: 'code'}, block => {
      iter_blocks(f, block.code);
    })
    .with({kind: 'get'}, () => {})
    .with({kind: 'data'}, () => {})
    .with({kind: 'text'}, block => {
      iter_blocks(f, block.text);
    })
    .with({kind: 'lastOf'}, block => {
      iter_blocks(f, block.lastOf);
    })
    .with({kind: 'array'}, block => {
      iter_blocks(f, block.array);
    })
    .with({kind: 'object'}, block => {
      let object;
      if (block.object instanceof Array) {
        iter_blocks(f, block.object);
      } else {
        Object.entries(block.object).forEach(([_, v]) => iter_blocks(f, v));
      }
      return {...block, object: object};
    })

    .with({kind: 'message'}, block => {
      iter_blocks(f, block.content);
    })
    .with({kind: 'if'}, block => {
      if (block.then) iter_blocks(f, block.then);
      if (block.else) iter_blocks(f, block.else);
    })
    .with({kind: 'repeat'}, block => {
      iter_blocks(f, block.repeat);
    })
    .with({kind: 'repeat_until'}, block => {
      iter_blocks(f, block.repeat);
    })
    .with({kind: 'for'}, block => {
      iter_blocks(f, block.repeat);
    })
    .with({kind: 'error'}, block => iter_blocks(f, block.program))
    .with({kind: 'read'}, () => {})
    .with({kind: 'include'}, () => {})
    .with({kind: undefined}, () => {})
    .exhaustive();
  match(block)
    .with({parser: {pdl: P._}}, block => {
      iter_blocks(f, block.parser.pdl);
    })
    .otherwise(() => {});
  if (block.fallback) {
    iter_blocks(f, block.fallback);
  }
}

export function iter_blocks(
  f: (block: PdlBlock) => void,
  blocks: PdlBlocks
): void {
  match(blocks)
    .with(P.string, () => {})
    .with(P.array(P._), sequence => {
      sequence.forEach(doc => iter_blocks(f, doc));
    })
    .otherwise(block => f(block));
}
