import { useCallback, useEffect, useState } from "react"

import {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
} from "@patternfly/react-core"

import SunIcon from "@patternfly/react-icons/dist/esm/icons/sun-icon"
import MoonIcon from "@patternfly/react-icons/dist/esm/icons/moon-icon"

export type DarkModeProps = {
  onDarkModeToggle(darkMode: boolean): void
}

/** Replicating the dark mode toggler from the masthead of https://patternfly.org */
export default function DarkModeToggle({ onDarkModeToggle }: DarkModeProps) {
  const darkModeLocalStorageKey = "pdl-viewer.dark-mode"

  const [darkMode, setDarkMode] = useState(
    (localStorage.getItem(darkModeLocalStorageKey) || "false") == "true",
  )

  useEffect(() => {
    onDarkModeToggle(darkMode)
    localStorage.setItem(darkModeLocalStorageKey, darkMode ? "true" : "false")
  }, [darkMode, onDarkModeToggle])

  const handleClickSun = useCallback<
    Required<ToggleGroupItemProps>["onChange"]
  >((_event, isSelected) => {
    setDarkMode(!isSelected)
  }, [])
  const handleClickMoon = useCallback<
    Required<ToggleGroupItemProps>["onChange"]
  >((_event, isSelected) => {
    setDarkMode(isSelected)
  }, [])

  return (
    <ToggleGroup aria-label="light-dark mode toggle">
      <ToggleGroupItem
        icon={<SunIcon />}
        aria-label="light mode"
        isSelected={!darkMode}
        onChange={handleClickSun}
      />
      <ToggleGroupItem
        icon={<MoonIcon />}
        aria-label="dark mode"
        isSelected={darkMode}
        onChange={handleClickMoon}
      />
    </ToggleGroup>
  )
}
