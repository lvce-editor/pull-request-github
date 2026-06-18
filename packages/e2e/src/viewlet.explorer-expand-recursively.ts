// TODO maybe merge this test with the other explorer test, less end to end tests will run faster

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-expand-recursively'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a/b`)
  await FileSystem.writeFile(`${tmpDir}/a/b/c.txt`, 'ccccc')
  await FileSystem.mkdir(`${tmpDir}/folder-1`)
  await FileSystem.mkdir(`${tmpDir}/folder-2`)
  await FileSystem.mkdir(`${tmpDir}/folder-3`)
  await FileSystem.writeFile(`${tmpDir}/test.txt`, 'div')
  await Workspace.setPath(tmpDir)
  await Explorer.focusFirst()

  // act
  await Explorer.expandRecursively()

  // assert
  const treeItems = Locator('.TreeItem')
  const firstTreeItem = treeItems.nth(0)
  const secondTreeItem = treeItems.nth(1)
  const thirdTreeItem = treeItems.nth(2)
  await expect(firstTreeItem).toHaveText('a')
  await expect(secondTreeItem).toHaveText('b')
  await expect(thirdTreeItem).toHaveText('c.txt')
}
