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

import demos from "../../../demos/demos"

export default function Demos() {
  return (
    <Card isLarge>
      <CardHeader>
        <CardTitle>View a Demo</CardTitle>
      </CardHeader>
      <CardBody>You may view one of the built-in PDL demos.</CardBody>
      <CardFooter>
        <Flex>
          {demos.map((demo) => (
            <Button key={demo.name} isInline variant="link">
              <Link to={"/demos/" + encodeURIComponent(demo.name)}>
                {demo.name}
              </Link>
            </Button>
          ))}
        </Flex>
      </CardFooter>
    </Card>
  )
}
