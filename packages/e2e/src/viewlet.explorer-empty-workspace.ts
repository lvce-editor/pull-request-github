import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-empty-workspace'

export const test: Test = async ({ expect, Explorer, Locator, Workspace }) => {
  // act
  await Workspace.setPath('')

  // assert
  const explorer = Locator('.Explorer')
  await expect(explorer).toBeVisible()
  const welcome = Locator('.Explorer .Welcome')
  await expect(welcome).toBeVisible()
  const welcomeMessage = Locator('.Explorer .WelcomeMessage')
  await expect(welcomeMessage).toBeVisible()
  await expect(welcomeMessage).toHaveText('You have not yet opened a folder.')
  const openFolderButton = Locator('.Explorer .Button')
  await expect(openFolderButton).toBeVisible()
  await expect(openFolderButton).toHaveText('Open folder')

  await Explorer.handleDragOver(5000, 5000)
  await expect(explorer).toHaveClass('DropTarget')
}
