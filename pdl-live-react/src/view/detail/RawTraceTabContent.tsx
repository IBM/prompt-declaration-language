import Code from "../code/Code"
import { type NonScalarPdlBlock as Model } from "../../helpers"

export default function RawTraceTabContent({ block }: { block: Model }) {
  return <Code block={block} raw />
}
