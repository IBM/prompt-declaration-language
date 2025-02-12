import MasonryView, { ResponsiveMasonry } from "react-responsive-masonry"

import MasonryTile from "./MasonryTile"

import "./Masonry.css"

type Props = {
  as: import("./Toolbar").As
  model: import("./Tile").default[]
}

const col1 = { 10000: 1 }
const col3 = { 500: 1, 950: 2, 1400: 3 }

export default function Masonry({ as, model }: Props) {
  const breakpoints = as === "grid" ? col3 : col1

  // gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}
  return (
    <ResponsiveMasonry columnsCountBreakPoints={breakpoints}>
      <MasonryView className="pdl-masonry-view">
        {model.map((props, idx) => (
          <MasonryTile key={props.id} {...props} idx={idx + 1} as={as} />
        ))}
      </MasonryView>
    </ResponsiveMasonry>
  )
}
