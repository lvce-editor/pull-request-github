import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-opens-in-editor'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.newFile()

  // assert - input box is visible
  const inputBox = Locator('input')
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()

  // act - create new file
  await Explorer.updateEditingValue('new-file.txt')
  await Explorer.acceptEdit()

  // assert - file is visible in explorer
  const newFile = Locator('.Explorer').locator('text=new-file.txt')
  await expect(newFile).toBeVisible()

  // assert - input should be hidden after accepting
  await expect(inputBox).toBeHidden()

  // assert - file should be opened in editor (check for editor tab or editor view)
  // The file should be opened, which means there should be an editor tab or editor content visible
  const editorTab = Locator('[title*="new-file.txt"]').first()
  await expect(editorTab).toBeVisible()
}
