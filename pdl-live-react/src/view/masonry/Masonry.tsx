import MasonryView, { ResponsiveMasonry } from "react-responsive-masonry"

import MasonryTile from "./MasonryTile"

import "./Masonry.css"

type Props = import("react").PropsWithChildren<{
  as: import("./Toolbar").As
  sml: import("./Toolbar").SML
  model: import("./Tile").default[]
}>

const col1 = { 10000: 1 }
const col3 = { 500: 1, 950: 2, 1400: 3 }
const col6 = { 500: 4, 950: 5, 1400: 6 }

export default function Masonry({ as, sml, model, children }: Props) {
  const breakpoints = as === "grid" ? (sml === "s" ? col6 : col3) : col1

  // gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}
  return (
    <ResponsiveMasonry columnsCountBreakPoints={breakpoints}>
      <MasonryView className="pdl-masonry-view">
        {(!children ? [] : Array.isArray(children) ? children : [children])
          .filter(Boolean)
          .map((child, idx) => (
            <div
              key={idx}
              className="pdl-masonry-tile"
              data-is-non-card
              data-padding={sml}
            >
              {child}
            </div>
          ))}
        {model.map((props, idx) => (
          <MasonryTile
            key={props.id}
            {...props}
            idx={idx + 1}
            as={as}
            sml={sml}
          />
        ))}
      </MasonryView>
    </ResponsiveMasonry>
  )
}
