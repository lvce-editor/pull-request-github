import type { Test } from '@lvce-editor/test-with-playwright'

const owner = 'lvce-editor'
const repo = 'pull-request-github'

export const name = 'pull-requests-github.invalid-list-response'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, `[remote "origin"]\n  url = https://github.com/${owner}/${repo}.git\n`)
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListResponse', owner, repo, 'open', { items: [] })
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const error = Locator('.PullRequestMessageError')
  await expect(error).toContainText('GitHub returned an invalid pull request list.')
  await expect(error).toContainText('Error code: E_GITHUB_INVALID_LIST_DATA')
}
