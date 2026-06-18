import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-rename-folder-nested'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.mkdir(`${tmpDir}/a/b`)
  await FileSystem.mkdir(`${tmpDir}/a/b/c`)
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, '')
  await Workspace.setPath(tmpDir)
  await Explorer.expandRecursively()

  // act
  await Explorer.focusIndex(1)
  await Explorer.renameDirent()

  // assert
  const inputBox = Locator('input')
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()

  // act
  await Explorer.updateEditingValue('d')
  await Explorer.acceptEdit()

  // assert
  const file1 = Locator('.TreeItem').nth(0)
  await expect(file1).toHaveText('a')
  const file2 = Locator('.TreeItem').nth(1)
  await expect(file2).toHaveText('d')
  const file3 = Locator('.TreeItem').nth(2)
  await expect(file3).toHaveText('c')
  const file4 = Locator('.TreeItem').nth(3)
  await expect(file4).toHaveText('file1.txt')

  // TODO folder d should be expanded
}
