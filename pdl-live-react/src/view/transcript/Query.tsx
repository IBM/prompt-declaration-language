import {
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
} from "@patternfly/react-core"

import show_block from "./Block"
import type Context from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  q: PdlBlock
  ctx: Context
  prompt?: string
  className?: string
}

export default function query({ q, ctx, prompt = "Query", className }: Props) {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{prompt}</DescriptionListTerm>
      <DescriptionListDescription className={className}>
        {show_block(q, ctx)}
      </DescriptionListDescription>
    </DescriptionListGroup>
  )
}
