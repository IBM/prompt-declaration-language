type Tile = {
  id: string
  def?: string | null
  message?: string
  start_nanos?: number
  end_nanos?: number
  timezone?: string
  content: string
  lang?: import("../code/Code").SupportedLanguage
  crumb?: boolean
  kind?: string
  boundedHeight?: boolean
}

export default Tile
