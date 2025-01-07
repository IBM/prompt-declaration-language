import {
  useCallback,
  useState,
  type ReactNode,
  type PropsWithChildren,
} from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  Page,
  PageSection,
} from "@patternfly/react-core"

import Masthead from "./Masthead"
import Sidebar from "./Sidebar"
import DrawerContent from "./DrawerContent"

import DrawerContext from "./DrawerContentContext"
import DarkModeContext, { getDarkModeUserSetting } from "./DarkModeContext"

type Props = PropsWithChildren<{
  breadcrumb1?: string
  breadcrumb2?: string
}>

export default function PDLPage({ breadcrumb1, breadcrumb2, children }: Props) {
  const [darkMode, setDarkMode] = useState(getDarkModeUserSetting())

  /** Manage the drawer that slides in from the right */
  const [drawerContent, setDrawerContent] = useState<null | {
    header: string
    description?: ReactNode
    body: ReactNode
  }>(null)
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
        aria-label="PDL Viewer main section"
      >
        <DrawerContext.Provider value={setDrawerContent}>
          <DarkModeContext.Provider value={darkMode}>
            {children}
          </DarkModeContext.Provider>
        </DrawerContext.Provider>
      </PageSection>
    </Page>
  )
}
