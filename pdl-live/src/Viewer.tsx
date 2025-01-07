import { stringify } from "yaml"
import Markdown from "react-markdown"

import {
  isValidElement,
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react"

import {
  Button,
  Content,
  DescriptionList,
  type DescriptionListProps,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Label,
  Panel,
  PanelMain,
  Popover,
  Tabs,
  Tab,
  TabTitleText,
  type TabsProps,
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  Stack,
  StackItem,
} from "@patternfly/react-core"

import Code from "./Code"
import Icon from "./Icon"
import InfoPopover from "./InfoPopover"
import prettyKind from "./pretty"
import { type SupportedLanguage } from "./Preview"

import type { PdlBlock, Join, BamModelBlock, TextBlock } from "./pdl_ast"
import { match, P } from "ts-pattern"

import "./Viewer.css"

const flex_1 = { default: "flex_1" as const }
const alignCenter = { default: "alignItemsCenter" as const }

/**
 * Set this to true if you want to limit height of some elements (code previews, output from LLMs). This will result in inner scrolling which might not be desirable.
 */
const innerScroll = true

/** Context info passed along with the render */
class Context {
  public constructor(
    /** Current id contextualized in trace AST tree */
    public id: string,

    /** Are we rendering in dark mode? */
    public darkMode: boolean,

    /** Callback to toggle accordion */
    public toggleAccordion: (evt: MouseEvent<HTMLButtonElement>) => void,
  ) {}

  public withId(id: string) {
    return new Context(this.id + "." + id, this.darkMode, this.toggleAccordion)
  }

  public withIter(iter: number) {
    return this.withId(String(iter))
  }
}

function Output({ data }: { data: PdlBlock }) {
  return match(data)
    .with(P.string, (output) => <div className="pdl-wrap">{output.trim()}</div>)
    .with(P.union(P.number, P.boolean, P.nullish), (output) => String(output))
    .with({ contribute: P.union([], ["context"]) }, () => {
      //div.classList.add('pdl_show_result_false'); // @nickm TODO
      return "☐"
    })
    .with({ result: P.string }, (data) => <Markdown>{data.result}</Markdown>)
    .with({ result: P._ }, (data) => (
      <pre>{JSON.stringify(data.result, undefined, 2)}</pre>
    ))
    .otherwise(() => "☐")
}

function show_text(
  blocks: PdlBlock[] | PdlBlock,
  ctx: Context,
  join_str: string | undefined,
) {
  if (Array.isArray(blocks)) {
    return (
      <div className="pdl_text">
        {blocks.flatMap((block, idx) => [
          join_str && <div key={idx + "-join"}>{join_str}</div>,
          <div key={idx}>{show_block(block, ctx.withIter(idx))}</div>,
        ])}
      </div>
    )
  } else {
    return show_block(blocks, ctx)
  }
}

function show_lastOf(blocks: PdlBlock[], ctx: Context) {
  return blocks.flatMap((block, idx) => show_block(block, ctx.withIter(idx)))
}

function show_array(array: PdlBlock[], ctx: Context) {
  return (
    <>
      <pre>{"["}</pre>
      {array.flatMap((block, idx) =>
        [
          <div key={idx}>{show_block(block, ctx.withIter(idx))}</div>,
          idx < array.length - 1 && <pre>,</pre>,
        ].filter(Boolean),
      )}
      <pre>{"]"}</pre>
    </>
  )
}

function show_object(object: { [key: string]: PdlBlock }, ctx: Context) {
  return (
    <>
      <pre>{"{"}</pre>
      {Object.keys(object).forEach((key) => (
        <>
          <pre>{key + ":"}</pre>
          {show_block(object[key], ctx)}
          <pre>,</pre>
        </>
      ))}
      <pre>{"}"}</pre>
    </>
  )
}

function show_block(data: PdlBlock, ctx: Context): ReactNode | ReactNode[] {
  if (
    data === null ||
    typeof data === "boolean" ||
    typeof data === "number" ||
    typeof data === "string"
  ) {
    return <Output data={data} />
  }

  // Hmm, special case for situations that would result in empty blocks
  if (data.kind === "if" && !data.if_result && !data.else) {
    // An if condition that evaluates to false, where there is no else clause
    return []
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
          {data.input && query(data.input, ctx)}
          {show_result_or_code(data, ctx)}
        </>
      ),
    }))
    .with({ kind: "code" }, (data) => ({
      C: ["pdl_code"],
      B: show_result_or_code(data, ctx, "Execution Output"),
    }))
    .with({ kind: "get" }, (data) => ({
      C: ["pdl_get"],
      B: show_result_or_code(data, ctx),
    }))
    .with({ kind: "data" }, (data) => ({
      C: ["pdl_data"],
      B: result(
        stringify(data.result),
        ctx,
        data.def,
        "yaml",
        data.def ?? "Struct",
      ),
    }))
    .with({ kind: "if" }, (data) => ({
      C: ["pdl_if"],
      B: (
        <>
          {query(
            typeof data.if === "string"
              ? data.if.replace(/^\$\{*(.+)\}$/, "$1").trim()
              : isPdlBlock(data.if)
                ? data.if
                : "unknown",
            ctx,
            "Condition",
          )}
          {data.if_result !== undefined &&
            query(
              data.if_result === true
                ? "Then (condition is true)"
                : "Else (condition is false)",
              ctx,
              "Then or Else?",
            )}
        </>
      ),
      S:
        data.if_result === undefined
          ? show_result_or_code(data, ctx)
          : data.if_result
            ? show_block_conjoin(data?.then ?? "", ctx)
            : show_block_conjoin(data?.else ?? "", ctx),
    }))
    .with({ kind: "read" }, (data) => ({
      C: ["pdl_read"],
      B: (
        <>
          {data.message && query(data.message.trim(), ctx, "Question")}
          {show_result_or_code(data, ctx, "Answer")}
        </>
      ),
    }))
    .with({ kind: "include" }, (data) => ({
      C: ["pdl_include"],
      B: data.trace
        ? show_block(data.trace, ctx)
        : show_result_or_code(data, ctx),
    }))
    .with({ kind: "function" }, () => ({
      C: ["pdl_function", "pdl_show_result_false"],
      B: "☐", // TODO
    }))
    // const args = document.createElement('pre');
    // args.innerHTML = htmlize(stringify({function: data.function}));
    // body.appendChild(args);
    // body.appendChild(show_blocks(data.return));
    .with({ kind: "call" }, (data) => ({
      C: ["pdl_call"],
      B: data.trace
        ? show_block(data.trace, ctx)
        : // const args = document.createElement('pre');
          // args.innerHTML = htmlize(stringify({call: data.call, args: data.args}));
          // body.appendChild(args);
          show_result_or_code(data, ctx),
    }))
    .with({ kind: "text" }, (data) => ({
      C: ["pdl_text"],
      B: data.text && show_text(data.text, ctx, undefined),
    }))
    .with({ kind: "lastOf" }, (data) => ({
      C: ["pdl_lastOf"],
      S: show_lastOf(data.lastOf, ctx),
    }))
    .with({ kind: "array" }, (data) => ({
      C: ["pdl_array"],
      B: show_array(data.array, ctx),
    }))
    .with({ kind: "object" }, (data) => ({
      C: ["pdl_object"],
      B:
        data.object instanceof Array
          ? show_array(data.object, ctx)
          : show_object(data.object, ctx),
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
      P: show_loop_trace(data?.trace ?? [data.repeat], ctx, data.join),
    }))
    .with({ kind: "repeat_until" }, (data) => ({
      C: ["pdl_repeat_until"],
      S: show_loop_trace(data?.trace ?? [data.repeat], ctx, data.join),
    }))
    .with({ kind: "for" }, (data) => ({
      C: ["pdl_for"],
      P: show_loop_trace(data?.trace ?? [data.repeat], ctx, data.join),
    }))
    .with({ kind: "empty" }, () => ({ C: ["pdl_empty"], B: "☐" }))
    .with({ kind: "error" }, (data) => ({
      C: ["pdl_error"],
      B: show_result_or_code(data, ctx),
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

  const classes = ["pdl_block", ...extraClasses]
  //if (data?.contribute !== undefined && !data.contribute.includes("result")) {
  //classes.push("pdl_show_result_false")
  //}

  const kind = prettyKind(data)
  const icon = Icon({ kind: data.kind })

  return [
    prefixContent,
    data.defs && show_defs(data.defs, ctx),
    bodyContent && (
      <div className={classes.join(" ")} data-id={ctx.id}>
        <AccordionToggle id={ctx.id} onClick={ctx.toggleAccordion}>
          <Flex alignItems={alignCenter}>
            {icon && <FlexItem className="pdl-block-icon">{icon}</FlexItem>}
            <FlexItem flex={flex_1}>{kind}</FlexItem>
            <FlexItem>
              <InfoPopover block={data} darkMode={ctx.darkMode} />
            </FlexItem>
          </Flex>
        </AccordionToggle>
        <AccordionContent>
          <DescriptionList>{bodyContent}</DescriptionList>
        </AccordionContent>
      </div>
    ),
    suffixContent,
  ]
    .filter(Boolean)
    .flat()
}

function show_defs(defs: { [k: string]: PdlBlock }, ctx: Context) {
  const entries = Object.entries(defs)
  return (
    entries.length > 0 && (
      <DescriptionList isCompact isHorizontal isFluid>
        <DescriptionListGroup>
          <DescriptionListTerm>Variable Definitions</DescriptionListTerm>
          <DescriptionListDescription>
            {entries.map(([key, value]) => (
              <Popover
                key={key}
                hasAutoWidth
                maxWidth="600px"
                headerContent={`Variable definition`}
                bodyContent={
                  <Stack hasGutter>
                    <StackItem>{add_def(key)}</StackItem>
                    <StackItem>
                      {hasResult(value) && isPdlBlock(value.result) ? (
                        hasParser(value) &&
                        (value.parser === "yaml" ||
                          value.parser === "json" ||
                          value.parser === "jsonl") ? (
                          <Code
                            block={value.result}
                            darkMode={ctx.darkMode}
                            language={
                              value.parser === "jsonl" ? "json" : value.parser
                            }
                          />
                        ) : typeof value.result === "string" ? (
                          show_value(value.result)
                        ) : (
                          show_block(value.result, ctx)
                        )
                      ) : (
                        show_block(value, ctx)
                      )}
                    </StackItem>
                  </Stack>
                }
              >
                <Button variant="plain">{add_def(key)}</Button>
              </Popover>
            ))}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    )
  )
}

function show_loop_trace(
  trace: PdlBlock[],
  ctx: Context,
  join_config: Join | undefined,
) {
  return match(join_config)
    .with(P.nullish, () => show_text(trace, ctx, undefined))
    .with({ as: P.union("text", P.nullish) }, (cfg) =>
      show_text(trace, ctx, cfg?.with),
    )
    .with({ as: "array" }, () => show_array(trace, ctx))
    .with({ as: "lastOf" }, () => show_lastOf(trace, ctx))
    .with({ with: P._ }, () => show_blocks(trace, ctx))
    .exhaustive()
}

function add_def(name: string | null | undefined) {
  return name && <Label color="purple">{name}</Label>
}

function query(q: PdlBlock, ctx: Context, prompt = "Query") {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{prompt}</DescriptionListTerm>
      <DescriptionListDescription>
        {show_block(q, ctx)}
      </DescriptionListDescription>
    </DescriptionListGroup>
  )
}

function code(code: string, ctx: Context, lang: SupportedLanguage) {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Code</DescriptionListTerm>
      <DescriptionListDescription>
        <Code block={code.trim()} darkMode={ctx.darkMode} language={lang} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  )
}

