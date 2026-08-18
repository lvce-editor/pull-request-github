import { afterEach, expect, jest, test } from '@jest/globals'
import { fetchPullRequest, toPullRequestCommit, toPullRequestData, toPullRequestFile } from '../src/parts/GitHubPullRequest/GitHubPullRequest.ts'
import {
  clearPullRequestData,
  setPullRequestData,
  setPullRequestError,
  setPullRequestResponse,
} from '../src/parts/PullRequestMockRegistry/PullRequestMockRegistry.ts'

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
    commits: [],
    description: 'description',
    files: [],
    headBranch: 'feature',
    title: 'Add feature',
  })
})

test('toPullRequestCommit maps github response', () => {
  expect(
    toPullRequestCommit({
      author: { login: 'test-user' },
      commit: {
        author: { name: 'Test User' },
        message: 'Add detail tabs',
      },
      sha: '1234567890abcdef',
    }),
  ).toEqual({
    author: 'test-user',
    message: 'Add detail tabs',
    sha: '1234567890abcdef',
  })
})

test('toPullRequestFile maps github response', () => {
  expect(
    toPullRequestFile({
      additions: 8,
      deletions: 3,
      filename: 'src/detail.ts',
      patch: '@@ -1 +1 @@',
      status: 'modified',
    }),
  ).toEqual({
    additions: 8,
    deletions: 3,
    filename: 'src/detail.ts',
    patch: '@@ -1 +1 @@',
    status: 'modified',
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
    let json: unknown
    if (requestUrl.endsWith('/commits?per_page=100')) {
      json = [
        {
          author: { login: 'test-user' },
          commit: { message: 'Add feature' },
          sha: '1234567890abcdef',
        },
      ]
    } else if (requestUrl.endsWith('/files?per_page=100')) {
      json = [
        {
          additions: 2,
          deletions: 1,
          filename: 'src/feature.ts',
          patch: '@@ -1 +1 @@',
          status: 'modified',
        },
      ]
    } else {
      json = {
        base: {
          ref: 'main',
        },
        body: 'description',
        head: {
          ref: 'feature',
        },
        title: 'Add feature',
      }
    }
    return {
      json: async () => json,
      ok: true,
      status: 200,
    } as Response
  }

  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7', fetchFn)).resolves.toEqual({
    baseBranch: 'main',
    commits: [
      {
        author: 'test-user',
        message: 'Add feature',
        sha: '1234567890abcdef',
      },
    ],
    description: 'description',
    files: [
      {
        additions: 2,
        deletions: 1,
        filename: 'src/feature.ts',
        patch: '@@ -1 +1 @@',
        status: 'modified',
      },
    ],
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
    [
      'https://api.github.com/repos/owner/repo/pulls/7/commits?per_page=100',
      {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      },
    ],
    [
      'https://api.github.com/repos/owner/repo/pulls/7/files?per_page=100',
      {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      },
    ],
  ])
})

test('fetchPullRequest reports github error message', async () => {
  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7', createNotFoundFetch)).rejects.toMatchObject({
    code: 'E_GITHUB_REQUEST_FAILED',
    message: 'Not Found',
  })
})

test('fetchPullRequest reports a network error with a code', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'))

  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7', fetchFn)).rejects.toMatchObject({
    code: 'E_GITHUB_REQUEST_FAILED',
    message: 'Failed to fetch',
  })
})

test('fetchPullRequest returns mock data without fetching', async () => {
  const data = {
    baseBranch: 'main',
    commits: [],
    description: 'description',
    files: [],
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

  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7', fetchFn)).rejects.toMatchObject({
    code: 'E_GITHUB_REQUEST_FAILED',
    message: 'Not Found',
  })
  expect(calls).toEqual([])
})

test('fetchPullRequest validates deterministic raw commit data', async () => {
  setPullRequestResponse('https://github.com/owner/repo/pull/7', {}, { commits: [] }, [])

  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7')).rejects.toMatchObject({
    code: 'E_GITHUB_INVALID_COMMIT_DATA',
    message: 'GitHub returned an invalid pull request commit list.',
  })
})

test('fetchPullRequest validates deterministic raw file data', async () => {
  setPullRequestResponse('https://github.com/owner/repo/pull/7', {}, [], { files: [] })

  await expect(fetchPullRequest('https://github.com/owner/repo/pull/7')).rejects.toMatchObject({
    code: 'E_GITHUB_INVALID_FILE_DATA',
    message: 'GitHub returned an invalid pull request file list.',
  })
})
