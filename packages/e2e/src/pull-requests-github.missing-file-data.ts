/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.missing-file-data'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/404'
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
      body: 'Missing file fields.',
      head: { ref: 'feature/missing-file-data' },
      title: 'Missing file data',
    },
    [],
    [{ additions: 'many', deletions: null, filename: 'src/generated.ts', patch: null, status: null }],
  )
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Missing file fields.',
      headBranch: 'feature/missing-file-data',
      number: 404,
      title: 'Missing file data',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="openPullRequest:404"]').click()
  await Command.execute('Timeout.sleep', 200)

  await Locator('button[name="showPullRequestChanges"]').click()
  await Command.execute('Timeout.sleep', 200)
  const file = Locator('.PullRequestFile')
  await expect(file).toContainText('src/generated.ts')
  await expect(file).toContainText('modified')
  await expect(file).toContainText('+0')
  await expect(file).toContainText('−0')
  await expect(file).toContainText('Diff not available for this file.')
}
