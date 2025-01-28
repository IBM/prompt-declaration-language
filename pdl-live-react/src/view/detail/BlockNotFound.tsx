import type Model from "../timeline/model"

export default function BlockNotFound(props: { id: string; model: Model }) {
  console.error(
    "Block not found",
    props.id,
    props.model.map((b) => b.id),
  )
  return <div>Block not found</div>
}
