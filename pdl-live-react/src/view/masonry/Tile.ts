type Tile = {
  id: string
  def?: string | null
  kind?: string
  message?: string

  start_nanos?: number
  end_nanos?: number
  timezone?: string

  lang?: import("../code/Code").SupportedLanguage
  content: string | number | boolean

  footer1Key?: string
  footer1Value?: string | number | boolean
  footer2Key?: string
  footer2Value?: string | number | boolean
  footer3Key?: string
  footer3Value?: string | number | boolean
  stability?: import("./stability").StabilityMetric[]

  block?: import("../../helpers").NonScalarPdlBlock
  actions?: "run"[]
}

export default Tile
