import { useEffect, useMemo, useState } from "react"

import {
  type Model,
  SELECTION_EVENT,
  action,
  TopologyControlBar,
  TopologyView,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from "@patternfly/react-topology"

import computeModel from "./model"
import layoutFactory from "./layout"
import componentFactory from "./components"

import "./DataFlow.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

export default function DataFlow({ block }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { nodes, edges } = useMemo(() => computeModel(block), [block])

  const controller = useMemo(() => {
    const newController = new Visualization()
    newController.registerLayoutFactory(layoutFactory)
    newController.registerComponentFactory(componentFactory)
    newController.addEventListener(SELECTION_EVENT, setSelectedIds)

    return newController
  }, [])

  useEffect(() => {
    const model: Model = {
      nodes,
      edges,
      graph: {
        id: "g1",
        type: "graph",
        layout: "Dagre",
      },
    }

    controller.fromModel(model, false)
    setTimeout(() => {
      controller.getGraph().reset()
      controller.getGraph().layout()
    }, 100)
  }, [nodes, edges, controller])

  return (
    <TopologyView
      controlBar={
        <TopologyControlBar
          controlButtons={createTopologyControlButtons({
            ...defaultControlButtonsOptions,
            zoomInCallback: action(() => {
              controller.getGraph().scaleBy(4 / 3)
            }),
            zoomOutCallback: action(() => {
              controller.getGraph().scaleBy(0.75)
            }),
            fitToScreenCallback: action(() => {
              controller.getGraph().fit(80)
            }),
            resetViewCallback: action(() => {
              controller.getGraph().reset()
              controller.getGraph().layout()
            }),
            legend: false,
          })}
        />
      }
    >
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={{ selectedIds }} />
      </VisualizationProvider>
    </TopologyView>
  )
}
