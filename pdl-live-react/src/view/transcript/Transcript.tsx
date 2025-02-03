import { useMemo } from "react"
import { Stack } from "@patternfly/react-core"

import Context from "../../Context"

import { hasResult } from "../../helpers"
import BlocksConjoin from "./BlocksConjoin"
import FinalResult from "./FinalResult"

import "./Transcript.css"

type Props = {
  data: import("../../pdl_ast").PdlBlock
}

export default function Transcript({ data }: Props) {
  const ctx = useMemo<Context>(() => {
    return {
      id: "",
      parents: [],
    }
  }, [])

  return (
    <>
      <Stack className="pdl-transcript">
        <BlocksConjoin block={data} ctx={ctx} />
      </Stack>
      {hasResult(data) && <FinalResult block={data} />}
    </>
  )
}
