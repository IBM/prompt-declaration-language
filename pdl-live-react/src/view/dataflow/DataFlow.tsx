import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router"

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
  const { hash } = useLocation()
  const navigate = useNavigate()

  const [selectedIds, setSelectedIds] = useState<string[]>()
  const onSelect = useCallback(
    (ids: string[]) => {
      setSelectedIds(ids)
      if (ids.length === 1) {
        const id = ids[0].replace(/-(result|\d+)$/, "")
        navigate(`?detail&type=block&id=${id}${hash}`)
      }
    },
    [setSelectedIds, hash, navigate],
  )

  const { nodes, edges } = useMemo(() => computeModel(block), [block])

  const [searchParams] = useSearchParams()
  const selectedFromSearch = searchParams.get("id")
  useEffect(() => {
    if (selectedFromSearch) {
      const node = nodes
        .filter(({ id, group }) => !group && id.includes(selectedFromSearch))
        .sort()[0]
      if (node) {
        setSelectedIds([node.id])
      }
    } else {
      setSelectedIds([])
    }
  }, [setSelectedIds, selectedFromSearch, nodes])
  const state = useMemo(() => ({ selectedIds }), [selectedIds])

  const controller = useMemo(() => {
    const newController = new Visualization()
    newController.registerLayoutFactory(layoutFactory)
    newController.registerComponentFactory(componentFactory)
    newController.addEventListener(SELECTION_EVENT, onSelect)

    return newController
  }, [onSelect])

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
    }, 50)
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
        <VisualizationSurface state={state} />
      </VisualizationProvider>
    </TopologyView>
  )
}
