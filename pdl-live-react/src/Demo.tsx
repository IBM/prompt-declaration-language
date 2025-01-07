import Page from "./Page"
import Viewer from "./Viewer"

type Props = {
  value: string
}

export default function Demo(props: Props) {
  return (
    <Page>
      <Viewer {...props} />
    </Page>
  )
}
