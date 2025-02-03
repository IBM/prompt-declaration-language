import Block from "./Block"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  array: PdlBlock[]
}

export default function Array({ array }: Props) {
  return array.map((block, idx) => [<Block key={idx} data={block} />])
}
