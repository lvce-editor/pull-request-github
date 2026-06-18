import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-context-menu-paste-root-no-focused-item'

export const test: Test = async ({ ClipBoard, ContextMenu, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.writeFile(`${tmpDir}/a/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)
  await Explorer.expandRecursively()
  await Explorer.focusIndex(1)
  await Explorer.handleCopy()
  await Explorer.focusIndex(-1)

  // act
  await Explorer.openContextMenu(-1)
  await ContextMenu.selectItem('Paste')

  // assert
  const file1 = Locator('.TreeItem').nth(0)
  await expect(file1).toHaveText('a')
  const file2 = Locator('.TreeItem').nth(1)
  await expect(file2).toHaveText('file.txt')
}
