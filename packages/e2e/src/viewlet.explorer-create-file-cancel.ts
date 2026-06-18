import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-cancel'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.newFile()

  // assert
  const inputBox = Locator('input')
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()

  // act
  await Explorer.updateEditingValue('created.txt')
  await Explorer.cancelEdit()

  // assert
  await expect(inputBox).toBeHidden()
  const items = Locator('.TreeItem')
  await expect(items).toHaveCount(1)
}
