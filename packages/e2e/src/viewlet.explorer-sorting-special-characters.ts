import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-sorting-special-characters'

export const test: Test = async ({ expect, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/-file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/!file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/(file).txt`, '')
  await FileSystem.writeFile(`${tmpDir}/[file].txt`, '')
  await FileSystem.writeFile(`${tmpDir}/{file}.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/@file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/&file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/#file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/+file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/$file.txt`, '')

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
  await expect(firstTreeItem).toHaveText('-file.txt')
  await expect(secondTreeItem).toHaveText('!file.txt')
  await expect(thirdTreeItem).toHaveText('(file).txt')
  await expect(fourthTreeItem).toHaveText('[file].txt')
  await expect(fifthTreeItem).toHaveText('{file}.txt')
  await expect(sixthTreeItem).toHaveText('@file.txt')
  await expect(seventhTreeItem).toHaveText('&file.txt')
  await expect(eighthTreeItem).toHaveText('#file.txt')
  await expect(ninthTreeItem).toHaveText('+file.txt')
  await expect(tenthTreeItem).toHaveText('$file.txt')
}
