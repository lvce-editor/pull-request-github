import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-folder-with-items'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/folder-1`)
  await FileSystem.writeFile(`${tmpDir}/folder-1/a.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/folder-1/b.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/folder-1/c.txt`, '')
  await FileSystem.mkdir(`${tmpDir}/folder-2`)
  await FileSystem.mkdir(`${tmpDir}/folder-3`)
  await Workspace.setPath(tmpDir)
  await Explorer.focusFirst()
  await Explorer.expandAll()

  // act
  await Explorer.removeDirent()

  // assert
  const fileA = Locator('text=a.txt')
  const fileB = Locator('text=a.txt')
  const fileC = Locator('text=a.txt')
  await expect(fileA).toBeHidden()
  await expect(fileB).toBeHidden()
  await expect(fileC).toBeHidden()
}
