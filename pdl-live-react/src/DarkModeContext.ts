import { createContext } from "react"

const darkModeLocalStorageKey = "pdl-viewer.dark-mode"

export function getDarkModeUserSetting(): boolean {
  return (localStorage.getItem(darkModeLocalStorageKey) || "false") == "true"
}

export function setDarkModeUserSetting(darkMode: boolean) {
  localStorage.setItem(darkModeLocalStorageKey, darkMode ? "true" : "false")
}

export default createContext(getDarkModeUserSetting())
