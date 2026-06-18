import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-sorting-unicode-characters'

export const test: Test = async ({ expect, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/café.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/naïve.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/résumé.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/piñata.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/jalapeño.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/façade.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/séance.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/déjà.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/château.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/soirée.txt`, '')

  // act
  await Workspace.setPath(tmpDir)

  // assert
  const treeItems = Locator('.TreeItem')
  const firstTreeItem = treeItems.nth(0)
  const secondTreeItem = treeItems.nth(1)
  const thirdTreeItem = treeItems.nth(2)
  const fourthTreeItem = treeItems.nth(3)
  const fifthTreeItem = treeItems.nth(4)
  const sixthTreeItem = treeItems.nth(5)
  const seventhTreeItem = treeItems.nth(6)
  const eighthTreeItem = treeItems.nth(7)
  const ninthTreeItem = treeItems.nth(8)
  const tenthTreeItem = treeItems.nth(9)
  await expect(treeItems).toHaveCount(10)
  await expect(firstTreeItem).toHaveText('café.txt')
  await expect(secondTreeItem).toHaveText('château.txt')
  await expect(thirdTreeItem).toHaveText('déjà.txt')
  await expect(fourthTreeItem).toHaveText('façade.txt')
  await expect(fifthTreeItem).toHaveText('jalapeño.txt')
  await expect(sixthTreeItem).toHaveText('naïve.txt')
  await expect(seventhTreeItem).toHaveText('piñata.txt')
  await expect(eighthTreeItem).toHaveText('résumé.txt')
  await expect(ninthTreeItem).toHaveText('séance.txt')
  await expect(tenthTreeItem).toHaveText('soirée.txt')
}
