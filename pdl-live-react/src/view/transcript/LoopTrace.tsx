import { match, P } from "ts-pattern"

import Text from "./Text"
import Blocks from "./Blocks"
import LastOf from "./LastOf"
import ArrayUI from "./Array"

import type Context from "../../Context"
import type { Join, PdlBlock } from "../../pdl_ast"

type Props = { trace: PdlBlock[]; ctx: Context; join_config?: Join }

export default function LoopTrace({ trace, ctx, join_config }: Props) {
  return match(join_config)
    .with(P.nullish, () => <Text blocks={trace} ctx={ctx} />)
    .with({ as: P.union("text", P.nullish) }, (cfg) => (
      <Text blocks={trace} ctx={ctx} join_str={cfg?.with} />
    ))
    .with({ as: "array" }, () => <ArrayUI array={trace} ctx={ctx} />)
    .with({ as: "lastOf" }, () => <LastOf blocks={trace} ctx={ctx} />)
    .with({ with: P._ }, () => <Blocks blocks={trace} ctx={ctx} />)
    .exhaustive()
}
