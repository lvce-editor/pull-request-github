/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.empty-changes'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/402'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'main',
    commits: [],
    description: 'No changed files.',
    files: [],
    headBranch: 'feature/empty-changes',
    title: 'Empty changes',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'No changed files.',
      headBranch: 'feature/empty-changes',
      number: 402,
      title: 'Empty changes',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="openPullRequest:402"]').click()
  await Command.execute('Timeout.sleep', 200)

  await Locator('button[name="showPullRequestChanges"]').click()
  await Command.execute('Timeout.sleep', 200)
  const message = Locator('.PullRequestMessage')
  await expect(message).toHaveText('No changed files in this pull request.')
}
