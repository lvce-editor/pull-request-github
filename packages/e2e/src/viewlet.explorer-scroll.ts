import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-scroll'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  for (let i = 0; i < 100; i++) {
    const fileName = `file-${i.toString().padStart(2, '0')}.txt`
    await FileSystem.writeFile(`${tmpDir}/${fileName}`, '')
  }
  await Workspace.setPath(tmpDir)
  const file00 = Locator('.TreeItem', { hasText: 'file-00.txt' })
  const file50 = Locator('.TreeItem', { hasText: 'file-50.txt' })
  const file99 = Locator('.TreeItem', { hasText: 'file-99.txt' })

  // act
  await Explorer.focusFirst()

  // assert
  await expect(file00).toBeVisible()
  await expect(file00).toHaveId('TreeItemActive')

  // act
  await Explorer.focusIndex(50)

  // assert
  await expect(file50).toBeVisible()
  await expect(file50).toHaveId('TreeItemActive')

  // act
  await Explorer.focusIndex(99)

  // assert
  await expect(file99).toBeVisible()
  await expect(file99).toHaveId('TreeItemActive')

  // act
  await Explorer.focusFirst()

  // assert
  await expect(file00).toHaveId('TreeItemActive')
}
