import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.load-success'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(
    `${tmpDir}/.git/config`,
    `[remote "origin"]
  url = https://github.com/lvce-editor/pull-request-github.git
`,
  )
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      baseBranch: 'main',
      description: 'Plain text description from deterministic e2e data.',
      headBranch: 'feature/e2e-head',
      number: 123,
      title: 'Add deterministic pull request list coverage',
      url: 'https://github.com/lvce-editor/pull-request-github/pull/123',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const repositoryLabel = Locator('text=lvce-editor/pull-request-github')
  const pullRequestTitle = Locator('text=Add deterministic pull request list coverage')
  const pullRequestNumber = Locator('text=#123')
  const branches = Locator('text=feature/e2e-head → main')
  await expect(repositoryLabel).toBeVisible()
  await expect(pullRequestTitle).toBeVisible()
  await expect(pullRequestNumber).toBeVisible()
  await expect(branches).toBeVisible()
}
