import { useMemo } from "react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Flex,
  Stack,
} from "@patternfly/react-core"

import Result from "../transcript/Result"
import Duration from "./Duration"
import BreadcrumbBarForBlockId from "../breadcrumbs/BreadcrumbBarForBlockId"

export type Tile = {
  id: string
  def?: string | null
  message?: string
  start_nanos?: number
  end_nanos?: number
  timezone?: string
  content: string
  lang?: import("../Preview").SupportedLanguage
  crumb?: boolean
  kind?: string
  boundedHeight?: boolean
}

type Props = Tile & { idx: number }

const gapSm = { default: "gapSm" as const }
const nowrap = { default: "nowrap" as const }
const center = { default: "alignItemsCenter" as const }

export default function MasonryTile({
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
                start_nanos={start_nanos}
                end_nanos={end_nanos}
                timezone={timezone}
              />
            ),
          }
        : undefined,
    [start_nanos, end_nanos, timezone],
  )

  return (
    <Card
      isPlain
      isLarge
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
            {crumb && <BreadcrumbBarForBlockId id={id} def={def} />}
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
