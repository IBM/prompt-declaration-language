import { hasResult, type NonScalarPdlBlock as Block } from "../../helpers"

import BreadcrumbBarForBlockId from "./BreadcrumbBarForBlockId"

type Props = {
  block: Pick<Block, "id" | "def">
}

export default function BreadcrumbBarForBlock({ block }: Props) {
  return (
    <BreadcrumbBarForBlockId
      id={block.id ?? ""}
      def={block.def}
      value={hasResult(block) ? block.result : undefined}
    />
  )
}
