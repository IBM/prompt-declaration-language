import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core"

import models from "./models"

type Props = {
  demo: string
  model: string
}

export default function ModelSelect(props: Props) {
  const selected = props.model
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const onToggleClick = () => {
    setIsOpen(!isOpen)
  }

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    // eslint-disable-next-line no-console
    console.log("selected", value)

    setIsOpen(false)
    navigate({
      to: "/",
      search: { model: value === models[0].value ? undefined : String(value) },
    })
  }

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      size="sm"
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      {
        (
          models.find((d) => d.value === selected) || {
            value: "internal error",
          }
        ).label
      }
    </MenuToggle>
  )

  return (
    <Select
      isScrollable
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {models.map((model) => (
          <SelectOption
            key={model.value}
            value={model.value}
            description={model.description}
          >
            {model.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  )
}
