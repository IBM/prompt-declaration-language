import { match, P } from "ts-pattern"
import {
  WebWorkerMLCEngine as MLCEngine,
  CreateWebWorkerMLCEngine,
  type InitProgressReport,
  type ChatCompletionMessageParam,
  type ChatCompletionRequestStreaming,
} from "@mlc-ai/web-llm"

import { type Unit } from "./Unit"
import { type InitProgress } from "./ProgressUI"

const engines: Record<string, Promise<MLCEngine>> = {}
type Message = ChatCompletionMessageParam

function messagify(input: Unit): Message[] {
  return match(input)
    .with({ cross: P.array() }, ({ cross }) => cross.flatMap(messagify))
    .with({ plus: P.array() }, ({ plus }) => plus.flatMap(messagify))
    .with({ assistant: P.array(P.string) }, ({ assistant: [content] }) => [
      { role: "assistant" as const, content },
    ])
    .with({ user: P.array(P.string) }, ({ user: [content] }) => [
      { role: "user" as const, content },
    ])
    .with({ system: P.array(P.string) }, ({ system: [content] }) => [
      { role: "system" as const, content },
    ])
    .otherwise(() => [])
}

// Callback function for initializing progress
function updateEngineInitProgressCallback(
  setProgressInit: (p: InitProgress) => void,
  setProgressDownload: (n: number) => void,
) {
  return (report: InitProgressReport) => {
    console.log("initialize", report)
    const match = report.text.match(/cache\[(\d+)\/(\d+)\]/)
    if (match) {
      setProgressInit({
        min: 0,
        value: parseInt(match[1]),
        max: parseInt(match[2]),
      })
    }
    setProgressDownload(report.progress * 100)
  }
}

async function streamingGenerating(
  engine: MLCEngine,
  messages: Message[],
  onUpdate: (msg: string) => void,
  updateGenerationProgress: null | ((n: number) => void),
  maxTokens: number,
  temperature: number,
): Promise<string> {
  try {
    const req: ChatCompletionRequestStreaming = {
      stream: true,
      messages,
      temperature,
    }
    if (maxTokens > 0) {
      req.max_tokens = maxTokens
    }
    const completion = await engine.chat.completions.create(req)
    for await (const chunk of completion) {
      const curDelta = chunk.choices[0].delta.content
      if (curDelta) {
        onUpdate(curDelta)
        if (updateGenerationProgress) {
          updateGenerationProgress(curDelta.length)
        }
      }
    }
    return engine.getMessage()
  } catch (err) {
    console.error(err)
    return ""
  }
}

/**
 * Create engine instance for the `selectedModel` with given `temperature`.
 */
async function initializeEngine(
  selectedModel: string,
  setProgressInit: (p: InitProgress) => void,
  setProgressDownload: (n: number) => void,
) {
  const engine = await CreateWebWorkerMLCEngine(
    new Worker(new URL("./generate-worker.ts", import.meta.url), {
      type: "module",
    }),
    [selectedModel],
    {
      initProgressCallback: updateEngineInitProgressCallback(
        setProgressInit,
        setProgressDownload,
      ),
    },
  )
  return engine
}

export default async function generate(
  input: Unit,
  defaultModel: string,
  maxTokens: number,
  temperature: number,
  emit: (msg: string) => void,
  setProgressInit: (p: InitProgress) => void,
  setProgressDownload: (n: number) => void,
  updateGenerationProgress: null | ((n: number) => void),
  idx: number,
): Promise<string> {
  const messages = messagify(input)
  console.log("gen messages", messages)

  const selectedModel = defaultModel // TODO

  // We may need multiple engines, so that we can run concurrent
  // generations across Plus... idx is the index in the Plus
  const key = `${selectedModel}.${idx}`
  if (!(key in engines)) {
    console.log("Initializing engine", key)
    engines[key] = initializeEngine(
      selectedModel,
      setProgressInit,
      setProgressDownload,
    )
  }

  const engine = await engines[key]
  return streamingGenerating(
    engine,
    messages,
    emit,
    updateGenerationProgress,
    maxTokens,
    temperature,
  )
}
