import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-copy-and-paste-folder-with-items'

export const skip = 1

export const test: Test = async ({ ClipBoard, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.writeFile(`${tmpDir}/a/file.txt`, '')
  await FileSystem.mkdir(`${tmpDir}/a/c`)
  await FileSystem.mkdir(`${tmpDir}/b`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)
  await Explorer.expandRecursively()

  // act
  await Explorer.handleCopy()
  await Explorer.focusIndex(3)
  await Explorer.handlePaste()
  await Explorer.expandAll()

  // assert
  const treeItems = Locator('.TreeItem')
  await expect(treeItems).toHaveCount(2)
  const file1 = treeItems.nth(0)
  await expect(file1).toHaveText('b')
  await expect(file1).toHaveAttribute('aria-expanded', 'true')
  const file2 = treeItems.nth(1)
  await expect(file2).toHaveText('a')
  // await expect(file1).toHaveAttribute('aria-expanded', 'false')
}
