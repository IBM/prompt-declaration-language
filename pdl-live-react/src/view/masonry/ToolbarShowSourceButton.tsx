import { useCallback } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

import { Button, Tooltip } from "@patternfly/react-core"
import Icon from "@patternfly/react-icons/dist/esm/icons/code-icon"

export default function ToolbarShowSourceButton() {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onClick = useCallback(() => {
    if (searchParams.has("detail") && searchParams.get("type") === "source") {
      // close detail
      navigate(hash)
    } else {
      // open detail
      navigate("?detail&type=source" + hash)
    }
  }, [hash, navigate, searchParams])

  return (
    <Tooltip content="Show program source">
      <Button variant="secondary" icon={<Icon />} onClick={onClick} />
    </Tooltip>
  )
}
