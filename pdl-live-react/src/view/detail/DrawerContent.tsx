import { useCallback, useMemo, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

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

import Model, { computeModel } from "../timeline/model"

import Def from "../transcript/Def"
import BreadcrumbBar from "../transcript/BreadcrumbBar"
import BreadcrumbBarItem from "../transcript/BreadcrumbBarItem"

import DefContent from "./DefContent"
import BlockNotFound from "./BlockNotFound"
import SourceTabContent from "./SourceTabContent"
import SummaryTabContent from "./SummaryTabContent"
import RawTraceTabContent from "./RawTraceTabContent"

import { capitalizeAndUnSnakeCase, hasResult } from "../../helpers"

import CloseIcon from "@patternfly/react-icons/dist/esm/icons/times-icon"

import "./DrawerContent.css"

type Props = {
  //id: string | null
  //type: string | null
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

function asIter(part: string) {
  const int = parseInt(part)
  return isNaN(int) ? capitalizeAndUnSnakeCase(part) : `Iter ${int}`
}

function description(id: string, model: Model) {
  const block = model.find((block) => block.id === id)
  if (!block) {
    return <BlockNotFound id={id} model={model} />
  }

  return (
    <BreadcrumbBar>
      <>
        {id
          .replace(/text\.\d+\./g, "")
          .split(/\./)
          .map((part, idx, A) => (
            <BreadcrumbBarItem
              key={part}
              className={
                idx === A.length - 1 ? "pdl-breadcrumb-bar-item--kind" : ""
              }
            >
              {asIter(part)}
            </BreadcrumbBarItem>
          ))}

        {block.block.def && (
          <Def
            def={block.block.def}
            ctx={{ id, parents: [] }}
            value={hasResult(block.block) ? block.block.result : undefined}
          />
        )}
      </>
    </BreadcrumbBar>
  )
}

function defsBody(id: string, def: string | null, model: Model) {
  const block = model.find((block) => block.id === id)
  if (!block) {
    return (
      <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
        <BlockNotFound id={id} model={model} />
      </Tab>
    )
  }

  const value = def && block.block.defs ? block.block.defs[def] : undefined
  return (
    <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
      {!def ? (
        <>Internal error, missing field 'def' in query</>
      ) : (
        value && <DefContent value={value} />
      )}
    </Tab>
  )
}

function defBody(id: string, _def: string | null, model: Model) {
  const block = model.find((block) => block.id === id)
  if (!block) {
    return (
      <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
        <BlockNotFound id={id} model={model} />
      </Tab>
    )
  }

  const value = hasResult(block.block) ? block.block.result : undefined
  console.error("!!!!!!", block, _def)
  return (
    <Tab eventKey={0} title={<TabTitleText>Value</TabTitleText>}>
      {!value ? "Value not found" : <DefContent value={value} />}
    </Tab>
  )
}

function blockBody(id: string, model: Model) {
  const block = model.find((block) => block.id === id)
  if (!block) {
    return (
      <Tab eventKey={0} title={<TabTitleText>Summary</TabTitleText>}>
        <BlockNotFound id={id} model={model} />
      </Tab>
    )
  }

  return [
    <Tab key={0} eventKey={0} title={<TabTitleText>Summary</TabTitleText>}>
      <SummaryTabContent block={block} />
    </Tab>,
    <Tab key={1} eventKey={1} title={<TabTitleText>Source</TabTitleText>}>
      <SourceTabContent block={block} />
    </Tab>,
    <Tab key={2} eventKey={2} title={<TabTitleText>Raw Trace</TabTitleText>}>
      <RawTraceTabContent block={block} />
    </Tab>,
  ]
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

  if (!id || !objectType) {
    return <></>
  }

  //const model = useMemo(() => computeModel(
  /*        {!asTabs(props.body) ? (
          props.body
        ) : (
          <Tabs
            isFilled
            activeKey={activeTab}
            onSelect={handleTabClick}
            mountOnEnter
            unmountOnExit
          >
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
  */

  return (
    <Card isPlain isLarge isFullHeight className="pdl-drawer-content">
      <CardHeader
        actions={{
          actions: (
            <Button
              variant="plain"
              onClick={onCloseDrawer}
              icon={<CloseIcon />}
            />
          ),
        }}
      >
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
          {objectType === "defs"
            ? defsBody(id, def, model)
            : objectType === "def"
              ? defBody(id, def, model)
              : blockBody(id, model)}
        </Tabs>
      </CardBody>
    </Card>
  )
}
