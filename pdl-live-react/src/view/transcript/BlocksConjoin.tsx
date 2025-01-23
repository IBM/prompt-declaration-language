import Block from "./Block"
import Context, { withId } from "../../Context"
import { isTextBlockWithArrayContent, type PdlBlock } from "../../helpers"

type Props = { block: PdlBlock; ctx: Context }

export default function BlocksConjoin({ block, ctx }: Props) {
  if (isTextBlockWithArrayContent(block)) {
    return block.text.map((b, idx) => (
      <Block key={idx} data={b} ctx={withId(ctx, `${block.kind}.${idx}`)} />
    ))
  } else {
    return <Block data={block} ctx={ctx} />
  }
}
