import type { PullRequestSummary } from '../PullRequestData/PullRequestData.ts'

export interface PullRequestListItem extends PullRequestSummary {
  readonly number: number
  readonly url: string
}
