import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-rename-file-150-times'

const renameCount = 150

const getFileName = (index: number): string => {
  return `file-${index.toString().padStart(3, '0')}.txt`
}

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/${getFileName(0)}`, 'content')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)

  const explorer = Locator('.Explorer')
  const inputBox = explorer.locator('input')

  let currentFileName = getFileName(0)

  // act
  for (let i = 1; i <= renameCount; i++) {
    await Explorer.renameDirent()
    await expect(inputBox).toHaveValue(currentFileName)

    const nextFileName = getFileName(i)
    await Explorer.updateEditingValue(nextFileName)
    await Explorer.acceptEdit()

    const renamedFile = Locator('.TreeItem', { hasText: nextFileName })
    await expect(renamedFile).toBeVisible()
    await expect(renamedFile).toHaveId('TreeItemActive')

    currentFileName = nextFileName
  }

  // assert
  const finalFile = Locator('.TreeItem', { hasText: getFileName(renameCount) })
  const originalFile = Locator('.TreeItem', { hasText: getFileName(0) })
  await expect(inputBox).toBeHidden()
  await expect(finalFile).toBeVisible()
  await expect(finalFile).toHaveId('TreeItemActive')
  await expect(originalFile).toBeHidden()
}
