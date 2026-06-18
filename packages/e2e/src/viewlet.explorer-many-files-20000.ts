import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-many-files-20000'

const totalFiles = 20_000
const batchSize = 500

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  for (let start = 0; start < totalFiles; start += batchSize) {
    const end = Math.min(start + batchSize, totalFiles)
    await Promise.all(
      Array.from({ length: end - start }, (_, index) => {
        const number = start + index
        const fileName = `file-${number.toString().padStart(5, '0')}.txt`
        return FileSystem.writeFile(`${tmpDir}/${fileName}`, `content ${number}`)
      }),
    )
  }

  await Workspace.setPath(tmpDir)

  // act
  await Explorer.focusIndex(0)

  // assert
  const firstFile = Locator('.TreeItem', { hasText: 'file-00000.txt' })
  await expect(firstFile).toBeVisible()
  await expect(firstFile).toHaveId('TreeItemActive')

  // act
  await Explorer.focusIndex(10_000)

  // assert
  const middleFile = Locator('.TreeItem', { hasText: 'file-10000.txt' })
  await expect(middleFile).toBeVisible()
  await expect(middleFile).toHaveId('TreeItemActive')

  // act
  await Explorer.focusIndex(19_999)

  // assert
  const lastFile = Locator('.TreeItem', { hasText: 'file-19999.txt' })
  await expect(lastFile).toBeVisible()
  await expect(lastFile).toHaveId('TreeItemActive')
}
