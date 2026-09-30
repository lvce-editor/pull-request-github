import { afterEach, expect, jest, test } from '@jest/globals'
import { fetchPullRequestPage, fetchPullRequests, toPullRequestListItem } from '../src/parts/GitHubPullRequestList/GitHubPullRequestList.ts'
import {
  clearPullRequestData,
  setPullRequestListData,
  setPullRequestListError,
  setPullRequestListResponse,
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
      comments: 12,
      draft: false,
      head: { ref: 'feature' },
      html_url: 'https://github.com/owner/repo/pull/42',
      is_archived: true,
      labels: [{ color: '1d76db', name: 'feature' }],
      node_id: 'PR_node_42',
      number: 42,
      title: 'Add feature',
      updated_at: '2026-08-18T10:00:00.000Z',
      user: { login: 'mira.k' },
    }),
  ).toEqual({
    author: 'mira.k',
    baseBranch: 'main',
    comments: 12,
    description: 'description',
    draft: false,
    headBranch: 'feature',
    isArchived: true,
    labels: [{ color: '1d76db', name: 'feature' }],
    nodeId: 'PR_node_42',
    number: 42,
    title: 'Add feature',
    updatedAt: '2026-08-18T10:00:00.000Z',
    url: 'https://github.com/owner/repo/pull/42',
  })
})

test('toPullRequestListItem normalizes a false archive state', () => {
  expect(toPullRequestListItem({ is_archived: false })).toMatchObject({ isArchived: false })
})

test('toPullRequestListItem defaults missing archive state to false', () => {
  expect(toPullRequestListItem({})).toMatchObject({ isArchived: false })
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
      author: 'mira.k',
      baseBranch: 'main',
      comments: 12,
      description: '',
      draft: false,
      headBranch: 'feature',
      labels: [],
      number: 42,
      title: 'Add feature',
      updatedAt: '',
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

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open', fetchFn)).rejects.toMatchObject({
    code: 'E_GITHUB_REQUEST_FAILED',
    message: 'Not Found',
  })
})

test('fetchPullRequests reports a network error with a code', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'))

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open', fetchFn)).rejects.toMatchObject({
    code: 'E_GITHUB_REQUEST_FAILED',
    message: 'Failed to fetch',
  })
})

test('fetchPullRequests reports a deterministic mock error', async () => {
  setPullRequestListError('owner', 'repo', 'open', 'Mock error')

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open')).rejects.toMatchObject({
    code: 'E_GITHUB_REQUEST_FAILED',
    message: 'Mock error',
  })
})

test('fetchPullRequests rejects an invalid GitHub response', async () => {
  const fetchFn = jest.fn<typeof fetch>().mockResolvedValue({
    json: async () => ({ items: [] }),
    ok: true,
    status: 200,
  } as unknown as Response)

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open', fetchFn)).rejects.toMatchObject({
    code: 'E_GITHUB_INVALID_LIST_DATA',
    message: 'GitHub returned an invalid pull request list.',
  })
})

test('fetchPullRequests validates a deterministic raw response', async () => {
  setPullRequestListResponse('owner', 'repo', 'open', { items: [] })

  await expect(fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open')).rejects.toMatchObject({
    code: 'E_GITHUB_INVALID_LIST_DATA',
    message: 'GitHub returned an invalid pull request list.',
  })
})

test('loads a bounded page with a count beyond 100 from the last-page link', async () => {
  const fetchFn = jest
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json([{ number: 61, title: 'Third page' }]))
    .mockResolvedValueOnce(
      Response.json([{ number: 1 }], {
        headers: { link: '<https://api.github.com/repositories/123/pulls?state=closed&per_page=1&page=243>; rel="last"' },
      }),
    )
  const result = await fetchPullRequestPage({ name: 'repo', owner: 'owner' }, 'closed', 3, fetchFn)
  expect(result.total).toBe(243)
  expect(result.items[0].number).toBe(61)
  expect(fetchFn.mock.calls.map((call: readonly unknown[]) => call[0])).toEqual([
    'https://api.github.com/repos/owner/repo/pulls?state=closed&per_page=30&page=3',
    'https://api.github.com/repos/owner/repo/pulls?state=closed&per_page=1&page=1',
  ])
})

test.each([0, 1])('counts %i pull requests without a link header', async (total) => {
  const fetchFn = jest.fn<typeof fetch>().mockImplementation(async () => Response.json(Array.from({ length: total }, () => ({ number: 1 }))))
  await expect(fetchPullRequestPage({ name: 'repo', owner: 'owner' }, 'open', 1, fetchFn)).resolves.toMatchObject({ total })
})

test.each([0, -1, 1.5, NaN])('rejects invalid page %s without fetching', async (page) => {
  const fetchFn = jest.fn<typeof fetch>()
  await expect(fetchPullRequestPage({ name: 'repo', owner: 'owner' }, 'open', page, fetchFn)).rejects.toThrow('Invalid pull request page')
  expect(fetchFn).not.toHaveBeenCalled()
})

test('paginates mock responses and reports their full count', async () => {
  setPullRequestListResponse(
    'owner',
    'repo',
    'open',
    Array.from({ length: 121 }, (_, index) => ({ number: index + 1 })),
  )
  const result = await fetchPullRequestPage({ name: 'repo', owner: 'owner' }, 'open', 5)
  expect(result.total).toBe(121)
  expect(result.items.map((item) => item.number)).toEqual([121])
})

test.each([
  { body: { message: 'Rate limit exceeded' }, message: 'Rate limit exceeded', status: 403 },
  { body: {}, message: 'invalid pull request list', status: 200 },
])(
  'reports API errors: $message',
  async ({ body, message, status }: { readonly body: unknown; readonly message: string; readonly status: number }) => {
    const fetchFn = jest.fn<typeof fetch>().mockImplementation(async () => Response.json(body, { status }))
    await expect(fetchPullRequestPage({ name: 'repo', owner: 'owner' }, 'open', 1, fetchFn)).rejects.toThrow(message)
  },
)

test('does not report a partial count when GitHub omits last despite a next page', async () => {
  const fetchFn = jest
    .fn<typeof fetch>()
    .mockImplementation(async () => new Response('[{}]', { headers: { link: '<https://api.github.com/pulls?page=2>; rel="next"' } }))
  await expect(fetchPullRequestPage({ name: 'repo', owner: 'owner' }, 'open', 1, fetchFn)).rejects.toThrow('invalid pull request count')
})
