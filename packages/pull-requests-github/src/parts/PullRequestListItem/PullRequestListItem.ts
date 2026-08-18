import type { PullRequestData } from '../PullRequestData/PullRequestData.ts'

export interface PullRequestListItem extends PullRequestData {
  readonly number: number
  readonly url: string
}
