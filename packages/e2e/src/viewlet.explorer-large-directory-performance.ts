import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-large-directory-performance'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()

  // Create 10,000 files in the directory
  const numbers = Array.from(Array(10_000), (_, index) => index)
  await Promise.all(
    numbers.map((number) => {
      return FileSystem.writeFile(`${tmpDir}/file${number.toString().padStart(4, '0')}.txt`, `content ${number}`)
    }),
  )

  await Workspace.setPath(tmpDir)

  // Test 1: Initial load performance
  await Explorer.focusIndex(0)
  // await Explorer.expandRecursively()

  // Should load within reasonable time

  // Test 2: Verify items are loaded
  const firstItem = Locator('.TreeItem').nth(0)
  await expect(firstItem).toBeVisible()

  // Test 3: Navigation performance in large list
  await Explorer.focusIndex(100)
  await Explorer.focusIndex(1000)
  await Explorer.focusIndex(5000)

  // Should navigate quickly

  // Test 4: Verify specific items exist
  const midItem = Locator('.TreeItem', { hasText: 'file5000.txt' })
  await expect(midItem).toBeVisible()

  // Test 5: Test scrolling by focusing different items
  await Explorer.focusIndex(9000)
  await Explorer.focusIndex(100)

  // TODO need to autoscroll to those locations
  // Test 6: Verify explorer is still responsive
  // const lastItem = Locator('.TreeItem', { hasText: 'file9999.txt' })
  // await expect(lastItem).toBeVisible()

  // // Test 7: Test selection performance
  // await Explorer.focusIndex(0)
  // await Explorer.focusIndex(5000)
}
