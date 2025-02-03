import { Stack } from "@patternfly/react-core"

import Block from "./Block"
import FinalResult from "./FinalResult"
import { hasResult } from "../../helpers"

import "./Transcript.css"

type Props = {
  data: import("../../pdl_ast").PdlBlock
}

export default function Transcript({ data }: Props) {
  return (
    <>
      <Stack className="pdl-transcript">
        <Block data={data} />
      </Stack>
      {hasResult(data) && <FinalResult block={data} />}
    </>
  )
}
