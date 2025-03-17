import { lazy, Suspense } from "react"
import { Tab, TabTitleText } from "@patternfly/react-core"

const BlockNotFound = lazy(() => import("./BlockNotFound"))
const DefContent = lazy(() => import("./DefContent"))
const SourceTabContent = lazy(() => import("./SourceTabContent"))
const ContextTabContent = lazy(() => import("./ContextTabContent"))
const SummaryTabContent = lazy(() => import("./SummaryTabContent"))
const RawTraceTabContent = lazy(() => import("./RawTraceTabContent"))

import {
  hasContextInformation,
  hasResult,
  type NonScalarPdlBlock as Model,
} from "../../helpers"

function blockBody(block: Model) {
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
    <Tab key={2} eventKey={2} title={<TabTitleText>Trace</TabTitleText>}>
      <Suspense>
        <RawTraceTabContent block={block} />
      </Suspense>
    </Tab>,
  ]

  if (hasContextInformation(block)) {
    tabs.splice(
      1,
      0,
      <Tab key={3} eventKey={3} title={<TabTitleText>Messages</TabTitleText>}>
        <Suspense>
          <ContextTabContent block={block} />
        </Suspense>
      </Tab>,
    )
  }

  return tabs
}

type Props = {
  id: string | null
  value: string
  def: string | null
  objectType: string
  model: Model | null
}

export default function DrawerContentBody({
  id,
  value,
  objectType,
  model,
}: Props) {
  if (!model) {
    return (
      <Suspense fallback={<div />}>
        <BlockNotFound pdl__id={id} value={value} />
      </Suspense>
    )
  }

  switch (objectType) {
    case "def": {
      const value = hasResult(model) ? model.pdl__result : undefined
      return (
        <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
          {!value ? "Value not found" : <DefContent value={value} />}
        </Tab>
      )
    }
    default:
      return blockBody(model)
  }
}
