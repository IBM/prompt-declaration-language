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
  title: ReactNode
  body: ReactNode
}>

export default function Tile({ title, body, children }: Props) {
  return (
    <Card isLarge>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>{body}</CardBody>
      <CardFooter>
        <Flex>{children}</Flex>
      </CardFooter>
    </Card>
  )
}
