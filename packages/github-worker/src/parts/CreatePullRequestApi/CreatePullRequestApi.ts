import { ErrorCodes, PullRequestError } from '@lvce-editor/pull-request-shared'

export interface MockResponse {
  readonly body?: unknown
  readonly error?: string
  readonly status?: number
}
const mockState: { responses: readonly MockResponse[] | undefined; requests: { path: string; body: unknown }[] } = {
  requests: [],
  responses: undefined,
}
const mutationInputTypes = {
  archive: 'ArchivePullRequestInput',
  close: 'ClosePullRequestInput',
  unarchive: 'UnarchivePullRequestInput',
} as const
export const setCreateResponses = (values: readonly MockResponse[] | undefined): void => {
  mockState.responses = values
  mockState.requests = []
}
export const getCreateRequests = (): unknown => mockState.requests
export const mutatePullRequest = async (
  token: string,
  action: 'archive' | 'close' | 'unarchive',
  pullRequestId: string,
  fetchFn: typeof fetch = fetch,
): Promise<void> => {
  if (!token) throw new PullRequestError('Sign in to GitHub before changing a pull request.', ErrorCodes.Unknown)
  const { responses } = mockState
  if (responses) {
    const path = `/pull-requests/${pullRequestId}/${action}`
    mockState.requests.push({ body: { pullRequestId }, path })
    const mock = responses[0]
    mockState.responses = responses.slice(1)
    if (!mock) throw new Error('No mock response configured')
    if (mock.error) throw new PullRequestError(mock.error, ErrorCodes.GitHubRequestFailed)
    if ((mock.status ?? 200) >= 400) {
      const { body } = mock
      const errorMessage =
        body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' ? body.error : `GitHub request failed (${mock.status}).`
      throw new PullRequestError(errorMessage, ErrorCodes.GitHubRequestFailed)
    }
    return
  }
  const mutation = {
    archive: 'archivePullRequest',
    close: 'closePullRequest',
    unarchive: 'unarchivePullRequest',
  }[action]
  const inputType = mutationInputTypes[action]
  const response = await fetchFn('https://api.github.com/graphql', {
    body: JSON.stringify({
      query: `mutation($input: ${inputType}!) { ${mutation}(input: $input) { pullRequest { id } } }`,
      variables: { input: { pullRequestId } },
    }),
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    method: 'POST',
    signal: AbortSignal.timeout(70_000),
  })
  const value = await parseResponse(response)
  if (value.errors?.length)
    throw new PullRequestError(value.errors[0]?.message || 'GitHub could not update the pull request.', ErrorCodes.GitHubRequestFailed)
}

export const request = async (token: string, path: string, body?: unknown, fetchFn: typeof fetch = fetch): Promise<any> => {
  if (!token) throw new PullRequestError('Sign in to LVCE with GitHub before creating a pull request.', ErrorCodes.Unknown)
  let response: Response
  try {
    const { requests, responses } = mockState
    if (responses) {
      requests.push({ body, path })
      const mock = responses[0]
      mockState.responses = responses.slice(1)
      if (!mock) throw new Error('No mock response configured')
      if (mock.error) throw new Error(mock.error)
      response = Response.json(mock.body ?? {}, { status: mock.status ?? 200 })
    } else {
      response = await fetchFn(`https://lvce-editor.dev/github/pull-requests${path}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        method: body === undefined ? 'GET' : 'POST',
        ...(body !== undefined && { body: JSON.stringify(body) }),
        redirect: 'error',
        signal: AbortSignal.timeout(70_000),
      })
    }
  } catch (error) {
    if (error instanceof PullRequestError) {
      throw error
    }
    throw new PullRequestError(
      'Could not reach GitHub. Check the repository for an existing pull request before retrying.',
      ErrorCodes.GitHubRequestFailed,
    )
  }
  return parseResponse(response)
}

const parseResponse = async (response: Response): Promise<any> => {
  let value
  try {
    value = await response.json()
  } catch {
    value = null
  }
  if (!response.ok) {
    const hint = response.status === 401 || response.status === 403 ? ' Sign in with GitHub again and check repository permissions.' : ''
    const message = typeof value?.error === 'string' ? value.error : `GitHub request failed (${response.status}).`
    throw new PullRequestError(message + hint, ErrorCodes.GitHubRequestFailed)
  }
  if (!value || typeof value !== 'object') {
    throw new PullRequestError('Invalid response from GitHub. Check the repository before retrying.', ErrorCodes.Unknown)
  }
  return value
}
