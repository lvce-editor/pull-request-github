/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.detail-tabs'

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
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/482'
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      author: 'mira.k',
      baseBranch: 'main',
      comments: 12,
      description: 'Adds a comment gutter to the diff editor so reviewers can leave inline comments without leaving the editor.',
      draft: false,
      headBranch: 'feat/inline-review-comments',
      labels: [
        { color: '1d76db', name: 'feature' },
        { color: 'd4a72c', name: 'needs-review' },
      ],
      number: 482,
      title: 'Add inline review comments to the diff editor',
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'main',
    commits: [
      {
        author: 'mira-k',
        message: 'Add detail tab navigation',
        sha: 'a1b2c3d4e5f67890',
      },
      {
        author: 'mira-k',
        message: 'Render changed files',
        sha: 'b2c3d4e5f67890a1',
      },
      {
        author: 'mira-k',
        message: 'Polish inline comment markers',
        sha: 'c3d4e5f67890a1b2',
      },
    ],
    description: 'Adds a comment gutter to the diff editor so reviewers can leave inline comments without leaving the editor.',
    files: [
      {
        additions: 5,
        deletions: 1,
        filename: 'src/detailTabs.ts',
        patch: "@@ -1,2 +1,2 @@\n-export const tabs = []\n+export const tabs = ['overview', 'commits', 'changes']",
        status: 'modified',
      },
      {
        additions: 4,
        deletions: 0,
        filename: 'src/inlineComments.ts',
        patch: '@@ -0,0 +1 @@\n+export const inlineComments = true',
        status: 'added',
      },
      {
        additions: 2,
        deletions: 1,
        filename: 'src/comments.css',
        patch: '@@ -1 +1 @@\n-old\n+new',
        status: 'modified',
      },
    ],
    headBranch: 'feat/inline-review-comments',
    title: 'Add inline review comments to the diff editor',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const pullRequest = Locator('button[name="openPullRequest:482"]')
  await expect(pullRequest).toBeVisible()
  await pullRequest.click()
  await Command.execute('Timeout.sleep', 200)

  const tabs = Locator('.PullRequestDetailTabs')
  const overviewTab = Locator('button[name="showPullRequestOverview"]')
  const commitsTab = Locator('button[name="showPullRequestCommits"]')
  const changesTab = Locator('button[name="showPullRequestChanges"]')
  const overview = Locator('.PullRequestOverview')
  const title = Locator('.PullRequestDetailTitle')
  const stateBadge = Locator('.PullRequestStateBadge')
  const overviewIcon = overviewTab.locator('.PullRequestOverviewIcon')
  await expect(tabs).toHaveCSS('display', 'flex')
  await expect(title).toContainText('Add inline review comments to the diff editor #482')
  await expect(stateBadge).toContainText('Open')
  await expect(overviewIcon).toHaveCount(1)
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true')
  await expect(overview).toHaveCSS('display', 'grid')
  await expect(overview).toContainText('mira.k opened this pull request')
  await expect(overview).toContainText('Adds a comment gutter to the diff editor')
  await expect(overview).toContainText('feature')
  await expect(overview).toContainText('needs-review')
  await expect(overview).toContainText('12 comments')

  await commitsTab.click()
  await Command.execute('Timeout.sleep', 200)
  const commitList = Locator('.PullRequestCommitList')
  await expect(commitsTab).toHaveAttribute('aria-selected', 'true')
  await expect(commitList).toHaveCSS('display', 'flex')
  await expect(commitList).toContainText('Add detail tab navigation')
  await expect(commitList).toContainText('a1b2c3d')

  await changesTab.click()
  await Command.execute('Timeout.sleep', 200)
  const changedFile = Locator('.PullRequestFile').first()
  const addition = changedFile.locator('.PullRequestDiffLineAddition')
  const deletion = changedFile.locator('.PullRequestDiffLineDeletion')
  await expect(changesTab).toHaveAttribute('aria-selected', 'true')
  await expect(changedFile).toContainText('src/detailTabs.ts')
  await expect(changedFile).toContainText('+5')
  await expect(changedFile).toContainText('−1')
  await expect(addition).toHaveCSS('display', 'block')
  await expect(addition).toContainText("+export const tabs = ['overview', 'commits', 'changes']")
  await expect(deletion).toContainText('-export const tabs = []')

  await overviewTab.click()
  await Command.execute('Timeout.sleep', 200)
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true')
  await expect(overview).toBeVisible()
}
