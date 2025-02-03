import Block from "./Block"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  className?: string
  blocks: PdlBlock[] | PdlBlock
  join_str?: string
}

export default function Text({ className, blocks, join_str }: Props) {
  if (Array.isArray(blocks)) {
    return (
      <div className={"pdl_text" + (className ? " " + className : "")}>
        {blocks.flatMap((block, idx) => [
          join_str && <div key={idx + "-join"}>{join_str}</div>,
          <Block key={idx} data={block} />,
        ])}
      </div>
    )
  } else {
    return <Block data={blocks} />
  }
}
