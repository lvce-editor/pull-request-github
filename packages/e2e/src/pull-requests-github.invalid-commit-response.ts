/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.invalid-commit-response'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/503'
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
      body: 'Invalid commits response.',
      head: { ref: 'feature/invalid-commits' },
      title: 'Invalid commits',
    },
    { commits: [] },
    [],
  )
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Invalid commits response.',
      headBranch: 'feature/invalid-commits',
      number: 503,
      title: 'Invalid commits',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="openPullRequest:503"]').click()
  await Command.execute('Timeout.sleep', 200)

  const error = Locator('.PullRequestMessageError')
  await expect(error).toHaveText('GitHub returned an invalid pull request commit list.')
}
