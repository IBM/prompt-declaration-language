import { useEffect, useMemo, useState } from "react"
import { BackToTop, PageSection } from "@patternfly/react-core"

import Topology from "../memory/Topology"
import extractVariables from "../memory/model"
import Timeline from "../timeline/TimelineFromModel"

import Masonry from "./Masonry"
import computeModel from "./model"
import Toolbar, { type As, type SML } from "./Toolbar"

import "./Masonry.css"

type Props = {
  value: string
  setValue(value: string): void
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
  return (localStorage.getItem(smlLocalStorageKey) as SML) || "m"
}
function setSMLUserSetting(sml: SML) {
  localStorage.setItem(smlLocalStorageKey, sml)
}

/** Combines <Masonry/>, <Timeline/>, ... */
export default function MasonryCombo({ value, setValue }: Props) {
  const block = useMemo(
    () =>
      value ? (JSON.parse(value) as import("../../pdl_ast").PdlBlock) : null,
    [value],
  )

  const [as, setAs] = useState<As>(getAsUserSetting())
  const [sml, setSML] = useState<SML>(getSMLUserSetting())

  useEffect(() => setAsUserSetting(as), [as])
  useEffect(() => setSMLUserSetting(sml), [sml])

  const { base, masonry, numbering } = useMemo(
    () => computeModel(block),
    [block],
  )

  // This is the <Topology/> model. We compute this here, so we can
  // nicely not render anything if we have an empty topology model.
  const { nodes, edges } = useMemo(() => extractVariables(block), [block])

  if (!block) {
    return "Invalid trace content"
  }

  return (
    <>
      <PageSection type="subnav">
        <Toolbar
          as={as}
          setAs={setAs}
          sml={sml}
          setSML={setSML}
          block={block}
          setValue={setValue}
        />
      </PageSection>
      <PageSection
        isFilled
        hasOverflowScroll
        className="pdl-content-section pdl-masonry-page-section"
        aria-label="PDL Viewer main section"
      >
        <Masonry model={masonry} as={as} sml={sml}>
          {sml !== "s" && <Timeline model={base} numbering={numbering} />}
          {(as !== "list" || sml !== "s") && nodes.length > 0 && (
            <Topology
              nodes={nodes}
              edges={edges}
              numbering={numbering}
              sml={sml}
            />
          )}
        </Masonry>
      </PageSection>

      <BackToTop scrollableSelector=".pdl-masonry-page-section" />
    </>
  )
}
