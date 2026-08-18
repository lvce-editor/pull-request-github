/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.multiple-commits'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/701'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Three commits.',
      headBranch: 'feature/multiple-commits',
      number: 701,
      title: 'Render multiple commits',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'main',
    commits: [
      { author: 'alice', message: 'Add model', sha: '1111111aaaaaaaaa' },
      { author: 'bob', message: 'Add rendering', sha: '2222222bbbbbbb' },
      { author: 'carol', message: 'Add coverage', sha: '3333333ccccccc' },
    ],
    description: 'Three commits.',
    files: [],
    headBranch: 'feature/multiple-commits',
    title: 'Render multiple commits',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  await Locator('button[name="openPullRequest:701"]').click()
  await Command.execute('Timeout.sleep', 200)
  await Locator('button[name="showPullRequestCommits"]').click()
  await Command.execute('Timeout.sleep', 200)

  const commits = Locator('.PullRequestCommit')
  const list = Locator('.PullRequestCommitList')
  await expect(commits).toHaveCount(3)
  await expect(list).toContainText('Add model')
  await expect(list).toContainText('bob')
  await expect(list).toContainText('3333333')
}
