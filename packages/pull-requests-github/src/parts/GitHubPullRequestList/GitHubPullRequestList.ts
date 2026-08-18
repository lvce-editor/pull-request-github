import type { GitHubRepository } from '../GitHubRepository/GitHubRepository.ts'
import type { PullRequestFilter } from '../PullRequestFilter/PullRequestFilter.ts'
import type { PullRequestListItem } from '../PullRequestListItem/PullRequestListItem.ts'
import * as PullRequestMockRegistry from '../PullRequestMockRegistry/PullRequestMockRegistry.ts'

interface GitHubPullRequestListResponse {
  readonly base?: {
    readonly ref?: unknown
  }
  readonly body?: unknown
  readonly comments?: unknown
  readonly draft?: unknown
  readonly head?: {
    readonly ref?: unknown
  }
  readonly html_url?: unknown
  readonly labels?: unknown
  readonly message?: unknown
  readonly number?: unknown
  readonly title?: unknown
  readonly updated_at?: unknown
  readonly user?: {
    readonly login?: unknown
  }
}

const assertString = (value: unknown): string => {
  return typeof value === 'string' ? value : ''
}

const toLabels = (value: unknown): PullRequestListItem['labels'] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((label) => {
    if (!label || typeof label !== 'object' || !('name' in label) || typeof label.name !== 'string' || !label.name) {
      return []
    }
    return [
      {
        color: 'color' in label && typeof label.color === 'string' ? label.color : '',
        name: label.name,
      },
    ]
  })
}

export const toPullRequestListItem = (response: GitHubPullRequestListResponse): PullRequestListItem => {
  return {
    author: assertString(response.user?.login),
    baseBranch: assertString(response.base?.ref),
    comments: typeof response.comments === 'number' ? response.comments : 0,
    description: assertString(response.body),
    draft: response.draft === true,
    headBranch: assertString(response.head?.ref),
    labels: toLabels(response.labels),
    number: typeof response.number === 'number' ? response.number : 0,
    title: assertString(response.title),
    updatedAt: assertString(response.updated_at),
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
  let json: unknown
  if (mock?.type === 'listResponse') {
    json = mock.data
  } else {
    const apiUrl = `https://api.github.com/repos/${repository.owner}/${repository.name}/pulls?state=${state}&per_page=100`
    const response = await fetchFn(apiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })
    json = await response.json()
    if (!response.ok) {
      throw new Error(getErrorMessage(json as GitHubPullRequestListResponse, response.status))
    }
  }
  if (!Array.isArray(json)) {
    throw new TypeError('GitHub returned an invalid pull request list.')
  }
  return json.map(toPullRequestListItem)
}
