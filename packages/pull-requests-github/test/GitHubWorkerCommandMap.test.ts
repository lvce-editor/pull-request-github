import { expect, test } from '@jest/globals'
import { commandMap } from '../src/parts/GitHubWorkerCommandMap/GitHubWorkerCommandMap.ts'

test('exposes github logic over rpc', () => {
  expect(Object.keys(commandMap)).toEqual([
    'GitHub.clearPullRequestData',
    'GitHub.fetchPullRequest',
    'GitHub.fetchPullRequests',
    'GitHub.setPullRequestData',
    'GitHub.setPullRequestError',
    'GitHub.setPullRequestListData',
    'GitHub.setPullRequestListError',
    'GitHub.setPullRequestListResponse',
    'GitHub.setPullRequestResponse',
    'GitHub.validatePullRequestUrl',
  ])
})
