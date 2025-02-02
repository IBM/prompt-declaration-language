import { Link } from "react-router"
import { useCallback, useState, type MouseEvent } from "react"
import { NavExpandable, NavItem } from "@patternfly/react-core"

import demos from "../demos/demos"

export default function DemoNavItems({
  hash,
  activeItem,
}: {
  hash: string
  activeItem: string
}) {
  const demosExpandedLocalStorageKey = "pdl.sidebar-nav-demos.expanded"
  const [isDemosExpanded, setIsDemosExpanded] = useState(
    !localStorage.getItem(demosExpandedLocalStorageKey) ||
      localStorage.getItem(demosExpandedLocalStorageKey) === "true",
  )
  const onDemosExpand = useCallback(
    (_evt: MouseEvent, val: boolean) => {
      setIsDemosExpanded(val)
      localStorage.setItem(demosExpandedLocalStorageKey, String(val))
    },
    [setIsDemosExpanded],
  )

  return (
    <NavExpandable
      title="Demos"
      groupId="pdl-sidebar-nav-demos"
      isExpanded={isDemosExpanded}
      onExpand={onDemosExpand}
    >
      {demos.map((demo) => {
        const id = "/demos/" + encodeURIComponent(demo.name)
        return (
          <NavItem key={id} itemId={id} isActive={activeItem === id}>
            <Link to={id + hash}>{demo.name}</Link>
          </NavItem>
        )
      })}
    </NavExpandable>
  )
}
