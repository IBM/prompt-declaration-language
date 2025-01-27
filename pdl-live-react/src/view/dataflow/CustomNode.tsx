import { type FunctionComponent } from "react"
import { DefaultNode, type GraphElement } from "@patternfly/react-topology"

interface CustomNodeProps {
  element: GraphElement
}

const CustomNode: FunctionComponent<CustomNodeProps> = ({
  element,
}: CustomNodeProps) => {
  const data = element.getData()
  const ordinal = data && "ordinal" in data ? data.ordinal : undefined
  const variant = data && "variant" in data ? data.variant : undefined
  /*const content =
    data && "content" in data && typeof data.content === "string"
      ? data.content
      : null*/

  return (
    <DefaultNode
      element={element}
      badge={(ordinal !== undefined ? `[${ordinal}] ` : "") + variant}
      badgeColor={
        variant === "Final Result"
          ? "var(--pf-t--global--icon--color--status--success--default)"
          : "var(--pf-t--global--color--brand--default)"
      }
      badgeTextColor="var(--pf-t--global--background--color--primary--default)"
      badgeBorderColor="transparent"
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
