import { useEffect } from "react"
import { useLocation } from "react-router"

function capitalize(s: string) {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)
}

export default function useDynamicTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const rest = capitalize(
      decodeURIComponent(pathname.replace(/^\/(demos\/)?/, "")),
    )

    document.title = "PDL Viewer" + (rest ? ` - ${rest}` : "")
  }, [pathname])
}
