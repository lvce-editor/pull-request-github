import {
  Closed,
  Open,
  type GitHubRepository,
  type PullRequestData,
  type PullRequestFilter,
  type PullRequestListItem,
} from '@lvce-editor/pull-request-shared'
import type { PullRequestDetailTab } from '../PullRequestDetailTab/PullRequestDetailTab.ts'
import * as PullRequestDetailTabs from '../PullRequestDetailTab/PullRequestDetailTab.ts'

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
  readonly closedPullRequests: readonly PullRequestListItem[]
  readonly detailTab: PullRequestDetailTab
  readonly error: string
  readonly filter: PullRequestFilter
  readonly openPullRequests: readonly PullRequestListItem[]
  readonly pullRequest: PullRequestData | undefined
  readonly pullRequests: readonly PullRequestListItem[]
  readonly query: string
  readonly repository: GitHubRepository | undefined
  readonly screen: PullRequestScreen
  readonly status: PullRequestViewStatus
  readonly url: string
}

export const createDefaultState = (savedState: PullRequestViewSavedState | undefined): PullRequestViewState => {
  return {
    closedPullRequests: [],
    detailTab: PullRequestDetailTabs.Overview,
    error: '',
    filter: savedState?.filter === Closed ? Closed : Open,
    openPullRequests: [],
    pullRequest: undefined,
    pullRequests: [],
    query: '',
    repository: undefined,
    screen: List,
    status: Loading,
    url: '',
  }
}
