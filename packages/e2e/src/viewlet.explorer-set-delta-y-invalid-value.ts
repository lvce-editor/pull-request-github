import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-set-delta-y-invalid-value'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  for (let i = 0; i < 30; i++) {
    const fileName = `file-${i.toString().padStart(2, '0')}.txt`
    await FileSystem.writeFile(`${tmpDir}/${fileName}`, '')
  }
  await Workspace.setPath(tmpDir)
  const file00 = Locator('.TreeItem', { hasText: 'file-00.txt' })

  // act
  await Explorer.setDeltaY('invalid' as any)

  // assert
  await expect(file00).toBeVisible()

  await Explorer.focusIndex(29)

  // assert
  const file29 = Locator('.TreeItem', { hasText: 'file-29.txt' })
  await expect(file29).toBeVisible()
  await expect(file29).toHaveId('TreeItemActive')
}
