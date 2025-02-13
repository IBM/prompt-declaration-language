import {
  ForceLayout as ColaLayout,
  Graph,
  Layout,
  LayoutFactory,
} from "@patternfly/react-topology"

const layoutFactory: LayoutFactory = (
  type: string,
  graph: Graph,
): Layout | undefined => {
  switch (type) {
    case "Cola":
      return new ColaLayout(graph)
    default:
      return new ColaLayout(graph, { layoutOnDrag: false })
  }
}

export default layoutFactory
