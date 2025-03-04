import { childrenOf } from "../timeline/model"

import {
  isNonScalarPdlBlock,
  nonNullable,
  type NonScalarPdlBlock as Block,
} from "../../helpers"

/**
 * Traverse the tree under `block` looking for a sub-block with then
 * given `id`.
 */
export default function find(
  block: import("../../pdl_ast").PdlBlock,
  id: string,
): null | Block {
  if (!isNonScalarPdlBlock(block)) {
    return null
  } else if (block.pdl__id === id) {
    return block
  } else {
    return (
      childrenOf(block)
        .map((child) => find(child, id))
        .filter(nonNullable)[0] || null
    )
  }
}
