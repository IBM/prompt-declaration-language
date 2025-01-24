const mytracesLocalStorageKey = "pdl.sidebar-nav-mytraces.list"

type MyTrace = {
  title: string
  timestamp: number
  filename: string
  value: string
}
export function getMyTraces(): MyTrace[] {
  return JSON.parse(
    localStorage.getItem(mytracesLocalStorageKey) || "[]",
  ) as MyTrace[]
}

export function addMyTrace(filename: string, value: string): MyTrace {
  const traces = getMyTraces()
  const already = traces.find(
    (_) => _.filename === filename && _.value === value,
  )
  if (!already) {
    const trace = {
      title: filename.replace(/\.trace.json$/, ""),
      timestamp: Date.now(),
      filename,
      value,
    }
    traces.push(trace)
    localStorage.setItem(mytracesLocalStorageKey, JSON.stringify(traces))

    return trace
  }

  return already
}
