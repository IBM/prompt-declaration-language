import { lazy, Suspense } from "react"
import { Tab, TabTitleText } from "@patternfly/react-core"

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

function defBody(_def: string | null, block: Model) {
  const value = hasResult(block) ? block.result : undefined
  return (
    <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
      {!value ? "Value not found" : <DefContent value={value} />}
    </Tab>
  )
}

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
    <Tab key={2} eventKey={2} title={<TabTitleText>Raw Trace</TabTitleText>}>
      <Suspense>
        <RawTraceTabContent block={block} />
      </Suspense>
    </Tab>,
  ]

  if (hasContextInformation(block)) {
    tabs.splice(
      1,
      0,
      <Tab key={3} eventKey={3} title={<TabTitleText>Context</TabTitleText>}>
        <Suspense>
          <ContextTabContent block={block} />
        </Suspense>
      </Tab>,
    )
  }

  return tabs
}

type Props = {
  def: string | null
  objectType: string
  model: Model
}

export default function DrawerContentBody({ def, objectType, model }: Props) {
  switch (objectType) {
    case "def":
      return defBody(def, model)
    default:
      return blockBody(model)
  }
}
