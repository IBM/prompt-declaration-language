import { useCallback, useMemo, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Tabs,
  type TabsProps,
} from "@patternfly/react-core"

import Model, { computeModel } from "../timeline/model"

import BlockNotFound from "./BlockNotFound"
import drawerContentBody from "./DrawerContentBody"
import BreadcrumbBarForBlock from "../breadcrumbs/BreadcrumbBarForBlock"

import CloseIcon from "@patternfly/react-icons/dist/esm/icons/times-icon"

import "./DrawerContent.css"

type Props = {
  value: string
}

function header(objectType: string) {
  switch (objectType) {
    case "defs":
    case "def":
      return "Variable Definition"
    default:
      return "Block Details"
  }
}

function description(id: string, model: Model) {
  const block = model.find((block) => block.id === id)
  if (!block) {
    return <BlockNotFound id={id} model={model} />
  }

  return <BreadcrumbBarForBlock id={id} block={block.block} />
}

export default function DrawerContent({ value }: Props) {
  const [activeTab, setActiveTab] = useState<string | number>(0)
  const handleTabClick = useCallback<Required<TabsProps>["onSelect"]>(
    (_event, tabKey) => setActiveTab(tabKey),
    [setActiveTab],
  )

  const [searchParams] = useSearchParams()
  const id = searchParams.get("id")
  const def = searchParams.get("def")
  const objectType = searchParams.get("type")

  const navigate = useNavigate()
  const { pathname, hash } = useLocation()
  const onCloseDrawer = useCallback(
    () => navigate(pathname + hash), // remove query
    [hash, pathname, navigate],
  )

  const model = useMemo<Model>(
    () => (!id || !objectType || !value ? [] : computeModel(JSON.parse(value))),
    [id, objectType, value],
  )

  const actions = useMemo(
    () => ({
      actions: (
        <Button variant="plain" onClick={onCloseDrawer} icon={<CloseIcon />} />
      ),
    }),
    [onCloseDrawer],
  )

  if (!id || !objectType) {
    // Should never happen. TODO error handling?
    return <></>
  }

  return (
    <Card isPlain isLarge isFullHeight className="pdl-drawer-content">
      <CardHeader actions={actions}>
        <CardTitle>{header(objectType)}</CardTitle>
        {description(id, model)}
      </CardHeader>
      <CardBody>
        <Tabs
          isFilled={objectType === "block"}
          activeKey={activeTab}
          onSelect={handleTabClick}
          mountOnEnter
          unmountOnExit
        >
          {drawerContentBody({ id, def, objectType, model })}
        </Tabs>
      </CardBody>
    </Card>
  )
}
