import Page from "./Page"

type Props = {
  name: string
  value: string
}

export default function MyTrace({ name, value }: Props) {
  return <Page breadcrumb1="My Traces" breadcrumb2={name} value={value} />
}
