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

import BlockNotFound from "./BlockNotFound"
import drawerContentBody from "./DrawerContentBody"
import BreadcrumbBarForBlock from "../breadcrumbs/BreadcrumbBarForBlock"

import { childrenOf } from "../timeline/model"
import {
  isNonScalarPdlBlock,
  nonNullable,
  type NonScalarPdlBlock as Block,
} from "../../helpers"

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
  const onCloseDrawer = useCallback(
    () => navigate(pathname + hash), // remove query
    [hash, pathname, navigate],
  )

  const data = useMemo(
    () =>
      value ? (JSON.parse(value) as import("../../pdl_ast").PdlBlock) : null,
    [value],
  )
  const block = useMemo<null | Block>(
    () => (!id || !data ? null : find(data, id)),
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

  if (!id || !objectType) {
    // Should never happen. TODO error handling?
    return <></>
  } else if (!value) {
    // Nothing to show
    return <></>
  } else if (!block) {
    return <BlockNotFound id={id} value={value} />
  }

  return (
    <Card isPlain isLarge isFullHeight className="pdl-drawer-content">
      <CardHeader actions={actions}>
        <CardTitle>{header(objectType)}</CardTitle>
        {description(block)}
      </CardHeader>
      <CardBody>
        <Tabs
          isFilled={objectType === "block"}
          activeKey={activeTab}
          onSelect={handleTabClick}
          mountOnEnter
          unmountOnExit
        >
          {drawerContentBody({ def, objectType, model: block })}
        </Tabs>
      </CardBody>
    </Card>
  )
}

/** Traverse the tree under `block` looking for a sub-block with then given `id` */
function find(
  block: import("../../pdl_ast").PdlBlock,
  id: string,
): null | Block {
  if (!isNonScalarPdlBlock(block)) {
    return null
  } else if (block.id === id) {
    return block
  } else {
    return (
      childrenOf(block)
        .map((child) => find(child, id))
        .filter(nonNullable)[0] || null
    )
  }
}
