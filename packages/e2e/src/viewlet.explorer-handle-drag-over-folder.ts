import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-handle-drag-over-folder'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.handleDragOverIndex(0)

  // assert
  const treeItems = Locator('.Explorer .TreeItem')
  const treeItemOne = treeItems.nth(0)
  await expect(treeItemOne).toHaveClass('DropTarget')
}
