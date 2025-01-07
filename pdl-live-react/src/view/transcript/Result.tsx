import {
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Panel,
  PanelMain,
} from "@patternfly/react-core"

import Code from "../Code"
import Value from "./Value"

import type Context from "../../Context"
import { type SupportedLanguage } from "../Preview"

type Props = {
  result: number | string | unknown
  ctx: Context
  lang?: SupportedLanguage
  term?: string
}

export default function Result({ result, ctx, lang, term = "Result" }: Props) {
  const isCode = lang && result

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>{term}</DescriptionListTerm>
        <DescriptionListDescription>
          <Panel className="pdl-result-panel" isScrollable={!isCode}>
            <PanelMain>
              {isCode ? (
                <Code block={result} darkMode={ctx.darkMode} language={lang} />
              ) : (
                <Value>{result}</Value>
              )}
            </PanelMain>
          </Panel>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  )
}
