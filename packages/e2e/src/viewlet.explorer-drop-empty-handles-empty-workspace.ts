import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-drop-empty-handles-empty-workspace'

export const test: Test = async ({ expect, Explorer, Locator, Workspace }) => {
  // arrange
  await Workspace.setPath('')
  const welcomeMessage = Locator('.Explorer .WelcomeMessage')
  const treeItems = Locator('.TreeItem')

  // act
  await Explorer.handleDrop(5000, 5000, [], [])

  // assert
  await expect(welcomeMessage).toBeVisible()
  await expect(welcomeMessage).toHaveText('You have not yet opened a folder.')
  await expect(treeItems).toHaveCount(0)
}
