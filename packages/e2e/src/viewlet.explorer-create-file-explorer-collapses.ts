import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-explorer-collapses'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')
  await Workspace.setPath(tmpDir)
  await Explorer.newFile()
  const inputBox = Locator('input')
  await Explorer.updateEditingValue('test-file.txt')

  // act
  await Explorer.collapseAll()

  // assert
  await expect(inputBox).toBeHidden()

  // TODO focus should be at on tree
}
