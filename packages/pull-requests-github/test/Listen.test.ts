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
      'PullRequestsGithub.create',
      'PullRequestsGithub.setCreationFixture',
      'PullRequestsGithub.getCreateRequests',
      'PullRequestsGithub.show',
      'PullRequestsGithub.refresh',
      'PullRequestsGithub.openOnGitHub',
      'PullRequestsGithub.setPullRequestData',
      'PullRequestsGithub.setPullRequestError',
      'PullRequestsGithub.setPullRequestListData',
      'PullRequestsGithub.setPullRequestListError',
      'PullRequestsGithub.setPullRequestListResponse',
      'PullRequestsGithub.setPullRequestResponse',
      'PullRequestsGithub.setPullRequestFileDiff',
      'PullRequestsGithub.clearPullRequestData',
      'PullRequestsGithub.focusNextCreateControl',
      'PullRequestsGithub.focusPreviousCreateControl',
    ])
    expect(getViewRegistrySnapshot()).toEqual({
      views: [
        {
          displayName: 'Pull Requests',
          eventListeners: [
            {
              name: 'handlePullRequestFocus',
              params: ['handlePullRequestFocus', 'event.currentTarget.name'],
            },
            {
              name: 'handlePullRequestBlur',
              params: ['handlePullRequestBlur', 'event.currentTarget.name'],
            },
            { name: 'handleCreateInput', params: ['handleCreateInput', 'event.currentTarget.name', 'event.currentTarget.value'] },
            {
              name: 'handlePullRequestClick',
              params: ['handlePullRequestClick', 'event.currentTarget.name'],
            },
            {
              name: 'handlePullRequestFilterInput',
              params: ['handlePullRequestFilterInput', 'event.currentTarget.value'],
            },
          ],
          icon: 'media/git-pull-request.svg',
          id: 'github.pullRequests',
          kind: 'virtualDom',
          name: undefined,
          preferredLocation: 'sideBar',
          stateful: true,
          title: 'Pull Requests',
        },
      ],
    })
  } finally {
    dispose()
  }
})
