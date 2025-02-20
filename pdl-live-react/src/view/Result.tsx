import {
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Panel,
  PanelMain,
} from "@patternfly/react-core"

import Code from "./code/Code"
import Value from "./Value"

import { type SupportedLanguage } from "./code/Code"

type Props = {
  result: number | string | unknown
  lang?: SupportedLanguage
  term?: string
  limitHeight?: boolean
  isWidthConstrained?: boolean
}

export default function Result({
  result,
  lang,
  term = "Result",
  limitHeight = false,
  isWidthConstrained = false,
}: Props) {
  const isCode = lang && result

  const innerContent = isCode ? (
    <Code
      block={result}
      language={lang}
      isWidthConstrained={isWidthConstrained}
    />
  ) : (
    <Value>{result}</Value>
  )

  const content = !limitHeight ? (
    innerContent
  ) : (
    <Panel className="pdl-result-panel" isScrollable={!isCode}>
      <PanelMain>{innerContent}</PanelMain>
    </Panel>
  )

  return !term ? (
    content
  ) : (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>{term}</DescriptionListTerm>
        <DescriptionListDescription>{content}</DescriptionListDescription>
      </DescriptionListGroup>
    </>
  )
}
