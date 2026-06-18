import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-file'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await Workspace.setPath(tmpDir)
  await Explorer.focusFirst()

  // act
  await Explorer.removeDirent()

  // assert
  const file1 = Locator('text=file1.txt')
  await expect(file1).toBeHidden()
}
