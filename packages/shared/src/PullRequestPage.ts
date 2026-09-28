import type { PullRequestListItem } from './PullRequestListItem.ts'

export const pullRequestPageSize = 30

export interface PullRequestPage {
  readonly items: readonly PullRequestListItem[]
  readonly total: number
}
