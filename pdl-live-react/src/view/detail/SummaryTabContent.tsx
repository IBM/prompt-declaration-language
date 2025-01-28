import { match } from "ts-pattern"

import { DescriptionList } from "@patternfly/react-core"

import IfItems from "./kind/If"
import CallItems from "./kind/Call"
import CodeItems from "./kind/Code"
import DataItems from "./kind/Data"
import ReadItems from "./kind/Read"
import TextItems from "./kind/Text"
import ModelItems from "./kind/Model"
import FunctionItems from "./kind/Function"

import type Model from "../timeline/model"

export default function SummaryTabContent({ block }: { block: Model[number] }) {
  return <DescriptionList>{descriptionItems(block.block)}</DescriptionList>
}

function descriptionItems(block: import("../../helpers").NonScalarPdlBlock) {
  return match(block)
    .with({ kind: "if" }, (block) => <IfItems block={block} />)
    .with({ kind: "call" }, (block) => <CallItems block={block} />)
    .with({ kind: "code" }, (block) => <CodeItems block={block} />)
    .with({ kind: "data" }, (block) => <DataItems block={block} />)
    .with({ kind: "read" }, (block) => <ReadItems block={block} />)
    .with({ kind: "text" }, (block) => <TextItems block={block} />)
    .with({ kind: "model" }, (block) => <ModelItems block={block} />)
    .with({ kind: "function" }, (block) => <FunctionItems block={block} />)
    .otherwise(() => <>This is a {block.kind} block</>)
}
