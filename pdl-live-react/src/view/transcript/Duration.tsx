import prettyMs from "pretty-ms"
import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Tooltip,
} from "@patternfly/react-core"

import "./Duration.css"

type Props = {
  block: import("../../helpers").PdlBlockWithTiming
}

/** Duration of block execution */
function duration(block: Props["block"]) {
  return block.end_nanos - block.start_nanos
}

function format(nanos: number, timezone: string) {
  return new Date(nanos / 1000000).toLocaleTimeString(navigator.language, {
    timeZone: timezone,
  })
}

export default function Duration({ block }: Props) {
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
          {format(block.start_nanos, block.timezone)}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>End Time</DescriptionListTerm>
        <DescriptionListDescription>
          {format(block.end_nanos, block.timezone)}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  )

  return (
    <Tooltip content={tip}>
      <span className="pdl-duration">{dur}</span>
    </Tooltip>
  )
}
