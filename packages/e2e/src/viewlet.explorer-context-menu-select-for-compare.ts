import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-context-menu-select-for-compare'

export const test: Test = async ({ ContextMenu, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')
  await Workspace.setPath(tmpDir)
  await Explorer.openContextMenu(0)
  await ContextMenu.selectItem('Select for Compare')

  // act
  await Explorer.openContextMenu(1)

  // assert
  const compareWithSelected = Locator('text=Compare with Selected')
  await expect(compareWithSelected).toBeVisible()
}
