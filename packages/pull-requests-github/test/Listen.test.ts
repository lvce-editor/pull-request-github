import { afterEach, beforeEach, expect, test } from '@jest/globals'
import { getViewRegistrySnapshot, resetViewRegistry } from '@lvce-editor/api'
import { mockWorkerGlobalRpc } from '@lvce-editor/rpc'
import { listen } from '../src/parts/Listen/Listen.ts'
import * as PullRequestCommands from '../src/parts/PullRequestCommands/PullRequestCommands.ts'
import { getMockPullRequest } from '../src/parts/PullRequestMockRegistry/PullRequestMockRegistry.ts'

beforeEach(() => {
  resetViewRegistry()
})

afterEach(() => {
  resetViewRegistry()
})

test('listen', async () => {
  const { dispose, start } = mockWorkerGlobalRpc()
  try {
    const listenPromise = listen()
    start()
    await expect(listenPromise).resolves.toBeUndefined()
    expect(PullRequestCommands.commandIds).toEqual([
      'PullRequestsGithub.setPullRequestData',
      'PullRequestsGithub.setPullRequestError',
      'PullRequestsGithub.clearPullRequestData',
    ])
    PullRequestCommands.setPullRequestData('https://github.com/owner/repo/pull/7', {
      baseBranch: 'main',
      description: 'description',
      headBranch: 'feature',
      title: 'Add feature',
    })
    expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toEqual({
      data: {
        baseBranch: 'main',
        description: 'description',
        headBranch: 'feature',
        title: 'Add feature',
      },
      type: 'data',
    })
    PullRequestCommands.setPullRequestError('https://github.com/owner/repo/pull/7', 'Not Found')
    expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toEqual({
      message: 'Not Found',
      type: 'error',
    })
    PullRequestCommands.clearPullRequestData()
    expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toBeUndefined()
    expect(getViewRegistrySnapshot()).toEqual({
      views: [
        {
          icon: 'symbol-github',
          id: 'github.pullRequests',
          kind: 'virtualDom',
          title: 'Pull Requests',
        },
      ],
    })
  } finally {
    dispose()
  }
})
