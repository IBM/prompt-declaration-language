import { invoke } from "@tauri-apps/api/core"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react"
import {
  Button,
  BackToTop,
  Modal,
  type ModalProps,
  ModalBody,
  ModalFooter,
  ModalHeader,
  PageSection,
} from "@patternfly/react-core"

const RunTerminal = lazy(() => import("../term/RunTerminal"))

//import Topology from "../memory/Topology"
//import extractVariables from "../memory/model"
import Masonry from "./Masonry"
import Timeline from "../timeline/TimelineFromModel"
import MasonryTileWrapper from "./MasonryTileWrapper"
import Toolbar, { type SML } from "./Toolbar"

import computeModel from "./model"
import {
  hasContextInformation,
  hasTimingInformation,
  isNonScalarPdlBlock,
  type NonScalarPdlBlock,
} from "../../helpers"

import RunningIcon from "@patternfly/react-icons/dist/esm/icons/running-icon"

import "./Masonry.css"

export type Runner = (
  block: NonScalarPdlBlock,
  onExit: () => void,
  modalVariant?: ModalProps["variant"],
) => void

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
  const [modalVariant, setModalVariant] =
    useState<ModalProps["variant"]>("large")

  const block = useMemo(() => {
    if (value) {
      try {
        return JSON.parse(value) as import("../../pdl_ast").PdlBlock
      } catch (err) {
        console.error(err)
      }
    }
    return null
  }, [value])

  const [sml, setSML] = useState<SML>(getSMLUserSetting())
  useEffect(() => setSMLUserSetting(sml), [sml])

  const [modalIsDone, setModalIsDone] = useState(-1)
  const [modalContent, setModalContent] = useState<null | {
    header: string
    cmd: string
    args?: string[]
    onExit?: (exitCode: number) => void
  }>(null)
  const closeModal = useCallback(() => {
    setModalContent(null)
    setModalIsDone(-1)
  }, [setModalContent, setModalIsDone])
  const onExit = useCallback(
    (exitCode: number) => {
      setModalIsDone(exitCode)
      if (modalContent?.onExit) {
        modalContent.onExit(exitCode)
      }
    },
    [setModalIsDone, modalContent],
  )

  // special form of setModalContent for running a PDL program
  const run = useCallback<Runner>(
    async (runThisBlock, onExit, modalVariant) => {
      if (!isNonScalarPdlBlock(block)) {
        onExit()
        return
      }

      if (modalVariant) {
        setModalVariant(modalVariant)
      }

      const [cmd, input, output] = (await invoke("replay_prep", {
        trace: JSON.stringify(runThisBlock),
        name:
          runThisBlock.description?.slice(0, 20).replace(/\s/g, "-") ?? "trace",
      })) as [string, string, string]
      console.error(`Replaying with cmd=${cmd} input=${input} output=${output}`)

      // We need to pass tothe re-execution the original input context
      const data = hasContextInformation(runThisBlock)
        ? { pdl_context: runThisBlock.context }
        : undefined

      setModalContent({
        header: "Running Program",
        cmd,
        args: [
          "run",
          "--trace",
          output,
          ...(!data ? [] : ["--data", JSON.stringify(data)]),
          input,
        ],
        onExit: async () => {
          onExit()
          try {
            const buf = await invoke<ArrayBuffer>("read_trace", {
              traceFile: output,
            }).catch(console.error)
            if (buf) {
              const decoder = new TextDecoder("utf-8") // Assuming UTF-8 encoding
              const newTrace = decoder.decode(new Uint8Array(buf))
              if (newTrace) {
                setValue(
                  JSON.stringify(
                    spliceSubtree(block, runThisBlock, JSON.parse(newTrace)),
                  ),
                )
              }
            }
          } catch (err) {
            console.error(err)
          }
        },
      })
    },
    [block, setValue, setModalContent],
  )

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
        <Toolbar sml={sml} setSML={setSML} run={run} block={block} />
      </PageSection>
      <PageSection
        isFilled
        hasOverflowScroll
        className="pdl-masonry-page-section"
        aria-label="PDL Viewer main section"
      >
        <Masonry model={masonry} sml={sml} run={run}>
          <MasonryTileWrapper sml={sml} variant="plain">
            <Timeline model={base} numbering={numbering} />
          </MasonryTileWrapper>
          {/*(as !== "list" || sml !== "s") && nodes.length > 0 && (
            <Topology
              nodes={nodes}
              edges={edges}
              numbering={numbering}
              sml={sml}
            />)*/}
        </Masonry>
      </PageSection>

      <BackToTop scrollableSelector=".pdl-masonry-page-section" />

      <Modal
        variant={modalVariant}
        isOpen={!!modalContent}
        onClose={closeModal}
      >
        <ModalHeader
          title={modalContent?.header}
          titleIconVariant={
            modalIsDone === -1
              ? RunningIcon
              : modalIsDone === 0
                ? "success"
                : "danger"
          }
        />
        <ModalBody tabIndex={0}>
          <Suspense fallback={<div />}>
            <RunTerminal
              cmd={modalContent?.cmd ?? ""}
              args={modalContent?.args}
              onExit={onExit}
            />
          </Suspense>
        </ModalBody>

        <ModalFooter>
          <Button
            key="Close"
            variant={modalIsDone > 0 ? "danger" : "primary"}
            onClick={closeModal}
            isDisabled={modalIsDone === -1}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

/**
 * We have received an updated subtree model. Splice it
 * (destructively) into `tree` at the same place `oldSubtree` is
 * located.
 */
function spliceSubtree(
  tree: NonScalarPdlBlock,
  oldSubtree: NonScalarPdlBlock,
  newSubtree: NonScalarPdlBlock,
): NonScalarPdlBlock {
  let key: keyof NonScalarPdlBlock
  for (key in tree) {
    const value = tree[key]
    if (Array.isArray(value)) {
      for (let idx = 0; idx < value.length; idx++) {
        const v = value[idx]
        if (isNonScalarPdlBlock(v)) {
          if (v.id === oldSubtree.id) {
            value[idx] = updateIds(
              newSubtree,
              oldSubtree.id?.replace(new RegExp(newSubtree.id + "$"), "") ?? "",
              hasTimingInformation(oldSubtree) &&
                hasTimingInformation(newSubtree)
                ? oldSubtree.pdl__timing.start_nanos -
                    newSubtree.pdl__timing.start_nanos
                : 0,
            )
          } else {
            spliceSubtree(v, oldSubtree, newSubtree)
          }
        }
      }
    } else if (isNonScalarPdlBlock(value)) {
      if (value.id === oldSubtree.id) {
        Object.assign(tree, { [key]: newSubtree })
      } else {
        spliceSubtree(value, oldSubtree, newSubtree)
      }
    }
  }

  return tree
}

/**
 * We need to add the id prefix from the enclosing tree, and also
 * update the timestamps so that the timeline view stays consistent.
 * TODO: re: timestamp updates, we still need to update all subsequent
 * children as well; this only updates the new subtree...
 */
function updateIds(
  tree: NonScalarPdlBlock,
  idPrefix: string,
  timeDelta: number,
) {
  return JSON.parse(
    JSON.stringify(tree, (k, v) => {
      switch (k) {
        case "id":
          return idPrefix + v
        case "start_nanos":
        case "end_nanos":
          return v + timeDelta
        default:
          return v
      }
    }),
  )
}
