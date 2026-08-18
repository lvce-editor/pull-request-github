/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.not-found'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/404'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestError', url, 'Not Found')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Missing pull request.',
      headBranch: 'feature/missing',
      number: 404,
      title: 'Missing pull request',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="openPullRequest:404"]').click()
  await Command.execute('Timeout.sleep', 200)

  const error = Locator('.PullRequestMessageError')
  await expect(error).toContainText('Not Found')
  await expect(error).toContainText('Error code: E_GITHUB_REQUEST_FAILED')
}
