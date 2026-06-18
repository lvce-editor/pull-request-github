import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-context-menu-create-folder-error-already-exists'

export const test: Test = async ({ ContextMenu, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/folder1`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(-1)

  // act
  await Explorer.openContextMenu(-1)
  await ContextMenu.selectItem('New Folder...')
  await Explorer.updateEditingValue('folder1')

  // assert
  const inputBox = Locator('input')
  await expect(inputBox).toHaveClass('InputValidationError')
  const errorMessage = Locator('.ExplorerErrorMessage')
  await expect(errorMessage).toBeVisible()
  await expect(errorMessage).toHaveText('A file or folder **folder1** already exists at this location. Please choose a different name.')
}
