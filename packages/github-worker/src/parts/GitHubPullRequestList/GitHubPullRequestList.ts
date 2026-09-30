import {
  ErrorCodes,
  pullRequestPageSize,
  type PullRequestPage,
  type GitHubRepository,
  PullRequestError,
  type PullRequestFilter,
  type PullRequestListItem,
  toPullRequestError,
} from '@lvce-editor/pull-request-shared'
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
  readonly is_archived?: unknown
  readonly labels?: unknown
  readonly message?: unknown
  readonly node_id?: unknown
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
    isArchived: response.is_archived === true,
    labels: toLabels(response.labels),
    nodeId: assertString(response.node_id),
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
    throw new PullRequestError(mock.message, ErrorCodes.GitHubRequestFailed)
  }
  let json: unknown
  if (mock?.type === 'listResponse') {
    json = mock.data
  } else {
    try {
      const apiUrl = `https://api.github.com/repos/${repository.owner}/${repository.name}/pulls?state=${state}&per_page=100`
      const response = await fetchFn(apiUrl, {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      })
      json = await response.json()
      if (!response.ok) {
        throw new PullRequestError(getErrorMessage(json as GitHubPullRequestListResponse, response.status), ErrorCodes.GitHubRequestFailed)
      }
    } catch (error) {
      throw toPullRequestError(error, ErrorCodes.GitHubRequestFailed)
    }
  }
  if (!Array.isArray(json)) {
    throw new PullRequestError('GitHub returned an invalid pull request list.', ErrorCodes.GitHubInvalidListData)
  }
  return json.map(toPullRequestListItem)
}

const getTotal = (link: string, itemCount: number): number => {
  const last = link.split(',').find((part) => part.includes('rel="last"'))
  const lastUrl = last?.slice(last.indexOf('<') + 1, last.indexOf('>'))
  let total = itemCount
  if (last) {
    if (!lastUrl || !URL.canParse(lastUrl)) {
      throw new PullRequestError('GitHub returned an invalid pull request count.', ErrorCodes.GitHubInvalidListData)
    }
    total = Number(new URL(lastUrl).searchParams.get('page'))
  }
  if (!Number.isSafeInteger(total) || total < 0 || (!last && link.includes('rel="next"'))) {
    throw new PullRequestError('GitHub returned an invalid pull request count.', ErrorCodes.GitHubInvalidListData)
  }
  return total
}

// With one item per page, GitHub's last page number is the exact total.
// This avoids both downloading every PR and the search API's result cap.
export const fetchPullRequestPage = async (
  repository: GitHubRepository,
  state: PullRequestFilter,
  page: number,
  fetchFn: typeof fetch = fetch,
): Promise<PullRequestPage> => {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new PullRequestError('Invalid pull request page.', ErrorCodes.GitHubInvalidListData)
  }
  const mock = PullRequestMockRegistry.getMockPullRequestList(repository.owner, repository.name, state)
  if (mock) {
    const items = await fetchPullRequests(repository, state, fetchFn)
    return { items: items.slice((page - 1) * pullRequestPageSize, page * pullRequestPageSize), total: items.length }
  }
  try {
    const baseUrl = `https://api.github.com/repos/${repository.owner}/${repository.name}/pulls?state=${state}`
    const request = async (query: string): Promise<{ items: readonly GitHubPullRequestListResponse[]; link: string }> => {
      const response = await fetchFn(`${baseUrl}&${query}`, { headers: { Accept: 'application/vnd.github+json' } })
      const json: unknown = await response.json()
      if (!response.ok) {
        throw new PullRequestError(getErrorMessage(json as GitHubPullRequestListResponse, response.status), ErrorCodes.GitHubRequestFailed)
      }
      if (!Array.isArray(json)) {
        throw new PullRequestError('GitHub returned an invalid pull request list.', ErrorCodes.GitHubInvalidListData)
      }
      return { items: json, link: response.headers.get('link') || '' }
    }
    const [result, count] = await Promise.all([request(`per_page=${pullRequestPageSize}&page=${page}`), request('per_page=1&page=1')])
    const total = getTotal(count.link, count.items.length)
    return { items: result.items.map(toPullRequestListItem), total }
  } catch (error) {
    throw toPullRequestError(error, ErrorCodes.GitHubRequestFailed)
  }
}
