import Group from "../Group"

export default function ErrorItems({
  block: { msg },
}: {
  block: import("../../../pdl_ast").ErrorBlock
}) {
  return <Group term="Error Message" description={msg} />
}
