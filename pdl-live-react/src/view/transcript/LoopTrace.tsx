import { match, P } from "ts-pattern"

import ArrayUI from "./Array"
import LastOf from "./LastOf"
import Text from "./Text"

import show_blocks from "./Blocks"

import type Context from "../../Context"
import type { Join, PdlBlock } from "../../pdl_ast"

export default function show_loop_trace(
  trace: PdlBlock[],
  ctx: Context,
  join_config?: Join,
) {
  return match(join_config)
    .with(P.nullish, () => <Text blocks={trace} ctx={ctx} />)
    .with({ as: P.union("text", P.nullish) }, (cfg) => (
      <Text blocks={trace} ctx={ctx} join_str={cfg?.with} />
    ))
    .with({ as: "array" }, () => <ArrayUI array={trace} ctx={ctx} />)
    .with({ as: "lastOf" }, () => LastOf({ blocks: trace, ctx }))
    .with({ with: P._ }, () => show_blocks(trace, ctx))
    .exhaustive()
}
