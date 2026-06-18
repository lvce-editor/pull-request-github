import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-long-file-name'

export const test: Test = async ({ expect, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  const fileName = `a`.repeat(100) + '.txt'
  await FileSystem.writeFile(`${tmpDir}/${fileName}`, '')

  // act
  await Workspace.setPath(tmpDir)

  // assert
  const newFile = Locator(`text=${fileName}`)
  await expect(newFile).toBeVisible()
}
