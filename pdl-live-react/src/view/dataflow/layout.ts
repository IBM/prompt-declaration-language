import {
  type Graph,
  type Layout,
  type LayoutFactory,
  ColaLayout,
} from "@patternfly/react-topology"

const layoutFactory: LayoutFactory = (
  _type: string,
  graph: Graph,
): Layout | undefined => {
  const options = { groupDistance: 80, nodeDistance: 50 }
  //return new ConcentricLayout(graph, options)
  //return new DagreLayout(graph)
  //return new ForceLayout(graph)
  //  return new GridLayout(graph)
  //return new ConcentricLayout(graph)
  return new ColaLayout(graph, Object.assign(options, { layoutOnDrag: false }))
  // return new ColaLayout(graph, options)
  //return new ColaGroupsLayout(graph, options)
}

export default layoutFactory
