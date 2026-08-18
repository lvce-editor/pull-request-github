import type { PullRequestData } from '../PullRequestData/PullRequestData.ts'
import type { PullRequestFilter } from '../PullRequestFilter/PullRequestFilter.ts'
import type { PullRequestListItem } from '../PullRequestListItem/PullRequestListItem.ts'
import { parsePullRequestUrl } from '../PullRequestUrl/PullRequestUrl.ts'

export interface PullRequestMockData {
  readonly data: PullRequestData
  readonly type: 'data'
}

export interface PullRequestMockError {
  readonly message: string
  readonly type: 'error'
}

export interface PullRequestMockResponse {
  readonly commits: unknown
  readonly files: unknown
  readonly pullRequest: unknown
  readonly type: 'response'
}

export interface PullRequestListMockData {
  readonly data: readonly PullRequestListItem[]
  readonly type: 'listData'
}

export interface PullRequestListMockResponse {
  readonly data: unknown
  readonly type: 'listResponse'
}

export type PullRequestMock =
  PullRequestListMockData | PullRequestListMockResponse | PullRequestMockData | PullRequestMockError | PullRequestMockResponse

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

export const setPullRequestResponse = (url: string, pullRequest: unknown, commits: unknown, files: unknown): void => {
  mocks.set(getPullRequestApiUrl(url), {
    commits,
    files,
    pullRequest,
    type: 'response',
  })
}

const getPullRequestListApiUrl = (owner: string, repo: string, state: PullRequestFilter): string => {
  return `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`
}

export const setPullRequestListData = (owner: string, repo: string, state: PullRequestFilter, data: readonly PullRequestListItem[]): void => {
  mocks.set(getPullRequestListApiUrl(owner, repo, state), {
    data,
    type: 'listData',
  })
}

export const setPullRequestListError = (owner: string, repo: string, state: PullRequestFilter, message: string): void => {
  mocks.set(getPullRequestListApiUrl(owner, repo, state), {
    message,
    type: 'error',
  })
}

export const setPullRequestListResponse = (owner: string, repo: string, state: PullRequestFilter, data: unknown): void => {
  mocks.set(getPullRequestListApiUrl(owner, repo, state), {
    data,
    type: 'listResponse',
  })
}

export const clearPullRequestData = (): void => {
  mocks.clear()
}

export const getMockPullRequest = (url: string): PullRequestMock | undefined => {
  return mocks.get(getPullRequestApiUrl(url))
}

export const getMockPullRequestList = (owner: string, repo: string, state: PullRequestFilter): PullRequestMock | undefined => {
  return mocks.get(getPullRequestListApiUrl(owner, repo, state))
}
