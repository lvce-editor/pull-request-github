import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-file-system-provider-invalid-data'
export const skip = 1

export const test: Test = async ({ Command, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)

  // Mock file system provider to return invalid data (null/undefined entries)
  await Command.execute('FileSystemProvider.setInvalidData', true)

  // act & assert - Try to expand directory when provider returns invalid data
  await Explorer.focusIndex(0)
  await Explorer.expandRecursively()

  // Should handle invalid data gracefully and not crash
  const treeItems = Locator('.TreeItem')
  const firstItem = treeItems.first()

  // Should still show valid items, ignoring invalid ones
  await expect(firstItem).toBeVisible()

  // Should not show broken UI elements
  const brokenItems = Locator('.TreeItem[aria-label*="undefined"], .TreeItem[aria-label*="null"]')
  await expect(brokenItems).toHaveCount(0)

  // Reset to normal data
  await Command.execute('FileSystemProvider.setInvalidData', false)
  await Explorer.refresh()

  // Should work normally after reset
  const fileItem = Locator('.TreeItem', { hasText: 'file.txt' })
  await expect(fileItem).toBeVisible()
}
