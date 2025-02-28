import { useCallback, useEffect, useMemo, useState } from "react"
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

import drawerContentBody from "./DrawerContentBody"
import BreadcrumbBarForBlock from "../breadcrumbs/BreadcrumbBarForBlock"

import findNode from "./find"

import { type NonScalarPdlBlock as Block } from "../../helpers"

import CloseIcon from "@patternfly/react-icons/dist/esm/icons/times-icon"

import "./DrawerContent.css"

type Props = {
  value: string
}

function header(objectType: string) {
  switch (objectType) {
    case "def":
      return "Variable Definition"
    default:
      return "Block Details"
  }
}

function description(block: Block) {
  return <BreadcrumbBarForBlock block={block} />
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
  const onCloseDrawer = useCallback(() => {
    // Remove the search params that lead us here, for onCloseDrawer()
    searchParams.delete("id")
    searchParams.delete("def")
    searchParams.delete("get")
    searchParams.delete("type")
    searchParams.delete("detail")
    const s = searchParams.toString()

    navigate(pathname + (s ? "?" + s : "") + hash)
  }, [hash, pathname, navigate, searchParams])

  const data = useMemo(
    () =>
      value ? (JSON.parse(value) as import("../../pdl_ast").PdlBlock) : null,
    [value],
  )
  const block = useMemo<null | Block>(
    () => (!id || !data ? null : findNode(data, id)),
    [id, data],
  )
  useEffect(() => {
    setActiveTab(0)
  }, [id, objectType, value])

  const actions = useMemo(
    () => ({
      actions: (
        <Button variant="plain" onClick={onCloseDrawer} icon={<CloseIcon />} />
      ),
    }),
    [onCloseDrawer],
  )

  if (!objectType) {
    // Should never happen. TODO error handling?
    return <></>
  } else if (!value) {
    // Nothing to show
    return <></>
  }

  return (
    <Card isPlain isLarge className="pdl-drawer-content">
      <CardHeader actions={actions}>
        <CardTitle>{header(objectType)}</CardTitle>
        {block && description(block)}
      </CardHeader>
      <CardBody>
        <Tabs
          isFilled={objectType === "block"}
          activeKey={activeTab}
          onSelect={handleTabClick}
          mountOnEnter
          unmountOnExit
        >
          {drawerContentBody({ id, value, def, objectType, model: block })}
        </Tabs>
      </CardBody>
    </Card>
  )
}
