import { useEffect, useMemo, useState } from "react"

import Timeline from "../timeline/TimelineFromModel"

import Masonry from "./Masonry"
import computeModel from "./model"
import Toolbar, { type As, type SML } from "./Toolbar"

import "./Masonry.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

const asLocalStorageKey = "pdl-viewer.masonry.as"
export function getAsUserSetting(): As {
  return (localStorage.getItem(asLocalStorageKey) as As) || "grid"
}
export function setAsUserSetting(as: As) {
  localStorage.setItem(asLocalStorageKey, as)
}

const smlLocalStorageKey = "pdl-viewer.masonry.sml"
export function getSMLUserSetting(): SML {
  return (localStorage.getItem(smlLocalStorageKey) as SML) || "l"
}
export function setSMLUserSetting(sml: SML) {
  localStorage.setItem(smlLocalStorageKey, sml)
}

export default function MasonryTimelineCombo({ block }: Props) {
  const [as, setAs] = useState<As>(getAsUserSetting())
  const [sml, setSML] = useState<SML>(getSMLUserSetting())

  useEffect(() => setAsUserSetting(as), [as])
  useEffect(() => setSMLUserSetting(sml), [sml])

  const { base, masonry, numbering } = useMemo(
    () => computeModel(block),
    [block],
  )

  return (
    <>
      <Toolbar as={as} setAs={setAs} sml={sml} setSML={setSML} />
      <Masonry model={masonry} as={as} sml={sml}>
        <Timeline model={base} numbering={numbering} />
      </Masonry>
    </>
  )
}
