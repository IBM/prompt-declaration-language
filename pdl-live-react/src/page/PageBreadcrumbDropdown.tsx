import { useCallback, useState } from "react"
import {
  Dropdown,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core"

export default function PageBreadcrumbDropdown({
  label,
  children,
}: {
  label: string
  children: import("react").ReactNode[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => setIsOpen(!isOpen)
  const onSelect = useCallback(() => {
    setIsOpen((prevIsOpen: boolean) => !prevIsOpen)
  }, [setIsOpen])

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          size="sm"
          className="pdl-breadcrumb-menu-toggle"
          ref={toggleRef}
          onClick={onToggle}
          isExpanded={isOpen}
          variant="plainText"
        >
          {label}
        </MenuToggle>
      )}
    >
      <DropdownList>{children}</DropdownList>
    </Dropdown>
  )
}
