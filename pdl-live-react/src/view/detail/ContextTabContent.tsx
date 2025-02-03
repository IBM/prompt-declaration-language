import { Link, useLocation } from "react-router"
import {
  Button,
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Divider,
  Stack,
} from "@patternfly/react-core"

import Result from "../transcript/Result"

type Props = {
  block: import("../../helpers").PdlBlockWithContext
}

export default function SummaryTabContent({ block }: Props) {
  const { hash } = useLocation()

  return (
    <DescriptionList>
      {block.context.map((c, idx, A) => (
        <>
          <DescriptionListGroup key={idx}>
            <DescriptionListTerm>
              {c.role[0].toUpperCase() + c.role.slice(1)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Stack>
                <Result result={c.content} term="" />
                {c.defsite && (
                  <Button variant="link" isInline>
                    <Link
                      to={`?detail&type=block&id=${encodeURIComponent(c.defsite)}${hash}`}
                    >
                      Where is this value defined?
                    </Link>
                  </Button>
                )}
              </Stack>
            </DescriptionListDescription>
          </DescriptionListGroup>

          {idx < A.length - 1 && <Divider />}
        </>
      ))}
    </DescriptionList>
  )
}
