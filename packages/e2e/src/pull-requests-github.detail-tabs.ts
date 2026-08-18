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
      baseBranch: 'main',
      description: 'A deterministic overview for the pull request detail tabs.',
      headBranch: 'feature/detail-tabs',
      number: 482,
      title: 'Add pull request detail tabs',
      url,
    },
  ])
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
    ],
    description: 'A deterministic overview for the pull request detail tabs.',
    files: [
      {
        additions: 5,
        deletions: 1,
        filename: 'src/detailTabs.ts',
        patch: "@@ -1,2 +1,2 @@\n-export const tabs = []\n+export const tabs = ['overview', 'commits', 'changes']",
        status: 'modified',
      },
    ],
    headBranch: 'feature/detail-tabs',
    title: 'Add pull request detail tabs',
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
  const overview = Locator('.PullRequestDetails')
  await expect(tabs).toHaveCSS('display', 'grid')
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true')
  await expect(overview).toContainText('A deterministic overview for the pull request detail tabs.')

  await commitsTab.click()
  await Command.execute('Timeout.sleep', 200)
  const commitList = Locator('.PullRequestCommitList')
  await expect(commitsTab).toHaveAttribute('aria-selected', 'true')
  await expect(commitList).toHaveCSS('display', 'flex')
  await expect(commitList).toContainText('Add detail tab navigation')
  await expect(commitList).toContainText('a1b2c3d')

  await changesTab.click()
  await Command.execute('Timeout.sleep', 200)
  const changedFile = Locator('.PullRequestFile')
  const addition = Locator('.PullRequestDiffLineAddition')
  const deletion = Locator('.PullRequestDiffLineDeletion')
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
