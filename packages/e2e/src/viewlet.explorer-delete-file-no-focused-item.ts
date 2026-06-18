import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-file-no-focused-item'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file-1.txt`, 'a')
  await FileSystem.writeFile(`${tmpDir}/file-2.txt`, 'b')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(-1)

  // act
  await Explorer.removeDirent()

  // assert
  const file1 = Locator('.TreeItem', { hasText: 'file-1.txt' })
  const file2 = Locator('.TreeItem', { hasText: 'file-2.txt' })
  await expect(file1).toBeVisible()
  await expect(file2).toBeVisible()
}
