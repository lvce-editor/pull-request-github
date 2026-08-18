/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

// cspell:ignore priya

export const name = 'pull-requests-github.navigation'

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
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [
    {
      author: 'priya.s',
      baseBranch: 'main',
      comments: 2,
      description: 'A completed pull request.',
      draft: false,
      headBranch: 'feature/completed',
      labels: [{ color: '1d76db', name: 'ui' }],
      number: 122,
      title: 'Completed pull request',
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://github.com/lvce-editor/pull-request-github/pull/122',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', 'https://github.com/lvce-editor/pull-request-github/pull/122', {
    baseBranch: 'main',
    commits: [],
    description: 'A completed pull request.',
    files: [],
    headBranch: 'feature/completed',
    title: 'Completed pull request',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  await Locator('button[name="showClosedPullRequests"]').click()
  await Command.execute('Timeout.sleep', 200)
  const closedPullRequestTitle = Locator('.PullRequestListItemTitle')
  await expect(closedPullRequestTitle).toContainText('Completed pull request')

  await Locator('button[name="openPullRequest:122"]').click()
  await Command.execute('Timeout.sleep', 200)
  const detailTitle = Locator('text=Pull request details')
  const detailDescription = Locator('text=A completed pull request.')
  await expect(detailTitle).toBeVisible()
  await expect(detailDescription).toBeVisible()

  await Locator('button[name="showPullRequestList"]').click()
  await Command.execute('Timeout.sleep', 200)
  await expect(closedPullRequestTitle).toBeVisible()
}
