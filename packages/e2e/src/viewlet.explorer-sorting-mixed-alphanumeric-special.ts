import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-sorting-mixed-alphanumeric-special'

export const test: Test = async ({ expect, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/1file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/a-file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/b_file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/file@10.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/file#2.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/file$3.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/z-file.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/10file.txt`, '')

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
  await expect(firstTreeItem).toHaveText('1file.txt')
  await expect(secondTreeItem).toHaveText('10file.txt')
  await expect(thirdTreeItem).toHaveText('a-file.txt')
  await expect(fourthTreeItem).toHaveText('b_file.txt')
  await expect(fifthTreeItem).toHaveText('file@10.txt')
  await expect(sixthTreeItem).toHaveText('file#2.txt')
  await expect(seventhTreeItem).toHaveText('file$3.txt')
  await expect(eighthTreeItem).toHaveText('file1.txt')
  await expect(ninthTreeItem).toHaveText('file2.txt')
  await expect(tenthTreeItem).toHaveText('z-file.txt')
}
