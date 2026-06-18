import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-nested-middle-folder'

export const skip = 1

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a/b/c/d`)
  await FileSystem.writeFile(`${tmpDir}/a/b/c/d/e.txt`, 'deep')
  await Workspace.setPath(tmpDir)

  const topLevelFolder = Locator(`.TreeItem[title$="/a"]`)
  const parentFolder = Locator(`.TreeItem[title$="/a/b"]`)
  const deletedFolder = Locator(`.TreeItem[title$="/a/b/c"]`)
  const deletedChildFolder = Locator(`.TreeItem[title$="/a/b/c/d"]`)
  const deletedDescendantFile = Locator(`.TreeItem[title$="/a/b/c/d/e.txt"]`)

  await Explorer.focusFirst()
  await Explorer.expandRecursively()
  await Explorer.focusIndex(2)

  // act
  await Explorer.removeDirent()

  // assert
  await expect(topLevelFolder).toBeVisible()
  await expect(parentFolder).toHaveId('TreeItemActive')
  await expect(deletedFolder).toBeHidden()
  await expect(deletedChildFolder).toBeHidden()
  await expect(deletedDescendantFile).toBeHidden()
}
