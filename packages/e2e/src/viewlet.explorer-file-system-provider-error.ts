import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-file-system-provider-error'
export const skip = 1

export const test: Test = async ({ Command, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)

  // Mock file system provider to throw an error
  await Command.execute('FileSystemProvider.setError', true)

  // act & assert - Try to expand directory when provider throws error
  await Explorer.focusIndex(0)
  await Explorer.expandRecursively()

  // Should show error state or handle gracefully
  const errorMessage = Locator('.ErrorMessage')
  await expect(errorMessage).toBeVisible()
  await expect(errorMessage).toHaveText('File system provider error')

  // Reset error state
  await Command.execute('FileSystemProvider.setError', false)

  // Should recover and work normally
  await Explorer.refresh()
  const fileItem = Locator('.TreeItem', { hasText: 'file.txt' })
  await expect(fileItem).toBeVisible()
}
