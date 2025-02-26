import Page from "./Page"
import PageBreadcrumbDropdown from "./PageBreadcrumbDropdown"
import PageBreadcrumbDropdownItem from "./PageBreadcrumbDropdownItem"

import demos, { type Demo } from "../demos/demos"

type Props = {
  name: string
  value: string
}

/** current is demo curently being shown */
function DemosDropdown({ current }: { current: string }) {
  return (
    <PageBreadcrumbDropdown label="Demos">
      {demos.map((demo) => (
        <PageBreadcrumbDropdownItem
          key={demo.name}
          url="demos"
          current={current}
          {...demo}
        />
      ))}
    </PageBreadcrumbDropdown>
  )
}

export default function Demo({ name, value }: Props) {
  return (
    <Page
      breadcrumb1={<DemosDropdown current={name} />}
      breadcrumb2={name}
      initialValue={value}
    />
  )
}
