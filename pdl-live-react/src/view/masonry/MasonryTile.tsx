import { useMemo } from "react"

import {
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Flex,
  Panel,
  PanelMain,
} from "@patternfly/react-core"

import Result from "../Result"
import RunMenu from "./RunMenu"
import Duration from "./Duration"
import MasonryTileWrapper from "./MasonryTileWrapper"
import BreadcrumbBarForBlockId from "../breadcrumbs/BreadcrumbBarForBlockId"

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
              <RunMenu key="run" run={run} block={block} />
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

  const footer = footer1Key && footer1Value && (
    <DescriptionList isCompact isHorizontal isFluid>
      <DescriptionListGroup>
        <DescriptionListTerm>{footer1Key}</DescriptionListTerm>
        <DescriptionListDescription>{footer1Value}</DescriptionListDescription>
      </DescriptionListGroup>
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
