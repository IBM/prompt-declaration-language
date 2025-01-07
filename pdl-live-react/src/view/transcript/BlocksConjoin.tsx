import show_block from "./Block"
import Context, { withId } from "../../Context"

import {
  isLLMBlock,
  isTextBlockWithArrayContent,
  type PdlBlock,
} from "../../helpers"

export default function show_block_conjoin(block: PdlBlock, ctx: Context) {
  if (isTextBlockWithArrayContent(block)) {
    const { text: _text, result: _result, ...rest } = block
    return [
      show_block(Object.assign(rest, { text: null }), withId(ctx, "rest")),
      ...conjoinModelInput(block.text).flatMap((block, idx) =>
        show_block(block, withId(ctx, idx)),
      ),
    ].filter(Boolean)
  } else {
    return [show_block(block, ctx)]
  }
}

/**
 * For any BamModelBlock (i.e. LLM interactions) without an `input`
 * field that are preceded by a text element, and treat that as the
 * input to the LLM.
 */
function conjoinModelInput(blocks: PdlBlock[]): PdlBlock[] {
  return blocks
    .flatMap((block, idx, A) => {
      const next = A[idx + 1]
      const prev = A[idx - 1]
      if (
        idx < A.length - 1 &&
        typeof block === "string" &&
        isLLMBlock(next) &&
        !next.input
      ) {
        // Smash the prior 'text' element into this 'model' element's 'input' attribute
        return Object.assign({}, A[idx + 1], { input: block })
      } else if (
        idx > 0 &&
        isLLMBlock(block) &&
        !block.input &&
        typeof prev === "string"
      ) {
        // Then we have already smashed this into the next block as the model.input attribute
        return null
      } else {
        // Unchanged
        return block
      }
    }, [])
    .filter(Boolean)
}
