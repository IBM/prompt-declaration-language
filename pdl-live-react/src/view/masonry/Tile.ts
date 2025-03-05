type Tile = {
  id: string
  def?: string | null
  kind?: string
  message?: string

  start_nanos?: number
  end_nanos?: number
  timezone?: string

  lang?: import("../code/Code").SupportedLanguage
  content: string

  footer1Key?: string
  footer1Value?: string | number | boolean
  footer2Key?: string
  footer2Value?: string | number | boolean | number[]
  footer2DetailHeader?: string
  footer2DetailBody?: string[]

  block?: import("../../helpers").NonScalarPdlBlock
  actions?: "run"[]
}

export default Tile
