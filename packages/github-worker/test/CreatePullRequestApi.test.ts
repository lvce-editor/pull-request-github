import { afterEach, expect, jest, test } from '@jest/globals'
import { PullRequestError } from '@lvce-editor/pull-request-shared'
import { getCreateRequests, request, setCreateResponses } from '../src/parts/CreatePullRequestApi/CreatePullRequestApi.ts'
afterEach(() => setCreateResponses(undefined))
test('uses bearer authentication and fixed backend origin', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue(Response.json({ number: 1 }))
  await request('secret', '', { title: 'Title' }, fetchFn)
  expect(fetchFn).toHaveBeenCalledWith(
    'https://lvce-editor.dev/github/pull-requests',
    expect.objectContaining({
      body: '{"title":"Title"}',
      headers: { Authorization: 'Bearer secret', 'Content-Type': 'application/json' },
      method: 'POST',
      redirect: 'error',
    }),
  )
})
test('missing token never invokes fetch', async () => {
  const fetchFn = jest.fn<typeof fetch>()
  await expect(request('', '', {}, fetchFn)).rejects.toThrow('Sign in')
  expect(fetchFn).not.toHaveBeenCalled()
})
test.each([401, 403, 404, 409, 422, 429, 500, 502])('reports HTTP %s', async (status) => {
  setCreateResponses([{ body: { error: `Failure ${status}` }, status }])
  const promise = request('mock', '', {})
  await expect(promise).rejects.toThrow(`Failure ${status}`)
  await expect(promise).rejects.toHaveProperty('code', 'E_GITHUB_REQUEST_FAILED')
  expect(getCreateRequests()).toEqual([{ body: {}, path: '' }])
})
test('network errors instruct user to check for an existing PR', async () => {
  setCreateResponses([{ error: 'offline' }])
  const promise = request('mock', '', {})
  await expect(promise).rejects.toThrow('existing pull request')
  await expect(promise).rejects.toHaveProperty('code', 'E_GITHUB_REQUEST_FAILED')
})
test('non-json server failure remains actionable', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue(new Response('Bad Gateway', { status: 502 }))
  const promise = request('mock', '', {}, fetchFn)
  await expect(promise).rejects.toThrow('GitHub request failed (502).')
  await expect(promise).rejects.toHaveProperty('code', 'E_GITHUB_REQUEST_FAILED')
})
test('invalid successful JSON is rejected', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue(new Response('invalid'))
  const promise = request('mock', '/repository', undefined, fetchFn)
  await expect(promise).rejects.toThrow('Invalid response from GitHub. Check the repository before retrying.')
  await expect(promise).rejects.toHaveProperty('code', 'E_UNKNOWN')
})

test('missing token has an unknown error code', async () => {
  const promise = request('', '', {})
  await expect(promise).rejects.toBeInstanceOf(PullRequestError)
  await expect(promise).rejects.toHaveProperty('code', 'E_UNKNOWN')
})
