import { Tab, TabTitleText } from "@patternfly/react-core"

import DefContent from "./DefContent"
import BlockNotFound from "./BlockNotFound"
import SourceTabContent from "./SourceTabContent"
import SummaryTabContent from "./SummaryTabContent"
import RawTraceTabContent from "./RawTraceTabContent"

import { hasResult } from "../../helpers"

import type Model from "../timeline/model"

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

type Props = {
  id: string
  def: string | null
  objectType: string
  model: Model
}

export default function DrawerContentBody({
  id,
  def,
  objectType,
  model,
}: Props) {
  switch (objectType) {
    case "defs":
      return defsBody(id, def, model)
    case "def":
      return defBody(id, def, model)
    default:
      return blockBody(id, model)
  }
}
