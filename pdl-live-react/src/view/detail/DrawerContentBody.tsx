import { lazy, Suspense } from "react"
import { Tab, TabTitleText } from "@patternfly/react-core"

const BlockNotFound = lazy(() => import("./BlockNotFound"))
const DefContent = lazy(() => import("./DefContent"))
const UsageTabContent = lazy(() => import("./UsageTabContent"))
const ResultTabContent = lazy(() => import("./ResultTabContent"))
const SourceTabContent = lazy(() => import("./SourceTabContent"))
const ContextTabContent = lazy(() => import("./ContextTabContent"))
const SummaryTabContent = lazy(() => import("./SummaryTabContent"))
const RawTraceTabContent = lazy(() => import("./RawTraceTabContent"))

import {
  hasContextInformation,
  hasModelUsage,
  hasResult,
  type NonScalarPdlBlock as Model,
} from "../../helpers"

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
  model: block,
}: Props) {
  if (!block) {
    return [
      <Tab eventKey={0} title={<TabTitleText>Error</TabTitleText>}>
        <Suspense fallback={<div />}>
          <BlockNotFound pdl__id={id} value={value} />
        </Suspense>
      </Tab>,
    ]
  }

  switch (objectType) {
    case "def": {
      const value = hasResult(block) ? block.pdl__result : undefined
      return [
        <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
          {!value ? "Value not found" : <DefContent value={value} />}
        </Tab>,
      ]
    }

    default: {
      // some blocks have nothing interesting to show other than their result
      const hasSummary = !(block.kind === "data")

      return [
        ...(!hasSummary
          ? []
          : [
              <Tab
                key={0}
                eventKey={0}
                title={<TabTitleText>Summary</TabTitleText>}
              >
                <Suspense>
                  <SummaryTabContent block={block} />
                </Suspense>
              </Tab>,
            ]),

        ...(!hasContextInformation(block)
          ? []
          : [
              <Tab
                key={3}
                eventKey={3}
                title={<TabTitleText>Messages</TabTitleText>}
              >
                <Suspense>
                  <ContextTabContent block={block} />
                </Suspense>
              </Tab>,
            ]),

        ...(!hasResult(block)
          ? []
          : [
              <Tab
                key="result"
                eventKey="result"
                title={<TabTitleText>Result</TabTitleText>}
              >
                <Suspense>
                  <ResultTabContent block={block} />
                </Suspense>
              </Tab>,
            ]),

        ...(!hasModelUsage(block)
          ? []
          : [
              <Tab
                key={4}
                eventKey={4}
                title={<TabTitleText>Usage</TabTitleText>}
              >
                <Suspense>
                  <UsageTabContent block={block} />
                </Suspense>
              </Tab>,
            ]),
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
    }
  }
}
