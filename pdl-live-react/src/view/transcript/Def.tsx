import { Label } from "@patternfly/react-core"

import DefContent from "./DefContent"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

import type Context from "../../Context"
import type { PdlBlock } from "../../pdl_ast"

type Props = { def: string; value?: PdlBlock; ctx: Context }

/** One variable definition */
export default function Def({ def, value, ctx }: Props) {
  return (
    <BreadcrumbBarItem
      className="pdl-breadcrumb-bar-item--def"
      tooltip={
        <>
          <div>This block defines the variable "{def}".</div>
          {value && <>Click to see details.</>}
        </>
      }
      onClick={
        !value
          ? undefined
          : () => {
              ctx.setDrawerContent({
                header: "Variable definition",
                description: (
                  <Label isCompact color="blue">
                    {def}
                  </Label>
                ),
                body: <DefContent value={value} ctx={ctx} />,
              })
            }
      }
    >
      ${def}
    </BreadcrumbBarItem>
  )
}
