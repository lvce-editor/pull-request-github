import { afterEach, expect, test } from '@jest/globals'
import { fetchPullRequest, toPullRequestData } from '../src/parts/GitHubPullRequest/GitHubPullRequest.ts'
import { clearPullRequestData, setPullRequestData, setPullRequestError } from '../src/parts/PullRequestMockRegistry/PullRequestMockRegistry.ts'

afterEach(() => {
  clearPullRequestData()
})

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
  const fetchFn: typeof fetch = async (...args: readonly unknown[]): Promise<Response> => {
    const [url, options] = args as readonly [URL | RequestInfo, Readonly<RequestInit> | undefined]
    let requestUrl: string
    if (typeof url === 'string') {
      requestUrl = url
    } else if (url instanceof URL) {
      requestUrl = url.href
    } else {
      requestUrl = url.url
    }
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

test('fetchPullRequest returns mock data without fetching', async () => {
  const data = {
    baseBranch: 'main',
    description: 'description',
    headBranch: 'feature',
    title: 'Add feature',
  }
  const calls: unknown[] = []
  const fetchFn = async (): Promise<Response> => {
    calls.push('fetch')
    throw new Error('unexpected fetch')
  }
  setPullRequestData('https://github.com/owner/repo/pull/7', data)

  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7', fetchFn)).resolves.toEqual(data)
  expect(calls).toEqual([])
})

test('fetchPullRequest throws mock error without fetching', async () => {
  const calls: unknown[] = []
  const fetchFn = async (): Promise<Response> => {
    calls.push('fetch')
    throw new Error('unexpected fetch')
  }
  setPullRequestError('https://github.com/owner/repo/pull/7', 'Not Found')

  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7', fetchFn)).rejects.toThrow('Not Found')
  expect(calls).toEqual([])
})
