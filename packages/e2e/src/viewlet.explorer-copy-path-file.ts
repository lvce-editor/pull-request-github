import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-copy-path-file'

export const test: Test = async ({ ClipBoard, Explorer, FileSystem, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.writeFile(`${tmpDir}/a/b.txt`, '')
  await Workspace.setPath(tmpDir)
  await Explorer.expandRecursively()
  await Explorer.focusIndex(1)

  // act
  await Explorer.copyPath()

  // assert
  await ClipBoard.shouldHaveText('memfs:///workspace/a/b.txt')
}
