export interface PullRequestCommit {
  readonly author: string
  readonly message: string
  readonly sha: string
}

export interface PullRequestFile {
  readonly additions: number
  readonly deletions: number
  readonly filename: string
  readonly patch: string
  readonly status: string
}

export interface PullRequestCheck {
  readonly conclusion: string | null
  readonly detailsUrl: string
  readonly name: string
  readonly status: string
}

export interface PullRequestSummary {
  readonly baseBranch: string
  readonly description: string
  readonly headBranch: string
  readonly title: string
}

export interface PullRequestData extends PullRequestSummary {
  readonly author?: string
  readonly checks?: readonly PullRequestCheck[]
  readonly checksStatus?: 'loaded' | 'unavailable'
  readonly comments?: number
  readonly commits: readonly PullRequestCommit[]
  readonly draft?: boolean
  readonly files: readonly PullRequestFile[]
  readonly labels?: readonly {
    readonly color: string
    readonly name: string
  }[]
  readonly number?: number
  readonly updatedAt?: string
}
