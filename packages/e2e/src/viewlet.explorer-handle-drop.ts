import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-handle-drop'

export const test: Test = async ({ Command, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')
  await Workspace.setPath(tmpDir)
  const directory = await navigator.storage.getDirectory()
  const fileHandle = await directory.getFileHandle('dropped-file.txt', {
    create: true,
  })
  const file = await fileHandle.getFile()
  const fileList = [file]
  const id = await Command.execute('FileSystemHandle.addFileHandle', fileHandle)

  // act
  await Explorer.handleDrop(0, 0, [id], fileList)

  // assert
  const droppedFile = Locator('.TreeItem', { hasText: 'dropped-file.txt' })
  await expect(droppedFile).toBeVisible()
}
