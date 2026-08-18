import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.no-git-remote'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[core]\n  bare = false\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const message = Locator('.PullRequestMessage')
  await expect(message).toContainText('No Git remote was found in the current workspace.')
  await expect(message).toContainText('Error code: E_GIT_REMOTE_NOT_FOUND')
}
