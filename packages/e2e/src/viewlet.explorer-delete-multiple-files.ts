import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-multiple-files'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')

  await Workspace.setPath(tmpDir)

  const explorer = Locator('.Explorer')
  const file1 = explorer.locator('text=file1.txt')
  const file2 = explorer.locator('text=file2.txt')
  const file3 = explorer.locator('text=file3.txt')

  // act
  await Explorer.focus()

  // assert
  // TODO
  // await expect(explorer).toHaveClass('FocusOutline')
  // await expect(explorer).toBeFocused()

  // act
  await Explorer.focusIndex(2)

  // assert
  // TODO
  // await expect(file3).toHaveClass('FocusOutline')

  // act
  await Explorer.removeDirent()

  // assert
  await expect(file3).toBeHidden()
  // TODO
  // await expect(file2).toHaveClass('FocusOutline')

  // act
  await Explorer.removeDirent()
  // await KeyBoard.press('Delete')

  // assert
  await expect(file2).toBeHidden()
  // TODO
  // await expect(file1).toHaveClass('FocusOutline')

  // act
  await Explorer.removeDirent()

  // assert
  await expect(file1).toBeHidden()
  // TODO
  // await expect(explorer).toHaveClass('FocusOutline')
}
