import { Link } from "react-router"
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@patternfly/react-core"

export default function Upload() {
  return (
    <Card isLarge>
      <CardHeader>
        <CardTitle>Upload Trace</CardTitle>
      </CardHeader>
      <CardBody>
        You may upload a trace from your computer to visualize the program
        execution.
      </CardBody>
      <CardFooter>
        <Button isInline variant="link">
          <Link to="/upload">Choose Trace File</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
