import { useCallback } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

import Def from "./Def"
import BreadcrumbBar from "./BreadcrumbBar"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

import { capitalizeAndUnSnakeCase } from "../../helpers"

type Props = {
  id: string
  def?: string | null | undefined
  value?: import("../../pdl_ast").PdlBlock
  maxCrumbs?: number
  isCompact?: boolean
}

function asIter(part: string) {
  if (!part) return ""
  const int = parseInt(part)
  return isNaN(int) ? capitalizeAndUnSnakeCase(part) : `Step ${int + 1}`
}

export default function BreadcrumbBarForBlockId({
  id,
  def,
  value,
  maxCrumbs = 5,
  isCompact = false,
}: Props) {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const s = searchParams.toString().length === 0 ? "" : "&" + searchParams
  const onClick = useCallback(
    () => navigate(`?detail&type=block&id=${id}${s}${hash}`),
    [id, hash, s, navigate],
  )

  // Notes:
  // 1) in compact mode, don't show "Text.3.If.1"; instead show "Text.If"
  // 2) also in compact mode, always strip of initial "Text."
  // 3) replace ids within dots (i.e. roots) with "Output of Program"
  const crumbs = id
    .replace(/^[^.]+$/, "Output of Program")
    .replace(/(text|empty|if)\.\d+/g, (p0, p1) => (isCompact ? p1 : p0))
    .replace(/^text\./, (p0) => (isCompact ? "" : p0))
    .split(/\./)

  if (def) {
    // We'll add one crumb for the def
    maxCrumbs--
  }

  return (
    <BreadcrumbBar>
      <>
        {crumbs.length > maxCrumbs && <BreadcrumbBarItem>…</BreadcrumbBarItem>}

        {crumbs.slice(-maxCrumbs).map((part, idx, A) => (
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
