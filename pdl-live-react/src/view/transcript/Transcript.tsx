import { isValidElement, useContext, useMemo } from "react"

import { Stack } from "@patternfly/react-core"

import Context from "../../Context"
import DrawerContext from "../../DrawerContentContext"
import DarkModeContext from "../../DarkModeContext"

import { hasResult } from "../../helpers"
import show_block_conjoin from "./BlocksConjoin"
import FinalResult from "./FinalResult"

import "./Transcript.css"

type Props = {
  data: import("../../pdl_ast").PdlBlock
}

export default function Transcript({ data }: Props) {
  // DarkMode state
  const darkMode = useContext(DarkModeContext)

  // DrawerContent updater
  const setDrawerContent = useContext(DrawerContext)

  const ctx = useMemo<Context>(() => {
    return {
      id: "root",
      darkMode,
      setDrawerContent,
      parents: [],
    }
  }, [darkMode, setDrawerContent])

  return (
    <Stack className="pdl-transcript" hasGutter>
      {show_block_conjoin(data, ctx)
        .flat()
        .filter(Boolean)
        .map((block, idx) =>
          isValidElement(block) && "data-id" in block.props ? (
            block
          ) : (
            <div key={idx} className="pdl-interstitial-text">
              {block}
            </div>
          ),
        )}

      {hasResult(data) && <FinalResult block={data} ctx={ctx} />}
    </Stack>
  )
}
