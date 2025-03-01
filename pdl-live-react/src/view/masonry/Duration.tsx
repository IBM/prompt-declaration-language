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
  Required<import("../../helpers").WithTiming>,
  "start_nanos" | "end_nanos" | "timezone"
> & { sml: import("./Toolbar").SML }

const gapSm = { default: "gapSm" as const }
const nowrap = { default: "nowrap" as const }
const center = { default: "alignItemsCenter" as const }

/** Duration of block execution */
function duration(timing: Props) {
  return timing.end_nanos - timing.start_nanos
}

function format(nanos: number, _timezone: string) {
  return new Date(nanos / 1000000).toTimeString(/*navigator.language, {
    timeZone: timezone,
  }*/)
}

export default function Duration(timing: Props) {
  const dur = prettyMs(duration(timing) / 1000000)

  const tip = (
    <DescriptionList isCompact isHorizontal isFluid>
      <DescriptionListGroup>
        <DescriptionListTerm>Duration</DescriptionListTerm>
        <DescriptionListDescription>{dur}</DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>Start Time</DescriptionListTerm>
        <DescriptionListDescription>
          {format(timing.start_nanos, timing.timezone)}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>End Time</DescriptionListTerm>
        <DescriptionListDescription>
          {format(timing.end_nanos, timing.timezone)}
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
            {timing.sml === "xl" && format(timing.start_nanos, timing.timezone)}
          </strong>
        </FlexItem>
        <FlexItem>
          {timing.sml === "xl" ? "(" : ""}
          {dur}
          {timing.sml === "xl" ? ")" : ""}
        </FlexItem>
      </Flex>
    </Tooltip>
  )
}
