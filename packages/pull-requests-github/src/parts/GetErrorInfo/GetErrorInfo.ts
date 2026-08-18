import { ErrorCodes } from '@lvce-editor/pull-request-shared'

export interface ErrorInfo {
  readonly code: string
  readonly message: string
}

const getErrorCode = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code) {
    return error.code
  }
  return ErrorCodes.Unknown
}

const getErrorMessage = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error)
  return message || 'An unknown error occurred.'
}

export const getErrorInfo = (error: unknown): ErrorInfo => {
  return {
    code: getErrorCode(error),
    message: getErrorMessage(error),
  }
}
