import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-copy-and-paste-file'

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
  await Explorer.handleCopy()
  await Explorer.focusIndex(-1)
  await Explorer.handlePaste()

  // assert
  const file1 = Locator('.TreeItem').nth(0)
  await expect(file1).toHaveText('a')
  await expect(file1).toHaveAttribute('aria-expanded', 'true')
  const file3 = Locator('.TreeItem').nth(1)
  await expect(file3).toHaveText('b')
  await expect(file3).toHaveAttribute('aria-expanded', 'false') // TODO should be true
  const file4 = Locator('.TreeItem').nth(2)
  await expect(file4).toHaveText('file.txt')
}
