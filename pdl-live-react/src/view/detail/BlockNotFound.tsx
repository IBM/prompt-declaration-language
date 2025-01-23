import type Model from "../timeline/model"

export default function BlockNotFound({
  id,
  model,
}: {
  id: string
  model: Model
}) {
  return (
    <>
      <div>
        Block not found{" "}
        <strong>
          <pre>{id}</pre>
        </strong>
      </div>
      <div className="pdl-wrap">
        <code>{model.map((_) => _.id).join(", ")}</code>
      </div>
    </>
  )
}
