import type { PropsWithChildren, ReactNode } from "react"

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Divider,
  Flex,
} from "@patternfly/react-core"

type Props = PropsWithChildren<{
  title: ReactNode
  body: ReactNode
  icon?: ReactNode
}>

const gapSm = { default: "gapSm" as const }
const center = { default: "alignItemsCenter" as const }

export default function Tile({ title, body, children, icon }: Props) {
  return (
    <Card isLarge>
      <CardHeader>
        <CardTitle>
          <Flex gap={gapSm} alignItems={center}>
            {icon}
            {title}
          </Flex>
        </CardTitle>
      </CardHeader>
      <Divider />
      <CardBody>{body}</CardBody>
      <CardFooter>
        <Flex>{children}</Flex>
      </CardFooter>
    </Card>
  )
}
