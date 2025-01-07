import { Label } from "@patternfly/react-core"

type Props = { children: string; asStatus?: boolean }

/** One variable definition */
export default function Def({ children, asStatus = true }: Props) {
  return (
    <Label
      isCompact
      status={asStatus ? "info" : undefined}
      color={!asStatus ? "purple" : undefined}
    >
      {children}
    </Label>
  )
}
