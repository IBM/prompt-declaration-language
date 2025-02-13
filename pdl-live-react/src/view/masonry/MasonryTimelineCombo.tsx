import { useNavigate } from "react-router"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react"

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

  const navigate = useNavigate()
  const setView = useCallback(
    (view: View) => {
      navigate("#" + view)
    },
    [navigate],
  )

  const { base, masonry, numbering } = useMemo(
    () => computeModel(block),
    [block],
  )

  return (
    <>
      <Toolbar
        as={as}
        setAs={setAs}
        sml={sml}
        setSML={setSML}
        view={view}
        setView={setView}
      />
      {view === "program" ? (
        <Masonry model={masonry} as={as} sml={sml}>
          <Timeline model={base} numbering={numbering} />
        </Masonry>
      ) : (
        <Suspense>
          <Code block={block} limitHeight={false} raw={view === "rawtrace"} />
        </Suspense>
      )}
    </>
  )
}
