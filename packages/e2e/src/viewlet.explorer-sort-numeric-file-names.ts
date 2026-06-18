import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-sort-numeric-file-names'

export const test: Test = async ({ expect, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/file-1.txt`)
  await FileSystem.mkdir(`${tmpDir}/file-10.txt`)
  await FileSystem.mkdir(`${tmpDir}/file-2.txt`)

  // act
  await Workspace.setPath(tmpDir)

  // assert
  const treeItems = Locator('.TreeItem')
  const firstTreeItem = treeItems.nth(0)
  const secondTreeItem = treeItems.nth(1)
  const thirdTreeItem = treeItems.nth(2)
  await expect(treeItems).toHaveCount(3)
  await expect(firstTreeItem).toHaveText('file-1.txt')
  await expect(secondTreeItem).toHaveText('file-2.txt')
  await expect(thirdTreeItem).toHaveText('file-10.txt')
}
