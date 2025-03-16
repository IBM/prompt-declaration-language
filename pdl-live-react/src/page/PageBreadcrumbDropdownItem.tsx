import { useCallback } from "react"
import { useNavigate, useSearchParams, useLocation } from "react-router"
import { DropdownItem } from "@patternfly/react-core"

export default function PageBreadcrumbDropdownItem({
  url,
  name,
  current,
}: {
  url: string
  name: string
  current: string
}) {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const [searchParams] = useSearchParams()
  searchParams.delete("id")
  searchParams.delete("def")
  searchParams.delete("get")
  searchParams.delete("type")
  searchParams.delete("detail")
  const s = searchParams.toString()
  const search = s.length > 0 ? "?" + s : ""

  const onClick = useCallback(
    () => navigate("/" + url + "/" + name + search + hash),
    [name, url, hash, search, navigate],
  )
  return (
    <DropdownItem onClick={onClick} isDisabled={name === current}>
      {name}
    </DropdownItem>
  )
}
