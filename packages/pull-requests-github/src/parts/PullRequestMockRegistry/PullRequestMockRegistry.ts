import type { PullRequestData } from '../GitHubPullRequest/GitHubPullRequest.ts'
import { parsePullRequestUrl } from '../PullRequestUrl/PullRequestUrl.ts'

export interface PullRequestMockData {
  readonly data: PullRequestData
  readonly type: 'data'
}

export interface PullRequestMockError {
  readonly message: string
  readonly type: 'error'
}

export type PullRequestMock = PullRequestMockData | PullRequestMockError

const mocks = new Map<string, PullRequestMock>()

export const getPullRequestApiUrl = (url: string): string => {
  const location = parsePullRequestUrl(url)
  return `https://api.github.com/repos/${location.owner}/${location.repo}/pulls/${location.number}`
}

export const setPullRequestData = (url: string, data: PullRequestData): void => {
  mocks.set(getPullRequestApiUrl(url), {
    data,
    type: 'data',
  })
}

export const setPullRequestError = (url: string, message: string): void => {
  mocks.set(getPullRequestApiUrl(url), {
    message,
    type: 'error',
  })
}

export const clearPullRequestData = (): void => {
  mocks.clear()
}

export const getMockPullRequest = (url: string): PullRequestMock | undefined => {
  return mocks.get(getPullRequestApiUrl(url))
}
