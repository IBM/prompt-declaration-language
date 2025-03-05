import { useMemo, lazy, Suspense } from "react"

import {
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Flex,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Popover,
  Progress,
  Split,
  Stack,
  Title,
} from "@patternfly/react-core"

import Result from "../Result"
const RunMenu = lazy(() => import("./RunMenu"))
import Duration from "./Duration"
import MasonryTileWrapper from "./MasonryTileWrapper"
import BreadcrumbBarForBlockId from "../breadcrumbs/BreadcrumbBarForBlockId"

import "./Stability.css"

type Props = import("./Tile").default & {
  idx: number
  run: import("./MasonryCombo").Runner
  sml: import("./Toolbar").SML
}

const gapSm = { default: "gapSm" as const }
const nowrap = { default: "nowrap" as const }
const center = { default: "alignItemsCenter" as const }

export default function MasonryTile({
  sml,
  id,
  def,
  start_nanos,
  end_nanos,
  timezone,
  message,
  content,
  lang,
  kind,
  idx,
  footer1Key,
  footer1Value,
  footer2Key,
  footer2Value,
  footer2DetailHeader,
  footer2DetailBody,
  actions: tileActions = [],
  block,
  run,
}: Props) {
  const actions = useMemo(
    () => ({
      actions: (
        <>
          {sml !== "s" && start_nanos && end_nanos && timezone && (
            <Duration
              sml={sml}
              start_nanos={start_nanos}
              end_nanos={end_nanos}
              timezone={timezone}
            />
          )}
          {tileActions.map((action) =>
            action === "run" ? (
              <Suspense fallback={<div />}>
                <RunMenu key="run" run={run} block={block} />
              </Suspense>
            ) : (
              <></>
            ),
          )}
        </>
      ),
    }),
    [tileActions, run, block, start_nanos, end_nanos, timezone, sml],
  )

  const maxHeight =
    sml === "s"
      ? "20em"
      : sml === "m"
        ? "30em"
        : sml === "l"
          ? "40em"
          : undefined

  const header = (
    <CardHeader actions={actions}>
      <CardTitle>
        <Flex
          gap={gapSm}
          alignItems={center}
          flexWrap={nowrap}
          className="pdl-masonry-tile-header"
        >
          <div className="pdl-masonry-index">{idx}</div>
          <BreadcrumbBarForBlockId
            id={id}
            def={def}
            value={content}
            isCompact
            maxCrumbs={sml === "xl" ? 4 : sml === "l" ? 3 : 2}
          />
        </Flex>
      </CardTitle>
    </CardHeader>
  )

  const hasFooter = (footer1Key && footer1Value) || (footer2Key && footer2Value)
  const footer = hasFooter && (
    <DescriptionList isCompact isHorizontal isFluid>
      {footer1Key && (
        <DescriptionListGroup>
          <DescriptionListTerm>{footer1Key}</DescriptionListTerm>
          <DescriptionListDescription>
            {footer1Value}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {footer2Key && (
        <DescriptionListGroup className="pdl-masonry-tile-footer2-dg">
          <DescriptionListTerm>{footer2Key}</DescriptionListTerm>
          <DescriptionListDescription>
            {renderValue(footer2Value, footer2DetailHeader, footer2DetailBody)}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  )

  return (
    <MasonryTileWrapper
      sml={sml}
      kind={/^[^.]+$/.test(id) ? "output-of-program" : kind}
      header={header}
      footer={footer}
    >
      <Panel isScrollable={sml !== "xl"} className="pdl-masonry-tile-panel">
        <PanelMain maxHeight={maxHeight}>
          <Result
            term=""
            result={
              message
                ? `> ${message.trim().replace(/\n/g, "\n> ")}\n\n${content}`
                : content
            }
            lang={lang}
          />
        </PanelMain>
      </Panel>
    </MasonryTileWrapper>
  )
}

function renderValue(
  value: Props["footer2Value"],
  detailHeader?: Props["footer2DetailHeader"],
  detailBody?: Props["footer2DetailBody"],
) {
  if (Array.isArray(value) && detailBody) {
    const lookup: { i: number; j: number }[] = []
    let k = 0
    for (let i = 0; i < detailBody.length; i++) {
      for (let j = i + 1; j < detailBody.length; j++) {
        lookup[k++] = { i, j }
      }
    }

    return (
      <Flex className="pdl-masonry-tile-stability-grid">
        {value.map((v, idx) => {
          const quartile = Math.round(v / 0.25)
          const { i, j } = lookup[idx]

          return (
            <Popover
              hasAutoWidth
              maxWidth="500px"
              triggerAction="hover"
              headerContent={detailHeader}
              bodyContent={
                <Stack hasGutter>
                  <Progress
                    size="sm"
                    variant={
                      quartile <= 1
                        ? "danger"
                        : quartile <= 3
                          ? "warning"
                          : "success"
                    }
                    value={100 * v}
                    title="A/B Match"
                  />
                  <Split hasGutter>
                    <Panel isScrollable>
                      <PanelHeader>
                        <Title headingLevel="h4">A</Title>
                      </PanelHeader>
                      <PanelMain maxHeight="400px">
                        <PanelMainBody>
                          <Result result={detailBody?.[i]} term="" />
                        </PanelMainBody>
                      </PanelMain>
                    </Panel>
                    <Panel isScrollable>
                      <PanelHeader>
                        <Title headingLevel="h4">B</Title>
                      </PanelHeader>
                      <PanelMain maxHeight="400px">
                        <PanelMainBody>
                          <Result result={detailBody?.[j]} term="" />
                        </PanelMainBody>
                      </PanelMain>
                    </Panel>
                  </Split>
                </Stack>
              }
            >
              <div
                key={idx + "." + v}
                className="pdl-masonry-tile-stability-cell"
                data-quartile={quartile}
              />
            </Popover>
          )
        })}
      </Flex>
    )
  } else {
    return value
  }
}
