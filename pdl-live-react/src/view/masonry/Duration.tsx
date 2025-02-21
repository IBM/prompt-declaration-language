import prettyMs from "pretty-ms"
import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Flex,
  FlexItem,
  Tooltip,
} from "@patternfly/react-core"

import "./Duration.css"

type Props = Pick<
  Required<import("../../helpers").PdlBlockWithTiming>,
  "pdl__timing"
> & { sml: import("./Toolbar").SML }

const gapSm = { default: "gapSm" as const }
const nowrap = { default: "nowrap" as const }
const center = { default: "alignItemsCenter" as const }

/** Duration of block execution */
function duration(block: Props) {
  return block.pdl__timing.end_nanos - block.pdl__timing.start_nanos
}

function format(nanos: number, timezone: string) {
  return new Date(nanos / 1000000).toLocaleTimeString(navigator.language, {
    timeZone: timezone,
  })
}

export default function Duration(block: Props) {
  const dur = prettyMs(duration(block) / 1000000)

  const tip = (
    <DescriptionList isCompact isHorizontal isFluid>
      <DescriptionListGroup>
        <DescriptionListTerm>Duration</DescriptionListTerm>
        <DescriptionListDescription>{dur}</DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>Start Time</DescriptionListTerm>
        <DescriptionListDescription>
          {format(block.pdl__timing.start_nanos, block.pdl__timing.timezone)}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>End Time</DescriptionListTerm>
        <DescriptionListDescription>
          {format(block.pdl__timing.end_nanos, block.pdl__timing.timezone)}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  )

  return (
    <Tooltip content={tip}>
      <Flex
        gap={gapSm}
        alignItems={center}
        flexWrap={nowrap}
        className="pdl-duration"
      >
        <FlexItem>
          <strong>
            {block.sml === "xl" &&
              format(block.pdl__timing.start_nanos, block.pdl__timing.timezone)}
          </strong>
        </FlexItem>
        <FlexItem>
          {block.sml === "xl" ? "(" : ""}
          {dur}
          {block.sml === "xl" ? ")" : ""}
        </FlexItem>
      </Flex>
    </Tooltip>
  )
}
