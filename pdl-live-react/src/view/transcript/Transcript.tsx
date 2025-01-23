import { useContext, useMemo } from "react"

import { Stack } from "@patternfly/react-core"

import Context from "../../Context"
import DarkModeContext from "../../DarkModeContext"

import { hasResult } from "../../helpers"
import BlocksConjoin from "./BlocksConjoin"
import FinalResult from "./FinalResult"

import "./Transcript.css"

type Props = {
  data: import("../../pdl_ast").PdlBlock
}

export default function Transcript({ data }: Props) {
  // DarkMode state
  const darkMode = useContext(DarkModeContext)

  const ctx = useMemo<Context>(() => {
    return {
      id: "",
      darkMode,
      parents: [],
    }
  }, [darkMode])

  return (
    <>
      <Stack className="pdl-transcript">
        <BlocksConjoin block={data} ctx={ctx} />
      </Stack>
      {hasResult(data) && <FinalResult block={data} />}
    </>
  )
}
