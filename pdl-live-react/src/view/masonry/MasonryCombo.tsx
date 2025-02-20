import { useCallback, useEffect, useMemo, useState } from "react"
import { LogViewer } from "@patternfly/react-log-viewer"
import {
  Button,
  BackToTop,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  PageSection,
} from "@patternfly/react-core"

//import Topology from "../memory/Topology"
//import extractVariables from "../memory/model"
import Timeline from "../timeline/TimelineFromModel"

import Masonry from "./Masonry"
import computeModel from "./model"
import Toolbar, { type SML } from "./Toolbar"

import "./Masonry.css"

type Props = {
  value: string
  setValue(value: string): void
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

  const [sml, setSML] = useState<SML>(getSMLUserSetting())
  useEffect(() => setSMLUserSetting(sml), [sml])

  const [modalContent, setModalContent] = useState<null | {
    header: string
    body: string
    done?: boolean
  }>(null)
  const closeModal = useCallback(() => setModalContent(null), [setModalContent])

  const { base, masonry, numbering } = useMemo(
    () => computeModel(block),
    [block],
  )

  // This is the <Topology/> model. We compute this here, so we can
  // nicely not render anything if we have an empty topology model.
  // const { nodes, edges } = useMemo(() => extractVariables(block), [block])

  if (!block) {
    return "Invalid trace content"
  }

  return (
    <>
      <PageSection type="subnav">
        <Toolbar
          sml={sml}
          setSML={setSML}
          block={block}
          setValue={setValue}
          setModalContent={setModalContent}
        />
      </PageSection>
      <PageSection
        isFilled
        hasOverflowScroll
        className="pdl-content-section pdl-masonry-page-section"
        aria-label="PDL Viewer main section"
      >
        <Masonry model={masonry} sml={sml}>
          <Timeline model={base} numbering={numbering} />
          {/*(as !== "list" || sml !== "s") && nodes.length > 0 && (
            <Topology
              nodes={nodes}
              edges={edges}
              numbering={numbering}
              sml={sml}
            />
          )*/}
        </Masonry>
      </PageSection>

      <BackToTop scrollableSelector=".pdl-masonry-page-section" />

      <Modal variant="medium" isOpen={!!modalContent} onClose={closeModal}>
        <ModalHeader title={modalContent?.header} />
        <ModalBody tabIndex={0}>
          <LogViewer
            hasLineNumbers={false}
            data={modalContent?.body}
            theme="dark"
            scrollToRow={Number.MAX_VALUE}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            key="Close"
            variant="primary"
            onClick={closeModal}
            isDisabled={!modalContent?.done}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
