import {
  capitalizeAndUnSnakeCase,
  hasResult,
  type NonScalarPdlBlock as Block,
} from "../../helpers"

import Def from "../transcript/Def"
import BreadcrumbBar from "./BreadcrumbBar"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

type Props = {
  block: Pick<Block, "id" | "def">
}

function asIter(part: string) {
  if (!part) return ""
  const int = parseInt(part)
  return isNaN(int) ? capitalizeAndUnSnakeCase(part) : `Step ${int + 1}`
}

export default function BreadcrumbBarForBlock({ block }: Props) {
  const id = block.id ?? ""
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
              className={
                idx === A.length - 1 ? "pdl-breadcrumb-bar-item--kind" : ""
              }
            >
              {asIter(part)}
            </BreadcrumbBarItem>
          ))}

        {block.def && (
          <Def
            block={block}
            def={block.def}
            value={hasResult(block) ? block.result : undefined}
          />
        )}
      </>
    </BreadcrumbBar>
  )
}
