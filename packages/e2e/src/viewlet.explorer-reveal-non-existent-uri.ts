import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-reveal-non-existent-uri'

export const skip = 1

export const test: Test = async ({ Command, expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await Workspace.setPath(tmpDir)

  await Explorer.newFile()
  await Explorer.updateEditingValue('first.txt')
  await Explorer.acceptEdit()

  await Explorer.newFile()
  await Explorer.updateEditingValue('second.txt')
  await Explorer.acceptEdit()

  const explorer = Locator('.Explorer')
  const firstFile = Locator('.TreeItem[aria-label="first.txt"]')
  const secondFile = Locator('.TreeItem[aria-label="second.txt"]')
  await expect(explorer).toBeVisible()
  await expect(firstFile).toBeVisible()
  await expect(secondFile).toBeVisible()

  // act
  await Command.execute('Explorer.reveal', 'non-existent:///some-file.txt')

  // assert
  await expect(explorer).toBeVisible()
  await expect(firstFile).toBeVisible()
  await expect(secondFile).toBeVisible()
}
