import { Pagination, type PaginationProps } from "@patternfly/react-core"

export type Props = Pick<
  Required<PaginationProps>,
  "itemCount" | "perPage" | "page"
> & {
  setPage(n: number): void
  setPerPage(n: number): void
}

export default function ToolbarPaginator({
  itemCount,
  perPage,
  page,
  setPage,
  setPerPage,
}: Props) {
  const onPerPageSelect = (
    _event:
      | import("react").MouseEvent
      | import("react").KeyboardEvent
      | MouseEvent,
    newPerPage: number,
    newPage: number,
  ) => {
    setPerPage(newPerPage)
    setPage(newPage)
  }

  const onSetPage = (
    _event:
      | import("react").MouseEvent
      | import("react").KeyboardEvent
      | MouseEvent,
    newPage: number,
  ) => {
    setPage(newPage)
  }

  return (
    itemCount > 1 && (
      <Pagination
        itemCount={itemCount}
        perPage={perPage}
        page={page}
        onSetPage={onSetPage}
        widgetId="masonry-paginator"
        onPerPageSelect={onPerPageSelect}
        ouiaId="PaginationTop"
      />
    )
  )
}
