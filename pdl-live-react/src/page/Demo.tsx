import Page from "./Page"

type Props = {
  name: string
  value: string
}

export default function Demo({ name, value }: Props) {
  return <Page breadcrumb1="Demos" breadcrumb2={name} value={value} />
}
