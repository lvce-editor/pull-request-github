/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.partial-commit-data'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/403'
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
      body: 'Partial commit fields.',
      head: { ref: 'feature/partial-commit' },
      title: 'Partial commit data',
    },
    [{ author: null, commit: { author: null, message: 7 }, sha: 'abc1234def' }],
    [],
  )
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Partial commit fields.',
      headBranch: 'feature/partial-commit',
      number: 403,
      title: 'Partial commit data',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="openPullRequest:403"]').click()
  await Command.execute('Timeout.sleep', 200)

  await Locator('button[name="showPullRequestCommits"]').click()
  await Command.execute('Timeout.sleep', 200)
  const commit = Locator('.PullRequestCommit')
  await expect(commit).toContainText('Untitled commit')
  await expect(commit).toContainText('Unknown author')
  await expect(commit).toContainText('abc1234')
}
