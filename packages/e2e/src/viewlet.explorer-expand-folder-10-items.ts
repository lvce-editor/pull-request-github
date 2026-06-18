import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-expand-folder-10-items'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/stress-folder`)
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00000.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00001.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00002.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00003.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00004.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00005.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00006.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00007.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00008.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/stress-folder/item-00009.txt`, '')
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.focusFirst()
  const folder = Locator('.TreeItem', { hasText: 'stress-folder' })
  await expect(folder).toHaveId('TreeItemActive')
  await Explorer.clickCurrent()

  // assert
  await expect(folder).toHaveAttribute('aria-expanded', 'true')
  const firstItem = Locator('.TreeItem', { hasText: 'item-00000.txt' })
  const lastItem = Locator('.TreeItem', { hasText: 'item-00009.txt' })
  await expect(firstItem).toBeVisible()
  await Explorer.focusIndex(10)
  await expect(lastItem).toBeVisible()
  await expect(lastItem).toHaveId('TreeItemActive')
}
