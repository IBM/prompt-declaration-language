import prettyMs from "pretty-ms"
import { useMemo } from "react"
import { Link, useLocation } from "react-router"

import {
  Table,
  Caption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table"

import Result from "../transcript/Result"
import BreadcrumbBarForBlock from "../breadcrumbs/BreadcrumbBarForBlock"

import { hasResult } from "../../helpers"

import extractVariables from "./model"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

export default function Variables({ block }: Props) {
  const { hash } = useLocation()
  const vars = useMemo(() => extractVariables(block), [block])

  return (
    <Table variant="compact" isStriped>
      <Caption>This table shows the variable definitions and uses</Caption>

      <Thead>
        <Tr>
          <Th modifier="fitContent">Start Time</Th>
          <Th modifier="fitContent">Location</Th>
          {/*<Th modifier="fitContent">Name</Th>*/}
          <Th modifier="fitContent">Where was this value defined?</Th>
          <Th modifier="wrap">Value</Th>
        </Tr>
      </Thead>

      <Tbody>
        {vars.map(
          ({ incrNanos, block, name, value, defsite, defsiteId }, idx) => (
            <Tr
              key={
                idx +
                "." +
                block.id +
                ".use." +
                name +
                "." +
                defsite?.id +
                "." +
                idx
              }
            >
              <Td>
                {idx === 0 ? (
                  new Date((block.start_nanos || 0) / 1000000).toLocaleString()
                ) : incrNanos === 0 ? (
                  <>&mdash;</>
                ) : (
                  "+" + prettyMs(incrNanos / 1000000)
                )}
              </Td>
              <Td>
                <BreadcrumbBarForBlock block={block} />
              </Td>
              {/*<Td>{name}</Td>*/}
              <Td>
                {defsite ? (
                  <BreadcrumbBarForBlock block={defsite} />
                ) : defsiteId ? (
                  <>
                    This is a use of a literal value defined{" "}
                    <Link
                      to={`?detail&type=block&id=${encodeURIComponent(defsiteId.replace(/\.\d+$/, ""))}${hash}`}
                    >
                      here
                    </Link>
                    .
                  </>
                ) : (
                  "This is a new definition"
                )}
              </Td>
              <Td>
                <Result
                  result={hasResult(value) ? value.result : value}
                  term=""
                />
              </Td>
            </Tr>
          ),
        )}
      </Tbody>
    </Table>
  )
}
