import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-delete-file-error'

export const test: Test = async ({ Dialog, expect: _expect, Explorer, Extension, FileSystem, Locator: _Locator, Workspace }) => {
  // arrange
  // @ts-ignore
  let _message: string = ''
  // @ts-ignore
  await Dialog.mockConfirm((message: string) => {
    _message = message
    return true
  })
  const uri = import.meta.resolve('../fixtures/sample.file-system-provider-delete-file-error')
  await Extension.addWebExtension(uri)
  const prefix = 'extension-host://xyz://'
  await FileSystem.writeFile(`${prefix}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${prefix}/file2.txt`, 'content 2')
  await FileSystem.writeFile(`${prefix}/file3.txt`, 'content 3')
  await Workspace.setPath(prefix)
  await Explorer.focusFirst()

  // act
  await Explorer.removeDirent()

  // assert
  const expectedMessage = 'Error: Failed to execute file system provider: oops'
  if (_message !== expectedMessage) {
    throw new Error(`expected confirm message to be `)
  }
}
