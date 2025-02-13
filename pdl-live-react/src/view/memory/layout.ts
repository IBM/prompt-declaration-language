import {
  ColaLayout,
  Graph,
  Layout,
  LayoutFactory,
} from "@patternfly/react-topology"

const layoutFactory: LayoutFactory = (
  type: string,
  graph: Graph,
): Layout | undefined => {
  const nodeDistance = 28
  switch (type) {
    case "Cola":
      return new ColaLayout(graph, { nodeDistance })
    default:
      return new ColaLayout(graph, { nodeDistance, layoutOnDrag: false })
  }
}

export default layoutFactory
