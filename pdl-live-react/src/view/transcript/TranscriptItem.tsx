import { type PropsWithChildren } from "react"
import {
  AccordionContent,
  AccordionToggle,
  DescriptionList,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from "@patternfly/react-core"

import Defs from "./Defs"
import Icon from "./Icon"
import QAV from "./QAV"
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

/** One item in the Transcript UI */
export default function TranscriptItem(props: Props) {
  const icon = Icon({ kind: props.block.kind })

  return (
    <div className={props.className} data-id={props.ctx.id}>
      <AccordionToggle id={props.ctx.id} onClick={props.ctx.toggleAccordion}>
        <Flex alignItems={alignCenter}>
          {icon && <FlexItem className="pdl-block-icon">{icon}</FlexItem>}
          <FlexItem>
            <Flex>
              <BreadcrumbBar>
                {[...props.ctx.parents, props.block.kind ?? "unknown"].map(
                  (parent, idx) => (
                    <BreadcrumbBarItem key={idx}>
                      {capitalizeAndUnSnakeCase(parent)}
                    </BreadcrumbBarItem>
                  ),
                )}
              </BreadcrumbBar>
            </Flex>
          </FlexItem>
          <FlexItem flex={flex_1}>
            <Stack>
              <StackItem>
                <PrettyKind block={props.block} />
              </StackItem>
              {props.block.def && hasResult(props.block) && (
                <QAV q="V">
                  <Defs
                    defs={{ [props.block.def]: props.block.result }}
                    ctx={props.ctx}
                  />
                </QAV>
              )}
            </Stack>
          </FlexItem>
          <FlexItem>
            <InfoPopover block={props.block} ctx={props.ctx} />
          </FlexItem>
        </Flex>
      </AccordionToggle>
      <AccordionContent>
        <DescriptionList>{props.children}</DescriptionList>
      </AccordionContent>
    </div>
  )
}
