import { stringify } from "yaml"
import { Hint, HintBody, HintTitle } from "@patternfly/react-core"

import Code from "../Code"
import Markdown from "../Markdown"
import CopyToClipboard from "../CopyToClipboard"

import { hasScalarResult } from "../../helpers"

import "./FinalResult.css"

type Props = {
  block: import("../../helpers").PdlBlockWithResult
}

/** The final result of a program */
export default function FinalResult(props: Props) {
  const { clipboard, element } = content(props)

  return (
    <Hint
      className="pdl-final-result"
      hasNoActionsOffset
      actions={<CopyToClipboard>{clipboard}</CopyToClipboard>}
    >
      <HintTitle>Final Result</HintTitle>
      <HintBody>{element}</HintBody>
    </Hint>
  )
}

/**
 * @return The content UI `element` and `clipboard` content text for clipboard copying
 */
function content({ block }: Props): {
  clipboard: string
  element: import("react").ReactNode
} {
  if (hasScalarResult(block)) {
    return {
      clipboard: String(block.result),
      element: (
        <Markdown data-clipboard-content={String(block.result)}>
          {String(block.result)}
        </Markdown>
      ),
    }
  } else {
    const content =
      typeof block.result === "object"
        ? stringify(block.result)
        : String(block.result)
    return {
      clipboard: content,
      element: (
        <Code
          data-clipboard-content={content}
          language={typeof block.result === "object" ? "yaml" : "plaintext"}
          block={content}
          limitHeight
        />
      ),
    }
  }
}
