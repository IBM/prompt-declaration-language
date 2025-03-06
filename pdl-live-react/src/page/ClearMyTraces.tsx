import { useCallback } from "react"
import { useNavigate } from "react-router"
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@patternfly/react-core"

import { getMyTraces, clear } from "./MyTraces"

export default function ClearMyTraces() {
  const navigate = useNavigate()
  const navigateHome = useCallback(() => navigate("/"), [navigate])
  const clearThenNavigateHome = useCallback(() => {
    clear()
    navigate("/")
  }, [navigate])
  const myTraces = getMyTraces()

  return (
    <Modal
      variant="small"
      title="Confirm: Clear My Traces"
      isOpen
      onClose={navigateHome}
      aria-labelledby="clear-modal-title"
      aria-describedby="modal-box-body-clear"
    >
      <ModalHeader title="Confirm Trace Removal" labelId="clear-modal-title" />
      <ModalBody id="modal-box-body-clear">
        Are you sure you wish to remove all stored traces? You currently have{" "}
        {myTraces.length}.
      </ModalBody>
      <ModalFooter>
        <Button key="confirm" variant="primary" onClick={clearThenNavigateHome}>
          Confirm
        </Button>
        <Button key="cancel" variant="link" onClick={navigateHome}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}
