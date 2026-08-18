/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.refresh-detail-after-error'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/705'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Recover this detail view.',
      headBranch: 'feature/detail-recovery',
      number: 705,
      title: 'Recover detail view',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestError', url, 'Failed to fetch')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  await Locator('button[name="openPullRequest:705"]').click()
  await Command.execute('Timeout.sleep', 200)
  const error = Locator('.PullRequestMessageError')
  await expect(error).toHaveText('Failed to fetch')

  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'main',
    commits: [],
    description: 'The detail view recovered after refresh.',
    files: [],
    headBranch: 'feature/detail-recovery',
    title: 'Recovered detail view',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.refresh')

  const details = Locator('.PullRequestDetails')
  await expect(details).toContainText('Recovered detail view')
  await expect(details).toContainText('The detail view recovered after refresh.')
  await expect(error).toBeHidden()
}
