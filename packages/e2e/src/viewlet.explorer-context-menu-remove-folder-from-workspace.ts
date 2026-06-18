import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-context-menu-remove-folder-from-workspace'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await Workspace.setPath(tmpDir)

  // act
  await Explorer.openContextMenu(-1)

  // assert
  const menuItem = Locator('text=Remove folder from workspace')
  await expect(menuItem).toBeVisible()
}
