import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.quick-pick-show'

// The command palette test helper does not currently surface isolated extension commands.
export const skip = 1

export const test: Test = async ({ Command, expect, FileSystem, Locator, QuickPick, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [])
  await QuickPick.executeCommand('GitHub Pull Requests: Focus on Pull Requests View')

  const view = Locator('.PullRequestView')
  const message = Locator('.PullRequestMessage')
  await expect(view).toBeVisible()
  await expect(message).toHaveText('No open pull requests.')
}
