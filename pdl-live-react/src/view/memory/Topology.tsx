import { useEffect, useMemo, useState } from "react"

import {
  EdgeAnimationSpeed,
  EdgeModel,
  EdgeStyle,
  LabelPosition,
  Model,
  NodeModel,
  NodeShape,
  SELECTION_EVENT,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from "@patternfly/react-topology"

import layoutFactory from "./layout"
import componentFactory from "./components"

const NODE_SHAPE = NodeShape.ellipse
const NODE_DIAMETER = 10

type Props = {
  nodes: import("./model").Node[]
  edges: import("./model").Edge[]
  numbering: Record<string, number>
}

export default function Topology({ nodes, edges, numbering }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const controller = useMemo(() => {
    const newController = new Visualization()
    newController.registerLayoutFactory(layoutFactory)
    newController.registerComponentFactory(componentFactory)

    newController.addEventListener(SELECTION_EVENT, setSelectedIds)
    return newController
  }, [])

  useEffect(() => {
    const myNodes: NodeModel[] = nodes.map(({ id, label }) => ({
      id,
      label,
      type: "node",
      width: NODE_DIAMETER,
      height: NODE_DIAMETER,
      shape: NODE_SHAPE,
      labelPosition: LabelPosition.top,
      data: {
        ordinal: numbering[id],
      },
    }))
    const myEdges: EdgeModel[] = edges.map(({ source, target }) => ({
      id: `${source}-${target}`,
      type: "edge",
      source,
      target,
      edgeStyle: EdgeStyle.dashedXl,
      animationSpeed: EdgeAnimationSpeed.medium,
    }))
    const model: Model = {
      nodes: myNodes,
      edges: myEdges,
      graph: {
        id: "g1",
        type: "graph",
        layout: "Cola",
      },
    }

    controller.fromModel(model, false)
  }, [nodes, edges, controller])

  return (
    <div className="pdl-memory-topology">
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={{ selectedIds }} />
      </VisualizationProvider>
    </div>
  )
}
