/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.multiple-files'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/702'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Two changed files.',
      headBranch: 'feature/multiple-files',
      number: 702,
      title: 'Render multiple files',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'main',
    commits: [],
    description: 'Two changed files.',
    files: [
      {
        additions: 4,
        deletions: 0,
        filename: 'src/added.ts',
        patch: '@@ -0,0 +1 @@\n+export const added = true',
        status: 'added',
      },
      {
        additions: 1,
        deletions: 3,
        filename: 'src/renamed.ts',
        patch: '',
        status: 'renamed',
      },
    ],
    headBranch: 'feature/multiple-files',
    title: 'Render multiple files',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  await Locator('button[name="openPullRequest:702"]').click()
  await Command.execute('Timeout.sleep', 200)
  await Locator('button[name="showPullRequestChanges"]').click()
  await Command.execute('Timeout.sleep', 200)

  const files = Locator('.PullRequestFile')
  const fileList = Locator('.PullRequestFileList')
  await expect(files).toHaveCount(2)
  await expect(fileList).toContainText('src/added.ts')
  await expect(fileList).toContainText('renamed')
  await expect(fileList).toContainText('Diff not available for this file.')
}
