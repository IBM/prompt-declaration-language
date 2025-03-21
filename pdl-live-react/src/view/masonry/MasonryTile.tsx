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
  footer3Key,
  footer3Value,
  stability,
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
              <Suspense key="run" fallback={<div />}>
                <RunMenu run={run} block={block} />
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

  const hasFooter =
    (footer1Key && footer1Value) ||
    (footer2Key && footer2Value) ||
    (footer3Key && footer3Value) ||
    (stability?.length ?? 0) > 0
  const footer = hasFooter && (
    <DescriptionList className="pdl-masonry-tile-footer-dl">
      {footer1Key && (
        <DescriptionListGroup>
          <DescriptionListTerm>{footer1Key}</DescriptionListTerm>
          <DescriptionListDescription>
            {footer1Value}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {footer2Key && (
        <DescriptionListGroup>
          <DescriptionListTerm>{footer2Key}</DescriptionListTerm>
          <DescriptionListDescription>
            {footer2Value}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {footer3Key && (
        <DescriptionListGroup>
          <DescriptionListTerm>{footer3Key}</DescriptionListTerm>
          <DescriptionListDescription>
            {footer3Value}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {stability &&
        stability.map((m) => (
          <DescriptionListGroup
            key={m.temperature}
            className="pdl-masonry-tile-footer2-dg"
          >
            <DescriptionListTerm>
              T={m.temperature} Stability
            </DescriptionListTerm>
            <DescriptionListDescription>
              {renderValue(m)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        ))}
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

function renderValue({
  temperature,
  matrix,
  results,
}: import("./stability").BlockWithStabilityMetrics["pdl__stability"][number]) {
  const value = matrix
  const detailHeader = `Stability across calls with the same input (temperature=${temperature})`
  const detailBody = results

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
          const quartile =
            v >= 0.925 ? 4 : v >= 0.7 ? 3 : v >= 0.6 ? 2 : v >= 0.5 ? 1 : 0
          const { i, j } = lookup[idx]

          return (
            <Popover
              key={idx}
              hasAutoWidth
              maxWidth="450px"
              triggerAction="hover"
              className="pdl-masonry-tile-stability-popover"
              headerContent={detailHeader}
              bodyContent={
                <Stack>
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
                    title={
                      v === 1
                        ? "Perfect Match!"
                        : "A/B Comparison of Differences"
                    }
                  />
                  <Split>
                    <Panel
                      isScrollable
                      className="pdl-masonry-tile-stability-popover-ab-panel"
                      data-perfect-match={v === 1 || undefined}
                    >
                      {v < 1 && (
                        <PanelHeader>
                          <Title headingLevel="h4">A</Title>
                        </PanelHeader>
                      )}
                      <PanelMain maxHeight="300px">
                        <PanelMainBody>
                          <Result result={detailBody?.[i]} term="" />
                        </PanelMainBody>
                      </PanelMain>
                    </Panel>
                    {v < 1 && (
                      <Panel
                        isScrollable
                        variant="secondary"
                        className="pdl-masonry-tile-stability-popover-ab-panel"
                      >
                        <PanelHeader>
                          <Title headingLevel="h4">B</Title>
                        </PanelHeader>
                        <PanelMain maxHeight="300px">
                          <PanelMainBody>
                            <Result result={detailBody?.[j]} term="" />
                          </PanelMainBody>
                        </PanelMain>
                      </Panel>
                    )}
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
