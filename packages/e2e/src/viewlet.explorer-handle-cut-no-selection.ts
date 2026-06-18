import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-handle-cut-no-selection'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file-1.txt`, 'a')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(-1)

  // act
  await Explorer.handleCut()

  // assert
  const file1 = Locator('.TreeItem', { hasText: 'file-1.txt' })
  await expect(file1).toHaveClass('TreeItem')
}
