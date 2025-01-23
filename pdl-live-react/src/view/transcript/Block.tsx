import { match } from "ts-pattern"

import { type ReactNode } from "react"
import { type DescriptionListProps } from "@patternfly/react-core"

import ArrayUI from "./Array"
import Defs from "./Defs"
import Function from "./Function"
import LastOf from "./LastOf"
import ObjectUI from "./Object"
import Output from "./Output"
import Query from "./Query"
import ResultOrCode from "./ResultOrCode"
import Text from "./Text"
import TranscriptItem from "./TranscriptItem"

import LoopTrace from "./LoopTrace"
import BlocksConjoin from "./BlocksConjoin"

import Context, { withParentAndId as withParent } from "../../Context"

import { type PdlBlock } from "../../helpers"

type Props = { data: PdlBlock; ctx: Context }

/**
 * Render one tree of blocks rooted at `data` as a list of
 * `TranscriptItem`.
 */
export default function Block({ data, ctx }: Props): ReactNode {
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
          <BlocksConjoin
            block={data?.then ?? ""}
            ctx={withParent(ctx, `${data.kind}.0`)}
          />
        ) : (
          <BlocksConjoin
            block={data?.else ?? ""}
            ctx={withParent(ctx, `${data.kind}.0`)}
          />
        ),
    }))
    .with({ kind: "read" }, () => ({
      C: ["pdl_read"],
      B: <></>,
    }))
    .with({ kind: "include" }, (data) => ({
      C: ["pdl_include"],
      B: data.trace ? (
        <Block data={data.trace} ctx={withParent(ctx, data.kind)} />
      ) : (
        <ResultOrCode block={data} />
      ),
    }))
    .with({ kind: "function" }, (data) => ({
      C: ["pdl_function"],
      B: <Function f={data} ctx={withParent(ctx, data.kind)} />,
    }))
    .with({ kind: "call" }, () => ({
      C: ["pdl_call"],
      B: <></>,
    }))
    .with({ kind: "text" }, (data) => ({
      C: ["pdl_text"],
      B: data.text && (
        <Text blocks={data.text} ctx={withParent(ctx, data.kind)} />
      ),
    }))
    .with({ kind: "lastOf" }, (data) => ({
      C: ["pdl_lastOf"],
      S: <LastOf blocks={data.lastOf} ctx={withParent(ctx, data.kind)} />,
    }))
    .with({ kind: "array" }, (data) => ({
      C: ["pdl_array"],
      B: <ArrayUI array={data.array} ctx={withParent(ctx, data.kind)} />,
    }))
    .with({ kind: "object" }, (data) => ({
      C: ["pdl_object"],
      B:
        data.object instanceof Array ? (
          <ArrayUI array={data.object} ctx={withParent(ctx, data.kind)} />
        ) : (
          <ObjectUI object={data.object} ctx={withParent(ctx, data.kind)} />
        ),
    }))
    .with({ kind: "message" }, (data) => ({
      C: ["pdl_message"],
      B: (
        <>
          <pre>{data.role + ": "}</pre>
          <Block data={data.content} ctx={withParent(ctx, data.kind)} />
        </>
      ),
    }))
    .with({ kind: "repeat" }, (data) => ({
      C: ["pdl_repeat"],
      P: (
        <LoopTrace
          trace={data?.trace ?? [data.repeat]}
          ctx={withParent(ctx, data.kind)}
          join_config={data.join}
        />
      ),
    }))
    .with({ kind: "repeat_until" }, (data) => ({
      C: ["pdl_repeat_until"],
      S: (
        <LoopTrace
          trace={data?.trace ?? [data.repeat]}
          ctx={withParent(ctx, data.kind)}
          join_config={data.join}
        />
      ),
    }))
    .with({ kind: "for" }, (data) => ({
      C: ["pdl_for"],
      P: (
        <LoopTrace
          trace={data?.trace ?? [data.repeat]}
          ctx={withParent(ctx, data.kind)}
          join_config={data.join}
        />
      ),
    }))
    .with({ kind: "empty" }, () => ({ C: ["pdl_empty"], B: "☐" }))
    .with({ kind: "error" }, (data) => ({
      C: ["pdl_error"],
      B: (
        <Query
          prompt="Error Message"
          ctx={withParent(ctx, data.kind)}
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

  return (
    <>
      {prefixContent}
      {data.defs && Object.keys(data.defs).length > 0 && (
        <Defs defs={data.defs} ctx={withParent(ctx, data.kind ?? "unknown")} />
      )}
      {bodyContent && (
        <TranscriptItem
          className={["pdl_block", ...extraClasses].join(" ")}
          ctx={withParent(ctx, data.kind ?? "unknown")}
          block={data}
        >
          {bodyContent}
        </TranscriptItem>
      )}
      {suffixContent}
    </>
  )
}
