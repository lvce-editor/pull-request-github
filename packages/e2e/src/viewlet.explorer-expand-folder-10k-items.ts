import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-expand-folder-10k-items'

const totalItems = 10_000
const batchSize = 500

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/stress-folder`)
  for (let start = 0; start < totalItems; start += batchSize) {
    const end = Math.min(start + batchSize, totalItems)
    await Promise.all(
      Array.from({ length: end - start }, (_, index) => {
        const number = start + index
        const fileName = `item-${number.toString().padStart(5, '0')}.txt`
        return FileSystem.writeFile(`${tmpDir}/stress-folder/${fileName}`, '')
      }),
    )
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
  const lastItem = Locator('.TreeItem', { hasText: 'item-09999.txt' })
  await expect(firstItem).toBeVisible()
  await Explorer.focusIndex(10_000)
  await expect(lastItem).toBeVisible()
  await expect(lastItem).toHaveId('TreeItemActive')
}
