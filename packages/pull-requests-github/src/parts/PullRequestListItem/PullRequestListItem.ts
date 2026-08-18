import type { PullRequestSummary } from '../PullRequestData/PullRequestData.ts'

export interface PullRequestLabel {
  readonly color: string
  readonly name: string
}

export interface PullRequestListItem extends PullRequestSummary {
  readonly author: string
  readonly comments: number
  readonly draft: boolean
  readonly labels: readonly PullRequestLabel[]
  readonly number: number
  readonly updatedAt: string
  readonly url: string
}
