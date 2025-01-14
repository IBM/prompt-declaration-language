import { useCallback, useState } from "react"

import {
  Nav,
  NavGroup,
  NavList,
  NavItem,
  type NavProps,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core"

import demos from "./demos/demos"

type Props = {
  setValue: (value: { name: string; value: string }) => void
}

export default function Sidebar(props: Props) {
  const [activeItem, setActiveItem] = useState<string | number>("welcome")

  const { setValue } = props
  const onNavSelect = useCallback<Required<NavProps>["onSelect"]>(
    (_event, result) => {
      setActiveItem(result.itemId)
      if (
        typeof result.itemId === "string" &&
        result.itemId.startsWith("demo-")
      ) {
        const expected = result.itemId.slice("demo-".length)
        const demo = demos.find(({ name }) => name === expected)
        if (demo) {
          setValue({ name: demo.name, value: demo.trace })
        }
      } else if (result.itemId === "about") {
        setValue({ name: "_about", value: "" })
      } else if (result.itemId === "welcome") {
        setValue({ name: "_welcome", value: "" })
      } else {
        // clear any prior demo input
        setValue({ name: "", value: "" })
      }
    },
    [setValue],
  )

  return (
    <PageSidebar id="pdl--vertical-sidebar">
      <PageSidebarBody>
        <Nav onSelect={onNavSelect}>
          <NavList>
            <NavItem itemId="welcome" isActive={activeItem === "welcome"}>
              Welcome
            </NavItem>
            <NavItem itemId="viewer" isActive={activeItem === "viewer"}>
              Upload a Trace
            </NavItem>
          </NavList>
          <NavGroup title="Demos">
            {demos.map((demo) => {
              const id = "demo-" + demo.name
              return (
                <NavItem key={id} itemId={id} isActive={activeItem === id}>
                  {demo.name}
                </NavItem>
              )
            })}
          </NavGroup>
          <NavItem itemId="about" isActive={activeItem === "about"}>
            About PDL
          </NavItem>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  )
}
