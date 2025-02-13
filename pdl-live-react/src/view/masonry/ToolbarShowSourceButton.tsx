import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router"

import { Button, Tooltip } from "@patternfly/react-core"

import CodeIcon from "@patternfly/react-icons/dist/esm/icons/code-icon"

export default function ToolbarProgramOrSourceToggle() {
  const { hash } = useLocation()
  const navigate = useNavigate()

  const handleClickSource = useCallback(() => {
    navigate("?detail&type=source" + hash)
  }, [hash, navigate])

  return (
    <Tooltip content="Show program source">
      <Button size="sm" icon={<CodeIcon />} onClick={handleClickSource} />
    </Tooltip>
  )
}
