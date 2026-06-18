import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-switch-folders'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.mkdir(`${tmpDir}/b`)
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await Workspace.setPath(tmpDir)

  // act - start creating file in folder a
  await Explorer.focusIndex(0) // focus on folder a
  await Explorer.newFile()

  // assert - input should be visible in folder a
  const inputBox = Locator('input')
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()

  // act - type some content for the file in folder a
  await inputBox.type('file-in-a.txt')

  // act - switch to folder b and start creating file there
  await Explorer.focusIndex(1) // focus on folder b
  await Explorer.newFile()

  // assert - only one input should be visible (the new one in folder b)
  const inputBoxes = Locator('input')
  await expect(inputBoxes).toHaveCount(1)
  await expect(inputBoxes).toBeVisible()
  await expect(inputBoxes).toBeFocused()

  // act - type content for the file in folder b
  await inputBoxes.type('file-in-b.txt')
  await Explorer.updateEditingValue('file-in-b.txt')
  await Explorer.acceptEdit()

  // assert - file should be created in folder b
  const newFile = Locator('.Explorer').locator('text=file-in-b.txt')
  await expect(newFile).toBeVisible()

  // assert - no input should be visible after accepting
  await expect(inputBoxes).toBeHidden()
}
