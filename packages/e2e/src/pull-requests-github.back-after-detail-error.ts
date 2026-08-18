/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.back-after-detail-error'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/704'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Return to this item after an error.',
      headBranch: 'feature/back-after-error',
      number: 704,
      title: 'Back after error',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestError', url, 'Not Found')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  await Locator('button[name="openPullRequest:704"]').click()
  await Command.execute('Timeout.sleep', 200)
  const error = Locator('.PullRequestMessageError')
  await expect(error).toHaveText('Not Found')

  await Locator('button[name="showPullRequestList"]').click()
  await Command.execute('Timeout.sleep', 200)
  const title = Locator('text=Back after error')
  await expect(title).toBeVisible()
  await expect(error).toBeHidden()
}
