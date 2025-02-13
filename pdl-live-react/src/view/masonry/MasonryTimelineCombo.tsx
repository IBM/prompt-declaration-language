import { useNavigate, useSearchParams } from "react-router"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react"
import { PageSection } from "@patternfly/react-core"

import Timeline from "../timeline/TimelineFromModel"
const Code = lazy(() => import("../code/Code"))

import Masonry from "./Masonry"
import computeModel from "./model"
import Toolbar, { type As, type SML, type View } from "./Toolbar"

import "./Masonry.css"

type Props = {
  view: View
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

export default function MasonryTimelineCombo({ block, view }: Props) {
  const [as, setAs] = useState<As>(getAsUserSetting())
  const [sml, setSML] = useState<SML>(getSMLUserSetting())

  useEffect(() => setAsUserSetting(as), [as])
  useEffect(() => setSMLUserSetting(sml), [sml])

  const [searchParams] = useSearchParams()
  const s = searchParams.toString().length === 0 ? "" : "?" + searchParams
  const navigate = useNavigate()
  const setView = useCallback(
    (view: View) => {
      navigate(s + "#" + view)
    },
    [navigate, s],
  )

  const { base, masonry, numbering } = useMemo(
    () => computeModel(block),
    [block],
  )

  return (
    <>
      <PageSection type="subnav">
        <Toolbar
          as={as}
          setAs={setAs}
          sml={sml}
          setSML={setSML}
          view={view}
          setView={setView}
        />
      </PageSection>
      <PageSection
        isFilled
        hasOverflowScroll
        className="pdl-content-section"
        aria-label="PDL Viewer main section"
      >
        {view === "program" ? (
          <Masonry model={masonry} as={as} sml={sml}>
            <Timeline model={base} numbering={numbering} />
          </Masonry>
        ) : (
          <Suspense>
            <Code block={block} limitHeight={false} raw={view === "rawtrace"} />
          </Suspense>
        )}
      </PageSection>
    </>
  )
}
