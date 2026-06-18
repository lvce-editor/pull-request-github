import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-context-menu-copy-path-file'

export const test: Test = async ({ ClipBoard, ContextMenu, Explorer, FileSystem, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.writeFile(`${tmpDir}/a/b.txt`, '')
  await Workspace.setPath(tmpDir)
  await Explorer.expandRecursively()

  // act
  await Explorer.openContextMenu(1)
  await ContextMenu.selectItem('Copy Path')

  // assert
  await ClipBoard.shouldHaveText('memfs:///workspace/a/b.txt')
}
