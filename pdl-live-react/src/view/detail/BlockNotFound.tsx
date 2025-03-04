export default function BlockNotFound(props: {
  pdl__id: string | null
  value: string
}) {
  console.error("Block not found", props.pdl__id, props.value)
  return <div>Block not found</div>
}
