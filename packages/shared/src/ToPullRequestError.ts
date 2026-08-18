import type { ErrorCode } from './ErrorCode.ts'
import { PullRequestError } from './PullRequestError.ts'

export const toPullRequestError = (error: unknown, fallbackCode: ErrorCode): PullRequestError => {
  if (error instanceof PullRequestError) {
    return error
  }
  const message = error instanceof Error ? error.message : String(error)
  return new PullRequestError(message || 'An unknown error occurred.', fallbackCode)
}
