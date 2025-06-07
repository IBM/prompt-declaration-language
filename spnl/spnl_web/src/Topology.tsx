import { useMemo } from "react"
import { match, P } from "ts-pattern"
import { Tree, type Data } from "react-tree-graph"

import "./Topology.css"

type Props = {
  unit: null | import("./Unit").Unit
}

const NODE_SIZE = 18

function node(id: string, label: string, children: Data[] = []) {
  return {
    label,
    name: id + "." + label,
    labelProp: "label",
    children,
    gProps: {
      className: "node spnl-node spnl-node-" + (label === "+" ? "plus" : label),
    },
  }
}

function graphify(unit: import("./Unit").Unit, id = "root"): Data[] {
  return match(unit)
    .with({ user: P.array(P.string) }, () => [node(id, "U")])
    .with({ assistant: P.array(P.string) }, () => [node(id, "A")])
    .with({ system: P.array(P.string) }, () => [node(id, "S")])
    .with({ g: P.array() }, ({ g }) => [
      node(id, "G", graphify(g[1], id + ".G")),
    ])
    .with({ print: P._ }, () => [])
    .with({ repeat: P.array() }, ({ repeat }) =>
      Array(repeat[0])
        .fill(0)
        .flatMap((_, idx) => graphify(repeat[1], id + "." + idx)),
    )
    .with({ cross: P.array() }, ({ cross }) => [
      node(
        id,
        "X",
        cross.flatMap((child, idx) => graphify(child, id + ".X+" + idx)),
      ),
    ])
    .with({ plus: P.array() }, ({ plus }) => [
      node(
        id,
        "+",
        plus.flatMap((child, idx) => graphify(child, id + ".+" + idx)),
      ),
    ])
    .exhaustive()
}

const nodeProps = { width: NODE_SIZE, height: NODE_SIZE }
const textProps = {
  dx: -NODE_SIZE / 4 + 0.25,
  dy: NODE_SIZE / 4 + 0.25,
} as Data["textProps"] // hmm typing issues in @types/react-tree-graph

export default function Topology(props: Props) {
  const data = useMemo(
    () => (!props.unit ? null : graphify(props.unit)[0]),
    [props.unit],
  )
  if (!data) {
    return <></>
  } else {
    return (
      <Tree
        key={JSON.stringify(data)}
        data={data}
        margins={{ bottom: 0, left: NODE_SIZE, top: 0, right: NODE_SIZE }}
        height={800}
        width={400}
        nodeShape="rect"
        nodeProps={nodeProps}
        textProps={textProps}
      />
    )
  }

  /*         svgProps={{
          transform: "rotate(90)", //rotates the tree to make it verticle
          viewBox: "100 -150 400 600",
        }}
        textProps={{
          transform: "rotate(-90)", //rotates the text label
          x: -NODE_SIZE * 0.75 + 2,
          y: 2,
        }}
  */
}
