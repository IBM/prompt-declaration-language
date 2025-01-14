declare module "*.svg?react" {
  import React from "react"
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>
  export default SVG
}
