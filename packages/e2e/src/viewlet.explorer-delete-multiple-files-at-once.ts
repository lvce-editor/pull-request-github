import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-multiple-files'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')
  await Workspace.setPath(tmpDir)
  const explorer = Locator('.Explorer')
  const file1 = explorer.locator('text=file1.txt')
  const file2 = explorer.locator('text=file2.txt')
  const file3 = explorer.locator('text=file3.txt')
  await Explorer.focus()
  await Explorer.selectIndices([0, 1])

  // act
  await Explorer.removeDirent()

  // assert
  await expect(file1).toBeHidden()
  await expect(file2).toBeHidden()
  await expect(file3).toBeVisible()

  // TODO file3 should be focused
}
