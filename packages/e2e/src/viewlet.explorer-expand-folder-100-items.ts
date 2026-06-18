import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-expand-folder-100-items'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/stress-folder`)
  for (let index = 0; index < 100; index++) {
    const fileName = `item-${index.toString().padStart(5, '0')}.txt`
    await FileSystem.writeFile(`${tmpDir}/stress-folder/${fileName}`, '')
  }
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.focusFirst()
  const folder = Locator('.TreeItem', { hasText: 'stress-folder' })
  await expect(folder).toHaveId('TreeItemActive')
  await Explorer.clickCurrent()

  // assert
  await expect(folder).toHaveAttribute('aria-expanded', 'true')
  const firstItem = Locator('.TreeItem', { hasText: 'item-00000.txt' })
  const lastItem = Locator('.TreeItem', { hasText: 'item-00099.txt' })
  await expect(firstItem).toBeVisible()
  await Explorer.focusIndex(100)
  await expect(lastItem).toBeVisible()
  await expect(lastItem).toHaveId('TreeItemActive')
}
