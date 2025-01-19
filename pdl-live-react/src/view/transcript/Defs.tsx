import {
  AccordionContent,
  AccordionItem,
  AccordionToggle,
} from "@patternfly/react-core"

import Def from "./Def"
import BreadcrumbBar from "./BreadcrumbBar"

import type Context from "../../Context"
import type { PdlBlock } from "../../pdl_ast"

type Props = { defs: { [k: string]: PdlBlock }; ctx: Context }

/** A set of variable definitions */
export default function Defs({ defs, ctx }: Props) {
  const entries = Object.entries(defs)
  return entries.map(([key, value]) => {
    const id = "defs-" + ctx.id + "-" + key
    return (
      <AccordionItem
        key={key}
        isExpanded={ctx.isAccordionExpanded.includes(id)}
      >
        <AccordionToggle id={id} onClick={ctx.toggleAccordion}>
          <BreadcrumbBar>
            <Def ctx={ctx} def={key} value={value} />
          </BreadcrumbBar>
        </AccordionToggle>

        <AccordionContent></AccordionContent>
      </AccordionItem>
    )
  })
}
