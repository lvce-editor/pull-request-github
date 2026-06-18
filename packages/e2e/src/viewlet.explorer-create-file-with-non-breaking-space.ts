import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-with-non-breaking-space'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/file3.txt`, 'content 3')

  await Workspace.setPath(tmpDir)

  // act
  await Explorer.newFile()

  // assert
  const inputBox = Locator('input')
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()

  // act
  const fileName = `my\u00A0file.txt`
  await Explorer.updateEditingValue(fileName)
  await Explorer.acceptEdit()

  // assert
  const dirents = await FileSystem.readDir(tmpDir)
  const hasCreatedFile = dirents.some((dirent) => dirent.name === fileName)
  if (!hasCreatedFile) {
    throw new Error(`Expected directory to contain ${JSON.stringify(fileName)} but got ${JSON.stringify(dirents)}`)
  }
}
