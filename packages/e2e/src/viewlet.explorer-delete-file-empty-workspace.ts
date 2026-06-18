import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-file-empty-workspace'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.removeDirent()

  // assert
  const listItems = Locator('.Explorer .ListItems')
  await expect(listItems).toBeVisible()
}
