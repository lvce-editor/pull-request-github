import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.non-github-remote'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://gitlab.com/example/project.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const message = Locator('.PullRequestMessage')
  await expect(message).toContainText('The current repository remote is not hosted on GitHub.')
  await expect(message).toContainText('Error code: E_GITHUB_REMOTE_REQUIRED')
}
