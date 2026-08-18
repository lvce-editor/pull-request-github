import type { Rpc } from '@lvce-editor/rpc'
import { expect, jest, test } from '@jest/globals'
import { create } from '../src/parts/GitHubWorkerRpc/GitHubWorkerRpc.ts'

test('forwards github operations to the worker', async () => {
  const data = {
    baseBranch: 'main',
    description: 'description',
    headBranch: 'feature',
    title: 'Add feature',
  }
  const invoke = jest.fn<Rpc['invoke']>().mockImplementation(async (method: string) => {
    if (method === 'GitHub.fetchPullRequest') {
      return data
    }
    return undefined
  })
  const githubWorker = create(async () => ({ invoke }))

  await expect(githubWorker.fetchPullRequest('https://github.com/owner/repo/pull/7')).resolves.toEqual(data)
  await githubWorker.validatePullRequestUrl('https://github.com/owner/repo/pull/7')
  await githubWorker.setPullRequestData('https://github.com/owner/repo/pull/7', data)
  await githubWorker.setPullRequestError('https://github.com/owner/repo/pull/7', 'Not Found')
  await githubWorker.clearPullRequestData()

  expect(invoke.mock.calls).toEqual([
    ['GitHub.fetchPullRequest', 'https://github.com/owner/repo/pull/7'],
    ['GitHub.validatePullRequestUrl', 'https://github.com/owner/repo/pull/7'],
    ['GitHub.setPullRequestData', 'https://github.com/owner/repo/pull/7', data],
    ['GitHub.setPullRequestError', 'https://github.com/owner/repo/pull/7', 'Not Found'],
    ['GitHub.clearPullRequestData'],
  ])
})
