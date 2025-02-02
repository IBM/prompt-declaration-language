import { Button, Content, Flex } from "@patternfly/react-core"

import ExternalLinkSquareAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon"

export default function Links() {
  return (
    <Content component="p">
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
      </Flex>
    </Content>
  )
}
