import { Button, Flex, Stack, StackItem } from "@patternfly/react-core"
import { Link, useLocation, useSearchParams } from "react-router"

import Tile from "../Tile"
import demos from "../../../demos/demos"

import DemoIcon from "@patternfly/react-icons/dist/esm/icons/file-code-icon"

export default function Demos() {
  const { hash } = useLocation()
  const [searchParams] = useSearchParams()
  const s = searchParams.toString()

  const body = (
    <Stack hasGutter>
      You may view one of the built-in PDL demos.
      <StackItem>
        <Flex>
          {demos.map((demo) => (
            <Button key={demo.name} isInline variant="link">
              <Link
                to={
                  "/demos/" +
                  encodeURIComponent(demo.name) +
                  (s ? `?${s}` : "") +
                  hash
                }
              >
                {demo.name}
              </Link>
            </Button>
          ))}
        </Flex>
      </StackItem>
    </Stack>
  )

  return <Tile title="View a Demo" icon={<DemoIcon />} body={body} />
}
