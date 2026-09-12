import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.no-workspace'

export const test: Test = async ({ Command, expect, Locator, Workspace }) => {
  await Workspace.close()
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const message = Locator('.PullRequestMessage')
  await expect(message).toHaveAttribute('role', 'status')
  await expect(message).toContainText('Open a Git repository to view its pull requests.')
  await expect(Locator('.PullRequestErrorCode')).toHaveCount(0)
  await expect(Locator('.PullRequestListHeader')).toHaveCount(0)
  await expect(Locator('.PullRequestSearchInput')).toHaveCount(0)
  await expect(Locator('.PullRequestListCard')).toHaveCount(0)
  await expect(Locator('.PullRequestCreateButton')).toHaveCount(0)
}
