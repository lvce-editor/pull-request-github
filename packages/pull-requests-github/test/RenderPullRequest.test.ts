import { expect, test } from '@jest/globals'
import { renderPullRequest } from '../src/parts/RenderPullRequest/RenderPullRequest.ts'

test('renderPullRequest renders a rich overview', () => {
  const dom = renderPullRequest({
    author: 'mira.k',
    baseBranch: 'main',
    comments: 12,
    commits: [],
    description: 'Review a diff directly from the editor.',
    files: [],
    headBranch: 'feat/inline-review-comments',
    labels: [
      { color: '1d76db', name: 'feature' },
      { color: 'd4a72c', name: 'needs-review' },
    ],
    title: 'Add inline review comments',
  })

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        childCount: 2,
        className: 'PullRequestOverview',
      }),
      expect.objectContaining({
        text: 'mira.k opened this pull request',
      }),
      expect.objectContaining({
        text: 'Review a diff directly from the editor.',
      }),
      expect.objectContaining({
        text: 'feat/inline-review-comments',
      }),
      expect.objectContaining({
        text: 'main',
      }),
      expect.objectContaining({
        text: 'feature',
      }),
      expect.objectContaining({
        text: 'needs-review',
      }),
      expect.objectContaining({
        text: '12 comments',
      }),
    ]),
  )
})

test('renderPullRequest renders overview fallbacks', () => {
  const dom = renderPullRequest({
    baseBranch: '',
    commits: [],
    description: '',
    files: [],
    headBranch: '',
    title: '',
  })

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        text: 'A contributor opened this pull request',
      }),
      expect.objectContaining({
        text: 'No description',
      }),
      expect.objectContaining({
        text: '0 comments',
      }),
    ]),
  )
})
