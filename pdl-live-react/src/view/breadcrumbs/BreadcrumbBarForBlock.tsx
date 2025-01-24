import { capitalizeAndUnSnakeCase, hasResult } from "../../helpers"

import Def from "../transcript/Def"
import BreadcrumbBar from "./BreadcrumbBar"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

type Props = {
  id: string
  block: import("../../helpers").NonScalarPdlBlock
}

function asIter(part: string) {
  const int = parseInt(part)
  return isNaN(int) ? capitalizeAndUnSnakeCase(part) : `Step ${int + 1}`
}

export default function BreadcrumbBarForBlock({ id, block }: Props) {
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
            def={block.def}
            ctx={{ id, parents: [] }}
            value={hasResult(block) ? block.result : undefined}
          />
        )}
      </>
    </BreadcrumbBar>
  )
}
