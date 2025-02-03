import { useSearchParams } from "react-router"
import { useEffect, useState } from "react"

import { Page, PageSection } from "@patternfly/react-core"

import Viewer from "./Viewer"
import Sidebar from "./Sidebar"
import Masthead from "./Masthead"
import ViewerTabs from "./ViewerTabs"
import DrawerContent from "../view/detail/DrawerContent"
import PageBreadcrumbs, { type PageBreadcrumbProps } from "./PageBreadcrumbs"

import DarkModeContext, {
  setDarkModeForSession,
  getDarkModeUserSetting,
} from "./DarkModeContext"

import "./Page.css"

const notFilled = { isFilled: false }
const withPadding = { default: "padding" as const }
const withoutPadding = { default: "noPadding" as const }

type Props = import("react").PropsWithChildren<
  PageBreadcrumbProps & {
    /** Should the page content use default padding? [default: true] */
    padding?: boolean

    /** The trace content */
    value?: string
  }
>

export default function PDLPage(props: Props) {
  const [darkMode, setDarkMode] = useState(getDarkModeUserSetting())
  useEffect(() => setDarkModeForSession(getDarkModeUserSetting()), [])

  /** Manage the drawer that slides in from the right */
  const [searchParams] = useSearchParams()
  const showingDetail = searchParams.has("detail")

  const { padding = true, value, children } = props

  return (
    <Page
      className="pdl-page"
      drawerMinSize="600px"
      isNotificationDrawerExpanded={showingDetail}
      notificationDrawer={
        <DrawerContent value={typeof value === "string" ? value : ""} />
      }
      isContentFilled
      sidebar={<Sidebar />}
      masthead={
        <DarkModeContext.Provider value={darkMode}>
          <Masthead setDarkMode={setDarkMode} />
        </DarkModeContext.Provider>
      }
      horizontalSubnav={<ViewerTabs hidden={typeof value !== "string"} />}
      groupProps={notFilled /* so breadcrumbs aren't filled */}
      isBreadcrumbGrouped
      breadcrumb={
        <PageBreadcrumbs
          breadcrumb1={props.breadcrumb1}
          breadcrumb2={props.breadcrumb2}
        />
      }
    >
      <PageSection
        isFilled
        hasOverflowScroll
        padding={padding ? withPadding : withoutPadding}
        className="pdl-content-section"
        aria-label="PDL Viewer main section"
      >
        {children || (value && value.length > 0 && <Viewer value={value} />)}
      </PageSection>
    </Page>
  )
}
