import type { Test } from '@lvce-editor/test-with-playwright'

const owner = 'lvce-editor'
const repo = 'pull-request-github'

export const name = 'pull-requests-github.refresh-after-error'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, `[remote "origin"]\n  url = https://github.com/${owner}/${repo}.git\n`)
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListError', owner, repo, 'open', 'Failed to fetch')
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const error = Locator('.PullRequestMessageError')
  await expect(error).toHaveText('Failed to fetch')

  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', owner, repo, 'open', [
    {
      baseBranch: 'main',
      description: 'The request loaded after retrying.',
      headBranch: 'feature/retry',
      number: 301,
      title: 'Loaded after refresh',
      url: `https://github.com/${owner}/${repo}/pull/301`,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.refresh')

  const title = Locator('text=Loaded after refresh')
  await expect(title).toBeVisible()
  await expect(error).toBeHidden()
}
