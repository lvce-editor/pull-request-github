import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-rename-root-folder-no-indent-shift'

export const test: Test = async ({ expect, Explorer, Extension, FileSystem, IconTheme, Locator, Settings, Workspace }) => {
  // arrange
  await Settings.update({
    'explorer.useChevrons': true,
  })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/folder-a`)
  await FileSystem.writeFile(`${tmpDir}/file.txt`, '')
  await Workspace.setPath(tmpDir)
  const extensionUri = import.meta.resolve('../fixtures/sample.icon-theme')
  await Extension.addWebExtension(extensionUri)
  await IconTheme.setIconTheme('test-icon-theme')

  const folder = Locator('.TreeItem').nth(0)
  await expect(folder).toHaveText('folder-a')

  // act
  await Explorer.focusIndex(0)

  // assert
  await expect(folder).toHaveJSProperty('className', 'TreeItem Indent-12 TreeItemActive')

  // act
  await Explorer.renameDirent()

  // assert
  const inputBox = Locator('input')
  await expect(inputBox).toBeVisible()
  await expect(folder).toHaveJSProperty('className', 'TreeItem Indent-12 TreeItemActive')
}
