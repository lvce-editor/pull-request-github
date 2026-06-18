import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-folder-nested-150-times'

const depth = 150

const getFolderName = (index: number): string => {
  return `folder-${index.toString().padStart(3, '0')}`
}

export const skip = 1

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await Workspace.setPath(tmpDir)

  const inputBox = Locator('input')

  // act
  for (let index = 0; index < depth; index++) {
    const folderName = getFolderName(index)

    if (index > 0) {
      await Explorer.focusIndex(index - 1)
    }
    await Explorer.newFolder()
    await expect(inputBox).toBeVisible()
    await expect(inputBox).toBeFocused()
    await Explorer.updateEditingValue(folderName)
    await Explorer.acceptEdit()
    await expect(inputBox).toBeHidden()
  }

  // assert
  const treeItems = Locator('.TreeItem')
  await expect(treeItems).toHaveCount(depth + 1)

  const deepestFolder = Locator('.TreeItem', { hasText: getFolderName(depth - 1) })
  await expect(deepestFolder).toBeVisible()

  let currentPath = tmpDir
  for (let index = 0; index < depth; index++) {
    const folderName = getFolderName(index)
    const dirents = await FileSystem.readDir(currentPath)
    const hasFolder = dirents.some((dirent) => dirent.name === folderName)
    if (!hasFolder) {
      throw new Error(`Expected ${JSON.stringify(currentPath)} to contain ${JSON.stringify(folderName)} but got ${JSON.stringify(dirents)}`)
    }
    currentPath = `${currentPath}/${folderName}`
  }
}
