import demo1 from "./demo1.json"
import demo2 from "./demo2.json"
import demo3 from "./demo3.json"
import demo4 from "./demo4.json"
import demo5 from "./demo5.json"
import demo6 from "./demo6.json"
import demo7 from "./demo7.json"
import demo8 from "./demo8.json"
import demo9 from "./demo9.json"

export type Demo = {
  name: string
  trace: string
}

const demos: Demo[] = [
  demo1,
  demo2,
  demo3,
  demo4,
  demo5,
  demo6,
  demo7,
  demo8,
  demo9,
].map((demo) => ({
  name: demo.description,
  trace: JSON.stringify(demo),
}))

export default demos
