import { useSearchParams } from "react-router"
import { useEffect, useState } from "react"

import { Page, PageSection } from "@patternfly/react-core"

import Sidebar from "./Sidebar"
import MasonryCombo from "../view/masonry/MasonryCombo"
import DrawerContent from "../view/detail/DrawerContent"
import PageBreadcrumbs, { type PageBreadcrumbProps } from "./PageBreadcrumbs"

import {
  getDarkModeUserSetting,
  setDarkModeForSession,
} from "./DarkModeContext"

import "./Page.css"

const withPadding = { default: "padding" as const }
const withoutPadding = { default: "noPadding" as const }

type Props = import("react").PropsWithChildren<
  PageBreadcrumbProps & {
    /** Should the page content use default padding? [default: true] */
    padding?: boolean

    /** The initial trace content */
    initialValue?: string
  }
>

export default function PDLPage(props: Props) {
  const { padding = true, initialValue, children } = props

  useEffect(() => setDarkModeForSession(getDarkModeUserSetting()), [])

  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    setValue(props.initialValue)
  }, [props.initialValue])

  /** Manage the drawer that slides in from the right */
  const [searchParams] = useSearchParams()
  const showingDetail = searchParams.has("detail") && !!value

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
      breadcrumb={
        <PageBreadcrumbs
          breadcrumb1={props.breadcrumb1}
          breadcrumb2={props.breadcrumb2}
        />
      }
    >
      {!children ? (
        value &&
        value.length > 0 && <MasonryCombo value={value} setValue={setValue} />
      ) : (
        <PageSection
          isFilled
          hasOverflowScroll
          padding={padding ? withPadding : withoutPadding}
          className="pdl-content-section"
          aria-label="PDL Viewer main section"
        >
          {children}
        </PageSection>
      )}
    </Page>
  )
}
