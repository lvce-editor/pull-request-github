import type { Test } from '@lvce-editor/test-with-playwright'

const owner = 'lvce-editor'
const repo = 'pull-request-github'

export const name = 'pull-requests-github.service-unavailable'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, `[remote "origin"]\n  url = https://github.com/${owner}/${repo}.git\n`)
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListError', owner, repo, 'open', 'GitHub request failed with status 503')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const error = Locator('.PullRequestMessageError')
  await expect(error).toContainText('GitHub request failed with status 503')
  await expect(error).toContainText('Error code: E_GITHUB_REQUEST_FAILED')
}
