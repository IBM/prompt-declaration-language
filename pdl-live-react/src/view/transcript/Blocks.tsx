import Block from "./Block"
import { type PdlBlock } from "../../helpers"

type Props = { blocks: PdlBlock[] }

export default function Blocks({ blocks }: Props) {
  return blocks.flatMap((block, idx) => <Block key={idx} data={block} />)
}
