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
  searchParams.delete("id")
  searchParams.delete("def")
  searchParams.delete("get")
  searchParams.delete("type")
  searchParams.delete("detail")
  const s = searchParams.toString()
  const search = (s.length > 0 ? "?" + s : "") + hash

  return (
    <PageSidebar isSidebarOpen={searchParams.has("sidebar")}>
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

          <MyTraces hash={search} activeItem={activeItem} />
          <Demos hash={search} activeItem={activeItem} />

          <NavItem itemId="about" isActive={activeItem === "/about"}>
            <Link to={"/about" + search}>About PDL</Link>
          </NavItem>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  )
}
