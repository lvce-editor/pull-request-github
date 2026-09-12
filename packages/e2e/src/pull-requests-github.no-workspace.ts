import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.no-workspace'

export const test: Test = async ({ Command, expect, Locator, Workspace }) => {
  await Workspace.close()
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const message = Locator('.PullRequestMessage')
  await expect(message).toHaveAttribute('role', 'status')
  await expect(message).toContainText('Open a Git repository to view its pull requests.')
  const errorCode = Locator('.PullRequestErrorCode')
  await expect(errorCode).toHaveCount(0)
  const header = Locator('.PullRequestListHeader')
  await expect(header).toHaveCount(0)
  const filter = Locator('.PullRequestSearchInput')
  await expect(filter).toHaveCount(0)
  const listCard = Locator('.PullRequestListCard')
  await expect(listCard).toHaveCount(0)
  const createButton = Locator('.PullRequestCreateButton')
  await expect(createButton).toHaveCount(0)
}
