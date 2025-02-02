import { useCallback, useMemo } from "react"
import { useLocation, useNavigate } from "react-router"

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
} from "@patternfly/react-core"

import Def from "./Def"
import Icon from "./Icon"
import type Context from "../../Context"
import Duration from "./Duration"
import PrettyKind from "./PrettyKind"
import BreadcrumbBar from "../breadcrumbs/BreadcrumbBar"
import BreadcrumbBarItem from "../breadcrumbs/BreadcrumbBarItem"

import {
  capitalizeAndUnSnakeCase,
  hasTimingInformation,
  hasResult,
  nonNullable,
  type NonScalarPdlBlock,
} from "../../helpers"

type Props = {
  className?: string
  ctx: Context
  block: NonScalarPdlBlock
}

const alignCenter = { default: "alignItemsCenter" as const }

/** One item in the Transcript UI */
export default function TranscriptItem(props: Props) {
  const navigate = useNavigate()
  const { hash } = useLocation()

  const icon = Icon({ kind: props.block.kind })
  const { ctx, block } = props
  const { parents } = ctx
  const { def } = block
  const value = hasResult(block) && block.result

  const breadcrumbs = useMemo(
    () => (
      <BreadcrumbBar>
        <>
          {parents.filter(nonNullable).map((parent, idx, A) => {
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
    [def, value, parents, ctx],
  )

  const headerContent = (
    <Flex alignItems={alignCenter}>
      {icon && <FlexItem className="pdl-block-icon">{icon}</FlexItem>}
      <FlexItem>{breadcrumbs}</FlexItem>
    </Flex>
  )

  const { id } = ctx
  const drilldown = useCallback(
    () => navigate(`?detail&type=block&id=${id}${hash}`),
    [id, hash, navigate],
  )

  const actions = useMemo(
    () =>
      hasTimingInformation(block)
        ? { actions: <Duration block={block} /> }
        : undefined,
    [block],
  )

  return (
    <Card
      data-id={ctx.id}
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
