import { afterEach, beforeEach, expect, test } from '@jest/globals'
import {
  getCommandRegistrySnapshot,
  getViewRegistrySnapshot,
  resetCommandRegistry,
  resetViewRegistry,
} from '@lvce-editor/api'
import { mockWorkerGlobalRpc } from '@lvce-editor/rpc'
import { listen } from '../src/parts/Listen/Listen.ts'

beforeEach(() => {
  resetCommandRegistry()
  resetViewRegistry()
})

afterEach(() => {
  resetCommandRegistry()
  resetViewRegistry()
})

test('listen', async () => {
  const { dispose, start } = mockWorkerGlobalRpc()
  const listenPromise = listen()
  start()
  await expect(listenPromise).resolves.toBeUndefined()
  expect(getCommandRegistrySnapshot()).toEqual({
    commands: [
      {
        id: 'PullRequestsGithub.setPullRequestData',
      },
      {
        id: 'PullRequestsGithub.setPullRequestError',
      },
      {
        id: 'PullRequestsGithub.clearPullRequestData',
      },
    ],
  })
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
  dispose()
})
