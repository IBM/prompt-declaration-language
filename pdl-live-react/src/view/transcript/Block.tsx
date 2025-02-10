import { match } from "ts-pattern"

import { type ReactNode } from "react"
import { type DescriptionListProps } from "@patternfly/react-core"

import Defs from "./Defs"
import Output from "./Output"
import LastOf from "./LastOf"
import ArrayUI from "./Array"
import ObjectUI from "./Object"
import LoopTrace from "./LoopTrace"
import ResultOrCode from "./ResultOrCode"
import TranscriptItem from "./TranscriptItem"

import { type PdlBlock } from "../../helpers"

type Props = { data: PdlBlock }

/**
 * Render one tree of blocks rooted at `data` as a list of
 * `TranscriptItem`.
 */
export default function Block({ data }: Props): ReactNode {
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
    .with({ kind: "model" }, () => ({
      C: ["pdl_model"],
      B: <></>,
    }))
    .with({ kind: "code" }, () => ({
      C: ["pdl_code"],
      B: <></>,
    }))
    .with({ kind: "get" }, (data) => ({
      C: ["pdl_get"],
      B: <ResultOrCode block={data} />,
    }))
    .with({ kind: "data" }, () => ({
      C: ["pdl_data"],
      B: <></>,
    }))
    .with({ kind: "if" }, (data) => ({
      C: ["pdl_if"],
      S:
        data.if_result === undefined ? (
          <ResultOrCode block={data} />
        ) : data.if_result ? (
          <Block data={data?.then ?? ""} />
        ) : (
          <Block data={data?.else ?? ""} />
        ),
    }))
    .with({ kind: "match" }, (_) => ({
      C: ["pdl_match"], // TODO: define pdl_match
      // TODO
      B: <>"TODO"</>,
    }))
    .with({ kind: "read" }, () => ({
      C: ["pdl_read"],
      B: <></>,
    }))
    .with({ kind: "include" }, (data) => ({
      C: ["pdl_include"],
      B: data.trace ? (
        <Block data={data.trace} />
      ) : (
        <ResultOrCode block={data} />
      ),
    }))
    .with({ kind: "function" }, () => ({
      C: ["pdl_function"],
      B: <></>,
    }))
    .with({ kind: "call" }, () => ({
      C: ["pdl_call"],
      B: <></>,
    }))
    .with({ kind: "text" }, (data) => ({
      C: ["pdl_text"],
      S: !Array.isArray(data.text) ? (
        <Block data={data.text} />
      ) : (
        data.text.map((b, idx) => <Block key={idx} data={b} />)
      ),
    }))
    .with({ kind: "lastOf" }, (data) => ({
      C: ["pdl_lastOf"],
      S: <LastOf blocks={data.lastOf} />,
    }))
    .with({ kind: "array" }, (data) => ({
      C: ["pdl_array"],
      S: <ArrayUI array={data.array} />,
    }))
    .with({ kind: "object" }, (data) => ({
      C: ["pdl_object"],
      B:
        data.object instanceof Array ? (
          <ArrayUI array={data.object} />
        ) : (
          <ObjectUI object={data.object} />
        ),
    }))
    .with({ kind: "message" }, (data) => ({
      C: ["pdl_message"],
      B: (
        <>
          <pre>{data.role + ": "}</pre>
          <Block data={data.content} />
        </>
      ),
    }))
    .with({ kind: "repeat" }, (data) => ({
      C: ["pdl_repeat"],
      S: (
        <LoopTrace
          trace={data?.trace ?? [data.repeat]}
          join_config={data.join}
        />
      ),
    }))
    .with({ kind: "repeat_until" }, (data) => ({
      C: ["pdl_repeat_until"],
      S: (
        <LoopTrace
          trace={data?.trace ?? [data.repeat]}
          join_config={data.join}
        />
      ),
    }))
    .with({ kind: "for" }, (data) => ({
      C: ["pdl_for"],
      S: (
        <LoopTrace
          trace={data?.trace ?? [data.repeat]}
          join_config={data.join}
        />
      ),
    }))
    .with({ kind: "empty" }, () => ({ C: ["pdl_empty"], B: "☐" }))
    .with({ kind: "error" }, () => ({
      C: ["pdl_error"],
      B: <></>,
    }))
    .with({ kind: undefined }, () => ({
      C: ["pdl_error"],
      B: <></>,
    }))
    .exhaustive()

  return (
    <>
      {prefixContent}
      {data.defs && Object.keys(data.defs).length > 0 && (
        <Defs block={data} defs={data.defs} />
      )}
      {bodyContent && (
        <TranscriptItem
          className={["pdl_block", ...extraClasses].join(" ")}
          block={data}
        />
      )}
      {suffixContent}
    </>
  )
}
