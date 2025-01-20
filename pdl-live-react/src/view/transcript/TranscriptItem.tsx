import { type PropsWithChildren } from "react"
import {
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Flex,
  FlexItem,
} from "@patternfly/react-core"

import Def from "./Def"
import Icon from "./Icon"
import type Context from "../../Context"
import PrettyKind from "./PrettyKind"
import InfoPopover from "./InfoPopover"
import BreadcrumbBar from "./BreadcrumbBar"
import BreadcrumbBarItem from "./BreadcrumbBarItem"

import { hasResult, type NonScalarPdlBlock } from "../../helpers"

type Props = PropsWithChildren<{
  className?: string
  ctx: Context
  block: NonScalarPdlBlock
}>

const flex_1 = { default: "flex_1" as const }
const alignCenter = { default: "alignItemsCenter" as const }

function capitalizeAndUnSnakeCase(s: string) {
  return s[0].toUpperCase() + s.slice(1).replace(/[-_]/, " ")
}

function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

/** One item in the Transcript UI */
export default function TranscriptItem(props: Props) {
  const icon = Icon({ kind: props.block.kind })

  const breadcrumbs = (
    <BreadcrumbBar>
      <>
        {[...props.ctx.parents, props.block.kind ?? "unknown"]
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
        {props.block.def && (
          <Def
            def={props.block.def}
            ctx={props.ctx}
            value={hasResult(props.block) && props.block.result}
          />
        )}
      </>
    </BreadcrumbBar>
  )

  const toggleContent = (
    <Flex alignItems={alignCenter}>
      {icon && <FlexItem className="pdl-block-icon">{icon}</FlexItem>}
      <Flex>{breadcrumbs}</Flex>

      <FlexItem flex={flex_1}>
        <PrettyKind block={props.block} />
      </FlexItem>
    </Flex>
  )

  return (
    <AccordionItem
      key={props.ctx.id}
      className={props.className}
      data-id={props.ctx.id}
      isExpanded={props.ctx.isAccordionExpanded.includes(props.ctx.id)}
    >
      <AccordionToggle id={props.ctx.id} onClick={props.ctx.toggleAccordion}>
        {toggleContent}
      </AccordionToggle>

      <AccordionContent>
        <DescriptionList>
          {props.children}

          <DescriptionListGroup>
            <DescriptionListTerm>Raw Trace</DescriptionListTerm>
            <DescriptionListDescription>
              <InfoPopover block={props.block} ctx={props.ctx} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </AccordionContent>
    </AccordionItem>
  )
}
