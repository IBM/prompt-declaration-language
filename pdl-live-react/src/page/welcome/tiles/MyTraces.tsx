import { Link } from "react-router"
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Flex,
} from "@patternfly/react-core"

import { getMyTraces } from "../../MyTraces"

export default function MyTraces() {
  const myTraces = getMyTraces()

  return (
    myTraces.length > 0 && (
      <Card isLarge>
        <CardHeader>
          <CardTitle>My Traces</CardTitle>
        </CardHeader>
        <CardBody>
          You may view one of your previously uploaded traces.
        </CardBody>
        <CardFooter>
          <Flex>
            {myTraces.map(({ title, filename }) => (
              <Button key={filename} isInline variant="link">
                <Link to={"/my/" + encodeURIComponent(title)}>{title}</Link>
              </Button>
            ))}
          </Flex>
        </CardFooter>
      </Card>
    )
  )
}
