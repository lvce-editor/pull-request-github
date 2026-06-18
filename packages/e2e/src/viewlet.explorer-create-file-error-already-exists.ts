import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-error-already-exists'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await Workspace.setPath(tmpDir)
  await Explorer.newFile()

  // act
  await Explorer.updateEditingValue('file1.txt')

  // assert
  const inputBox = Locator('input')
  await expect(inputBox).toHaveClass('InputValidationError')
  const errorMessage = Locator('.ExplorerErrorMessage')
  await expect(errorMessage).toBeVisible()
  await expect(errorMessage).toHaveText(`A file or folder **file1.txt** already exists at this location. Please choose a different name.`)
}
