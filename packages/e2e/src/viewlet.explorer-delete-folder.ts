import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-folder'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/folder-1`)
  await FileSystem.mkdir(`${tmpDir}/folder-2`)
  await FileSystem.mkdir(`${tmpDir}/folder-3`)
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.focusFirst()
  await Explorer.removeDirent()

  // assert
  const file1 = Locator('text=folder-1')
  await expect(file1).toBeHidden()
}
