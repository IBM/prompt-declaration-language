import { useSearchParams, Link } from "react-router"
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
  const [searchParams] = useSearchParams()
  const s = searchParams.toString()
  const search = s.length > 0 ? "?" + s : ""
  const renderHome = useCallback(
    () => <Link to={"/welcome" + search}>Home</Link>,
    [search],
  )

  const renderFirst = useCallback(
    () => (
      <Link to={"/" + breadcrumb1?.split(/\s+/)[0].toLowerCase()}>
        {breadcrumb1}
      </Link>
    ),
    [breadcrumb1],
  )

  const homeIsLink = !!breadcrumb1 || !!breadcrumb2

  return (
    <Breadcrumb>
      <BreadcrumbItem>PDL</BreadcrumbItem>
      {homeIsLink ? (
        <BreadcrumbItem render={renderHome} />
      ) : (
        <BreadcrumbItem isActive>Home</BreadcrumbItem>
      )}
      {breadcrumb1 && !breadcrumb2 ? (
        <BreadcrumbItem>{breadcrumb1}</BreadcrumbItem>
      ) : (
        breadcrumb1 && <BreadcrumbItem render={renderFirst} />
      )}
      {breadcrumb2 && <BreadcrumbItem isActive>{breadcrumb2}</BreadcrumbItem>}
    </Breadcrumb>
  )
}
