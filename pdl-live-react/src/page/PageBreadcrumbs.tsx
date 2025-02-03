import { Link } from "react-router"
import { useCallback } from "react"
import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core"

export type PageBreadcrumbProps = {
  /** The first breadcrumb to be displayed at the top of the page */
  breadcrumb1?: string

  /** The second breadcrumb to be displayed at the top of the page */
  breadcrumb2?: string
}

export default function PageBreadcrumbs({
  breadcrumb1,
  breadcrumb2,
}: PageBreadcrumbProps) {
  const renderHome = useCallback(() => <Link to="/welcome">Home</Link>, [])

  return (
    <Breadcrumb>
      <BreadcrumbItem render={renderHome} />
      {breadcrumb1 && <BreadcrumbItem>{breadcrumb1}</BreadcrumbItem>}
      {breadcrumb2 && <BreadcrumbItem>{breadcrumb2}</BreadcrumbItem>}
    </Breadcrumb>
  )
}
