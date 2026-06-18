import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-copy-paste-error-scenarios'
export const skip = 1

export const test: Test = async ({ ClipBoard, Command, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/source`)
  await FileSystem.writeFile(`${tmpDir}/source/file.txt`, 'content')
  await FileSystem.mkdir(`${tmpDir}/target`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)
  await Explorer.expandRecursively()
  await Explorer.focusIndex(1)

  // Test 1: Copy file to read-only directory
  await Command.execute('FileSystem.setReadOnly', `${tmpDir}/target`, true)
  await Explorer.handleCopy()
  await Explorer.focusIndex(2)
  await Explorer.handlePaste()

  // Should show error message for read-only target
  const errorMessage = Locator('.ErrorMessage')
  await expect(errorMessage).toBeVisible()
  await expect(errorMessage).toHaveText('Permission denied')

  // Test 2: Paste without copying anything first
  await Explorer.handlePaste()
  await expect(errorMessage).toBeVisible()

  // Test 3: Copy non-existent file (simulate file deletion after copy)
  await Command.execute('FileSystem.setReadOnly', `${tmpDir}/target`, false)
  await Explorer.handleCopy()
  await Command.execute('FileSystem.deleteFile', `${tmpDir}/source/file.txt`)
  await Explorer.focusIndex(2)
  await Explorer.handlePaste()

  // Should handle missing source gracefully
  await expect(errorMessage).toBeVisible()

  // Test 4: Copy file with invalid characters in name
  await FileSystem.writeFile(`${tmpDir}/source/invalid|file.txt`, 'content')
  await Explorer.focusIndex(1)
  await Explorer.expandRecursively()
  await Explorer.focusIndex(2)
  await Explorer.handleCopy()
  await Explorer.focusIndex(3)
  await Explorer.handlePaste()

  // Should handle invalid characters
  await expect(errorMessage).toBeVisible()
}
