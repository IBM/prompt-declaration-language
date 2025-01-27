/** Context info passed along with the render */
export default interface Context {
  /** Current tree parent chain as we are traversing the trace's AST, used to uniquely identify a node */
  id: string

  /** In case of nested blocks */
  parents: string[]
}

export function withId(ctx: Context, id: string | number): Context {
  return Object.assign({}, ctx, {
    id: (ctx.id ? ctx.id + "." : "") + id,
  })
}

export function withIter(ctx: Context, iter: number): Context {
  // Note that we 1-index iters in the displayed UI
  return withParent(withId(ctx, String(iter)), `Step ${iter + 1}`)
}

export function withParentAndId(ctx: Context, parent: string): Context {
  return withId(withParent(ctx, parent), parent)
}

export function withParent(ctx: Context, parent: string): Context {
  return Object.assign({}, ctx, {
    parents: [...ctx.parents, parent],
  })
}
