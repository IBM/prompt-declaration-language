import Code from "../code/Code"
import { type NonScalarPdlBlock as Model } from "../../helpers"

export default function SourceTabContent({ block }: { block: Model }) {
  return <Code block={block} />
}
