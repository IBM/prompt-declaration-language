import { Page } from "@patternfly/react-core"
import { useSearchParams } from "react-router"
import { useEffect, useState } from "react"

import Sidebar from "./Sidebar"
import Masthead from "./Masthead"
import MasonryCombo from "../view/masonry/MasonryCombo"
import DrawerContent from "../view/detail/DrawerContent"
import PageBreadcrumbs, { type PageBreadcrumbProps } from "./PageBreadcrumbs"

import {
  getDarkModeUserSetting,
  setDarkModeForSession,
} from "./DarkModeContext"

import "./Page.css"

type Props = import("react").PropsWithChildren<
  PageBreadcrumbProps & {
    /** The initial trace content */
    initialValue?: string
  }
>

export default function PDLPage(props: Props) {
  const { initialValue, children } = props

  useEffect(() => setDarkModeForSession(getDarkModeUserSetting()), [])

  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    setValue(props.initialValue)
  }, [props.initialValue])

  /** Manage the drawer that slides in from the right */
  const [searchParams] = useSearchParams()
  const showingDetail = searchParams.has("detail") && !!value
  const hideMasthead = searchParams.has("iframe")

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
      masthead={!window.__TAURI_INTERNALS__ && !hideMasthead && <Masthead />}
      breadcrumb={
        <PageBreadcrumbs
          breadcrumb1={props.breadcrumb1}
          breadcrumb2={props.breadcrumb2}
        />
      }
    >
      {!children
        ? value &&
          value.length > 0 && <MasonryCombo value={value} setValue={setValue} />
        : children}
    </Page>
  )
}
