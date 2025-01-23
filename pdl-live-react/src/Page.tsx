import { useSearchParams } from "react-router-dom"
import { useEffect, useState, type PropsWithChildren } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  Page,
  PageSection,
} from "@patternfly/react-core"

import Viewer from "./Viewer"
import Sidebar from "./Sidebar"
import Masthead from "./Masthead"
import ViewerTabs from "./ViewerTabs"
import DrawerContent from "./view/detail/DrawerContent"

import DarkModeContext, {
  setDarkModeForSession,
  getDarkModeUserSetting,
} from "./DarkModeContext"

import "./Page.css"

const notFilled = { isFilled: false }

type Props = PropsWithChildren<{
  breadcrumb1?: string
  breadcrumb2?: string
}>

export default function PDLPage({ breadcrumb1, breadcrumb2, children }: Props) {
  const [darkMode, setDarkMode] = useState(getDarkModeUserSetting())
  useEffect(() => setDarkModeForSession(getDarkModeUserSetting()), [])

  /** Manage the drawer that slides in from the right */
  const [searchParams] = useSearchParams()
  const showingDetail = searchParams.has("detail")

  return (
    <Page
      isNotificationDrawerExpanded={showingDetail}
      notificationDrawer={
        <DrawerContent value={typeof children === "string" ? children : ""} />
      }
      isContentFilled
      isManagedSidebar
      sidebar={<Sidebar />}
      masthead={
        <DarkModeContext.Provider value={darkMode}>
          <Masthead setDarkMode={setDarkMode} />
        </DarkModeContext.Provider>
      }
      horizontalSubnav={typeof children === "string" && <ViewerTabs />}
      groupProps={notFilled /* so breadcrumbs aren't filled */}
      isBreadcrumbGrouped
      breadcrumb={
        breadcrumb1 && (
          <Breadcrumb>
            <BreadcrumbItem>{breadcrumb1}</BreadcrumbItem>
            {breadcrumb2 && <BreadcrumbItem>{breadcrumb2}</BreadcrumbItem>}
          </Breadcrumb>
        )
      }
    >
      <PageSection
        isFilled
        hasOverflowScroll
        className="pdl-content-section"
        aria-label="PDL Viewer main section"
      >
        <DarkModeContext.Provider value={darkMode}>
          {typeof children === "string" && children.length > 0 ? (
            <Viewer value={children} />
          ) : (
            children
          )}
        </DarkModeContext.Provider>
      </PageSection>
    </Page>
  )
}
