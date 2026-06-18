import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-context-menu-copy-path-root'

export const test: Test = async ({ ClipBoard, ContextMenu, Explorer, FileSystem, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, '')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(-1)

  // act
  await Explorer.openContextMenu(-1)
  await ContextMenu.selectItem('Copy Path')

  // assert
  await ClipBoard.shouldHaveText('memfs:///workspace')
}
