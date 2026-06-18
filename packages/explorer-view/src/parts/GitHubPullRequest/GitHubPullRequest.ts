import { parsePullRequestUrl } from '../PullRequestUrl/PullRequestUrl.ts'

export interface PullRequestData {
  readonly baseBranch: string
  readonly description: string
  readonly headBranch: string
  readonly title: string
}

interface GitHubPullResponse {
  readonly base?: {
    readonly ref?: unknown
  }
  readonly body?: unknown
  readonly head?: {
    readonly ref?: unknown
  }
  readonly message?: unknown
  readonly title?: unknown
}

const assertString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  return ''
}

export const toPullRequestData = (response: GitHubPullResponse): PullRequestData => {
  return {
    baseBranch: assertString(response.base?.ref),
    description: assertString(response.body),
    headBranch: assertString(response.head?.ref),
    title: assertString(response.title),
  }
}

const getErrorMessage = (response: GitHubPullResponse, status: number): string => {
  if (typeof response.message === 'string' && response.message) {
    return response.message
  }
  return `GitHub request failed with status ${status}`
}

export const fetchPullRequest = async (url: string, fetchFn: typeof fetch = fetch): Promise<PullRequestData> => {
  const location = parsePullRequestUrl(url)
  const apiUrl = `https://api.github.com/repos/${location.owner}/${location.repo}/pulls/${location.number}`
  const response = await fetchFn(apiUrl, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  })
  const json = (await response.json()) as GitHubPullResponse
  if (!response.ok) {
    throw new Error(getErrorMessage(json, response.status))
  }
  return toPullRequestData(json)
}
