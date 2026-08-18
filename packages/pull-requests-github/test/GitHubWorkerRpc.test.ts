import type { Rpc } from '@lvce-editor/rpc'
import { expect, jest, test } from '@jest/globals'
import { create } from '../src/parts/GitHubWorkerRpc/GitHubWorkerRpc.ts'

test('forwards github operations to the worker', async () => {
  const data = {
    baseBranch: 'main',
    commits: [],
    description: 'description',
    files: [],
    headBranch: 'feature',
    title: 'Add feature',
  }
  const listData = [
    {
      ...data,
      author: 'mira.k',
      comments: 12,
      draft: false,
      labels: [{ color: '1d76db', name: 'feature' }],
      number: 7,
      updatedAt: '2026-08-18T10:00:00.000Z',
      url: 'https://github.com/owner/repo/pull/7',
    },
  ]
  const invoke = jest.fn<Rpc['invoke']>().mockImplementation(async (method: string) => {
    if (method === 'GitHub.fetchPullRequest') {
      return data
    }
    if (method === 'GitHub.fetchPullRequests') {
      return listData
    }
    return undefined
  })
  const githubWorker = create(async () => ({ invoke }))

  await expect(githubWorker.fetchPullRequest('https://github.com/owner/repo/pull/7')).resolves.toEqual(data)
  await expect(githubWorker.fetchPullRequests({ name: 'repo', owner: 'owner' }, 'open')).resolves.toEqual(listData)
  await githubWorker.validatePullRequestUrl('https://github.com/owner/repo/pull/7')
  await githubWorker.setPullRequestData('https://github.com/owner/repo/pull/7', data)
  await githubWorker.setPullRequestError('https://github.com/owner/repo/pull/7', 'Not Found')
  await githubWorker.setPullRequestListData('owner', 'repo', 'open', listData)
  await githubWorker.setPullRequestListError('owner', 'repo', 'closed', 'Not Found')
  await githubWorker.setPullRequestListResponse('owner', 'repo', 'open', { items: [] })
  await githubWorker.setPullRequestResponse('https://github.com/owner/repo/pull/7', {}, [], [])
  await githubWorker.clearPullRequestData()

  expect(invoke.mock.calls).toEqual([
    ['GitHub.fetchPullRequest', 'https://github.com/owner/repo/pull/7'],
    ['GitHub.fetchPullRequests', { name: 'repo', owner: 'owner' }, 'open'],
    ['GitHub.validatePullRequestUrl', 'https://github.com/owner/repo/pull/7'],
    ['GitHub.setPullRequestData', 'https://github.com/owner/repo/pull/7', data],
    ['GitHub.setPullRequestError', 'https://github.com/owner/repo/pull/7', 'Not Found'],
    ['GitHub.setPullRequestListData', 'owner', 'repo', 'open', listData],
    ['GitHub.setPullRequestListError', 'owner', 'repo', 'closed', 'Not Found'],
    ['GitHub.setPullRequestListResponse', 'owner', 'repo', 'open', { items: [] }],
    ['GitHub.setPullRequestResponse', 'https://github.com/owner/repo/pull/7', {}, [], []],
    ['GitHub.clearPullRequestData'],
  ])
})
