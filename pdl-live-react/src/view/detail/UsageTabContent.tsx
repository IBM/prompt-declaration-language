import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListDescription,
  DescriptionListTerm,
} from "@patternfly/react-core"

import {
  completionRate,
  ptcRatio,
  type ModelBlockWithUsage,
  type PdlBlockWithTiming,
} from "../../helpers"

export default function UsageTabContent({
  block,
}: {
  block: ModelBlockWithUsage & PdlBlockWithTiming
}) {
  return <DescriptionList>{descriptionItems(block)}</DescriptionList>
}

function descriptionItems(block: ModelBlockWithUsage & PdlBlockWithTiming) {
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Completion Rate</DescriptionListTerm>
        <DescriptionListDescription>
          {completionRate(block).toFixed(0)} tokens/sec
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>Prompt/Completion Ratio</DescriptionListTerm>
        <DescriptionListDescription>
          {(ptcRatio(block) * 100).toFixed(2)}%
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>Prompt Tokens Consumed</DescriptionListTerm>
        <DescriptionListDescription>
          {block.pdl__usage.prompt_tokens}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>Completion Tokens Consumed</DescriptionListTerm>
        <DescriptionListDescription>
          {block.pdl__usage.completion_tokens}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  )
}
