import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-ignored-file-decoration-invalid-null'

export const test: Test = async ({ expect, Extension, FileSystem, Locator, Settings, Workspace }) => {
  // arrange
  await Settings.update({
    'explorer.sourceControlDecorations': true,
  })
  const uri = import.meta.resolve('../fixtures/sample.source-control-decoration-invalid-null')
  await Extension.addWebExtension(uri)
  const tmpDir = 'extension-host://xyz://'
  await FileSystem.writeFile(`${tmpDir}/a`, '')
  await FileSystem.writeFile(`${tmpDir}/b`, '')
  await FileSystem.writeFile(`${tmpDir}/.gitignore`, 'a')

  // act
  await Workspace.setPath(tmpDir)

  // assert
  const a = Locator('.TreeItem[aria-label="a"]')
  await expect(a).toBeVisible()
}
