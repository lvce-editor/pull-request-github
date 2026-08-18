import type { ErrorCode } from './ErrorCode.ts'

export class PullRequestError extends Error {
  readonly code: ErrorCode

  constructor(message: string, code: ErrorCode) {
    super(message)
    this.code = code
    this.name = 'PullRequestError'
  }
}
