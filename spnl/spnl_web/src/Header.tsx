import { Button } from "@patternfly/react-core"

import ConsoleIcon from "@patternfly/react-icons/dist/esm/icons/terminal-icon"

type Props = {
  title: "Console"
}

export default function Header(props: Props) {
  return (
    <div className="pf-v6-c-code-editor__header">
      <div className="pf-v6-c-code-editor__header-content">
        <div className="pf-v6-c-code-editor__controls">
          <Button icon={<ConsoleIcon />} variant="plain" />
        </div>
        <div className="pf-v6-c-code-editor__header-main">{props.title}</div>
      </div>
    </div>
  )
}
