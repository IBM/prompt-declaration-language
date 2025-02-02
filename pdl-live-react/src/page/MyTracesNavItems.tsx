import { Link } from "react-router"
import { useCallback, useState, type MouseEvent } from "react"
import {
  NavExpandable,
  NavItem,
  Stack,
  StackItem,
} from "@patternfly/react-core"

import { getMyTraces } from "./MyTraces"

export default function MyTracesNavItems({
  hash,
  activeItem,
}: {
  hash: string
  activeItem: string
}) {
  const myTraces = getMyTraces()

  const mytracesExpandedLocalStorageKey = "pdl.sidebar-nav-mytraces.expanded"
  const [isMyTracesExpanded, setIsMyTracesExpanded] = useState(
    !localStorage.getItem(mytracesExpandedLocalStorageKey) ||
      localStorage.getItem(mytracesExpandedLocalStorageKey) === "true",
  )
  const onMyTracesExpand = useCallback(
    (_evt: MouseEvent, val: boolean) => {
      setIsMyTracesExpanded(val)
      localStorage.setItem(mytracesExpandedLocalStorageKey, String(val))
    },
    [setIsMyTracesExpanded],
  )

  return (
    myTraces.length > 0 && (
      <NavExpandable
        title="My Traces"
        groupId="pdl-sidebar-nav-my-traces"
        isExpanded={isMyTracesExpanded}
        onExpand={onMyTracesExpand}
      >
        {myTraces.map(({ title, filename, timestamp }) => {
          const id = "/my/" + encodeURIComponent(title)
          return (
            <NavItem key={filename} itemId={id} isActive={activeItem === id}>
              <Link to={id + hash}>
                <Stack>
                  {title}
                  <StackItem className="pdl-duration">
                    {new Date(timestamp).toLocaleString()}
                  </StackItem>
                </Stack>
              </Link>
            </NavItem>
          )
        })}
      </NavExpandable>
    )
  )
}
