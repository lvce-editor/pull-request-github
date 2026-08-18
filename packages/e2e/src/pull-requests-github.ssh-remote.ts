import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.ssh-remote'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = git@github.com:lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const repository = Locator('text=lvce-editor / pull-request-github')
  const message = Locator('.PullRequestMessage')
  await expect(repository).toBeVisible()
  await expect(message).toHaveText('No open pull requests.')
}
