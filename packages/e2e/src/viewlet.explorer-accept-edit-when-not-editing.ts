import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-accept-edit-when-not-editing'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')

  await Workspace.setPath(tmpDir)

  // act - call acceptEdit when not in editing mode
  await Explorer.acceptEdit()

  // assert - should not cause any errors and explorer should remain unchanged
  const items = Locator('.TreeItem')
  await expect(items).toHaveCount(3)

  const file1 = Locator('text=file1.txt')
  await expect(file1).toBeVisible()

  const file2 = Locator('text=file2.txt')
  await expect(file2).toBeVisible()

  const file3 = Locator('text=file3.txt')
  await expect(file3).toBeVisible()

  // assert - no input box should be visible since we're not in editing mode
  const inputBox = Locator('input')
  await expect(inputBox).toBeHidden()
}
