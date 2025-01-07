import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}

export default function useDynamicTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title =
      "PDL Live - " +
      capitalize(decodeURIComponent(pathname.replace(/^\/(demos\/)?/, "")))
  }, [pathname])
}
