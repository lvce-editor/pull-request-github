import { afterEach, beforeEach, expect, test } from '@jest/globals'
import { getViewRegistrySnapshot, resetViewRegistry } from '@lvce-editor/api'
import { mockWorkerGlobalRpc } from '@lvce-editor/rpc'
import { listen } from '../src/parts/Listen/Listen.ts'
import * as PullRequestCommands from '../src/parts/PullRequestCommands/PullRequestCommands.ts'

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
      'PullRequestsGithub.show',
      'PullRequestsGithub.refresh',
      'PullRequestsGithub.openOnGitHub',
      'PullRequestsGithub.setPullRequestData',
      'PullRequestsGithub.setPullRequestError',
      'PullRequestsGithub.clearPullRequestData',
    ])
    expect(getViewRegistrySnapshot()).toEqual({
      views: [
        {
          displayName: 'Pull Requests',
          icon: 'media/git-pull-request.svg',
          id: 'github.pullRequests',
          kind: 'virtualDom',
          name: undefined,
          preferredLocation: 'sideBar',
          title: 'Pull Requests',
        },
      ],
    })
  } finally {
    dispose()
  }
})
