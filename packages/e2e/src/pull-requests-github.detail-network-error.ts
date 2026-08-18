/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.detail-network-error'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/502'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestError', url, 'Failed to fetch')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Unavailable pull request.',
      headBranch: 'feature/unavailable',
      number: 502,
      title: 'Unavailable pull request',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="openPullRequest:502"]').click()
  await Command.execute('Timeout.sleep', 200)

  const error = Locator('.PullRequestMessageError')
  await expect(error).toHaveText('Failed to fetch')
}
