import Block from "./Block"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  blocks: PdlBlock[]
}

export default function LastOf({ blocks }: Props) {
  return blocks.map((block, idx) => <Block key={idx} data={block} />)
}
