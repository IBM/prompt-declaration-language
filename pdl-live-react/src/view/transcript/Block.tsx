import { match } from "ts-pattern"
import { stringify } from "yaml"

import { type ReactNode } from "react"
import { type DescriptionListProps } from "@patternfly/react-core"

import ArrayUI from "./Array"
import Defs from "./Defs"
import Function from "./Function"
import LastOf from "./LastOf"
import ObjectUI from "./Object"
import Output from "./Output"
import Query from "./Query"
import Result from "./Result"
import ResultOrCode from "./ResultOrCode"
import Text from "./Text"
import TranscriptItem from "./TranscriptItem"

import show_loop_trace from "./LoopTrace"
import show_block_conjoin from "./BlocksConjoin"

import Context, { withParent } from "../../Context"

import { isPdlBlock, type PdlBlock } from "../../helpers"

import "./Block.css"

/**
 * Render one tree of blocks rooted at `data` as a list of
 * `TranscriptItem`.
 */
export default function show_block(
  data: PdlBlock,
  ctx: Context,
): ReactNode | ReactNode[] {
  if (
    data === null ||
    typeof data === "boolean" ||
    typeof data === "number" ||
    typeof data === "string"
  ) {
    if (typeof data === "string" && data.trim().length === 0) {
      // Don't bother showing empty strings in the UI
      return
    }
    return <Output data={data} />
  }

  const {
    C: extraClasses,
    B: bodyContent,
    P: prefixContent,
    S: suffixContent,
  } = match(data)
    .returnType<{
      C: string[]
      B?: ReactNode
      P?: ReactNode
      S?: ReactNode
      D?: DescriptionListProps["columnModifier"]
    }>()
    .with({ kind: "model" }, (data) => ({
      C: ["pdl_model"],
      B: (
        <>
          {typeof data.model === "string" && (
            <Query q={data.model} ctx={ctx} prompt="Model" />
          )}
          {data.input && <Query q={data.input} ctx={ctx} />}
          <ResultOrCode block={data} ctx={ctx} />
        </>
      ),
    }))
    .with({ kind: "code" }, (data) => ({
      C: ["pdl_code"],
      B: <ResultOrCode block={data} ctx={ctx} term="Execution Output" />,
    }))
    .with({ kind: "get" }, (data) => ({
      C: ["pdl_get"],
      B: <ResultOrCode block={data} ctx={ctx} />,
    }))
    .with({ kind: "data" }, (data) => ({
      C: ["pdl_data"],
      B: (
        <Result
          result={stringify(data.result)}
          ctx={ctx}
          lang="yaml"
          term={data.def ?? "Struct"}
        />
      ),
    }))
    .with({ kind: "if" }, (data) => ({
      C: ["pdl_if"],
      B: (
        <>
          <Query
            q={
              typeof data.if === "string"
                ? data.if.replace(/^\$\{*(.+)\}$/, "$1").trim()
                : isPdlBlock(data.if)
                  ? data.if
                  : "unknown"
            }
            ctx={ctx}
            prompt="Condition"
          />
          {data.if_result !== undefined && (
            <Query
              q={
                data.if_result === true
                  ? "Then (condition is true)"
                  : "Else (condition is false)"
              }
              ctx={ctx}
              prompt="Then or Else?"
            />
          )}
        </>
      ),
      S:
        data.if_result === undefined ? (
          <ResultOrCode block={data} ctx={ctx} />
        ) : data.if_result ? (
          show_block_conjoin(data?.then ?? "", ctx)
        ) : (
          show_block_conjoin(data?.else ?? "", ctx)
        ),
    }))
    .with({ kind: "read" }, (data) => ({
      C: ["pdl_read"],
      B: (
        <>
          {data.message && (
            <Query q={data.message.trim()} ctx={ctx} prompt="Question" />
          )}
          <ResultOrCode block={data} ctx={ctx} term="Answer" />
        </>
      ),
    }))
    .with({ kind: "include" }, (data) => ({
      C: ["pdl_include"],
      B: data.trace ? (
        show_block(data.trace, ctx)
      ) : (
        <ResultOrCode block={data} ctx={ctx} />
      ),
    }))
    .with({ kind: "function" }, (data) => ({
      C: ["pdl_function"],
      B: <Function f={data} ctx={ctx} />,
    }))
    // const args = document.createElement('pre');
    // args.innerHTML = htmlize(stringify({function: data.function}));
    // body.appendChild(args);
    // body.appendChild(show_blocks(data.return));
    .with({ kind: "call" }, (data) => ({
      C: ["pdl_call"],
      B: data.trace ? (
        show_block(data.trace, ctx)
      ) : (
        // const args = document.createElement('pre');
        // args.innerHTML = htmlize(stringify({call: data.call, args: data.args}));
        // body.appendChild(args);
        <ResultOrCode block={data} ctx={ctx} />
      ),
    }))
    .with({ kind: "text" }, (data) => ({
      C: ["pdl_text"],
      B: data.text && <Text blocks={data.text} ctx={ctx} />,
    }))
    .with({ kind: "lastOf" }, (data) => ({
      C: ["pdl_lastOf"],
      S: LastOf({ blocks: data.lastOf, ctx: withParent(ctx, data.kind) }),
    }))
    .with({ kind: "array" }, (data) => ({
      C: ["pdl_array"],
      B: <ArrayUI array={data.array} ctx={ctx} />,
    }))
    .with({ kind: "object" }, (data) => ({
      C: ["pdl_object"],
      B:
        data.object instanceof Array ? (
          <ArrayUI array={data.object} ctx={ctx} />
        ) : (
          <ObjectUI object={data.object} ctx={ctx} />
        ),
    }))
    .with({ kind: "message" }, (data) => ({
      C: ["pdl_message"],
      B: (
        <>
          <pre>{data.role + ": "}</pre>
          {show_block(data.content, ctx)}
        </>
      ),
    }))
    .with({ kind: "repeat" }, (data) => ({
      C: ["pdl_repeat"],
      P: show_loop_trace(
        data?.trace ?? [data.repeat],
        withParent(ctx, data.kind),
        data.join,
      ),
    }))
    .with({ kind: "repeat_until" }, (data) => ({
      C: ["pdl_repeat_until"],
      S: show_loop_trace(
        data?.trace ?? [data.repeat],
        withParent(ctx, data.kind),
        data.join,
      ),
    }))
    .with({ kind: "for" }, (data) => ({
      C: ["pdl_for"],
      P: show_loop_trace(
        data?.trace ?? [data.repeat],
        withParent(ctx, data.kind),
        data.join,
      ),
    }))
    .with({ kind: "empty" }, () => ({ C: ["pdl_empty"], B: "☐" }))
    .with({ kind: "error" }, (data) => ({
      C: ["pdl_error"],
      B: (
        <Query
          prompt="Error Message"
          ctx={ctx}
          q={data.msg}
          className="pdl-mono"
        />
      ),
    }))
    .with({ kind: undefined }, () => ({
      C: ["pdl_error"],
      B: (
        <pre>
          Missing kind: <div>{JSON.stringify(data, undefined, 2)}</div>
        </pre>
      ),
    }))
    .exhaustive()

  return [
    prefixContent,
    data.defs &&
      Object.keys(data.defs).length > 0 &&
      Defs({ defs: data.defs, ctx }),
    bodyContent &&
      TranscriptItem({
        className: ["pdl_block", ...extraClasses].join(" "),
        ctx,
        block: data,
        children: bodyContent,
      }),
    suffixContent,
  ]
    .flat()
    .filter(Boolean)
}
