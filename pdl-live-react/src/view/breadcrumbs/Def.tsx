import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router"

import BreadcrumbBarItem from "../breadcrumbs/BreadcrumbBarItem"

type Props = {
  /** Block id */
  id: string

  def: string
  value?: import("../../pdl_ast").PdlBlock
  supportsDrilldown?: boolean
}

/** One variable definition */
export default function Def(props: Props) {
  const { id, def, value, supportsDrilldown = true } = props

  const navigate = useNavigate()
  const { hash } = useLocation()
  const drilldown = useCallback(
    (evt: import("react").MouseEvent) => {
      evt.stopPropagation()
      navigate(`?detail&type=def&id=${id}&def=${def}${hash}`)
    },
    [def, id, hash, navigate],
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
