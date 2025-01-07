import { createContext } from "react"
import { type DrawerContentSpec } from "./DrawerContent"

export default createContext((_spec: DrawerContentSpec) => {})
