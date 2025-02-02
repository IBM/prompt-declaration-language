import { parse as parseYaml } from "yaml"
import { useCallback, useMemo } from "react"
import { useLocation, useNavigate } from "react-router"

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Truncate,
} from "@patternfly/react-core"

import Def from "./Def"
import Markdown from "../Markdown"
import BreadcrumbBar from "../breadcrumbs/BreadcrumbBar"

import {
  hasParser,
  hasResult,
  hasScalarResult,
  firstLineOf,
} from "../../helpers"

import EqualsIcon from "@patternfly/react-icons/dist/esm/icons/equals-icon"

type Props = {
  def: string
  value: import("../../pdl_ast").PdlBlock
  ctx: import("../../Context").default
}

const alignCenter = { default: "alignItemsCenter" as const }

export default function TranscriptItemDef({ def: key, value, ctx }: Props) {
  const breadcrumbs = useMemo(
    () => (
      <BreadcrumbBar>
        <Def ctx={ctx} def={key} value={value} supportsDrilldown={false} />
      </BreadcrumbBar>
    ),
    [key, value, ctx],
  )

  const navigate = useNavigate()
  const { hash } = useLocation()
  const { id } = ctx
  const drilldown = useCallback(
    () => navigate(`?detail&type=defs&id=${id}&def=${key}${hash}`),
    [key, id, hash, navigate],
  )

  return (
    <Card
      isCompact
      onClick={drilldown}
      key={key}
      className="pdl-transcript-item"
    >
      <CardHeader>
        <Flex alignItems={alignCenter}>
          <FlexItem className="pdl-block-icon">
            <EqualsIcon />
          </FlexItem>

          <CardTitle>{breadcrumbs}</CardTitle>
        </Flex>
      </CardHeader>

      <CardBody>
        {typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ? (
          firstLineOf(String(value))
        ) : hasScalarResult(value) ? (
          hasParser(value) &&
          typeof value.result === "string" &&
          value.parser === "yaml" ? (
            <code>
              <Truncate
                content={
                  "{" +
                  Object.entries(parseYaml(value.result))
                    .map(([k, v]) => {
                      const vstring = JSON.stringify(v)
                      return `"${k}": ${vstring.slice(0, 10)}${vstring.length > 10 ? "…" : ""}`
                    })
                    .join(", ") +
                  "}"
                }
              />
            </code>
          ) : (
            <Markdown>{firstLineOf(String(value.result))}</Markdown>
          )
        ) : hasResult(value) ? (
          <Truncate
            content={Object.keys(value.result)
              .map((k) => k + ": …")
              .join(", ")}
          />
        ) : (
          "…"
        )}
      </CardBody>
    </Card>
  )
}
