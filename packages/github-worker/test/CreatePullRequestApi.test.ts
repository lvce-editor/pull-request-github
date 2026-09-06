import { afterEach, expect, jest, test } from '@jest/globals'
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
  await expect(request('mock', '', {})).rejects.toThrow(`Failure ${status}`)
  expect(getCreateRequests()).toEqual([{ body: {}, path: '' }])
})
test('network errors instruct user to check for an existing PR', async () => {
  setCreateResponses([{ error: 'offline' }])
  await expect(request('mock', '', {})).rejects.toThrow('existing pull request')
})
test('non-json server failure remains actionable', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue(new Response('Bad Gateway', { status: 502 }))
  await expect(request('mock', '', {}, fetchFn)).rejects.toThrow('502')
})
test('invalid successful JSON is rejected', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue(new Response('invalid'))
  await expect(request('mock', '/repository', undefined, fetchFn)).rejects.toThrow('Invalid response')
})
