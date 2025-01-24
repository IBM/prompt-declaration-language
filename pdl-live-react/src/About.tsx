import { Content } from "@patternfly/react-core"
import Page from "./Page"

export default function Welcome() {
  return (
    <Page breadcrumb1="About PDL">
      <Content component="h1">Prompt Declaration Language (PDL)</Content>

      <Content component="p">
        PDL is a declarative language designed for developers to create
        reliable, composable LLM prompts and integrate them into software
        systems. It provides a structured way to specify prompt templates,
        enforce validation, and compose LLM calls with traditional rule-based
        systems.
      </Content>

      <Content component="h2">Key Features</Content>

      <Content component="ul">
        <Content component="li">
          LLM Integration: Compatible with any LLM, including IBM watsonx
        </Content>
        <Content component="li">Prompt Engineering:</Content>
        <Content component="li">
          Template system for single/multi-shot prompting
        </Content>
        <Content component="li">Composition of multiple LLM calls</Content>
        <Content component="li">
          Integration with tools (code execution & APIs)
        </Content>
        <Content component="li">Development Tools:</Content>
        <Content component="li">Type checking for model I/O</Content>
        <Content component="li">Python SDK</Content>
        <Content component="li">Chat API support</Content>
        <Content component="li">
          Live document visualization for debugging
        </Content>
        <Content component="li">
          Control Flow: Variables, conditionals, loops, and functions
        </Content>
        <Content component="li">
          I/O Operations: File/stdin reading, JSON parsing
        </Content>
        <Content component="li">
          API Integration: Native REST API support (Python)
        </Content>
      </Content>
    </Page>
  )
}
