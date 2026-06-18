import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-handle-drag-over-all'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.handleDragOver(5000, 5000)

  // assert
  const explorer = Locator('.Explorer .ListItems')
  await expect(explorer).toHaveClass('DropTarget')
}
