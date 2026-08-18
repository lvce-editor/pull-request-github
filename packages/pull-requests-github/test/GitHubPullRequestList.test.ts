import { afterEach, expect, jest, test } from '@jest/globals'
import { fetchPullRequests, toPullRequestListItem } from '../src/parts/GitHubPullRequestList/GitHubPullRequestList.ts'
import {
  clearPullRequestData,
  setPullRequestListData,
  setPullRequestListError,
} from '../src/parts/PullRequestMockRegistry/PullRequestMockRegistry.ts'

afterEach(() => {
  clearPullRequestData()
  jest.restoreAllMocks()
})

test('toPullRequestListItem maps GitHub response data', () => {
  expect(
    toPullRequestListItem({
      base: { ref: 'main' },
      body: 'description',
      head: { ref: 'feature' },
      html_url: 'https://github.com/owner/repo/pull/42',
      number: 42,
      title: 'Add feature',
    }),
  ).toEqual({
    baseBranch: 'main',
    description: 'description',
    headBranch: 'feature',
    number: 42,
    title: 'Add feature',
    url: 'https://github.com/owner/repo/pull/42',
  })
})

test('fetchPullRequests requests the selected state', async () => {
  const json = jest.fn<() => Promise<any>>().mockResolvedValue([
    {
      base: { ref: 'main' },
      body: 'description',
      head: { ref: 'feature' },
      html_url: 'https://github.com/owner/repo/pull/42',
      number: 42,
      title: 'Add feature',
    },
  ])
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue({
    json,
    ok: true,
    status: 200,
  } as unknown as Response)

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'closed', fetchFn)).resolves.toHaveLength(1)
  expect(fetchFn).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo/pulls?state=closed&per_page=100', {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  })
})

test('fetchPullRequests returns deterministic mock data without fetching', async () => {
  const data = [
    {
      baseBranch: 'main',
      description: '',
      headBranch: 'feature',
      number: 42,
      title: 'Add feature',
      url: 'https://github.com/owner/repo/pull/42',
    },
  ]
  setPullRequestListData('owner', 'repo', 'open', data)
  const fetchFn = jest.fn<typeof fetch>()

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open', fetchFn)).resolves.toEqual(data)
  expect(fetchFn).not.toHaveBeenCalled()
})

test('fetchPullRequests reports a GitHub error', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue({
    json: async () => ({ message: 'Not Found' }),
    ok: false,
    status: 404,
  } as unknown as Response)

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open', fetchFn)).rejects.toThrow('Not Found')
})

test('fetchPullRequests reports a deterministic mock error', async () => {
  setPullRequestListError('owner', 'repo', 'open', 'Mock error')

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open')).rejects.toThrow('Mock error')
})

test('fetchPullRequests rejects an invalid GitHub response', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue({
    json: async () => ({ items: [] }),
    ok: true,
    status: 200,
  } as unknown as Response)

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open', fetchFn)).rejects.toThrow('GitHub returned an invalid pull request list.')
})
