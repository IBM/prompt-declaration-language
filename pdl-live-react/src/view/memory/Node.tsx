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
  const labelClassSuffix = /Read/.test(label)
    ? "read"
    : /Code/.test(label)
      ? "code"
      : /LLM/.test(label)
        ? "model"
        : "other"

  return (
    <DefaultNode
      badgeClassName={"pdl-topology-node-badge pdl-fill-" + labelClassSuffix}
      {...props}
      badge={badge}
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
