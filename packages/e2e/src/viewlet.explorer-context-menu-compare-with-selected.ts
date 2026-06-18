import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-context-menu-compare-with-selected'

export const test: Test = async ({ ContextMenu, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'left')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'right')
  await Workspace.setPath(tmpDir)
  await Explorer.openContextMenu(0)
  await ContextMenu.selectItem('Select for Compare')

  // act
  await Explorer.openContextMenu(1)
  await ContextMenu.selectItem('Compare with Selected')

  // assert
  const diffEditor = Locator('.DiffEditor')
  await expect(diffEditor).toBeVisible()
}
