import { type FunctionComponent } from "react"
import {
  BadgeLocation,
  DefaultNode,
  type GraphElement,
  type WithSelectionProps,
} from "@patternfly/react-topology"

type CustomNodeProps = WithSelectionProps & {
  element: GraphElement
}

const CustomNode: FunctionComponent<CustomNodeProps> = (
  props: CustomNodeProps,
) => {
  const { ordinal } = props.element.getData()
  const label = props.element.getLabel()
  const badge = ordinal
  const badgeColor = /Read/.test(label)
    ? "var(--pf-t--global--color--nonstatus--green--default)"
    : /Code/.test(label)
      ? "var(--pf-t--global--color--nonstatus--orange--default)"
      : /LLM/.test(label)
        ? "var(--pf-t--global--color--nonstatus--teal--default)"
        : "var(--pf-t--color--white)"
  /*const content =
    data && "content" in data && typeof data.content === "string"
      ? data.content
      : null*/

  /*      badge={(ordinal !== undefined ? `[${ordinal}] ` : "") + variant}
      badgeColor={
        variant === "Final Result"
          ? "var(--pf-t--global--icon--color--status--success--default)"
          : "var(--pf-t--global--color--brand--default)"
      }
      badgeTextColor="var(--pf-t--global--background--color--primary--default)"
      badgeBorderColor="transparent"
*/

  return (
    <DefaultNode
      {...props}
      badge={badge}
      badgeColor={badgeColor}
      badgeTextColor="var(--pf-t--color--black)"
      badgeLocation={BadgeLocation.below}
    >
      {/*content && (
        <g
          transform={`translate(${(-Math.min(30, content.length - 1) * 3.5) / 2 + 5}, 10.5)`}
        >
          <text className="pdl-dataflow-content">
            {data.content.slice(0, 30)}
          </text>
        </g>
      )*/}
    </DefaultNode>
  )
}

export default CustomNode
