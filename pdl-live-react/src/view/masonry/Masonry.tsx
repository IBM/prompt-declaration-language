import MasonryTile from "./MasonryTile"

import "./Masonry.css"

type Props = import("react").PropsWithChildren<{
  run: import("./MasonryCombo").Runner
  sml: import("./Toolbar").SML
  model: import("./Tile").default[]
}>

export default function Masonry({ run, sml, model, children }: Props) {
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
      {model.map((props, idx) => (
        <MasonryTile
          key={props.id + "." + idx}
          {...props}
          idx={idx + 1}
          sml={sml}
          run={run}
        />
      ))}
    </div>
  )
}
