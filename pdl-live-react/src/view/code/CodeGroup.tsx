import {
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
} from "@patternfly/react-core"

import Code, { type SupportedLanguage } from "./Code"

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
