import type { PropsWithChildren, ReactNode } from "react"

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Flex,
} from "@patternfly/react-core"

type Props = PropsWithChildren<{
  className?: string
  title: ReactNode
  body: ReactNode
  icon?: ReactNode
}>

const gapSm = { default: "gapSm" as const }
const center = { default: "alignItemsCenter" as const }

export default function Tile({
  className,
  title,
  body,
  children,
  icon,
}: Props) {
  return (
    <Card isLarge variant="secondary" className={className}>
      <CardHeader>
        <CardTitle>
          <Flex gap={gapSm} alignItems={center}>
            {icon}
            {title}
          </Flex>
        </CardTitle>
      </CardHeader>
      <CardBody>{body}</CardBody>
      <CardFooter>
        <Flex>{children}</Flex>
      </CardFooter>
    </Card>
  )
}
