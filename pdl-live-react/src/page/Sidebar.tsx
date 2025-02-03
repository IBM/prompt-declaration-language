import { Link, useLocation, useSearchParams } from "react-router"

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

  const [searchParams] = useSearchParams()
  const s = searchParams.toString()
  const search = (s.length > 0 ? "?" + s : "") + hash

  return (
    <PageSidebar isSidebarOpen={!!searchParams.get("sidebar")}>
      <PageSidebarBody>
        <Nav>
          <NavList>
            <NavItem
              itemId="welcome"
              isActive={activeItem === "" || activeItem === "/welcome"}
            >
              <Link to={"/welcome" + search}>Welcome</Link>
            </NavItem>

            <NavItem itemId="viewer" isActive={activeItem === "/upload"}>
              <Link to={"/upload" + search}>Upload a Trace</Link>
            </NavItem>
          </NavList>

          <MyTraces hash={search + hash} activeItem={activeItem} />
          <Demos hash={hash} activeItem={activeItem} />

          <NavItem itemId="about" isActive={activeItem === "/about"}>
            <Link to={"/about" + search}>About PDL</Link>
          </NavItem>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  )
}
