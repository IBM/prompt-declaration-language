import { invoke } from "@tauri-apps/api/core"
import { useParams } from "react-router"
import { useEffect, useState } from "react"

import Page from "./Page"

type Props = {
  traceFile: string
}

export default function Local() {
  const { traceFile } = useParams<Props>()
  const [value, setValue] = useState("")

  useEffect(() => {
    let active = true
    load()
    return () => {
      active = false
    }

    async function load() {
      if (traceFile) {
        const buf = (await invoke("read_trace", { traceFile })) as number[]
        let value = ""
        for (let i = 0; i < buf.length; i++) {
          value += String.fromCharCode(buf[i])
        }
        if (!active) {
          return
        }
        setValue(value)
      }
    }
  }, [traceFile, setValue])

  return (
    <Page
      breadcrumb1="Local"
      breadcrumb2={traceFile?.replace(/\.json$/, "")}
      initialValue={value}
    />
  )
}
