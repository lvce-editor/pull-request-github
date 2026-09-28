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

export type PullRequestFileDiffStatus = 'error' | 'hidden' | 'loaded' | 'loading' | 'unavailable'

export interface PullRequestFileDiffState {
  readonly error?: string
  readonly patch?: string
  readonly status: PullRequestFileDiffStatus
}

export interface PullRequestViewSavedState {
  readonly filter?: PullRequestFilter
}

export interface PullRequestViewState {
  readonly actionError: string
  readonly actionMenuOpen: boolean
  readonly actionPending: boolean
  readonly closedCount: number | undefined
  readonly closedPullRequests: readonly PullRequestListItem[]
  readonly detailTab: PullRequestDetailTab
  readonly error: string
  readonly errorCode: string
  readonly fileDiffs: Readonly<Record<number, PullRequestFileDiffState>>
  readonly filter: PullRequestFilter
  readonly openCount: number | undefined
  readonly openPullRequests: readonly PullRequestListItem[]
  readonly page: number
  readonly pullRequest: PullRequestData | undefined
  readonly pullRequests: readonly PullRequestListItem[]
  readonly query: string
  readonly repository: GitHubRepository | undefined
  readonly screen: PullRequestScreen
  readonly selectedPullRequestNumbers: readonly number[]
  readonly status: PullRequestViewStatus
  readonly url: string
}

export const createDefaultState = (savedState: PullRequestViewSavedState | undefined): PullRequestViewState => {
  return {
    actionError: '',
    actionMenuOpen: false,
    actionPending: false,
    closedCount: undefined,
    closedPullRequests: [],
    detailTab: PullRequestDetailTabs.Overview,
    error: '',
    errorCode: '',
    fileDiffs: {},
    filter: savedState?.filter === Closed ? Closed : Open,
    openCount: undefined,
    openPullRequests: [],
    page: 1,
    pullRequest: undefined,
    pullRequests: [],
    query: '',
    repository: undefined,
    screen: List,
    selectedPullRequestNumbers: [],
    status: Loading,
    url: '',
  }
}
