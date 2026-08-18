/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.invalid-file-response'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/504'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand(
    'PullRequestsGithub.setPullRequestResponse',
    url,
    {
      base: { ref: 'main' },
      body: 'Invalid files response.',
      head: { ref: 'feature/invalid-files' },
      title: 'Invalid files',
    },
    [],
    { files: [] },
  )
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Invalid files response.',
      headBranch: 'feature/invalid-files',
      number: 504,
      title: 'Invalid files',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="openPullRequest:504"]').click()
  await Command.execute('Timeout.sleep', 200)

  const error = Locator('.PullRequestMessageError')
  await expect(error).toHaveText('GitHub returned an invalid pull request file list.')
}
