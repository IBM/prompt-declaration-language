import { useCallback, useState, type ReactNode } from "react"

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Tabs,
  Tab,
  TabTitleText,
  type TabsProps,
} from "@patternfly/react-core"

import CloseIcon from "@patternfly/react-icons/dist/esm/icons/times-icon"

import "./DrawerContent.css"

type ATab = { title: string; body: ReactNode }

function asTabs(body: DrawerContentSpec["body"]): body is ATab[] {
  return Array.isArray(body)
}

export type DrawerContentSpec = {
  header: string
  description?: ReactNode
  body: ReactNode | ATab[]
}

type Props = DrawerContentSpec & {
  onCloseDrawer(): void
}

export default function DrawerContent(props: Props) {
  const [activeTab, setActiveTab] = useState<string | number>(0)
  const handleTabClick = useCallback<Required<TabsProps>["onSelect"]>(
    (_event, tabKey) => setActiveTab(tabKey),
    [setActiveTab],
  )

  return (
    <Card isPlain isLarge className="pdl-drawer-content">
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
      <CardBody>
        {!asTabs(props.body) ? (
          props.body
        ) : (
          <Tabs isFilled activeKey={activeTab} onSelect={handleTabClick}>
            {props.body.map(({ title, body }, idx) => (
              <Tab
                key={idx}
                eventKey={idx}
                title={<TabTitleText>{title}</TabTitleText>}
              >
                {body}
              </Tab>
            ))}
          </Tabs>
        )}
      </CardBody>
    </Card>
  )
}
