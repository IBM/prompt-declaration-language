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
  ModalBody,
  ModalFooter,
  ModalHeader,
  PageSection,
} from "@patternfly/react-core"

const RunTerminal = lazy(() => import("../term/RunTerminal"))

import Masonry from "./Masonry"
import Timeline from "../timeline/TimelineFromModel"
import MasonryTileWrapper from "./MasonryTileWrapper"
import Toolbar, { type SML } from "./Toolbar"

import computeModel from "./model"
import ConditionVariable from "./condvar"
import {
  hasContextInformation,
  hasTimingInformation,
  isNonScalarPdlBlock,
  type NonScalarPdlBlock,
} from "../../helpers"

import RunningIcon from "@patternfly/react-icons/dist/esm/icons/running-icon"

import "./Masonry.css"

/** Initial number of masonry tiles to show per page */
const initialPerPage = 20

export type Runner = (
  block?: import("../../helpers").NonScalarPdlBlock,
  async?: boolean,
  update?: <BB extends import("../../helpers").NonScalarPdlBlock>(
    outputBlock: BB,
  ) => import("../../pdl_ast").PdlBlock,
) => Promise<void | import("../../helpers").NonScalarPdlBlock>

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

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)

  const [modalIsDone, setModalIsDone] = useState(-1)
  const [modalContent, setModalContent] = useState<null | {
    header: string
    cmd: string
    cwd: string
    args?: string[]
    onExit?: (exitCode: number) => void
    cancelCondVar?: ConditionVariable
  }>(null)
  const cancelModal = useCallback(
    () => modalContent?.cancelCondVar?.signal(),
    [modalContent?.cancelCondVar],
  )
  const closeModal = useCallback(() => {
    modalContent?.cancelCondVar?.signal()
    setModalContent(null)
    setModalIsDone(-1)
  }, [modalContent?.cancelCondVar, setModalContent, setModalIsDone])
  const onExit = useCallback(
    (exitCode: number) => {
      setModalIsDone(exitCode)
      if (modalContent?.onExit) {
        modalContent.onExit(exitCode)
      }
    },
    [setModalIsDone, modalContent],
  )
  useEffect(() => {
    setModalIsDone(modalContent === null ? -1 : -2)
    setPage(1)
    setPerPage(initialPerPage)
  }, [modalContent])

  // special form of setModalContent for running a PDL program
  const run = useCallback<Runner>(
    async (runThisBlock, async = false, update) => {
      if (!isNonScalarPdlBlock(block)) {
        return
      } else if (!runThisBlock) {
        runThisBlock = block
      }
      if (!isNonScalarPdlBlock(runThisBlock)) {
        return
      }

      const [cmd, cwd, input, output] = (await invoke("replay_prep", {
        trace: JSON.stringify(runThisBlock),
        name: block.description?.slice(0, 30).replace(/\s/g, "-") ?? "trace",
      })) as [string, string, string, string]
      console.error(`Replaying with cmd=${cmd} input=${input} output=${output}`)

      // We need to pass tothe re-execution the original input context
      const data = hasContextInformation(runThisBlock)
        ? { pdl_context: runThisBlock.context }
        : undefined

      return new Promise<void | typeof runThisBlock>((resolve) => {
        setModalContent({
          header: "Running Program",
          cmd,
          cwd,
          args: [
            "run",
            ...(async ? ["--stream", "none"] : []),
            "--trace",
            output,
            ...(!data ? [] : ["--data", JSON.stringify(data)]),
            input,
          ],
          cancelCondVar: new ConditionVariable(),
          onExit: async (exitCode: number) => {
            if (exitCode !== 0) {
              resolve()
              return
            }

            try {
              const buf = await invoke<ArrayBuffer>("read_trace", {
                traceFile: output,
              }).catch(console.error)
              if (buf) {
                const decoder = new TextDecoder("utf-8") // Assuming UTF-8 encoding
                const newTraceBuf = decoder.decode(new Uint8Array(buf))
                if (newTraceBuf) {
                  const newTrace = JSON.parse(newTraceBuf)
                  setValue(
                    JSON.stringify(
                      spliceSubtree(
                        block,
                        runThisBlock,
                        update ? update(newTrace) : newTrace,
                      ),
                    ),
                  )

                  resolve(newTrace)
                  return
                }
              }

              resolve()
            } catch (err) {
              console.error(err)
            }
          },
        })
      })
    },
    [block, setValue, setModalContent],
  )

  const { base, masonry, numbering } = useMemo(
    () => computeModel(block),
    [block],
  )

  if (!block) {
    return "Invalid trace content"
  }

  return (
    <>
      <PageSection type="subnav">
        <Toolbar
          sml={sml}
          setSML={setSML}
          run={run}
          isRunning={modalIsDone === -2}
          block={block}
          itemCount={masonry.length < initialPerPage ? -1 : masonry.length}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
        />
      </PageSection>
      <PageSection
        isFilled
        hasOverflowScroll
        className="pdl-masonry-page-section"
        aria-label="PDL Viewer main section"
      >
        <Masonry
          model={masonry}
          sml={sml}
          run={run}
          page={page}
          perPage={perPage}
        >
          <MasonryTileWrapper sml={sml} variant="plain">
            <Timeline model={base} numbering={numbering} />
          </MasonryTileWrapper>
        </Masonry>
      </PageSection>

      <BackToTop scrollableSelector=".pdl-masonry-page-section" />

      <Modal variant="large" isOpen={!!modalContent} onClose={closeModal}>
        <ModalHeader
          title={modalContent?.header}
          titleIconVariant={
            modalIsDone < 0
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
              cwd={modalContent?.cwd ?? ""}
              args={modalContent?.args}
              cancel={modalContent?.cancelCondVar}
              onExit={onExit}
            />
          </Suspense>
        </ModalBody>

        <ModalFooter>
          <Button
            key="Close"
            variant={modalIsDone > 0 ? "danger" : "primary"}
            onClick={closeModal}
            isDisabled={modalIsDone < 0}
          >
            Close
          </Button>
          <Button
            key="Cancel"
            variant="danger"
            onClick={cancelModal}
            isLoading={modalIsDone == -2}
            isDisabled={modalIsDone !== -2}
          >
            Cancel
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
          if (v.pdl__id === oldSubtree.pdl__id) {
            value[idx] = updateIds(
              newSubtree,
              oldSubtree.pdl__id?.replace(
                new RegExp(newSubtree.pdl__id + "$"),
                "",
              ) ?? "",
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
      if (value.pdl__id === oldSubtree.pdl__id) {
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
