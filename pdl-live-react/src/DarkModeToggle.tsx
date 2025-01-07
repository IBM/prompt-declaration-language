import { useCallback, useContext } from "react"

import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core"

import DarkModeContext, { setDarkModeUserSetting } from "./DarkModeContext"

import SunIcon from "@patternfly/react-icons/dist/esm/icons/sun-icon"
import MoonIcon from "@patternfly/react-icons/dist/esm/icons/moon-icon"

export type DarkModeProps = { setDarkMode: (value: boolean) => void }

/** Replicating the dark mode toggler from the masthead of https://patternfly.org */
export default function DarkModeToggle({ setDarkMode }: DarkModeProps) {
  const darkMode = useContext(DarkModeContext)

  const handleClickSun = useCallback(() => {
    setDarkMode(false)
    setDarkModeUserSetting(false)
    document.querySelector("html")?.classList.remove("pf-v6-theme-dark")
  }, [setDarkMode])
  const handleClickMoon = useCallback(() => {
    setDarkMode(true)
    setDarkModeUserSetting(true)
    document.querySelector("html")?.classList.add("pf-v6-theme-dark")
  }, [setDarkMode])

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