function resultVariable(def: string) {
  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          headerContent={<div>Result Variable Definition</div>}
          bodyContent={
            <div>
              The output of this step is assigned to the variable{" "}
              <code>{def}</code>. Later steps can reference it by using{" "}
              <Button variant="link" isInline>
                <a
                  target="_blank"
                  href="https://jinja.palletsprojects.com/en/stable/"
                >
                  Jinja
                </a>
              </Button>{" "}
              expressions such as{" "}
              <code>
                ${"{"}
                {def}
                {"}"}
              </code>
              .
            </div>
          }
        >
          <DescriptionListTermHelpTextButton>
            Result Variable Definition
          </DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>{add_def(def)}</DescriptionListDescription>
    </DescriptionListGroup>
  )
}

function result(
  result: number | string | unknown,
  ctx: Context,
  def?: string | null,
  lang?: SupportedLanguage,
  term = "Result",
) {
  const isCode = lang && result

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>{term}</DescriptionListTerm>
        <DescriptionListDescription>
          <Panel
            className="pdl-result-panel"
            isScrollable={!isCode && innerScroll}
          >
            <PanelMain>
              {isCode ? (
                <Code block={result} darkMode={ctx.darkMode} language={lang} />
              ) : (
                show_value(result)
              )}
            </PanelMain>
          </Panel>
        </DescriptionListDescription>
      </DescriptionListGroup>

      {def && resultVariable(def)}
    </>
  )
}

