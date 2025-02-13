import { Content } from "@patternfly/react-core"

export default function Intro() {
  return (
    <Content component="p" isEditorial className="pdl-welcome-intro">
      PDL is a declarative language designed for developers to create reliable,
      composable LLM prompts and integrate them into software systems. It
      provides a structured way to specify prompt templates, enforce validation,
      and compose LLM calls with traditional rule-based systems.
    </Content>
  )
}
