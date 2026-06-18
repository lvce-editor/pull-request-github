import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-click-empty-space-clears-selection'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await Workspace.setPath(tmpDir)
  await Explorer.selectIndices([0])

  const focusedListItems = Locator('.Explorer .ListItems.FocusOutline')
  const file1 = Locator('.TreeItem').nth(0)
  const file2 = Locator('.TreeItem').nth(1)

  // act
  await Explorer.handleClickAt(false, 0, false, false, 20, 10_000)

  // assert
  await expect(focusedListItems).toBeVisible()
  await expect(file1).toHaveClass('TreeItem')
  await expect(file2).toHaveClass('TreeItem')
}
