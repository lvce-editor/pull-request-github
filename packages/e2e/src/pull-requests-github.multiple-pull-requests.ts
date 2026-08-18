import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.multiple-pull-requests'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'First description',
      headBranch: 'feature/first',
      number: 101,
      title: 'First pull request',
      url: 'https://github.com/lvce-editor/pull-request-github/pull/101',
    },
    {
      baseBranch: 'main',
      description: 'Second description',
      headBranch: 'feature/second',
      number: 102,
      title: 'Second pull request',
      url: 'https://github.com/lvce-editor/pull-request-github/pull/102',
    },
    {
      baseBranch: 'main',
      description: 'Third description',
      headBranch: 'feature/third',
      number: 103,
      title: 'Third pull request',
      url: 'https://github.com/lvce-editor/pull-request-github/pull/103',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const pullRequests = Locator('.PullRequestListItem')
  const first = Locator('text=First pull request')
  const second = Locator('text=Second pull request')
  const third = Locator('text=Third pull request')
  await expect(pullRequests).toHaveCount(3)
  await expect(first).toBeVisible()
  await expect(second).toBeVisible()
  await expect(third).toBeVisible()
}
