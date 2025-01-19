import type {
  JSXElementConstructor,
  PropsWithChildren,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react"
import { Tooltip } from "@patternfly/react-core"

type Props = PropsWithChildren<{
  detail?: string
  className?: string
  onClick?: (evt: MouseEvent) => void
  tooltip?: ReactNode
}>

export type BreadcrumbBarItemComponent = ReactElement<
  Props,
  JSXElementConstructor<Props>
>

export default function BreadcrumbBarItem({
  className,
  children,
  detail,
  onClick,
  tooltip,
}: Props) {
  const c = <span>{children}</span>
  return (
    <li className={className} data-detail={detail}>
      <a onClick={onClick}>
        {!tooltip ? c : <Tooltip content={tooltip}>{c}</Tooltip>}
      </a>
    </li>
  )
}
