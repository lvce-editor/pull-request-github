import type { Test } from '@lvce-editor/test-with-playwright'

const owner = 'lvce-editor'
const repo = 'pull-request-github'

export const name = 'pull-requests-github.partial-list-data'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, `[remote "origin"]\n  url = https://github.com/${owner}/${repo}.git\n`)
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListResponse', owner, repo, 'open', [
    {
      base: null,
      body: 42,
      head: { ref: false },
      html_url: `https://github.com/${owner}/${repo}/pull/17`,
      number: 17,
      title: null,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const title = Locator('text=Pull request #17')
  const metadata = Locator('.PullRequestListItemMetadata')
  await expect(title).toBeVisible()
  await expect(metadata).toHaveText('#17')
}
