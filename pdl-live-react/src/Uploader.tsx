import { useCallback, useMemo, useState } from "react"

import {
  FileUpload,
  type FileUploadProps,
  DropzoneErrorCode,
  FileUploadHelperText,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Icon,
} from "@patternfly/react-core"

import Page from "./Page"
import Viewer from "./Viewer"

export default function Uploader() {
  const [value, setValue] = useState("")
  const [filename, setFilename] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRejected, setIsRejected] = useState(false)
  const [message, setMessage] = useState(
    "Must be a JSON file no larger than 50 KB",
  )

  const handleFileInputChange = useCallback<
    Required<FileUploadProps>["onFileInputChange"]
  >((_event, file) => {
    setFilename(file.name)
  }, [])

  const handleTextChange = useCallback<
    Required<FileUploadProps>["onTextChange"]
  >(
    (_event, value) => {
      setValue(value)
    },
    [setValue],
  )

  const handleDataChange = useCallback<
    Required<FileUploadProps>["onDataChange"]
  >(
    (_event, value) => {
      setValue(value)
    },
    [setValue],
  )

  const reset = useCallback(() => {
    setValue("")
    setFilename("")
  }, [setValue])

  const handleClear = useCallback<Required<FileUploadProps>["onClearClick"]>(
    (_event) => {
      reset()
      setIsRejected(false)
    },
    [reset],
  )

  const handleFileRejected = useCallback(() => {
    reset()
    setIsRejected(true)
  }, [reset])

  const handleFileAccepted = useCallback(() => {
    setIsRejected(false)
  }, [])

  const handleFileReadStarted = useCallback(() => {
    setIsLoading(true)
  }, [])

  const handleFileReadFinished = useCallback(() => {
    setIsLoading(false)
  }, [])

  const dropzoneProps = useMemo<FileUploadProps["dropzoneProps"]>(
    () => ({
      accept: { "application/json": [".json"] },
      maxSize: 50 * 1024,
      onDropRejected: (rejections) => {
        const error = rejections[0].errors[0]
        if (error.code === DropzoneErrorCode.FileTooLarge) {
          setMessage("File is too big")
        } else if (error.code === DropzoneErrorCode.FileInvalidType) {
          setMessage("File is not a JSON file")
        }
        handleFileRejected()
      },
      onDropAccepted: handleFileAccepted,
    }),
    [handleFileAccepted, handleFileRejected],
  )

  return (
    <Page breadcrumb1="Uploader" breadcrumb2={filename}>
      <Form>
        <FormGroup fieldId="text-file-with-restrictions-example">
          <FileUpload
            id="text-file-with-restrictions-example"
            type="text"
            value={value}
            filename={filename}
            filenamePlaceholder="Drag and drop a file or upload one"
            hideDefaultPreview
            onFileInputChange={handleFileInputChange}
            onDataChange={handleDataChange}
            onTextChange={handleTextChange}
            onReadStarted={handleFileReadStarted}
            onReadFinished={handleFileReadFinished}
            onClearClick={handleClear}
            isLoading={isLoading}
            dropzoneProps={dropzoneProps}
            validated={isRejected ? "error" : "default"}
            browseButtonText="Upload"
            browseButtonAriaDescribedby="restricted-file-example-helpText"
          >
            {!value && (
              <FileUploadHelperText>
                <HelperText isLiveRegion>
                  <HelperTextItem
                    id="restricted-file-example-helpText"
                    variant={isRejected ? "error" : "default"}
                  >
                    {isRejected ? (
                      <>
                        <Icon status="danger" />
                        {message}
                      </>
                    ) : (
                      "Upload a JSON trace file"
                    )}
                  </HelperTextItem>
                </HelperText>
              </FileUploadHelperText>
            )}
          </FileUpload>
        </FormGroup>
      </Form>

      {value && <Viewer value={value} />}
    </Page>
  )
}
