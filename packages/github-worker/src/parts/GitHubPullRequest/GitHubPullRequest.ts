import {
  ErrorCodes,
  type PullRequestCommit,
  type PullRequestData,
  PullRequestError,
  type PullRequestFile,
  toPullRequestError,
} from '@lvce-editor/pull-request-shared'
import * as PullRequestMockRegistry from '../PullRequestMockRegistry/PullRequestMockRegistry.ts'
import { parsePullRequestUrl } from '../PullRequestUrl/PullRequestUrl.ts'

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

interface GitHubCommitResponse {
  readonly author?: {
    readonly login?: unknown
  } | null
  readonly commit?: {
    readonly author?: {
      readonly name?: unknown
    } | null
    readonly message?: unknown
  }
  readonly sha?: unknown
}

interface GitHubFileResponse {
  readonly additions?: unknown
  readonly deletions?: unknown
  readonly filename?: unknown
  readonly patch?: unknown
  readonly status?: unknown
}

const assertString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  return ''
}

const assertNumber = (value: unknown): number => {
  return typeof value === 'number' ? value : 0
}

export const toPullRequestCommit = (response: GitHubCommitResponse): PullRequestCommit => {
  return {
    author: assertString(response.author?.login) || assertString(response.commit?.author?.name) || 'Unknown author',
    message: assertString(response.commit?.message),
    sha: assertString(response.sha),
  }
}

export const toPullRequestFile = (response: GitHubFileResponse): PullRequestFile => {
  return {
    additions: assertNumber(response.additions),
    deletions: assertNumber(response.deletions),
    filename: assertString(response.filename),
    patch: assertString(response.patch),
    status: assertString(response.status),
  }
}

export const toPullRequestData = (
  response: GitHubPullResponse,
  commits: readonly PullRequestCommit[] = [],
  files: readonly PullRequestFile[] = [],
): PullRequestData => {
  return {
    baseBranch: assertString(response.base?.ref),
    commits,
    description: assertString(response.body),
    files,
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
  const mock = PullRequestMockRegistry.getMockPullRequest(url)
  if (mock?.type === 'data') {
    return mock.data
  }
  if (mock?.type === 'error') {
    throw new PullRequestError(mock.message, ErrorCodes.GitHubRequestFailed)
  }
  let pullRequestResponse: unknown
  let commitResponse: unknown
  let fileResponse: unknown
  if (mock?.type === 'response') {
    pullRequestResponse = mock.pullRequest
    commitResponse = mock.commits
    fileResponse = mock.files
  } else {
    try {
      const location = parsePullRequestUrl(url)
      const apiUrl = `https://api.github.com/repos/${location.owner}/${location.repo}/pulls/${location.number}`
      const fetchJson = async (requestUrl: string): Promise<unknown> => {
        const response = await fetchFn(requestUrl, {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        })
        const json = (await response.json()) as GitHubPullResponse
        if (!response.ok) {
          throw new PullRequestError(getErrorMessage(json, response.status), ErrorCodes.GitHubRequestFailed)
        }
        return json
      }
      const responses = await Promise.all([fetchJson(apiUrl), fetchJson(`${apiUrl}/commits?per_page=100`), fetchJson(`${apiUrl}/files?per_page=100`)])
      pullRequestResponse = responses[0]
      commitResponse = responses[1]
      fileResponse = responses[2]
    } catch (error) {
      throw toPullRequestError(error, ErrorCodes.GitHubRequestFailed)
    }
  }
  if (!Array.isArray(commitResponse)) {
    throw new PullRequestError('GitHub returned an invalid pull request commit list.', ErrorCodes.GitHubInvalidCommitData)
  }
  if (!Array.isArray(fileResponse)) {
    throw new PullRequestError('GitHub returned an invalid pull request file list.', ErrorCodes.GitHubInvalidFileData)
  }
  const commits = commitResponse.map(toPullRequestCommit)
  const files = fileResponse.map(toPullRequestFile)
  return toPullRequestData(pullRequestResponse as GitHubPullResponse, commits, files)
}
