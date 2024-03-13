import {
  Document as PdlDocument,
  Program as PdlBlock,
  EndsWithCondition,
  ContainsCondition,
} from './pdl_ast';
import {match, P} from 'ts-pattern';

type PdlCondition = string | EndsWithCondition | ContainsCondition;

export function map_block_children(
  f: (block: string | PdlBlock) => string | PdlBlock,
  block: string | PdlBlock
): string | PdlBlock {
  const new_block = match(block)
    .with(P.string, s => s)
    .with({kind: 'function'}, block => {
      const document = map_document(f, block.document);
      return {...block, document: document};
    })
    .with({kind: 'call'}, block => block)
    .with({kind: 'model'}, block => {
      if (block.input) {
        const input = map_document(f, block.input);
        block = {...block, input: input};
      }
      return block;
    })
    .with({kind: 'code'}, block => {
      const code = map_document(f, block.code);
      return {...block, code: code};
    })
    .with({kind: 'api'}, block => {
      const input = map_document(f, block.input);
      return {...block, input: input};
    })
    .with({kind: 'get'}, block => block)
    .with({kind: 'data'}, block => block)
    .with({kind: 'document'}, block => {
      const document = map_document(f, block.document);
      return {...block, document: document};
    })
    .with({kind: 'if'}, block => {
      const if_ = map_condition(f, block.if);
      const then_ = map_document(f, block.then);
      const else_ = block.else ? map_document(f, block.else) : undefined;
      return {...block, if: if_, then: then_, else: else_};
    })
    .with({kind: 'repeat'}, block => {
      const repeat = map_document(f, block.repeat);
      return {...block, repeat: repeat};
    })
    .with({kind: 'repeat_until'}, block => {
      const repeat = map_document(f, block.repeat);
      const until = map_condition(f, block.until);
      return {...block, repeat: repeat, until: until};
    })
    .with({kind: 'error'}, block => {
      const doc = map_document(f, block.document);
      return {...block, document: doc};
    })
    .with({kind: 'read'}, block => block)
    .with({kind: 'include'}, block => block)
    .with({kind: undefined}, block => block)
    .exhaustive();
  return new_block;
}

export function map_document(
  f: (block: string | PdlBlock) => string | PdlBlock,
  document: PdlDocument
): PdlDocument {
  document = match(document)
    .with(P.string, s => s)
    .with(P.array(P._), sequence => sequence.map(doc => f(doc)))
    .otherwise(block => f(block));
  return document;
}

export function map_condition(
  f: (block: string | PdlBlock) => string | PdlBlock,
  cond: PdlCondition
): PdlCondition {
  cond = match(cond)
    .with(P.string, s => s)
    .with({ends_with: P._}, cond => {
      const arg0 = map_document(f, cond.ends_with.arg0);
      return {...cond, ends_with: {...cond.ends_with, arg0: arg0}};
    })
    .with({contains: P._}, cond => {
      const arg0 = map_document(f, cond.contains.arg0);
      return {...cond, contains: {...cond.contains, arg0: arg0}};
    })
    .exhaustive();
  return cond;
}

export function iter_block_children(
  f: (block: PdlBlock) => void,
  block: PdlBlock
): void {
  match(block)
    .with(P.string, () => {})
    .with({kind: 'function'}, block => {
      iter_document(f, block.document);
    })
    .with({kind: 'call'}, () => {})
    .with({kind: 'model'}, block => {
      if (block.input) iter_document(f, block.input);
    })
    .with({kind: 'code'}, block => {
      iter_document(f, block.code);
    })
    .with({kind: 'api'}, block => {
      iter_document(f, block.input);
    })
    .with({kind: 'get'}, () => {})
    .with({kind: 'data'}, () => {})
    .with({kind: 'document'}, block => {
      iter_document(f, block.document);
    })
    .with({kind: 'if'}, block => {
      iter_condition(f, block.if);
      if (block.then) iter_document(f, block.then);
      if (block.else) iter_document(f, block.else);
    })
    .with({kind: 'repeat'}, block => {
      iter_document(f, block.repeat);
    })
    .with({kind: 'repeat_until'}, block => {
      iter_document(f, block.repeat);
      iter_condition(f, block.until);
    })
    .with({kind: 'error'}, block => iter_document(f, block.document))
    .with({kind: 'read'}, () => {})
    .with({kind: 'include'}, () => {})
    .with({kind: undefined}, () => {})
    .exhaustive();
}

export function iter_document(
  f: (block: PdlBlock) => void,
  document: PdlDocument
): void {
  match(document)
    .with(P.string, () => {})
    .with(P.array(P._), sequence => {
      sequence.forEach(doc => iter_document(f, doc));
    })
    .otherwise(block => f(block));
}

export function iter_condition(
  f: (block: PdlBlock) => void,
  cond: PdlCondition
): void {
  match(cond)
    .with(P.string, () => {})
    .with({ends_with: P._}, cond => {
      iter_document(f, cond.ends_with.arg0);
    })
    .with({contains: P._}, cond => {
      iter_document(f, cond.contains.arg0);
    })
    .exhaustive();
}
