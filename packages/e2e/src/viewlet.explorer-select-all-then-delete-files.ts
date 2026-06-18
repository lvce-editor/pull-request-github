import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-select-all-then-delete-files'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  for (let index = 0; index < 10; index++) {
    await FileSystem.writeFile(`${tmpDir}/file-${index}.txt`, `content ${index}`)
  }
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(9)

  // act
  await Explorer.selectAll()
  await Explorer.removeDirent()

  // assert
  const treeItems = Locator('.TreeItem')
  await expect(treeItems).toHaveCount(0)
}
