import { match, P } from "ts-pattern"

import Text from "./Text"
import Blocks from "./Blocks"
import LastOf from "./LastOf"
import ArrayUI from "./Array"

import type { Join, PdlBlock } from "../../pdl_ast"

type Props = { trace: PdlBlock[]; join_config?: Join }

export default function LoopTrace({ trace, join_config }: Props) {
  return match(join_config)
    .with(P.nullish, () => <Text blocks={trace} />)
    .with({ as: P.union("text", P.nullish) }, (cfg) => (
      <Text blocks={trace} join_str={cfg?.with} />
    ))
    .with({ as: "array" }, () => <ArrayUI array={trace} />)
    .with({ as: "lastOf" }, () => <LastOf blocks={trace} />)
    .with({ with: P._ }, () => <Blocks blocks={trace} />)
    .exhaustive()
}
