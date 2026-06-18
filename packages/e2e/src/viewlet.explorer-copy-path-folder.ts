import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-copy-path-folder'

export const test: Test = async ({ ClipBoard, Explorer, FileSystem, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)

  // act
  await Explorer.copyPath()

  // assert
  await ClipBoard.shouldHaveText('memfs:///workspace/a')
}
