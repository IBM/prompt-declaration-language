import { Progress, Stack } from "@patternfly/react-core"

export type InitProgress = { min: number; max: number; value: number }

type Props = {
  init: null | InitProgress
  download: number
  dopar: null | InitProgress[]
}

export default function ProgressUI({ init, download, dopar }: Props) {
  const hasInit = init && init.value < init.max
  const hasDownload = download >= 0 && download < 1

  const doparsToShow = dopar
    ? dopar.filter((dp) => dp && dp.value < dp.max)
    : []
  const hasDoPar = doparsToShow.length > 0

  return (
    (hasInit || hasDownload || hasDoPar) && (
      <Stack hasGutter>
        {init && hasInit && (
          <Progress {...init} title="Model Initialization" size="sm" />
        )}

        {hasDownload && (
          <Progress value={download} title="Model Download" size="sm" />
        )}

        {hasDoPar && (
          <Stack>
            {doparsToShow.map((progress, idx) => (
              <Progress key={idx} {...progress} size="sm" aria-label="dopar" />
            ))}
          </Stack>
        )}
      </Stack>
    )
  )
}
