/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.empty-description'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/124'
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'release/e2e-empty-base',
    commits: [],
    description: '',
    files: [],
    headBranch: 'feature/e2e-empty-head',
    title: 'Render empty pull request description',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'release/e2e-empty-base',
      description: '',
      headBranch: 'feature/e2e-empty-head',
      number: 124,
      title: 'Render empty pull request description',
      url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const pullRequest = Locator('button[name="openPullRequest:124"]')
  await pullRequest.click()
  await Command.execute('Timeout.sleep', 200)

  const title = Locator('text=Render empty pull request description')
  const mergeSummary = Locator('.PullRequestMergeSummary')
  const description = Locator('text=No description')
  await expect(title).toBeVisible()
  await expect(mergeSummary).toContainText('feature/e2e-empty-head')
  await expect(mergeSummary).toContainText('release/e2e-empty-base')
  await expect(description).toBeVisible()
}
