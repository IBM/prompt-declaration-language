import { useEffect, useMemo, useState } from "react"
import { PageSection } from "@patternfly/react-core"

import Timeline from "../timeline/TimelineFromModel"

import Masonry from "./Masonry"
import computeModel from "./model"
import Toolbar, { type As, type SML } from "./Toolbar"

import "./Masonry.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

const asLocalStorageKey = "pdl-viewer.masonry.as"
function getAsUserSetting(): As {
  return (localStorage.getItem(asLocalStorageKey) as As) || "grid"
}
function setAsUserSetting(as: As) {
  localStorage.setItem(asLocalStorageKey, as)
}

const smlLocalStorageKey = "pdl-viewer.masonry.sml"
function getSMLUserSetting(): SML {
  return (localStorage.getItem(smlLocalStorageKey) as SML) || "l"
}
function setSMLUserSetting(sml: SML) {
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
      <PageSection type="subnav">
        <Toolbar as={as} setAs={setAs} sml={sml} setSML={setSML} />
      </PageSection>
      <PageSection
        isFilled
        hasOverflowScroll
        className="pdl-content-section"
        aria-label="PDL Viewer main section"
      >
        <Masonry model={masonry} as={as} sml={sml}>
          <Timeline model={base} numbering={numbering} />
        </Masonry>
      </PageSection>
    </>
  )
}
