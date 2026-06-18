import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-long-file-name-500-emoji'

export const test: Test = async ({ expect, Extension, FileSystem, Locator, Workspace }) => {
  // arrange
  const uri = import.meta.resolve('../fixtures/sample.file-system-provider-permission')
  await Extension.addWebExtension(uri)
  const prefix = 'extension-host://xyz://'
  const fileName = `${'😀'.repeat(500)}.txt`
  await FileSystem.writeFile(`${prefix}/${fileName}`, '')

  // act
  await Workspace.setPath(`${prefix}/`)

  // assert
  const treeItems = Locator('.TreeItem')
  const firstTreeItem = treeItems.nth(0)
  await expect(treeItems).toHaveCount(1)
  await expect(firstTreeItem).toContainText(fileName)
}
