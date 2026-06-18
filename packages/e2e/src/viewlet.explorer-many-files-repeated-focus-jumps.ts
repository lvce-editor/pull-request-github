import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-many-files-repeated-focus-jumps'

const totalFiles = 2000
const batchSize = 250

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  for (let start = 0; start < totalFiles; start += batchSize) {
    const end = Math.min(start + batchSize, totalFiles)
    await Promise.all(
      Array.from({ length: end - start }, (_, index) => {
        const number = start + index
        const fileName = `file-${number.toString().padStart(4, '0')}.txt`
        return FileSystem.writeFile(`${tmpDir}/${fileName}`, `content ${number}`)
      }),
    )
  }
  await Workspace.setPath(tmpDir)

  const indices = [0, 250, 1999, 125, 1500, 1, 1998]

  for (const index of indices) {
    const fileName = `file-${index.toString().padStart(4, '0')}.txt`
    const file = Locator('.TreeItem', { hasText: fileName })
    await Explorer.focusIndex(index)
    await expect(file).toBeVisible()
    await expect(file).toHaveId('TreeItemActive')
  }
}
