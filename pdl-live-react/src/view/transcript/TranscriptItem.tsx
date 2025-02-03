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

import Icon from "./Icon"
import Duration from "./Duration"
import PrettyKind from "./PrettyKind"
import BreadcrumbBarForBlock from "../breadcrumbs/BreadcrumbBarForBlock"

import { hasTimingInformation, type NonScalarPdlBlock } from "../../helpers"

type Props = {
  className?: string
  block: NonScalarPdlBlock
}

const alignCenter = { default: "alignItemsCenter" as const }

/** One item in the Transcript UI */
export default function TranscriptItem(props: Props) {
  const navigate = useNavigate()
  const { hash } = useLocation()

  const icon = Icon({ kind: props.block.kind })
  const { block } = props
  const { id } = block

  const breadcrumbs = useMemo(
    () => <BreadcrumbBarForBlock block={block} />,
    [block],
  )

  const headerContent = (
    <Flex alignItems={alignCenter}>
      {icon && <FlexItem className="pdl-block-icon">{icon}</FlexItem>}
      <FlexItem>{breadcrumbs}</FlexItem>
    </Flex>
  )

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
      data-id={id}
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
