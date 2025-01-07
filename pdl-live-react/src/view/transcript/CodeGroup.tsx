import {
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
} from "@patternfly/react-core"

import Code from "../Code"

import type Context from "../../Context"
import { type SupportedLanguage } from "../Preview"

type Props = {
  code: string
  ctx: Context
  lang?: SupportedLanguage
  term?: string
}

export default function CodeGroup({ code, ctx, lang, term = "Code" }: Props) {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{term}</DescriptionListTerm>
      <DescriptionListDescription>
        <Code block={code.trim()} darkMode={ctx.darkMode} language={lang} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  )
}
