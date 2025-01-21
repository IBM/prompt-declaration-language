import "./BreadcrumbBar.css"

import { type BreadcrumbBarItemComponent } from "./BreadcrumbBarItem"

type Props = {
  children: BreadcrumbBarItemComponent | BreadcrumbBarItemComponent[]
}

/** Inspiration: https://codepen.io/renaudtertrais/pen/nMGWqm */
export default function BreadcrumbBar(props: Props) {
  return <ul className="pdl-breadcrumb-bar">{props.children}</ul>
}
