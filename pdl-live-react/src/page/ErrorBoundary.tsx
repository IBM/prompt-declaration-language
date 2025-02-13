import { Component } from "react"
import {
  Button,
  Bullseye,
  Stack,
  StackItem,
  Content,
} from "@patternfly/react-core"

import errorImageUrl from "../assets/404.png"

type ErrorResponse = {
  message: string
}

function isErrorResponse(err: unknown): err is ErrorResponse {
  const error = err as ErrorResponse
  return typeof error.message === "string"
}

function message(error: unknown) {
  if (isErrorResponse(error)) {
    return error.message
  } else {
    return String(error)
  }
}

type Props = import("react").PropsWithChildren<unknown>
type State = { error: null | Error }

export default class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  public static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  private readonly goHome = () => {
    // TODO use react-router navigation
    window.location.href = "/"
  }

  public render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <Bullseye>
        <Stack hasGutter>
          <StackItem isFilled />
          <StackItem>
            <Bullseye>
              <img src={errorImageUrl} />
            </Bullseye>
          </StackItem>
          <StackItem>
            <Bullseye>
              <Stack>
                <Content component="h1" style={{ textAlign: "center" }}>
                  Internal Error
                </Content>
                <Content component="p">{message(this.state.error)}</Content>

                <Button onClick={this.goHome}>Go Home</Button>
              </Stack>
            </Bullseye>
          </StackItem>
          <StackItem isFilled />
        </Stack>
      </Bullseye>
    )
  }
}
