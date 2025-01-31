import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
} from "@patternfly/react-core"

import Result from "../transcript/Result"

type Props = {
  block: import("../../helpers").PdlBlockWithContext
}

export default function SummaryTabContent({ block }: Props) {
  return (
    <DescriptionList>
      {block.context.map((c, idx) => (
        <DescriptionListGroup key={idx}>
          <DescriptionListTerm>
            {c.role[0].toUpperCase() + c.role.slice(1)}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Result result={c.content} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  )
}
