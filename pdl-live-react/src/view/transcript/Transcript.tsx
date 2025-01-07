import {
  isValidElement,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
} from "react"

import { Accordion, AccordionItem } from "@patternfly/react-core"

import Context from "../../Context"
import DrawerContext from "../../DrawerContentContext"
import DarkModeContext from "../../DarkModeContext"

import { hasResult } from "../../helpers"
import show_block_conjoin from "./BlocksConjoin"
import FinalResult from "./FinalResult"

type Props = {
  data: import("../../pdl_ast").PdlBlock
}

export default function Transcript({ data }: Props) {
  // DarkMode state
  const darkMode = useContext(DarkModeContext)

  // Accordion state
  const [expanded, setExpanded] = useState<string[]>([])

  // DrawerContent updater
  const setDrawerContent = useContext(DrawerContext)

  const ctx = useMemo<Context>(() => {
    return {
      id: "root",
      darkMode,
      toggleAccordion: (evt: MouseEvent<HTMLButtonElement>) => {
        const id = evt.currentTarget.id

        const index = expanded.indexOf(id)
        const newExpanded: string[] =
          index >= 0
            ? [
                ...expanded.slice(0, index),
                ...expanded.slice(index + 1, expanded.length),
              ]
            : [...expanded, id]
        setExpanded(newExpanded)
      },
      setDrawerContent,
      parents: [],
    }
  }, [darkMode, expanded, setDrawerContent])

  return (
    <Accordion className="pdl-transcript" isBordered>
      {show_block_conjoin(data, ctx)
        .flat()
        .filter(Boolean)
        .concat(hasResult(data) ? [<FinalResult block={data} ctx={ctx} />] : [])
        .map((block, idx) =>
          isValidElement(block) && "data-id" in block.props ? (
            <AccordionItem
              key={idx}
              className={isValidElement(block) && block.props.className}
              isExpanded={
                !isValidElement(block) ||
                expanded.includes(block.props["data-id"])
              }
            >
              {block}
            </AccordionItem>
          ) : (
            <div key={idx} className="pdl-interstitial-text">
              {block}
            </div>
          ),
        )}
    </Accordion>
  )
}
