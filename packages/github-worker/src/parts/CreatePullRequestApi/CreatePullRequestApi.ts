export interface MockResponse {
  readonly body?: unknown
  readonly error?: string
  readonly status?: number
}
const mockState: { responses: readonly MockResponse[] | undefined; requests: { path: string; body: unknown }[] } = {
  requests: [],
  responses: undefined,
}
export const setCreateResponses = (values: readonly MockResponse[] | undefined): void => {
  mockState.responses = values
  mockState.requests = []
}
export const getCreateRequests = (): unknown => mockState.requests

export const request = async (token: string, path: string, body?: unknown, fetchFn: typeof fetch = fetch): Promise<any> => {
  if (!token) throw new Error('Sign in to LVCE with GitHub before creating a pull request.')
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
  } catch {
    throw new Error('Could not reach GitHub. Check the repository for an existing pull request before retrying.')
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
    throw new Error(message + hint)
  }
  if (!value || typeof value !== 'object') throw new Error('Invalid response from GitHub. Check the repository before retrying.')
  return value
}
