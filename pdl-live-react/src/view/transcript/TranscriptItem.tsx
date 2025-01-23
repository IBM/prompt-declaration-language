import { useCallback, useMemo, type PropsWithChildren } from "react"
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
import Duration from "./Duration"
import PrettyKind from "./PrettyKind"
import BreadcrumbBar from "./BreadcrumbBar"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

import {
  capitalizeAndUnSnakeCase,
  hasTimingInformation,
  hasResult,
  nonNullable,
  type NonScalarPdlBlock,
} from "../../helpers"

type Props = PropsWithChildren<{
  className?: string
  ctx: Context
  block: NonScalarPdlBlock
}>

const alignCenter = { default: "alignItemsCenter" as const }

/** One item in the Transcript UI */
export default function TranscriptItem(props: Props) {
  const icon = Icon({ kind: props.block.kind })
  const { ctx, block, children } = props
  const { def, kind } = block
  const { parents } = ctx
  const value = hasResult(block) && block.result

  const breadcrumbs = useMemo(
    () => (
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
          {def && <Def def={def} ctx={ctx} value={value} />}
        </>
      </BreadcrumbBar>
    ),
    [def, value, kind, parents, ctx],
  )

  const headerContent = (
    <Flex alignItems={alignCenter}>
      {icon && <FlexItem className="pdl-block-icon">{icon}</FlexItem>}
      <FlexItem>{breadcrumbs}</FlexItem>
    </Flex>
  )

  const drilldown = useCallback(() => {
    ctx.setDrawerContent({
      header: "Block Details",
      description: breadcrumbs,
      body: [
        {
          title: "Summary",
          body: <DescriptionList>{children}</DescriptionList>,
        },
        {
          title: "Source",
          body: <Code block={block} />,
        },
        {
          title: "Raw Trace",
          body: <Code block={block} raw />,
        },
      ],
    })
  }, [block, children, breadcrumbs, ctx])

  const actions = useMemo(
    () =>
      hasTimingInformation(block)
        ? { actions: <Duration block={block} /> }
        : undefined,
    [block],
  )

  return (
    <Card
      onClick={drilldown}
      className={
        "pdl-transcript-item" + (props.className ? " " + props.className : "")
      }
    >
      <CardHeader actions={actions}>
        <CardTitle>{headerContent}</CardTitle>
      </CardHeader>

      <CardBody>
        <PrettyKind block={block} />
      </CardBody>
    </Card>
  )
}
