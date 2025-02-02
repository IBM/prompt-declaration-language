import { useSearchParams } from "react-router-dom"
import { useEffect, useState, type PropsWithChildren } from "react"

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

type Props = PropsWithChildren<
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
      drawerMinSize="600px"
      isNotificationDrawerExpanded={showingDetail}
      notificationDrawer={
        <DrawerContent value={typeof value === "string" ? value : ""} />
      }
      isContentFilled
      isManagedSidebar
      sidebar={<Sidebar />}
      masthead={
        <DarkModeContext.Provider value={darkMode}>
          <Masthead setDarkMode={setDarkMode} />
        </DarkModeContext.Provider>
      }
      horizontalSubnav={typeof value === "string" && <ViewerTabs />}
      groupProps={notFilled /* so breadcrumbs aren't filled */}
      isBreadcrumbGrouped
      breadcrumb={<PageBreadcrumbs {...props} />}
    >
      {children && (
        <PageSection
          padding={padding ? withPadding : withoutPadding}
          aria-label="Non-viewer content"
        >
          {children}
        </PageSection>
      )}

      {value && value.length > 0 && (
        <PageSection
          isFilled
          hasOverflowScroll
          className="pdl-content-section"
          aria-label="PDL Viewer main section"
        >
          <DarkModeContext.Provider value={darkMode}>
            <Viewer value={value} />
          </DarkModeContext.Provider>
        </PageSection>
      )}
    </Page>
  )
}
