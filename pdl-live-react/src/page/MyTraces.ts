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
  let traces = getMyTraces()
  const trace = {
    title: filename.replace(/\.trace.json$/, ""),
    timestamp: Date.now(),
    filename,
    value,
  }

  const alreadyIdx = traces.findIndex((_) => _.filename === filename)
  if (alreadyIdx < 0) {
    traces.push(trace)
  } else {
    traces = [
      ...traces.slice(0, alreadyIdx),
      trace,
      ...traces.slice(alreadyIdx + 1),
    ]
  }
  localStorage.setItem(mytracesLocalStorageKey, JSON.stringify(traces))

  return trace
}
