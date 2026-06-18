import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-deeply-nested-folders'

const depth = 1200

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  let currentPath = tmpDir
  for (let i = 0; i < depth; i++) {
    currentPath = `${currentPath}/a`
    await FileSystem.mkdir(currentPath)
  }
  await FileSystem.writeFile(`${currentPath}/deep-file.txt`, 'deep')

  await Workspace.setPath(tmpDir)
  await Explorer.focusFirst()

  // act
  await Explorer.expandRecursively()
  await Explorer.focusIndex(depth)

  // assert
  const deepFile = Locator('.TreeItem', { hasText: 'deep-file.txt' })
  await expect(deepFile).toBeVisible()
  await expect(deepFile).toHaveId('TreeItemActive')
}
