/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.partial-detail-data'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/703'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Partial detail data.',
      headBranch: 'feature/partial-detail',
      number: 703,
      title: 'Partial detail data',
      url,
    },
  ])
  await Command.executeExtensionCommand(
    'PullRequestsGithub.setPullRequestResponse',
    url,
    {
      base: { ref: 42 },
      body: null,
      head: null,
      title: false,
    },
    [],
    [],
  )
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  await Locator('button[name="openPullRequest:703"]').click()
  await Command.execute('Timeout.sleep', 200)

  const details = Locator('.PullRequestOverview')
  const commitsTab = Locator('button[name="showPullRequestCommits"]')
  const changesTab = Locator('button[name="showPullRequestChanges"]')
  await expect(details).toContainText('No description')
  await expect(commitsTab).toHaveText('Commits 0')
  await expect(changesTab).toHaveText('Changes 0')
}
