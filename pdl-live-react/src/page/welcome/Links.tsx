import { Link } from "react-router"
import { Button, Flex } from "@patternfly/react-core"

import ExternalLinkSquareAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon"

export default function Links() {
  return (
    <Flex>
      <Button
        variant="link"
        icon={<ExternalLinkSquareAltIcon />}
        iconPosition="end"
      >
        <a
          target="_blank"
          href="https://ibm.github.io/prompt-declaration-language"
        >
          Home Page
        </a>
      </Button>
      <Button
        variant="link"
        icon={<ExternalLinkSquareAltIcon />}
        iconPosition="end"
      >
        <a
          target="_blank"
          href="https://github.com/IBM/prompt-declaration-language"
        >
          GitHub
        </a>
      </Button>
      <Button variant="link" isInline>
        <Link to="/run">Run</Link>
      </Button>
    </Flex>
  )
}
