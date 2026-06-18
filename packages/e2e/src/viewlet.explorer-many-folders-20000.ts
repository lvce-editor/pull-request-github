import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-many-folders-20000'

const totalFolders = 20_000
const batchSize = 500

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  for (let start = 0; start < totalFolders; start += batchSize) {
    const end = Math.min(start + batchSize, totalFolders)
    await Promise.all(
      Array.from({ length: end - start }, (_, index) => {
        const number = start + index
        const folderName = `folder-${number.toString().padStart(5, '0')}`
        return FileSystem.mkdir(`${tmpDir}/${folderName}`)
      }),
    )
  }

  await Workspace.setPath(tmpDir)

  // act
  await Explorer.focusIndex(0)

  // assert
  const firstFolder = Locator('.TreeItem', { hasText: 'folder-00000' })
  await expect(firstFolder).toBeVisible()
  await expect(firstFolder).toHaveId('TreeItemActive')

  // act
  await Explorer.focusIndex(10_000)

  // assert
  const middleFolder = Locator('.TreeItem', { hasText: 'folder-10000' })
  await expect(middleFolder).toBeVisible()
  await expect(middleFolder).toHaveId('TreeItemActive')

  // act
  await Explorer.focusIndex(19_999)

  // assert
  const lastFolder = Locator('.TreeItem', { hasText: 'folder-19999' })
  await expect(lastFolder).toBeVisible()
  await expect(lastFolder).toHaveId('TreeItemActive')
}
