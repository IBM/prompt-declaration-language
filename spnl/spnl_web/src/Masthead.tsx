import {
  Masthead,
  MastheadMain,
  MastheadBrand,
  MastheadLogo,
  MastheadContent,
} from "@patternfly/react-core"

import DemoSelect from "./DemoSelect"
import ModelSelect from "./ModelSelect"

type Props = {
  demo: string
  model: string
}

export default function SPNLMasthead(props: Props) {
  return (
    <Masthead>
      <MastheadMain>
        <MastheadBrand>
          <MastheadLogo>Span Query Playground</MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <DemoSelect demo={props.demo} />
        <ModelSelect demo={props.demo} model={props.model} />
      </MastheadContent>
    </Masthead>
  )
}
