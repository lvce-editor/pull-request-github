import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-refresh'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')

  // act
  await Workspace.setPath(tmpDir)

  // assert
  const file1 = Locator('.TreeItem[aria-label="file1.txt"]')
  await expect(file1).toBeVisible()

  // act
  await FileSystem.remove(`${tmpDir}/file1.txt`)
  await Explorer.refresh()

  // assert
  await expect(file1).toBeHidden()
}
