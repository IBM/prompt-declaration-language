const darkModeLocalStorageKey = "pdl-viewer.dark-mode"

export function getDarkModeUserSetting(): boolean {
  return (localStorage.getItem(darkModeLocalStorageKey) || "false") == "true"
}

export function setDarkModeUserSetting(darkMode: boolean) {
  localStorage.setItem(darkModeLocalStorageKey, darkMode ? "true" : "false")
}

export function setDarkModeForSession(darkMode: boolean) {
  if (darkMode) {
    document.querySelector("html")?.classList.add("pf-v6-theme-dark")
  } else {
    document.querySelector("html")?.classList.remove("pf-v6-theme-dark")
  }
}
