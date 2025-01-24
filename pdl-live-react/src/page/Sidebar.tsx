import { Link, useLocation } from "react-router-dom"

import {
  Nav,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core"

import Demos from "./DemoNavItems"
import MyTraces from "./MyTracesNavItems"

export default function Sidebar() {
  const { hash, pathname: activeItem } = useLocation()

  return (
    <PageSidebar>
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

          <MyTraces hash={hash} activeItem={activeItem} />
          <Demos hash={hash} activeItem={activeItem} />

          <NavItem itemId="about" isActive={activeItem === "/about"}>
            <Link to="/about">About PDL</Link>
          </NavItem>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  )
}
