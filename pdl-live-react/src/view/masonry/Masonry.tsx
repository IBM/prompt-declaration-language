import MasonryTile from "./MasonryTile"

import "./Masonry.css"

type Props = import("react").PropsWithChildren<{
  page: number
  perPage: number
  run: import("./MasonryCombo").Runner
  sml: import("./Toolbar").SML
  model: import("./Tile").default[]
}>

export default function Masonry({
  run,
  sml,
  model,
  children,
  page,
  perPage,
}: Props) {
  return (
    <div className="pdl-masonry-view" data-padding={sml}>
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
      {model.slice((page - 1) * perPage, page * perPage).map((props, idx) => (
        <MasonryTile
          key={props.id + "." + idx}
          {...props}
          idx={(page - 1) * perPage + idx + 1}
          sml={sml}
          run={run}
        />
      ))}
    </div>
  )
}
