import {
  PdlBlocks,
  PdlBlock,
} from './pdl_ast';
import {match, P} from 'ts-pattern';

export function map_block_children(
  f: (block: string | PdlBlock) => string | PdlBlock,
  block: string | PdlBlock
): string | PdlBlock {
  const new_block = match(block)
    .with(P.string, s => s)
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
    .with({kind: 'api'}, block => {
      const input = map_blocks(f, block.input);
      return {...block, input: input};
    })
    .with({kind: 'get'}, block => block)
    .with({kind: 'data'}, block => block)
    .with({kind: 'document'}, block => {
      const document = map_blocks(f, block.document);
      return {...block, document: document};
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
  return new_block;
}

export function map_blocks(
  f: (block: string | PdlBlock) => string | PdlBlock,
  blocks: PdlBlocks
): PdlBlocks {
  blocks = match(blocks)
    .with(P.string, s => s)
    .with(P.array(P._), sequence => sequence.map(doc => f(doc)))
    .otherwise(block => f(block));
  return blocks;
}


export function iter_block_children(
  f: (block: PdlBlock) => void,
  block: PdlBlock
): void {
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
    .with({kind: 'api'}, block => {
      iter_blocks(f, block.input);
    })
    .with({kind: 'get'}, () => {})
    .with({kind: 'data'}, () => {})
    .with({kind: 'document'}, block => {
      iter_blocks(f, block.document);
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