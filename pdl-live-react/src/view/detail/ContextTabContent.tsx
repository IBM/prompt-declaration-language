import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Divider,
} from "@patternfly/react-core"

import Result from "../transcript/Result"
import BreadcrumbBarForBlockId from "../breadcrumbs/BreadcrumbBarForBlockId"

type Props = {
  block: import("../../helpers").PdlBlockWithContext
}

export default function ContextTabContent({ block }: Props) {
  return (
    <DescriptionList>
      {block.context.flatMap((c, idx, A) => [
        <DescriptionListGroup key={idx + ".value"}>
          <DescriptionListTerm>
            {c.role[0].toUpperCase() + c.role.slice(1)}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Result result={c.content} term="" />
          </DescriptionListDescription>
        </DescriptionListGroup>,

        <DescriptionListGroup key={idx + ".defsite"}>
          <DescriptionListTerm>
            Where was this value defined?
          </DescriptionListTerm>
          <DescriptionListDescription>
            {c.defsite && <BreadcrumbBarForBlockId id={c.defsite} />}
          </DescriptionListDescription>
        </DescriptionListGroup>,

        idx < A.length - 1 && <Divider key={idx + ".divider"} />,
      ])}
    </DescriptionList>
  )
}
