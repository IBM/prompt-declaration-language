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

function defBody(_def: string | null, block: Model) {
  const value = hasResult(block) ? block.pdl__result : undefined
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
  id: string | null
  value: string
  def: string | null
  objectType: string
  model: Model | null
}

export default function DrawerContentBody({
  id,
  value,
  def,
  objectType,
  model,
}: Props) {
  switch (objectType) {
    case "def":
      if (!model) {
        return (
          <Suspense>
            <BlockNotFound pdl__id={id} value={value} />
          </Suspense>
        )
      }
      return defBody(def, model)
    default:
      if (!model) {
        return (
          <Suspense>
            <BlockNotFound pdl__id={id} value={value} />
          </Suspense>
        )
      }

      return blockBody(model)
  }
}
