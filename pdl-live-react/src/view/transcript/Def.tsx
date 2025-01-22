import { useCallback, type MouseEvent } from "react"

import DefContent from "./DefContent"
import BreadcrumbBar from "./BreadcrumbBar"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

import type Context from "../../Context"
import type { PdlBlock } from "../../pdl_ast"

type Props = {
  def: string
  value?: PdlBlock
  ctx: Context
  supportsDrilldown?: boolean
}

/** One variable definition */
export default function Def(props: Props) {
  const { def, value, ctx, supportsDrilldown = true } = props

  const drilldown = useCallback(
    (evt: MouseEvent) => {
      if (value) {
        evt.stopPropagation()
        ctx.setDrawerContent({
          header: "Variable definition",
          description: (
            <BreadcrumbBar>
              <Def {...props} supportsDrilldown={false} />
            </BreadcrumbBar>
          ),
          body: <DefContent value={value} ctx={ctx} />,
        })
      }
    },
    [value, props, ctx],
  )

  return (
    <BreadcrumbBarItem
      className="pdl-breadcrumb-bar-item--def"
      tooltip={
        <>
          <div>This block defines the variable "{def}".</div>
          {value && <>Click to see details.</>}
        </>
      }
      onClick={!value || !supportsDrilldown ? undefined : drilldown}
    >
      ${def}
    </BreadcrumbBarItem>
  )
}
