import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-multiple-files-focuses-remaining-item'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)
  await Explorer.selectIndices([0, 1])

  const file1 = Locator('.TreeItem', { hasText: 'file1.txt' })
  const file2 = Locator('.TreeItem', { hasText: 'file2.txt' })
  const file3 = Locator('.TreeItem', { hasText: 'file3.txt' })

  // act
  await Explorer.removeDirent()

  // assert
  await expect(file1).toBeHidden()
  await expect(file2).toBeHidden()
  await expect(file3).toBeVisible()
  await expect(file3).toHaveId('TreeItemActive')
}
