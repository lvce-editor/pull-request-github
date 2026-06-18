import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-context-menu-copy-relative-path-root-no-focused-item'

export const test: Test = async ({ ClipBoard, ContextMenu, Explorer, FileSystem, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, '')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(-1)
  await ClipBoard.writeText('unchanged')

  // act
  await Explorer.openContextMenu(-1)
  await ContextMenu.selectItem('Copy Relative Path')

  // assert
  await ClipBoard.shouldHaveText('unchanged')
}
