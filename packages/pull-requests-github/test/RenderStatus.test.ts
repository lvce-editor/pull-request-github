import { expect, test } from '@jest/globals'
import { mergeClassNames } from '@lvce-editor/virtual-dom-worker'
import * as PullRequestViewStatus from '../src/parts/PullRequestViewState/PullRequestViewState.ts'
import { renderStatus } from '../src/parts/RenderStatus/RenderStatus.ts'

test('renderStatus renders loading state', () => {
  const dom = renderStatus({
    error: '',
    pullRequest: undefined,
    status: PullRequestViewStatus.Loading,
    url: 'https://github.com/owner/repo/pull/1',
  })

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        className: 'PullRequestMessage',
      }),
      expect.objectContaining({
        text: 'Loading pull request...',
      }),
    ]),
  )
})

test('renderStatus renders error state', () => {
  const className = mergeClassNames('PullRequestMessage', 'PullRequestMessageError')
  const dom = renderStatus({
    error: 'Not Found',
    pullRequest: undefined,
    status: PullRequestViewStatus.Error,
    url: 'https://github.com/owner/repo/pull/1',
  })

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        className,
      }),
      expect.objectContaining({
        text: 'Not Found',
      }),
    ]),
  )
})

test('renderStatus renders ready state', () => {
  const dom = renderStatus({
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

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        className: 'PullRequestDetails',
      }),
      expect.objectContaining({
        text: 'Add feature',
      }),
    ]),
  )
})

test('renderStatus renders empty state', () => {
  const dom = renderStatus({
    error: '',
    pullRequest: undefined,
    status: PullRequestViewStatus.Empty,
    url: '',
  })

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        className: 'PullRequestMessage',
      }),
      expect.objectContaining({
        text: 'Enter a GitHub pull request URL.',
      }),
    ]),
  )
})
