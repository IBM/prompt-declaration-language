import { type FunctionComponent } from "react"
import {
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
  const label = props.element.getLabel()
  const badge = label[0].toUpperCase()
  const badgeColor = /read/.test(label)
    ? "var(--pf-t--global--color--nonstatus--orange--default)"
    : /code/.test(label)
      ? "var(--pf-t--global--color--nonstatus--blue--default)"
      : /LLM/.test(label)
        ? "var(--pf-t--global--color--nonstatus--teal--default)"
        : undefined
  console.error(label, badgeColor)
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
    <DefaultNode {...props} badge={badge} badgeColor={badgeColor}>
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
