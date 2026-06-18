import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-cut-and-paste-file-error-already-exists'

export const test: Test = async ({ ClipBoard, Explorer, FileSystem, Workspace }) => {
  // arrange
  await ClipBoard.enableMemoryClipBoard()
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/a`)
  await FileSystem.writeFile(`${tmpDir}/a/file.txt`, 'content')
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Explorer.focusIndex(0)
  await Explorer.expandRecursively()
  await Explorer.focusIndex(2)

  // act
  await Explorer.handleCut()
  await Explorer.focusIndex(0)
  await Explorer.handlePaste()

  // TODO should show error message that destination already exists
  // assert
  // const file1 = Locator('.TreeItem').nth(0)
  // await expect(file1).toHaveText('a')
  // await expect(file1).toHaveAttribute('aria-expanded', 'true')
  // // TODO should be hidden
  // const file2 = Locator('.TreeItem').nth(1)
  // await expect(file2).toHaveText('b')
  // await expect(file2).toHaveAttribute('aria-expanded', 'true')
  // const file3 = Locator('.TreeItem').nth(2)
  // await expect(file3).toHaveText('file.txt')
}
