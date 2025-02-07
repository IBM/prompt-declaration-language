import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router"

import Def from "../transcript/Def"
import BreadcrumbBar from "./BreadcrumbBar"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

import { capitalizeAndUnSnakeCase } from "../../helpers"

type Props = {
  id: string
  def?: string | null | undefined
  value?: import("../../pdl_ast").PdlBlock
}

function asIter(part: string) {
  if (!part) return ""
  const int = parseInt(part)
  return isNaN(int) ? capitalizeAndUnSnakeCase(part) : `Step ${int + 1}`
}

export default function BreadcrumbBarForBlockId({ id, def, value }: Props) {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const onClick = useCallback(
    () => navigate(`?detail&type=def&id=${id}${hash}`),
    [id, hash],
  )

  return (
    <BreadcrumbBar>
      <>
        {id
          .replace(/text\.\d+\./g, "")
          .split(/\./)
          .slice(-5)
          .map((part, idx, A) => (
            <BreadcrumbBarItem
              key={part + idx}
              detail={part}
              onClick={onClick}
              className={
                idx === A.length - 1 ? "pdl-breadcrumb-bar-item--kind" : ""
              }
            >
              {asIter(part)}
            </BreadcrumbBarItem>
          ))}

        {def && <Def id={id} def={def} value={value} />}
      </>
    </BreadcrumbBar>
  )
}
