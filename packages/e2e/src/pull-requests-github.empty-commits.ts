/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.empty-commits'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/401'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'main',
    commits: [],
    description: 'No commits yet.',
    files: [],
    headBranch: 'feature/empty-commits',
    title: 'Empty commits',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'No commits yet.',
      headBranch: 'feature/empty-commits',
      number: 401,
      title: 'Empty commits',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="openPullRequest:401"]').click()
  await Command.execute('Timeout.sleep', 200)

  await Locator('button[name="showPullRequestCommits"]').click()
  await Command.execute('Timeout.sleep', 200)
  const message = Locator('.PullRequestMessage')
  await expect(message).toHaveText('No commits in this pull request.')
}