function show_result_or_code(block: PdlBlock, ctx: Context, term?: string) {
  return match(block)
    .with(P.union(P.string, P.number), (data) => show_value(data))
    .with({ lang: "python", code: P.string, result: P._ }, (data) => (
      <>
        {code(data.code, ctx, data.lang)}
        {result(data.result, ctx, data.def, undefined, term)}
      </>
    ))
    .with({ result: P._ }, (data) =>
      result(data.result, ctx, data.def, undefined, term),
    )
    .otherwise((data) => <Code block={data} darkMode={ctx.darkMode} />)
}

function show_value(s: number | string | unknown) {
  return (
    <>
      {typeof s === "number" ? (
        s
      ) : typeof s === "string" ? (
        isMarkdownish(s) ? (
          <Content>
            <Markdown>{s}</Markdown>
          </Content>
        ) : (
          <pre>{s.trim()}</pre>
        )
      ) : (
        JSON.stringify(s, undefined, 2)
      )}
    </>
  )
}

/** Is the given block a generic text block? */
function isTextBlock(data: PdlBlock): data is TextBlock {
  return (data as TextBlock).kind === "text"
}

/** Is the given block a generic text block with non-null content? */
type TextBlockWithContent = TextBlock & { text: NonNullable<TextBlock["text"]> }
function isTextBlockWithContent(data: PdlBlock): data is TextBlockWithContent {
  return isTextBlock(data) && data.text !== null
}

