import { useCallback } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

import { Button, Tooltip } from "@patternfly/react-core"
import Icon from "@patternfly/react-icons/dist/esm/icons/code-icon"

type Props = {
  /** Root of the program */
  root: string
}

export default function ToolbarShowSourceButton({ root }: Props) {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onClick = useCallback(() => {
    if (searchParams.has("detail") && searchParams.get("type") === "source") {
      // close detail
      navigate(hash)
    } else {
      // open detail
      navigate(`?detail&type=block&id=${root}${hash}`)
    }
  }, [hash, navigate, searchParams, root])

  return (
    <Tooltip content="Show program source and program output">
      <Button size="sm" variant="secondary" icon={<Icon />} onClick={onClick} />
    </Tooltip>
  )
}
