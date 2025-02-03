import TranscriptItemDef from "./TranscriptItemDef"

type Props = {
  block: import("../../helpers").NonScalarPdlBlock
  defs: { [k: string]: import("../../pdl_ast").PdlBlock }
}

/** A set of variable definitions */
export default function Defs({ block, defs }: Props) {
  return Object.entries(defs).map(([key, value]) => (
    <TranscriptItemDef block={block} key={key} def={key} value={value} />
  ))
}
