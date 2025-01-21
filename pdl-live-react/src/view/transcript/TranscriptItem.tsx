import { type PropsWithChildren } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  DescriptionList,
  Flex,
  FlexItem,
} from "@patternfly/react-core"

import Def from "./Def"
import Icon from "./Icon"
import Code from "../Code"
import type Context from "../../Context"
import PrettyKind from "./PrettyKind"
import BreadcrumbBar from "./BreadcrumbBar"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

import { hasResult, nonNullable, type NonScalarPdlBlock } from "../../helpers"

type Props = PropsWithChildren<{
  className?: string
  ctx: Context
  block: NonScalarPdlBlock
}>

const alignCenter = { default: "alignItemsCenter" as const }

function capitalizeAndUnSnakeCase(s: string) {
  return s[0].toUpperCase() + s.slice(1).replace(/[-_]/, " ")
}

/** One item in the Transcript UI */
export default function TranscriptItem(props: Props) {
  const icon = Icon({ kind: props.block.kind })
  const { ctx, block, children } = props
  const { def, kind } = block
  const { parents } = ctx

  const breadcrumbs = (
    <BreadcrumbBar>
      <>
        {[...parents, kind === "model" ? "LLM" : (kind ?? "unknown")]
          .filter(nonNullable)
          .map((parent, idx, A) => {
            const isKind = idx === A.length - 1
            const className = isKind ? "pdl-breadcrumb-bar-item--kind" : ""
            return (
              <BreadcrumbBarItem
                key={idx}
                className={className}
                detail={parent}
              >
                {capitalizeAndUnSnakeCase(parent)}
              </BreadcrumbBarItem>
            )
          })}
        {def && (
          <Def def={def} ctx={ctx} value={hasResult(block) && block.result} />
        )}
      </>
    </BreadcrumbBar>
  )

  const headerContent = (
    <Flex alignItems={alignCenter}>
      {icon && <FlexItem className="pdl-block-icon">{icon}</FlexItem>}
      <Flex>{breadcrumbs}</Flex>
    </Flex>
  )

  const drilldown = () => {
    ctx.setDrawerContent({
      header: "Block Details",
      description: breadcrumbs,
      body: [
        {
          title: "Summary",
          body: <DescriptionList>{children}</DescriptionList>,
        },
        {
          title: "Trace Snippet",
          body: <Code block={props.block} darkMode={ctx.darkMode} />,
        },
      ],
    })
  }

  return (
    <Card
      key={props.ctx.id}
      id={props.ctx.id}
      onClick={drilldown}
      isClickable
      className={
        "pdl-transcript-item" + (props.className ? " " + props.className : "")
      }
      data-id={props.ctx.id}
    >
      <CardHeader
        selectableActions={{
          onClickAction: drilldown,
          selectableActionAriaLabelledby: props.ctx.id,
        }}
      >
        <CardTitle>{headerContent}</CardTitle>
      </CardHeader>

      <CardBody>
        <PrettyKind block={props.block} />
      </CardBody>
    </Card>
  )
}
