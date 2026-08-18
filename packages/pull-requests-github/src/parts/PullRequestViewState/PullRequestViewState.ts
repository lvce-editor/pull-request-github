import type { GitHubRepository } from '../GitHubRepository/GitHubRepository.ts'
import type { PullRequestData } from '../PullRequestData/PullRequestData.ts'
import type { PullRequestFilter } from '../PullRequestFilter/PullRequestFilter.ts'
import type { PullRequestListItem } from '../PullRequestListItem/PullRequestListItem.ts'
import * as PullRequestFilters from '../PullRequestFilter/PullRequestFilter.ts'

export const Error = 'error'
export const Loading = 'loading'
export const Ready = 'ready'
export const Unavailable = 'unavailable'

export type PullRequestViewStatus = typeof Error | typeof Loading | typeof Ready | typeof Unavailable

export const List = 'list'
export const Detail = 'detail'

export type PullRequestScreen = typeof Detail | typeof List

export interface PullRequestViewSavedState {
  readonly filter?: PullRequestFilter
}

export interface PullRequestViewState {
  readonly error: string
  readonly filter: PullRequestFilter
  readonly pullRequest: PullRequestData | undefined
  readonly pullRequests: readonly PullRequestListItem[]
  readonly repository: GitHubRepository | undefined
  readonly screen: PullRequestScreen
  readonly status: PullRequestViewStatus
  readonly url: string
}

export const createDefaultState = (savedState: PullRequestViewSavedState | undefined): PullRequestViewState => {
  return {
    error: '',
    filter: savedState?.filter === PullRequestFilters.Closed ? PullRequestFilters.Closed : PullRequestFilters.Open,
    pullRequest: undefined,
    pullRequests: [],
    repository: undefined,
    screen: List,
    status: Loading,
    url: '',
  }
}
