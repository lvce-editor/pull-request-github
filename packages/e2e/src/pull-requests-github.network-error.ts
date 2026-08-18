import type { Test } from '@lvce-editor/test-with-playwright'

const owner = 'lvce-editor'
const repo = 'pull-request-github'

export const name = 'pull-requests-github.network-error'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, `[remote "origin"]\n  url = https://github.com/${owner}/${repo}.git\n`)
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListError', owner, repo, 'open', 'Failed to fetch')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const error = Locator('.PullRequestMessageError')
  await expect(error).toHaveAttribute('role', 'alert')
  await expect(error).toHaveText('Failed to fetch')
}
