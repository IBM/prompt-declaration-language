import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Divider,
  Panel,
  PanelMain,
} from "@patternfly/react-core"

import Result from "../Result"
import BreadcrumbBarForBlockId from "../breadcrumbs/BreadcrumbBarForBlockId"

type Props = {
  block: import("../../helpers").PdlBlockWithContext
}

export default function ContextTabContent({ block }: Props) {
  return (
    <DescriptionList>
      {block.pdl__context.flatMap((c, idx, A) => [
        <DescriptionListGroup key={idx + ".value"}>
          <DescriptionListTerm>
            {c.role[0].toUpperCase() + c.role.slice(1)}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Panel isScrollable>
              <PanelMain>
                <Result result={c.content} term="" />
              </PanelMain>
            </Panel>
          </DescriptionListDescription>
        </DescriptionListGroup>,

        <DescriptionListGroup key={idx + ".pdl__defsite"}>
          <DescriptionListTerm>
            Where was this value defined?
          </DescriptionListTerm>
          <DescriptionListDescription>
            {c.pdl__defsite ? (
              <BreadcrumbBarForBlockId id={c.pdl__defsite} />
            ) : (
              "The origin of this data is not known"
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>,

        idx < A.length - 1 && <Divider key={idx + ".divider"} />,
      ])}
    </DescriptionList>
  )
}
