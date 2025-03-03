import { useCallback, useMemo, useState } from "react"
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleAction,
} from "@patternfly/react-core"

import RunIcon from "@patternfly/react-icons/dist/esm/icons/redo-icon"

type Props = Pick<import("./Tile").default, "block"> & {
  run: import("./MasonryCombo").Runner
}

/**
 * The Run split action dropdown placed in the upper right of each
 * MasonryTile.
 */
export default function RunMenu({ block, run }: Props) {
  const runOnce = useCallback(() => {
    if (block && run) {
      run(block)
    }
  }, [block, run])

  const [isRunOpen, setIsRunOpen] = useState(false)
  const onRunToggle = useCallback(
    () => setIsRunOpen((open) => !open),
    [setIsRunOpen],
  )

  const splitButtonItems = useMemo(
    () => [
      <MenuToggleAction
        key="split-action-run"
        aria-label="Run"
        onClick={runOnce}
      >
        <RunIcon />
      </MenuToggleAction>,
    ],
    [runOnce],
  )

  return (
    <Dropdown
      isOpen={isRunOpen}
      onSelect={onRunToggle}
      onOpenChange={setIsRunOpen}
      toggle={(toggleRef) => (
        <MenuToggle
          size="sm"
          ref={toggleRef}
          onClick={onRunToggle}
          isExpanded={isRunOpen}
          isDisabled={!window.__TAURI_INTERNALS__}
          splitButtonItems={splitButtonItems}
        />
      )}
    >
      <DropdownList>
        <DropdownItem
          icon={<RunIcon />}
          description="Run this block once"
          onClick={runOnce}
        >
          Run Once
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  )
}
