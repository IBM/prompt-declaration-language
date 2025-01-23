import { useCallback, useEffect, useState, type PropsWithChildren } from "react"
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
import DrawerContent from "./DrawerContent"

import DrawerContext from "./DrawerContentContext"
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
  const [drawerContent, setDrawerContent] = useState<
    null | import("./DrawerContent").DrawerContentSpec
  >(null)
  const onCloseDrawer = useCallback(
    () => setDrawerContent(null),
    [setDrawerContent],
  )

  return (
    <Page
      isNotificationDrawerExpanded={!!drawerContent}
      notificationDrawer={
        <DrawerContent
          header={drawerContent?.header ?? ""}
          description={drawerContent?.description}
          body={drawerContent?.body ?? <></>}
          onCloseDrawer={onCloseDrawer}
        />
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
        <DrawerContext.Provider value={setDrawerContent}>
          <DarkModeContext.Provider value={darkMode}>
            {typeof children === "string" && children.length > 0 ? (
              <Viewer value={children} />
            ) : (
              children
            )}
          </DarkModeContext.Provider>
        </DrawerContext.Provider>
      </PageSection>
    </Page>
  )
}
