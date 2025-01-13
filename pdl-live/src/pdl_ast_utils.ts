import {PdlBlock} from './pdl_ast';
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
    const defs: {[k: string]: PdlBlock} = {};
    for (const x in block.defs) {
      defs[x] = f(block.defs[x]);
    }
    new_block = {...block, defs: defs};
  }
  new_block = match(new_block)
    // .with(P.string, s => s)
    .with({kind: 'empty'}, block => block)
    .with({kind: 'function'}, block => {
      const returns = f(block.return);
      return {...block, return: returns};
    })
    .with({kind: 'call'}, block => block)
    .with({kind: 'model'}, block => {
      if (block.input) {
        const input = f(block.input);
        block = {...block, input: input};
      }
      return block;
    })
    .with({kind: 'code'}, block => {
      const code = f(block.code);
      return {...block, code: code};
    })
    .with({kind: 'get'}, block => block)
    .with({kind: 'data'}, block => block)
    .with({kind: 'text'}, block => {
      let text;
      if (block.text instanceof Array) {
        text = block.text.map(f);
      } else {
        text = f(block.text);
      }
      return {...block, text: text};
    })
    .with({kind: 'lastOf'}, block => {
      const lastOf = block.lastOf.map(f);
      return {...block, lastOf: lastOf};
    })
    .with({kind: 'array'}, block => {
      const array = block.array.map(f);
      return {...block, array: array};
    })
    .with({kind: 'object'}, block => {
      let object;
      if (block.object instanceof Array) {
        object = block.object.map(f);
      } else {
        object = Object.fromEntries(
          Object.entries(block.object).map(([k, v]) => [k, f(v)])
        );
      }
      return {...block, object: object};
    })
    .with({kind: 'message'}, block => {
      const content = f(block.content);
      return {...block, content: content};
    })
    .with({kind: 'if'}, block => {
      const then_ = f(block.then);
      const else_ = block.else ? f(block.else) : undefined;
      return {...block, then: then_, else: else_};
    })
    .with({kind: 'match'}, block => {
      const with_ = block.with.map(match_case => {
        return {...match_case, then: f(match_case.then)};
      });
      return {...block, with: with_};
    })
    .with({kind: 'repeat'}, block => {
      const repeat = f(block.repeat);
      return {...block, repeat: repeat};
    })
    .with({kind: 'repeat_until'}, block => {
      const repeat = f(block.repeat);
      return {...block, repeat: repeat};
    })
    .with({kind: 'for'}, block => {
      const repeat = f(block.repeat);
      return {...block, repeat: repeat};
    })
    .with({kind: 'error'}, block => {
      const doc = f(block.program);
      return {...block, program: doc};
    })
    .with({kind: 'read'}, block => block)
    .with({kind: 'include'}, block => block)
    .with({kind: undefined}, block => block)
    .exhaustive();
  match(new_block)
    .with({parser: {pdl: P._}}, block => {
      block.parser.pdl = f(block.parser.pdl);
    })
    .otherwise(() => {});
  if (block.fallback) {
    block.fallback = f(block.fallback);
  }
  return new_block;
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
      f(block.defs[x]);
    }
  }
  match(block)
    .with(P.string, () => {})
    .with({kind: 'empty'}, () => {})
    .with({kind: 'function'}, block => {
      f(block.return);
    })
    .with({kind: 'call'}, () => {})
    .with({kind: 'model'}, block => {
      if (block.input) f(block.input);
    })
    .with({kind: 'code'}, block => {
      f(block.code);
    })
    .with({kind: 'get'}, () => {})
    .with({kind: 'data'}, () => {})
    .with({kind: 'text'}, block => {
      if (block.text instanceof Array) {
        block.text.forEach(f);
      } else {
        f(block.text);
      }
    })
    .with({kind: 'lastOf'}, block => {
      block.lastOf.forEach(f);
    })
    .with({kind: 'array'}, block => {
      block.array.forEach(f);
    })
    .with({kind: 'object'}, block => {
      let object;
      if (block.object instanceof Array) {
        block.object.forEach(f);
      } else {
        Object.entries(block.object).forEach(([_, b]) => f(b));
      }
      return {...block, object: object};
    })

    .with({kind: 'message'}, block => {
      f(block.content);
    })
    .with({kind: 'if'}, block => {
      if (block.then) f(block.then);
      if (block.else) f(block.else);
    })
    .with({kind: 'match'}, block => {
      block.with.forEach(match_case => {
        f(match_case.then);
      });
    })
    .with({kind: 'repeat'}, block => {
      f(block.repeat);
    })
    .with({kind: 'repeat_until'}, block => {
      f(block.repeat);
    })
    .with({kind: 'for'}, block => {
      f(block.repeat);
    })
    .with({kind: 'error'}, block => f(block.program))
    .with({kind: 'read'}, () => {})
    .with({kind: 'include'}, () => {})
    .with({kind: undefined}, () => {})
    .exhaustive();
  match(block)
    .with({parser: {pdl: P._}}, block => {
      f(block.parser.pdl);
    })
    .otherwise(() => {});
  if (block.fallback) {
    f(block.fallback);
  }
}