/** Is the given block a generic text block with array content? */
function isTextBlockWithArrayContent(
  data: PdlBlock,
): data is TextBlockWithContent & { text: PdlBlock[] } {
  return isTextBlockWithContent(data) && Array.isArray(data.text)
}

/** Does the given block represent an LLM interaction? */
function isLLMBlock(data: PdlBlock): data is BamModelBlock {
  return (data as BamModelBlock).kind === "model"
}

/**
 * For any BamModelBlock (i.e. LLM interactions) without an `input`
 * field that are preceded by a text element, and treat that as the
 * input to the LLM.
 */
function conjoinModelInput(blocks: PdlBlock[]): PdlBlock[] {
  return blocks
    .flatMap((block, idx, A) => {
      const next = A[idx + 1]
      const prev = A[idx - 1]
      if (
        idx < A.length - 1 &&
        typeof block === "string" &&
        isLLMBlock(next) &&
        !next.input
      ) {
        // Smash the prior 'text' element into this 'model' element's 'input' attribute
        return Object.assign({}, A[idx + 1], { input: block })
      } else if (
        idx > 0 &&
        isLLMBlock(block) &&
        !block.input &&
        typeof prev === "string"
      ) {
        // Then we have already smashed this into the next block as the model.input attribute
        return null
      } else {
        // Unchanged
        return block
      }
    }, [])
    .filter(Boolean)
}

/** Does the given block have a `result` field? */
function hasResult(
  data: PdlBlock,
): data is NonNullable<PdlBlock> & { result: NonNullable<PdlBlock> } {
  return data != null && typeof data === "object" && "result" in data
}

/** Does the given block have a `parser` field? */
function hasParser(
  data: PdlBlock,
): data is NonNullable<PdlBlock> & { parser: import("./pdl_ast").Parser } {
  return data != null && typeof data === "object" && "result" in data
}

