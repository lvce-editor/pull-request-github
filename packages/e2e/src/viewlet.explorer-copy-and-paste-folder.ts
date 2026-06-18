import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-copy-and-paste-folder'

export const test: Test = async ({ ClipBoard, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.mkdir(`${tmpDir}/b`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)
  await Explorer.expandRecursively()

  // act
  await Explorer.handleCopy()
  await Explorer.focusIndex(1)
  await Explorer.handlePaste()
  await Explorer.expandAll()

  // assert
  const file1 = Locator('.TreeItem').nth(0)
  await expect(file1).toHaveText('b')
  await expect(file1).toHaveAttribute('aria-expanded', 'true')
  const file2 = Locator('.TreeItem').nth(1)
  await expect(file2).toHaveText('a')
  // await expect(file1).toHaveAttribute('aria-expanded', 'false')
}
