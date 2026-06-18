import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-double-click-empty-space'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await Workspace.setPath(tmpDir)

  // act
  await Command.execute('Explorer.handleClickAt', false, 0, false, false, 20, 100)
  await Command.execute('Explorer.handleDoubleClick', 20, 100)

  // assert
  const inputBox = Locator('.Explorer input')
  await expect(inputBox).toBeVisible()
  await expect(inputBox).toBeFocused()
}
