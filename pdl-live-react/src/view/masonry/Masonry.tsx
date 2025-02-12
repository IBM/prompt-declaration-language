import { useMemo, useState } from "react"
import MasonryView, { ResponsiveMasonry } from "react-responsive-masonry"

import MasonryTile from "./MasonryTile"
import computeModel from "./model"
import Toolbar, { type As } from "./Toolbar"

import "./Masonry.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

const col1 = { 10000: 1 }
const col3 = { 350: 1, 750: 2, 900: 3 }

export default function Masonry({ block }: Props) {
  const [as, setAs] = useState<As>("grid")
  const model = useMemo(() => computeModel(block), [block])
  const breakpoints = as === "grid" ? col3 : col1

  // gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}
  return (
    <div className="pdl-masonry">
      <Toolbar as={as} setAs={setAs} />
      <ResponsiveMasonry columnsCountBreakPoints={breakpoints}>
        <MasonryView className="pdl-masonry-view">
          {model.map((props, idx) => (
            <MasonryTile key={props.id} {...props} idx={idx + 1} as={as} />
          ))}
        </MasonryView>
      </ResponsiveMasonry>
    </div>
  )
}
