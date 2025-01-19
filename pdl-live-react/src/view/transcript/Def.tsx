import { Label } from "@patternfly/react-core"

import Code from "../Code"
import Value from "./Value"
import show_block from "./Block"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

import type Context from "../../Context"
import type { PdlBlock } from "../../pdl_ast"

import { hasParser, hasResult, isPdlBlock } from "../../helpers"

type Props = { def: string; value?: PdlBlock; ctx: Context }

/** One variable definition */
export default function Def({ def, value, ctx }: Props) {
  return (
    <BreadcrumbBarItem
      className="pdl-breadcrumb-bar-item--def"
      tooltip={
        <>
          <div>This block defines the variable "{def}".</div>
          {value && <>Click to see details.</>}
        </>
      }
      onClick={
        !value
          ? undefined
          : (evt) => {
              evt.stopPropagation()
              ctx.setDrawerContent({
                header: "Variable definition",
                description: (
                  <Label isCompact color="purple">
                    {def}
                  </Label>
                ),
                body: (
                  <div className="pdl-variable-definition-content">
                    {hasResult(value) && isPdlBlock(value.result) ? (
                      hasParser(value) &&
                      (value.parser === "yaml" ||
                        value.parser === "json" ||
                        value.parser === "jsonl") ? (
                        <Code
                          block={value.result}
                          darkMode={ctx.darkMode}
                          limitHeight={false}
                          language={
                            value.parser === "jsonl" ? "json" : value.parser
                          }
                        />
                      ) : typeof value.result === "string" ? (
                        <Value>{value.result}</Value>
                      ) : (
                        show_block(value.result, ctx)
                      )
                    ) : (
                      show_block(value, ctx)
                    )}
                  </div>
                ),
              })
            }
      }
    >
      ${def}
    </BreadcrumbBarItem>
  )
}
