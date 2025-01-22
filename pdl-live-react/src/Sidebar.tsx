import { Link, useLocation } from "react-router-dom"
import {
  Nav,
  NavGroup,
  NavList,
  NavItem,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core"

import demos from "./demos/demos"

export default function Sidebar() {
  const { hash, pathname: activeItem } = useLocation()

  return (
    <PageSidebar id="pdl--vertical-sidebar">
      <PageSidebarBody>
        <Nav>
          <NavList>
            <NavItem
              itemId="welcome"
              isActive={activeItem === "" || activeItem === "/welcome"}
            >
              <Link to="/welcome">Welcome</Link>
            </NavItem>

            <NavItem itemId="viewer" isActive={activeItem === "/upload"}>
              <Link to={"/upload" + hash}>Upload a Trace</Link>
            </NavItem>
          </NavList>

          <NavGroup title="Demos">
            {demos.map((demo) => {
              const id = "/demos/" + encodeURIComponent(demo.name)
              return (
                <NavItem key={id} itemId={id} isActive={activeItem === id}>
                  <Link to={id + hash}>{demo.name}</Link>
                </NavItem>
              )
            })}
          </NavGroup>

          <NavItem itemId="about" isActive={activeItem === "/about"}>
            <Link to="/about">About PDL</Link>
          </NavItem>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  )
}
