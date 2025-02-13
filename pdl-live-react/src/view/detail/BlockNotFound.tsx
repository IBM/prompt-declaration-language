export default function BlockNotFound(props: { id: string; value: string }) {
  console.error("Block not found", props.id, props.value)
  return <div>Block not found</div>
}
