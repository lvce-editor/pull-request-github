import type { GitHubRepository } from '../GitHubRepository/GitHubRepository.ts'
import type { PullRequestFilter } from '../PullRequestFilter/PullRequestFilter.ts'
import type { PullRequestListItem } from '../PullRequestListItem/PullRequestListItem.ts'
import * as PullRequestMockRegistry from '../PullRequestMockRegistry/PullRequestMockRegistry.ts'

interface GitHubPullRequestListResponse {
  readonly base?: {
    readonly ref?: unknown
  }
  readonly body?: unknown
  readonly head?: {
    readonly ref?: unknown
  }
  readonly html_url?: unknown
  readonly message?: unknown
  readonly number?: unknown
  readonly title?: unknown
}

const assertString = (value: unknown): string => {
  return typeof value === 'string' ? value : ''
}

export const toPullRequestListItem = (response: GitHubPullRequestListResponse): PullRequestListItem => {
  return {
    baseBranch: assertString(response.base?.ref),
    description: assertString(response.body),
    headBranch: assertString(response.head?.ref),
    number: typeof response.number === 'number' ? response.number : 0,
    title: assertString(response.title),
    url: assertString(response.html_url),
  }
}

const getErrorMessage = (response: GitHubPullRequestListResponse, status: number): string => {
  if (typeof response.message === 'string' && response.message) {
    return response.message
  }
  return `GitHub request failed with status ${status}`
}

export const fetchPullRequests = async (
  repository: GitHubRepository,
  state: PullRequestFilter,
  fetchFn: typeof fetch = fetch,
): Promise<readonly PullRequestListItem[]> => {
  const mock = PullRequestMockRegistry.getMockPullRequestList(repository.owner, repository.name, state)
  if (mock?.type === 'listData') {
    return mock.data
  }
  if (mock?.type === 'error') {
    throw new Error(mock.message)
  }
  const apiUrl = `https://api.github.com/repos/${repository.owner}/${repository.name}/pulls?state=${state}&per_page=100`
  const response = await fetchFn(apiUrl, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  })
  const json = (await response.json()) as GitHubPullRequestListResponse[] | GitHubPullRequestListResponse
  if (!response.ok) {
    throw new Error(getErrorMessage(json as GitHubPullRequestListResponse, response.status))
  }
  if (!Array.isArray(json)) {
    throw new TypeError('GitHub returned an invalid pull request list.')
  }
  return json.map(toPullRequestListItem)
}
