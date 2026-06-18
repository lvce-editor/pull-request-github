import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-cut-and-paste-file'

export const test: Test = async ({ ClipBoard, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.writeFile(`${tmpDir}/a/file.txt`, 'content')
  await FileSystem.mkdir(`${tmpDir}/b`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)
  await Explorer.expandRecursively()
  await Explorer.focusIndex(1)

  // act
  await Explorer.handleCut()
  await Explorer.focusIndex(2)
  await Explorer.handlePaste()

  // TODO folder should expanded automatically
  await Explorer.focusIndex(1)
  await Explorer.expandRecursively()

  // assert
  const file1 = Locator('.TreeItem').nth(0)
  await expect(file1).toHaveText('a')
  await expect(file1).toHaveAttribute('aria-expanded', 'true')
  // TODO should be hidden
  const file2 = Locator('.TreeItem').nth(1)
  await expect(file2).toHaveText('b')
  await expect(file2).toHaveAttribute('aria-expanded', 'true')
  const file3 = Locator('.TreeItem').nth(2)
  await expect(file3).toHaveText('file.txt')
}
