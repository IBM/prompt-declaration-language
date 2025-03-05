import { compressToUTF16, decompressFromUTF16 } from "lz-string"

const mytracesLocalStorageKey = "pdl.sidebar-nav-mytraces.list"

type MyTrace = {
  title: string
  timestamp: number
  filename: string
  value: string
  isCompressed?: boolean
}

export function clear() {
  localStorage.removeItem(mytracesLocalStorageKey)
}

export function getMyTraces(): MyTrace[] {
  return (
    JSON.parse(
      localStorage.getItem(mytracesLocalStorageKey) || "[]",
    ) as MyTrace[]
  ).map((trace) =>
    Object.assign(trace, {
      title: trace.title.replace(/(\.trace)?.json$/, ""),
      value: trace.isCompressed
        ? decompressFromUTF16(trace.value)
        : trace.value,
    }),
  )
}

export function addMyTrace(filename: string, value: string): MyTrace {
  let traces = getMyTraces()
  const trace = {
    title: filename.replace(/(\.trace)?.json$/, ""),
    timestamp: Date.now(),
    filename,
    isCompressed: true,
    value: compressToUTF16(value),
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
