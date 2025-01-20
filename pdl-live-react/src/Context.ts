type SDC = (props: import("./DrawerContent").DrawerContentSpec) => void

/** Context info passed along with the render */
export default interface Context {
  /** Current tree parent chain as we are traversing the trace's AST, used to uniquely identify a node */
  id: string

  /** Are we rendering in dark mode? */
  darkMode: boolean

  /** Callback to set drawer content */
  setDrawerContent: SDC

  /** In case of nested blocks */
  parents: string[]
}

export function withId(ctx: Context, id: string | number): Context {
  return Object.assign({}, ctx, {
    id: ctx.id + "." + id,
  })
}

export function withIter(ctx: Context, iter: number): Context {
  // Note that we 1-index iters in the displayed UI
  return withParent(withId(ctx, String(iter + 1)), `Iter ${iter + 1}`)
}

export function withParent(ctx: Context, parent: string) {
  return Object.assign({}, ctx, {
    parents: [...ctx.parents, parent],
  })
}
