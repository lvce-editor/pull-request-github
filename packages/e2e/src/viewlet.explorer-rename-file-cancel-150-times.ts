import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-rename-file-cancel-150-times'

const iterations = 150

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')
  await Workspace.setPath(tmpDir)

  const explorer = Locator('.Explorer')
  const inputBox = explorer.locator('input')

  // act
  for (let index = 0; index < iterations; index++) {
    await Explorer.focusIndex(1)
    await Explorer.renameDirent()
    await expect(inputBox).toBeVisible()
    await expect(inputBox).toBeFocused()
    await Explorer.cancelEdit()
    await expect(inputBox).toBeHidden()
  }

  // assert
  const file2 = Locator('.TreeItem', { hasText: 'file2.txt' })
  await expect(file2).toBeVisible()
  await expect(file2).toHaveId('TreeItemActive')
}
