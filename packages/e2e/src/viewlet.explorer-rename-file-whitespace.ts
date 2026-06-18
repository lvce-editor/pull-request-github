import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-rename-file-whitespace'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/ `, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.focusIndex(0)
  await Explorer.renameDirent()

  // assert
  const explorer = Locator('.Explorer')
  const inputBox = explorer.locator('input')
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()

  // act
  await Explorer.updateEditingValue('file1.txt')
  await Explorer.acceptEdit()

  // // assert
  await expect(inputBox).toBeHidden()
  const file1 = Locator('.TreeItem', { hasText: 'file1.txt' })
  await expect(file1).toBeVisible()
}
