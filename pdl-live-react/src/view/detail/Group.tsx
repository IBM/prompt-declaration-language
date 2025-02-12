import {
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from "@patternfly/react-core"

import Value from "../Value"

export default function Group({
  term,
  description,
}: {
  term: string
  description: import("react").ReactNode
}) {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{term}</DescriptionListTerm>
      <DescriptionListDescription>
        {typeof description !== "object" ? (
          <Value>{description}</Value>
        ) : (
          description
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  )
}
