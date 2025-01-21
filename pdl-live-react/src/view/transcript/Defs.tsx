import { parse as parseYaml } from "yaml"
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
import DefContent from "./DefContent"
import BreadcrumbBar from "./BreadcrumbBar"

import {
  hasParser,
  hasResult,
  hasScalarResult,
  firstLineOf,
} from "../../helpers"

import EqualsIcon from "@patternfly/react-icons/dist/esm/icons/equals-icon"

import type Context from "../../Context"
import type { PdlBlock } from "../../pdl_ast"

type Props = { defs: { [k: string]: PdlBlock }; ctx: Context }

const alignCenter = { default: "alignItemsCenter" as const }

/** A set of variable definitions */
export default function Defs({ defs, ctx }: Props) {
  const entries = Object.entries(defs)
  return entries.map(([key, value]) => {
    const breadcrumbs = (
      <BreadcrumbBar>
        <Def ctx={ctx} def={key} value={value} />
      </BreadcrumbBar>
    )

    const drilldown = () =>
      ctx.setDrawerContent({
        header: "Variable definition",
        description: breadcrumbs,
        body: <DefContent value={value} ctx={ctx} />,
      })

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
  })
}