/** Does the given block have a stringable `result` field? */
/*function hasStringableResult(
  data: PdlBlock,
): data is NonNullable<PdlBlock> & { result: string | number | boolean } {
  return (
    hasResult(data) &&
    (typeof data.result === "string" ||
      typeof data.result === "number" ||
      typeof data.result === "boolean")
  )
}*/

const markdownPattern = /`/
/** Should we render `s` with react-markdown? */
function isMarkdownish(s: string) {
  return markdownPattern.test(s)
}

function isPdlBlock(o: unknown | ReactElement | PdlBlock): o is PdlBlock {
  const obj = o as PdlBlock
  return (
    obj === null ||
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean" ||
    typeof obj.kind === "string"
  )
}

function show_blocks(blocks: (ReactElement | PdlBlock)[], ctx: Context) {
  return blocks.flatMap((block, idx) =>
    !isPdlBlock(block) ? block : show_block_conjoin(block, ctx.withIter(idx)),
  )
}

function show_block_conjoin(block: PdlBlock, ctx: Context) {
  if (isTextBlockWithArrayContent(block)) {
    const { text: _text, result: _result, ...rest } = block
    return [
      show_block(Object.assign(rest, { text: null }), ctx.withId("rest")),
      ...conjoinModelInput(block.text).flatMap((block, idx) =>
        show_block(block, ctx.withIter(idx)),
      ),
    ].filter(Boolean)
  } else {
    return [show_block(block, ctx)]
  }
}

/** This is the main view component */
export default function Viewer({
  value,
  darkMode,
}: {
  value: string
  darkMode: boolean
}) {
  // Accordion state
  const [expanded, setExpanded] = useState<string[]>([])
  const toggleAccordion = useCallback(
    (evt: MouseEvent<HTMLButtonElement>) => {
      const id = evt.currentTarget.id

      const index = expanded.indexOf(id)
      const newExpanded: string[] =
        index >= 0
          ? [
              ...expanded.slice(0, index),
              ...expanded.slice(index + 1, expanded.length),
            ]
          : [...expanded, id]
      setExpanded(newExpanded)
    },
    [expanded, setExpanded],
  )

  const data = useMemo(
    () => (value ? (JSON.parse(value) as PdlBlock) : null),
    [value],
  )
  const [activeTabKey, setActiveTabKey] = useState<string | number>(
    "Transcript",
  )
  const handleTabClick = useCallback<Required<TabsProps>["onSelect"]>(
    (_event, tabIndex) => setActiveTabKey(tabIndex),
    [],
  )

  // re: mountOnEnter, unmountOnExit, sigh currently needed due to odd
  // zero-height issues with Preview/monaco editor
  return (
    data && (
      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label="Viewer tabs"
      >
        <Tab
          eventKey="Transcript"
          aria-label="Transcript"
          title={<TabTitleText>Transcript</TabTitleText>}
        >
          <Accordion className="pdl-accordion" togglePosition="start">
            {show_block_conjoin(
              data,
              new Context("root", darkMode, toggleAccordion),
            )
              .flat()
              .map((block, idx) => (
                <AccordionItem
                  key={idx}
                  className={isValidElement(block) && block.props.className}
                  isExpanded={
                    !isValidElement(block) ||
                    expanded.includes(block.props["data-id"])
                  }
                >
                  {block}
                </AccordionItem>
              ))}
          </Accordion>
        </Tab>

        {hasResult(data) && (
          <Tab
            eventKey="Result"
            aria-label="Result"
            title={<TabTitleText>Result</TabTitleText>}
          >
            <Code
              language={typeof data.result === "object" ? "yaml" : "plaintext"}
              block={
                typeof data.result === "object"
                  ? stringify(data.result)
                  : data.result
              }
              darkMode={darkMode}
              limitHeight={false}
            />
          </Tab>
        )}

        <Tab
          eventKey="Raw Trace"
          aria-label="Raw Trace"
          title={<TabTitleText>Raw Trace</TabTitleText>}
        >
          <Code block={data} darkMode={darkMode} limitHeight={false} />
        </Tab>
      </Tabs>
    )
  )
}
