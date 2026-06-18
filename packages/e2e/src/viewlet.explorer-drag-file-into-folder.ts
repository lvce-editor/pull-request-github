import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-drag-file-into-folder'

export const skip = 1

export const test: Test = async ({ Explorer, FileSystem, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/new`)
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(1)
  await Explorer.handleDragOverIndex(1)

  // act

  // const opfsRoot = await navigator.storage.getDirectory()
  // const fileHandle = await opfsRoot.getFileHandle('my first file', {
  //   create: true,
  // })
  // console.log({ fileHandle })
  // const fileHandles = [fileHandle]
  // const files = []
  // const paths = []
  // const index = 0
  // await Command.execute('Explorer.handleDropIndex', fileHandles, files, paths, index)
  // await Explorer.handleDrop()

  // TODO drop file into folder and verify it is moved
}
