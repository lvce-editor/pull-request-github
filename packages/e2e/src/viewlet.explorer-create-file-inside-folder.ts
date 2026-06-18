import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-inside-folder'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.mkdir(`${tmpDir}/b`)
  await FileSystem.mkdir(`${tmpDir}/c`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)

  // act
  await Explorer.newFile()

  // assert
  const inputBox = Locator('input')
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()

  // act
  await Explorer.updateEditingValue('created.txt')
  await Explorer.acceptEdit()

  // assert
  const newFile = Locator('.Explorer').locator('text=created.txt')
  await expect(newFile).toBeVisible()
}
