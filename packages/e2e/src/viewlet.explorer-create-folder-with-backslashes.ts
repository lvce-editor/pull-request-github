import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-folder-with-backslashes'

export const test: Test = async ({ expect, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/\\eee\\`)

  // act
  await Workspace.setPath(tmpDir)

  // assert
  const newFolder = Locator('.Explorer').locator('text=\\eee\\')
  await expect(newFolder).toBeVisible()
}
