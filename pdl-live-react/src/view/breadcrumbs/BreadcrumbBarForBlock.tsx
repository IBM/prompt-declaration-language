import { hasResult, type NonScalarPdlBlock as Block } from "../../helpers"

import BreadcrumbBarForBlockId from "./BreadcrumbBarForBlockId"

type Props = {
  block: Pick<Block, "pdl__id" | "def">
}

export default function BreadcrumbBarForBlock({ block }: Props) {
  return (
    <BreadcrumbBarForBlockId
      id={block.pdl__id ?? ""}
      def={block.def}
      value={hasResult(block) ? block.pdl__result : undefined}
    />
  )
}
