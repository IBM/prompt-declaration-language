import { useCallback, useMemo, useState } from "react"
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleAction,
} from "@patternfly/react-core"

import RunIcon from "@patternfly/react-icons/dist/esm/icons/redo-icon"
import ModelIcon from "@patternfly/react-icons/dist/esm/icons/theater-masks-icon"
import IdempotencyIcon from "@patternfly/react-icons/dist/esm/icons/equals-icon"
import TemperatureIcon from "@patternfly/react-icons/dist/esm/icons/thermometer-half-icon"

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
          description="Re-run with the same inputs and update to reflect the new response"
          onClick={runOnce}
        >
          Run Once
        </DropdownItem>

        <DropdownItem
          icon={<IdempotencyIcon />}
          description="Run several times to evaluate model stability for a fixed input"
          onClick={runOnce}
          isDisabled
        >
          Analyze Idempotency
        </DropdownItem>

        <DropdownItem
          icon={<TemperatureIcon />}
          description="Run several times to evaluate model stability across varying temperatures"
          onClick={runOnce}
          isDisabled
        >
          Analyze Temperature Variability
        </DropdownItem>

        <DropdownItem
          icon={<ModelIcon />}
          description="Run several times to evaluate model stability across varying models"
          onClick={runOnce}
          isDisabled
        >
          Analyze Model Variability
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  )
}
