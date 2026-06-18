import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-sorting-emojis'

export const test: Test = async ({ expect, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/🚀 rocket.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/🌟 star.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/💎 diamond.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/🔥 fire.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/⚡ lightning.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/🌈 rainbow.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/🎯 target.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/💡 idea.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/🚀🚀 double-rocket.txt`, '')
  await FileSystem.writeFile(`${tmpDir}/a-normal-file.txt`, '')

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
  await expect(firstTreeItem).toHaveText('⚡ lightning.txt')
  await expect(secondTreeItem).toHaveText('🌈 rainbow.txt')
  await expect(thirdTreeItem).toHaveText('🌟 star.txt')
  await expect(fourthTreeItem).toHaveText('🎯 target.txt')
  await expect(fifthTreeItem).toHaveText('💎 diamond.txt')
  await expect(sixthTreeItem).toHaveText('💡 idea.txt')
  await expect(seventhTreeItem).toHaveText('🔥 fire.txt')
  await expect(eighthTreeItem).toHaveText('🚀 rocket.txt')
  await expect(ninthTreeItem).toHaveText('🚀🚀 double-rocket.txt')
  await expect(tenthTreeItem).toHaveText('a-normal-file.txt')
}
