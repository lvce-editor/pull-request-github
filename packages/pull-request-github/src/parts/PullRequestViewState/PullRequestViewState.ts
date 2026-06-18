import type { PullRequestData } from '../GitHubPullRequest/GitHubPullRequest.ts'

export const Empty = 'empty'
export const Error = 'error'
export const Loading = 'loading'
export const Ready = 'ready'

export type PullRequestViewStatus = typeof Empty | typeof Error | typeof Loading | typeof Ready

export interface PullRequestViewSavedState {
  readonly url?: string
}

export interface PullRequestViewState {
  readonly error: string
  readonly pullRequest: PullRequestData | undefined
  readonly status: PullRequestViewStatus
  readonly url: string
}

export const createDefaultState = (savedState: PullRequestViewSavedState | undefined): PullRequestViewState => {
  return {
    error: '',
    pullRequest: undefined,
    status: Empty,
    url: savedState?.url || '',
  }
}
