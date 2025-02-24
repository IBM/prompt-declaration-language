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

import "./Topology.css"

type Props = {
  sml: import("../masonry/Toolbar").SML
  nodes: import("./model").Node[]
  edges: import("./model").Edge[]
  numbering: Record<string, number>
}

export default function Topology({ sml, nodes, edges, numbering }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const controller = useMemo(() => {
    const newController = new Visualization()
    newController.registerLayoutFactory(layoutFactory)
    newController.registerComponentFactory(componentFactory)

    newController.addEventListener(SELECTION_EVENT, setSelectedIds)
    newController.setFitToScreenOnLayout(true, 60)
    return newController
  }, [])

  useEffect(() => {
    const NODE_SHAPE = NodeShape.ellipse
    const NODE_DIAMETER = 10

    const myNodes: NodeModel[] = nodes.map(({ id, label }) => ({
      id,
      label: sml === "s" && /Text/.test(label) ? "" : label,
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
        scale: sml === "s" ? 0.65 : sml === "m" ? 0.75 : 0.85,
      },
    }

    controller.fromModel(model, false)
  }, [sml, nodes, edges, numbering, controller])

  return (
    <div className="pdl-memory-topology">
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={{ selectedIds }} />
      </VisualizationProvider>
    </div>
  )
}
