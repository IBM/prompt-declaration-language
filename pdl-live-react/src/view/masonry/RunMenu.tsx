import { useCallback, useMemo, useState } from "react"
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleAction,
  type MenuToggleElement,
} from "@patternfly/react-core"

import RunIcon from "@patternfly/react-icons/dist/esm/icons/redo-icon"
import ModelIcon from "@patternfly/react-icons/dist/esm/icons/theater-masks-icon"
import TemperatureIcon from "@patternfly/react-icons/dist/esm/icons/thermometer-half-icon"

const preventOverflow = {
  preventOverflow: true,
} satisfies import("@patternfly/react-core").DropdownPopperProps

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

  const runTemperature = useCallback(async () => {
    if (block && run) {
      const { runNTimes } = await import("./stability")
      await runNTimes(block, run, 4, [0, 0.33, 0.66, 1])
    }
  }, [block, run])

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const onMenuToggle = useCallback(
    () => setIsMenuOpen((open) => !open),
    [setIsMenuOpen],
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

  const toggle = useCallback(
    (toggleRef: import("react").RefObject<MenuToggleElement>) => (
      <MenuToggle
        size="sm"
        ref={toggleRef}
        onClick={onMenuToggle}
        isExpanded={isMenuOpen}
        isDisabled={!window.__TAURI_INTERNALS__}
        splitButtonItems={splitButtonItems}
      />
    ),
    [isMenuOpen, onMenuToggle, splitButtonItems],
  )

  return (
    <Dropdown
      popperProps={preventOverflow}
      isOpen={isMenuOpen}
      onSelect={onMenuToggle}
      onOpenChange={setIsMenuOpen}
      toggle={toggle}
    >
      <DropdownList>
        <DropdownItem
          icon={<RunIcon />}
          description="Re-run and update the UI to reflect the new response"
          onClick={runOnce}
        >
          Run Once
        </DropdownItem>

        <DropdownItem
          icon={<TemperatureIcon />}
          description="Evaluate model stability across a range of temperatures"
          onClick={runTemperature}
          isDisabled={!window.__TAURI_INTERNALS__}
        >
          Analyze Stability
        </DropdownItem>

        <DropdownItem
          icon={<ModelIcon />}
          description="Evaluate model stability across varying models"
          onClick={runOnce}
          isDisabled
        >
          Analyze Model Variability
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  )
}
