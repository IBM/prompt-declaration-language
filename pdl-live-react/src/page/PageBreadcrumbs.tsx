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
  return (
    breadcrumb1 && (
      <Breadcrumb>
        <BreadcrumbItem>{breadcrumb1}</BreadcrumbItem>
        {breadcrumb2 && <BreadcrumbItem>{breadcrumb2}</BreadcrumbItem>}
      </Breadcrumb>
    )
  )
}
