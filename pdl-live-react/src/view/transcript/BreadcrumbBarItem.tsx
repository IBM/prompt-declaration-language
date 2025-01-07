import type { ReactElement, ReactNode, JSXElementConstructor } from "react"

type Props = {
  children: ReactNode
}

export type BreadcrumbBarItemComponent = ReactElement<
  Props,
  JSXElementConstructor<Props>
>

export default function BreadcrumbBarItem(props: Props) {
  return (
    <li>
      <a href="#">
        <span>{props.children}</span>
      </a>
    </li>
  )
}
