import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-error-permission-denied-escape-then-create-again'

export const test: Test = async ({ expect, Explorer, Extension, FileSystem, Locator, Workspace }) => {
  // arrange
  const uri = import.meta.resolve('../fixtures/sample.file-system-provider-create-file-error-permission-denied')
  await Extension.addWebExtension(uri)
  const prefix = 'extension-host://xyz://'
  await FileSystem.writeFile(`${prefix}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${prefix}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${prefix}/file3.txt`, 'content 3')
  await Workspace.setPath(`${prefix}/`)

  const inputBox = Locator('input')
  const errorMessage = Locator('.ExplorerErrorMessage')
  const items = Locator('.TreeItem')

  // act
  await Explorer.newFile()
  await Explorer.updateEditingValue('file4.txt')
  await Explorer.acceptEdit()

  // assert
  await expect(inputBox).toHaveClass('InputValidationError')
  await expect(errorMessage).toBeVisible()
  await expect(errorMessage).toHaveText('Error: Failed to execute file system provider: Permission Denied')

  // act
  await Explorer.cancelEdit()

  // assert
  await expect(inputBox).toBeHidden()
  await expect(items).toHaveCount(3)

  // act
  await Explorer.newFile()

  // assert
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()
  await expect(inputBox).toHaveValue('')
  await expect(errorMessage).toBeHidden()
  await expect(items).toHaveCount(4)
}
