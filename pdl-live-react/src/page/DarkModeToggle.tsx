import { useCallback, useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core"

import {
  getDarkModeUserSetting,
  setDarkModeForSession,
  setDarkModeUserSetting,
} from "./DarkModeContext"

import SunIcon from "@patternfly/react-icons/dist/esm/icons/sun-icon"
import MoonIcon from "@patternfly/react-icons/dist/esm/icons/moon-icon"

/** Replicating the dark mode toggler from the masthead of https://patternfly.org */
export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(getDarkModeUserSetting())

  const handleClickSun = useCallback(() => {
    setDarkMode(false)
    setDarkModeUserSetting(false)
    setDarkModeForSession(false)
  }, [setDarkMode])
  const handleClickMoon = useCallback(() => {
    setDarkMode(true)
    setDarkModeUserSetting(true)
    setDarkModeForSession(true)
  }, [setDarkMode])

  return (
    <ToggleGroup aria-label="light-dark mode toggle" isCompact>
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
