import show_block from "./Block"
import Context, { withId } from "../../Context"
import { isTextBlockWithArrayContent, type PdlBlock } from "../../helpers"

export default function show_block_conjoin(block: PdlBlock, ctx: Context) {
  if (isTextBlockWithArrayContent(block)) {
    return block.text.flatMap((b, idx) => show_block(b, withId(ctx, idx)))
  } else {
    return [show_block(block, ctx)]
  }
}
