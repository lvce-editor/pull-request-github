import { expect, test } from '@jest/globals'
import { getPullRequestVirtualDom } from '../src/parts/GetPullRequestVirtualDom/GetPullRequestVirtualDom.ts'
import * as PullRequestViewStatus from '../src/parts/PullRequestViewState/PullRequestViewState.ts'

test('getPullRequestVirtualDom renders empty state', () => {
  const dom = getPullRequestVirtualDom({
    error: '',
    pullRequest: undefined,
    status: PullRequestViewStatus.Empty,
    url: '',
  })

  expect(dom.some((node) => node.text === 'Enter a GitHub pull request URL.')).toBe(true)
})

test('getPullRequestVirtualDom renders success state', () => {
  const dom = getPullRequestVirtualDom({
    error: '',
    pullRequest: {
      baseBranch: 'main',
      description: 'description',
      headBranch: 'feature',
      title: 'Add feature',
    },
    status: PullRequestViewStatus.Ready,
    url: 'https://github.com/owner/repo/pull/1',
  })

  expect(dom.some((node) => node.text === 'Add feature')).toBe(true)
  expect(dom.some((node) => node.text === 'feature')).toBe(true)
  expect(dom.some((node) => node.text === 'main')).toBe(true)
  expect(dom.some((node) => node.text === 'description')).toBe(true)
})

test('getPullRequestVirtualDom renders error state', () => {
  const dom = getPullRequestVirtualDom({
    error: 'Not Found',
    pullRequest: undefined,
    status: PullRequestViewStatus.Error,
    url: 'https://github.com/owner/repo/pull/1',
  })

  expect(dom.some((node) => node.text === 'Not Found')).toBe(true)
})
