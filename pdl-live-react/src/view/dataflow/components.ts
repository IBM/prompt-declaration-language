import {
  DefaultEdge,
  DefaultGroup,
  ModelKind,
  withPanZoom,
  withSelection,
  GraphComponent,
  type ComponentFactory,
} from "@patternfly/react-topology"

import CustomNode from "./CustomNode"

const componentFactory: ComponentFactory = (kind: ModelKind, type: string) => {
  switch (type) {
    case "group":
      return DefaultGroup
    default:
      switch (kind) {
        case ModelKind.graph:
          return withPanZoom()(GraphComponent)
        case ModelKind.node:
          return withSelection()(CustomNode)
        case ModelKind.edge:
          return DefaultEdge
        default:
          return undefined
      }
  }
}

export default componentFactory
