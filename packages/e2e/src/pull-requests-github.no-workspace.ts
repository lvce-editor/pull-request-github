import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.no-workspace'

export const test: Test = async ({ Command, expect, Locator, Workspace }) => {
  await Workspace.close()
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const message = Locator('.PullRequestMessage')
  await expect(message).toHaveAttribute('role', 'status')
  await expect(message).toHaveText('Open a folder containing a GitHub repository to view pull requests.')
}
