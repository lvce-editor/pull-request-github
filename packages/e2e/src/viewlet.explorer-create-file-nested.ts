import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-nested'

export const skip = 1

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
  await Explorer.updateEditingValue('a/b/created.txt')
  await Explorer.acceptEdit()

  // assert
  const file1 = Locator('.TreeItem').nth(0)
  await expect(file1).toHaveText('a')
  const file2 = Locator('.TreeItem').nth(1)
  await expect(file2).toHaveText('b')
  const file3 = Locator('.TreeItem').nth(2)
  await expect(file3).toHaveText('created.txt')
  const file4 = Locator('.TreeItem').nth(3)
  await expect(file4).toHaveText('file1.txt')
}
