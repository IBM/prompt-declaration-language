import { useMemo } from "react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Flex,
  Stack,
} from "@patternfly/react-core"

import Result from "../Result"
import Duration from "./Duration"
import BreadcrumbBarForBlockId from "../breadcrumbs/BreadcrumbBarForBlockId"

type Props = import("./Tile").default & {
  idx: number
  as: import("./Toolbar").As
  sml: import("./Toolbar").SML
}

const gapSm = { default: "gapSm" as const }
const nowrap = { default: "nowrap" as const }
const center = { default: "alignItemsCenter" as const }

export default function MasonryTile({
  as,
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
      start_nanos && end_nanos && timezone
        ? {
            actions: (
              <Duration
                as={as}
                start_nanos={start_nanos}
                end_nanos={end_nanos}
                timezone={timezone}
              />
            ),
          }
        : undefined,
    [start_nanos, end_nanos, timezone, as],
  )

  return (
    <Card
      isPlain
      isLarge={sml === "l"}
      isCompact={sml === "s"}
      key={id}
      data-kind={kind}
      className="pdl-masonry-tile"
    >
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
                maxCrumbs={3}
              />
            )}
          </Flex>
        </CardTitle>
      </CardHeader>

      <CardBody className="pdl-masonry-tile-body">
        <Stack>
          {message && <i>{message}</i>}
          <Result term="" result={content} lang={lang} />
        </Stack>
      </CardBody>
    </Card>
  )
}
