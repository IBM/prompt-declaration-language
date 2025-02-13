export type View = "program" | "source" | "rawtrace"

export function isView(v: string): v is View {
  return v === "program" || v === "source" || v === "rawtrace"
}
