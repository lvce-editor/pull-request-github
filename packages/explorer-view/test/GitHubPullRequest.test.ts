import { expect, test } from '@jest/globals'
import { fetchPullRequest, toPullRequestData } from '../src/parts/GitHubPullRequest/GitHubPullRequest.ts'

const createNotFoundFetch = async (): Promise<Response> => {
  return {
    json: async () => ({
      message: 'Not Found',
    }),
    ok: false,
    status: 404,
  } as Response
}

test('toPullRequestData maps github response', () => {
  expect(
    toPullRequestData({
      base: {
        ref: 'main',
      },
      body: 'description',
      head: {
        ref: 'feature',
      },
      title: 'Add feature',
    }),
  ).toEqual({
    baseBranch: 'main',
    description: 'description',
    headBranch: 'feature',
    title: 'Add feature',
  })
})

test('fetchPullRequest fetches public github pull request', async () => {
  const calls: unknown[] = []
  const fetchFn = async (url: URL | RequestInfo, options?: RequestInit): Promise<Response> => {
    const requestUrl = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url
    calls.push([requestUrl, options])
    return {
      json: async () => ({
        base: {
          ref: 'main',
        },
        body: 'description',
        head: {
          ref: 'feature',
        },
        title: 'Add feature',
      }),
      ok: true,
      status: 200,
    } as Response
  }

  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7', fetchFn)).resolves.toEqual({
    baseBranch: 'main',
    description: 'description',
    headBranch: 'feature',
    title: 'Add feature',
  })
  expect(calls).toEqual([
    [
      'https://api.github.com/repos/owner/repo/pulls/7',
      {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      },
    ],
  ])
})

test('fetchPullRequest reports github error message', async () => {
  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7', createNotFoundFetch)).rejects.toThrow('Not Found')
})
