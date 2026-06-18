import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-drop-file-empty-workspace'

export const test: Test = async ({ Command, expect, Explorer, Locator, Workspace }) => {
  // arrange
  await Workspace.setPath('')
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('dropped-file.txt', {
    create: true,
  })
  const id = await Command.execute('FileSystemHandle.addFileHandle', fileHandle)
  const welcomeMessage = Locator('.Explorer .WelcomeMessage')
  const treeItems = Locator('.TreeItem')

  // act
  await Explorer.handleDrop(5000, 5000, [id], [])

  // assert
  await expect(welcomeMessage).toBeVisible()
  await expect(welcomeMessage).toHaveText('You have not yet opened a folder.')
  await expect(treeItems).toHaveCount(0)
}
