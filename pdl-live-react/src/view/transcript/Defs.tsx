import { Flex } from "@patternfly/react-core"

import Code from "../Code"
import Def from "./Def"
import Value from "./Value"
import show_block from "./Block"

import type Context from "../../Context"
import type { PdlBlock } from "../../pdl_ast"

import { hasParser, hasResult, isPdlBlock } from "../../helpers"

type Props = { defs: { [k: string]: PdlBlock }; ctx: Context }

const inlineFlex = { default: "inlineFlex" as const }

/** A set of variable definitions */
export default function Defs({ defs, ctx }: Props) {
  const entries = Object.entries(defs)
  return (
    entries.length > 0 && (
      <Flex className="pdl-defs" display={inlineFlex}>
        {entries.map(([key, value]) => (
          <a
            key={key}
            onClick={(evt) => {
              evt.stopPropagation()
              ctx.setDrawerContent({
                header: "Variable definition",
                description: <Def asStatus={false}>{key}</Def>,
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
            }}
          >
            <Def>{key}</Def>
          </a>
        ))}
      </Flex>
    )
  )
}
