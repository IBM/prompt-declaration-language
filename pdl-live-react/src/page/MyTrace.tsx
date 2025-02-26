import Page from "./Page"
import PageBreadcrumbDropdown from "./PageBreadcrumbDropdown"
import PageBreadcrumbDropdownItem from "./PageBreadcrumbDropdownItem"

import { getMyTraces } from "./MyTraces"

type Props = {
  name: string
  value: string
}

/** current is demo curently being shown */
function MyTracesDropdown({ current }: { current: string }) {
  return (
    <PageBreadcrumbDropdown label="My Traces">
      {getMyTraces().map(({ title, filename }) => (
        <PageBreadcrumbDropdownItem
          key={filename}
          url="my"
          name={title}
          current={current}
        />
      ))}
    </PageBreadcrumbDropdown>
  )
}

export default function MyTrace({ name, value }: Props) {
  return (
    <Page
      breadcrumb1={<MyTracesDropdown current={name} />}
      breadcrumb2={name}
      initialValue={value}
    />
  )
}
