import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-inside-closed-folder'

export const skip = 1

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/folder1`)
  await FileSystem.writeFile(`${tmpDir}/folder1/existing.txt`, 'content')
  await FileSystem.mkdir(`${tmpDir}/folder2`)
  await FileSystem.mkdir(`${tmpDir}/folder2/nested`)
  await FileSystem.writeFile(`${tmpDir}/folder2/nested/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(1)

  // act
  await Explorer.newFile()

  // assert
  const folder2 = Locator('.Explorer').locator('text=folder2')
  await expect(folder2).toBeVisible()
  await expect(folder2).toHaveAttribute('aria-expanded', 'true')
  const newFile = Locator('.Explorer').locator('text=created.txt')
  await expect(newFile).toBeVisible()
}
