import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core"

import demos from "./demos"

type Props = {
  demo: string
}

export default function DemoSelect(props: Props) {
  const selected = props.demo ?? demos[0].value

  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const onToggleClick = () => {
    setIsOpen(!isOpen)
  }

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    demo: string | number | undefined,
  ) => {
    // eslint-disable-next-line no-console
    // console.log("selected", value)

    if (typeof demo === "string") {
      setIsOpen(false)
      navigate({ to: "/", search: { demo } })
    }
  }

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      size="sm"
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      {
        (demos.find((d) => d.value === selected) || { value: "internal error" })
          .label
      }
    </MenuToggle>
  )

  return (
    <Select
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {demos.map((demo) => (
          <SelectOption
            key={demo.value}
            value={demo.value}
            description={demo.description}
          >
            {demo.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  )
}
