import TranscriptItemDef from "./TranscriptItemDef"

type Props = {
  defs: { [k: string]: import("../../pdl_ast").PdlBlock }
  ctx: import("../../Context").default
}

/** A set of variable definitions */
export default function Defs({ defs, ctx }: Props) {
  return Object.entries(defs).map(([key, value]) => (
    <TranscriptItemDef key={key} def={key} value={value} ctx={ctx} />
  ))
}
