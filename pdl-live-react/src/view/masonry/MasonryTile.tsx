import { useMemo } from "react"

import {
  CardHeader,
  CardTitle,
  Flex,
  Panel,
  PanelMain,
} from "@patternfly/react-core"

import Result from "../Result"
import Duration from "./Duration"
import MasonryTileWrapper from "./MasonryTileWrapper"
import BreadcrumbBarForBlockId from "../breadcrumbs/BreadcrumbBarForBlockId"

type Props = import("./Tile").default & {
  idx: number
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
  crumb,
  kind,
  idx,
}: Props) {
  const actions = useMemo(
    () =>
      sml !== "s" && start_nanos && end_nanos && timezone
        ? {
            actions: (
              <Duration
                sml={sml}
                start_nanos={start_nanos}
                end_nanos={end_nanos}
                timezone={timezone}
              />
            ),
          }
        : undefined,
    [start_nanos, end_nanos, timezone, sml],
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
          {crumb && (
            <BreadcrumbBarForBlockId
              id={id}
              def={def}
              value={content}
              isCompact
              maxCrumbs={sml === "xl" ? 4 : sml === "l" ? 3 : 2}
            />
          )}
        </Flex>
      </CardTitle>
    </CardHeader>
  )

  return (
    <MasonryTileWrapper sml={sml} kind={kind} header={header}>
      <Panel isScrollable={sml !== "xl"} className="pdl-masonry-tile-panel">
        <PanelMain maxHeight={maxHeight}>
          <Result
            term=""
            result={message ? `*${message.trim()}*\n\n${content}` : content}
            lang={lang}
          />
        </PanelMain>
      </Panel>
    </MasonryTileWrapper>
  )
}
