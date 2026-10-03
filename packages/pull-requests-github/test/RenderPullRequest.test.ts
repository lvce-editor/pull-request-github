import { expect, test } from '@jest/globals'
import { text } from '@lvce-editor/virtual-dom-worker'
import { renderPullRequest } from '../src/parts/RenderPullRequest/RenderPullRequest.ts'

test('renderPullRequest renders a rich overview', () => {
  const dom = renderPullRequest(
    {
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
    },
    [text('Review a diff directly from the editor.')],
  )

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

test('renderPullRequest shows mixed check results in the overview', () => {
  const dom = renderPullRequest({
    baseBranch: 'main',
    checks: [
      { conclusion: 'failure', detailsUrl: 'https://github.com/owner/repo/actions/runs/1', name: 'Windows', status: 'completed' },
      ...['macOS', 'Linux ARM', 'Linux'].map((name) => ({
        conclusion: 'success',
        detailsUrl: 'https://github.com/owner/repo/actions/runs/2',
        name,
        status: 'completed',
      })),
    ],
    checksStatus: 'loaded',
    commits: [],
    description: '',
    files: [],
    headBranch: 'feature',
    title: 'Add feature',
  })

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ text: '1 failing, 3 successful' }),
      expect.objectContaining({ text: 'Windows' }),
      expect.objectContaining({ text: 'macOS' }),
      expect.objectContaining({ className: 'PullRequestCheck PullRequestCheck-failed', name: 'openPullRequestCheck:0' }),
      expect.objectContaining({ text: 'passed' }),
    ]),
  )
})

test('renderPullRequest distinguishes unavailable checks from an empty check list', () => {
  const unavailable = renderPullRequest({
    baseBranch: '',
    checksStatus: 'unavailable',
    commits: [],
    description: '',
    files: [],
    headBranch: '',
    title: '',
  })
  const empty = renderPullRequest({
    baseBranch: '',
    checks: [],
    checksStatus: 'loaded',
    commits: [],
    description: '',
    files: [],
    headBranch: '',
    title: '',
  })
  expect(unavailable).toContainEqual(expect.objectContaining({ text: 'Check status is unavailable' }))
  expect(empty).toContainEqual(expect.objectContaining({ text: 'No checks reported' }))
})
