import {
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
} from "@patternfly/react-core"

import Code from "../Code"

import { type SupportedLanguage } from "../Preview"

type Props = {
  code: string
  lang?: SupportedLanguage
  term?: string
}

export default function CodeGroup({ code, lang, term = "Code" }: Props) {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{term}</DescriptionListTerm>
      <DescriptionListDescription>
        <Code block={code.trim()} language={lang} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  )
}
