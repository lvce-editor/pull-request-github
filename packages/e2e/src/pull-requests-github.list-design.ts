import type { Test } from '@lvce-editor/test-with-playwright'

// cspell:ignore priya

export const name = 'pull-requests-github.list-design'

const hoursAgo = (hours: number): string => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(
    `${tmpDir}/.git/config`,
    `[remote "origin"]
  url = https://github.com/lvce-editor/pull-request-github.git
`,
  )
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      author: 'mira.k',
      baseBranch: 'main',
      comments: 12,
      description: 'Review a diff directly from the editor.',
      draft: false,
      headBranch: 'feat/inline-review-comments',
      labels: [
        { color: '1d76db', name: 'feature' },
        { color: 'd4a72c', name: 'needs-review' },
      ],
      number: 482,
      title: 'Add inline review comments to the diff editor',
      updatedAt: hoursAgo(2),
      url: 'https://github.com/lvce-editor/pull-request-github/pull/482',
    },
    {
      author: 'dan.w',
      baseBranch: 'main',
      comments: 4,
      description: 'Keep pull requests available while offline.',
      draft: false,
      headBranch: 'perf/pr-cache',
      labels: [{ color: '0e8a16', name: 'performance' }],
      number: 479,
      title: 'Cache PR list responses for offline browsing',
      updatedAt: hoursAgo(5),
      url: 'https://github.com/lvce-editor/pull-request-github/pull/479',
    },
    {
      author: 'priya.s',
      baseBranch: 'main',
      comments: 2,
      description: 'Explore a split diff layout.',
      draft: true,
      headBranch: 'feat/split-diff',
      labels: [{ color: '1d76db', name: 'ui' }],
      number: 471,
      title: 'Split diff view with word-level highlighting',
      updatedAt: hoursAgo(24),
      url: 'https://github.com/lvce-editor/pull-request-github/pull/471',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [
    {
      author: 'alex.r',
      baseBranch: 'main',
      comments: 6,
      description: 'Improve keyboard navigation.',
      draft: false,
      headBranch: 'fix/list-keyboard-navigation',
      labels: [{ color: 'd73a4a', name: 'bug' }],
      number: 468,
      title: 'Fix pull request list keyboard navigation',
      updatedAt: hoursAgo(48),
      url: 'https://github.com/lvce-editor/pull-request-github/pull/468',
    },
    {
      author: 'lee.n',
      baseBranch: 'main',
      comments: 1,
      description: 'Document the extension setup.',
      draft: false,
      headBranch: 'docs/setup',
      labels: [{ color: '5319e7', name: 'documentation' }],
      number: 463,
      title: 'Document pull request extension setup',
      updatedAt: hoursAgo(72),
      url: 'https://github.com/lvce-editor/pull-request-github/pull/463',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const openTab = Locator('button[name="showOpenPullRequests"]')
  const closedTab = Locator('button[name="showClosedPullRequests"]')
  const commentCounts = Locator('.PullRequestListItemComments')
  const draftIcons = Locator('.PullRequestStateDraft')
  const items = Locator('.PullRequestListItem')
  const needsReviewLabel = Locator('.PullRequestLabelWarn')
  const titles = Locator('.PullRequestListItemTitle')
  const secondTitle = titles.nth(1)
  await expect(openTab.locator('.PullRequestTabCount')).toContainText('3')
  await expect(closedTab.locator('.PullRequestTabCount')).toContainText('2')
  await expect(items).toHaveCount(3)
  await expect(draftIcons).toHaveCount(1)
  await expect(needsReviewLabel).toContainText('needs-review')
  await expect(commentCounts.first()).toContainText('12')
  await expect(secondTitle).toContainText('Cache PR list responses for offline browsing')
}
