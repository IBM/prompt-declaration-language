import DataIcon from "@patternfly/react-icons/dist/esm/icons/table-icon"
import CodeIcon from "@patternfly/react-icons/dist/esm/icons/code-icon"
import ErrorIcon from "@patternfly/react-icons/dist/esm/icons/error-circle-o-icon"
import RobotIcon from "@patternfly/react-icons/dist/esm/icons/robot-icon"
import RepeatIcon from "@patternfly/react-icons/dist/esm/icons/redo-icon"
import KeyboardIcon from "@patternfly/react-icons/dist/esm/icons/keyboard-icon"
import ConditionalIcon from "@patternfly/react-icons/dist/esm/icons/share-alt-icon"

/** Icon to represent the given kind */
export default function IconForKind({ kind }: { kind?: string }) {
  switch (kind) {
    case "model":
      return <RobotIcon />
    case "code":
      return <CodeIcon />
    case "read":
      return <KeyboardIcon />
    case "for":
    case "repeat":
    case "repeat_until":
      return <RepeatIcon />
    case "if":
      return <ConditionalIcon />
    case "data":
      return <DataIcon />
    case "error":
      return <ErrorIcon />
    default:
      return undefined
  }
}
