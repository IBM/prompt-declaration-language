import Page from "./Page"
import Viewer from "./Viewer"

type Props = {
  name: string
  value: string
}

export default function Demo({ name, value }: Props) {
  return (
    <Page breadcrumb1="Demo" breadcrumb2={name}>
      <Viewer value={value} />
    </Page>
  )
}
