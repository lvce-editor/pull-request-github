import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-drag-drop-error-scenarios'

export const skip = 1

export const test: Test = async ({ Command, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.mkdir(`${tmpDir}/readonly-dir`)
  await Workspace.setPath(tmpDir)

  // Test 1: Drop file on read-only directory
  await Command.execute('FileSystem.setReadOnly', `${tmpDir}/readonly-dir`, true)

  const directory = await navigator.storage.getDirectory()
  const fileHandle = await directory.getFileHandle('test-file.txt', { create: true })
  const file = await fileHandle.getFile()
  const fileList = [file]
  const id = await Command.execute('FileSystemHandle.addFileHandle', fileHandle)

  // Try to drop on read-only directory
  await Explorer.handleDrop(2, 0, [id], fileList)

  // Should show error message
  const errorMessage = Locator('.ErrorMessage')
  await expect(errorMessage).toBeVisible()
  await expect(errorMessage).toHaveText('Permission denied')

  // Test 2: Drop with invalid file handle
  const invalidId = 999_999 // Use number instead of string
  await Explorer.handleDrop(0, 0, [invalidId], fileList)

  // Should handle invalid handle gracefully
  await expect(errorMessage).toBeVisible()

  // Test 3: Drop file on itself (same location)
  await Command.execute('FileSystem.setReadOnly', `${tmpDir}/readonly-dir`, false)
  await Explorer.handleDrop(0, 0, [id], fileList)

  // Should handle or show appropriate message
  const fileItem = Locator('.TreeItem', { hasText: 'test-file.txt' })
  await expect(fileItem).toBeVisible()

  // Test 4: Drop multiple files where one is invalid
  const fileHandle2 = await directory.getFileHandle('test-file2.txt', { create: true })
  const file2 = await fileHandle2.getFile()
  const fileList2 = [file, file2]
  const id2 = await Command.execute('FileSystemHandle.addFileHandle', fileHandle2)

  // Delete one file after adding to handles to simulate error
  await Command.execute('FileSystemHandle.removeFileHandle', id2)

  await Explorer.handleDrop(0, 0, [id, 999_999], fileList2)

  // Should handle partial failure gracefully
  await expect(errorMessage).toBeVisible()

  // Test 5: Drop on non-existent target
  await Explorer.handleDrop(999, 0, [id], fileList)

  // Should handle invalid target gracefully
  await expect(errorMessage).toBeVisible()
}
