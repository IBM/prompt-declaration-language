import { Card, CardBody } from "@patternfly/react-core"

type Props = import("react").PropsWithChildren<{
  kind?: string
  variant?: "plain" | "default"
  sml: import("./Toolbar").SML
  header?: import("react").ReactNode
}>

export default function MasonryTileWrapper({
  sml,
  header,
  kind,
  variant = "default",
  children,
}: Props) {
  return (
    <Card
      isLarge={sml === "xl"}
      isCompact={sml === "s"}
      data-kind={kind}
      data-padding={sml}
      data-variant={variant}
      className="pdl-masonry-tile"
    >
      {header}
      <CardBody className="pdl-masonry-tile-body">{children}</CardBody>
    </Card>
  )
}
