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
    const id = "defs-" + ctx.id + "-" + key
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
        isClickable
        onClick={drilldown}
        key={key}
        className="pdl-transcript-item"
        data-id={id}
      >
        <CardHeader
          id={id}
          selectableActions={{
            onClickAction: drilldown,
            selectableActionAriaLabelledby: id,
          }}
        >
          <Flex alignItems={alignCenter}>
            <FlexItem className="pdl-block-icon">
              <EqualsIcon />
            </FlexItem>

            <CardTitle id={id}>{breadcrumbs}</CardTitle>
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
              <Truncate
                content={Object.keys(parseYaml(value.result))
                  .map((k) => k + ": …")
                  .join(", ")}
              />
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
