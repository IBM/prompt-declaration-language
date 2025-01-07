import { type ReactNode } from "react"

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "@patternfly/react-core"

import CloseIcon from "@patternfly/react-icons/dist/esm/icons/times-icon"

export type DrawerContentSpec = {
  header: string
  description?: ReactNode
  body: ReactNode
}

type Props = DrawerContentSpec & {
  onCloseDrawer(): void
}

export default function DrawerContent(props: Props) {
  return (
    <Card isPlain isLarge>
      <CardHeader
        actions={{
          actions: (
            <Button
              variant="plain"
              onClick={props.onCloseDrawer}
              icon={<CloseIcon />}
            />
          ),
        }}
      >
        <CardTitle>{props.header}</CardTitle>
        {props.description && props.description}
      </CardHeader>
      <CardBody>{props.body}</CardBody>
    </Card>
  )
}
