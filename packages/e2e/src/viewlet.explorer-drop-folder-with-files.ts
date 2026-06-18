import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-drop-folder-with-files'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/new`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)
  await Explorer.handleDragOverIndex(0)
  const opfsRoot = await navigator.storage.getDirectory()
  const directoryHandle = await opfsRoot.getDirectoryHandle('my first folder', {
    create: true,
  })
  const nestedFileHandle = await directoryHandle.getFileHandle('my first nested file', { create: true })
  const writable = await nestedFileHandle.createWritable({ keepExistingData: false })
  await writable.write('hello world')
  await writable.close()
  const fileHandles = [directoryHandle]
  const files = []
  const paths = []
  const index = 0

  // act
  await Explorer.handleDropIndex(fileHandles, files, paths, index)
  await Explorer.expandRecursively()

  // assert
  const newFolder = Locator('.TreeItem[aria-label="my first folder"]')
  await expect(newFolder).toBeVisible()
  await expect(newFolder).toHaveAttribute('aria-expanded', 'true')
  const newFile = Locator('.TreeItem[aria-label="my first nested file"]')
  await expect(newFile).toBeVisible()
}
