import { lazy, Suspense } from "react"
import { Tab, TabTitleText } from "@patternfly/react-core"

const DefContent = lazy(() => import("./DefContent"))
const BlockNotFound = lazy(() => import("./BlockNotFound"))
const SourceTabContent = lazy(() => import("./SourceTabContent"))
const ContextTabContent = lazy(() => import("./ContextTabContent"))
const SummaryTabContent = lazy(() => import("./SummaryTabContent"))
const RawTraceTabContent = lazy(() => import("./RawTraceTabContent"))

import { hasContextInformation, hasResult } from "../../helpers"

import type Model from "../timeline/model"

function defsBody(id: string, def: string | null, model: Model) {
  const block = model.find((block) => block.id === id)
  if (!block) {
    return (
      <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
        <BlockNotFound id={id} model={model} />
      </Tab>
    )
  }

  const value = def && block.block.defs ? block.block.defs[def] : undefined
  return (
    <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
      {!def ? (
        <>Internal error, missing field 'def' in query</>
      ) : (
        value && (
          <Suspense>
            <DefContent value={value} />
          </Suspense>
        )
      )}
    </Tab>
  )
}

function defBody(id: string, _def: string | null, model: Model) {
  const block = model.find((block) => block.id === id)
  if (!block) {
    return (
      <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
        <Suspense>
          <BlockNotFound id={id} model={model} />
        </Suspense>
      </Tab>
    )
  }

  const value = hasResult(block.block) ? block.block.result : undefined
  return (
    <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
      {!value ? "Value not found" : <DefContent value={value} />}
    </Tab>
  )
}

function blockBody(id: string, model: Model) {
  const block = model.find((block) => block.id === id)
  if (!block) {
    return (
      <Tab eventKey={0} title={<TabTitleText>Summary</TabTitleText>}>
        <BlockNotFound id={id} model={model} />
      </Tab>
    )
  }

  const tabs = [
    <Tab key={0} eventKey={0} title={<TabTitleText>Summary</TabTitleText>}>
      <Suspense>
        <SummaryTabContent block={block} />
      </Suspense>
    </Tab>,
    <Tab key={1} eventKey={1} title={<TabTitleText>Source</TabTitleText>}>
      <Suspense>
        <SourceTabContent block={block} />
      </Suspense>
    </Tab>,
    <Tab key={2} eventKey={2} title={<TabTitleText>Raw Trace</TabTitleText>}>
      <Suspense>
        <RawTraceTabContent block={block} />
      </Suspense>
    </Tab>,
  ]

  const pdlBlock = block.block
  if (hasContextInformation(pdlBlock)) {
    tabs.splice(
      1,
      0,
      <Tab key={3} eventKey={3} title={<TabTitleText>Context</TabTitleText>}>
        <Suspense>
          <ContextTabContent block={pdlBlock} />
        </Suspense>
      </Tab>,
    )
  }

  return tabs
}

type Props = {
  id: string
  def: string | null
  objectType: string
  model: Model
}

export default function DrawerContentBody({
  id,
  def,
  objectType,
  model,
}: Props) {
  switch (objectType) {
    case "defs":
      return defsBody(id, def, model)
    case "def":
      return defBody(id, def, model)
    default:
      return blockBody(id, model)
  }
}
