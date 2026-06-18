import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-drop-folder-empty-workspace'

export const test: Test = async ({ Command, expect, Explorer, Locator, Workspace }) => {
  // arrange
  await Workspace.setPath('')
  const opfsRoot = await navigator.storage.getDirectory()
  const directoryHandle = await opfsRoot.getDirectoryHandle('dropped-workspace-folder', {
    create: true,
  })
  const nestedFileHandle = await directoryHandle.getFileHandle('inside.txt', {
    create: true,
  })
  const writable = await nestedFileHandle.createWritable({ keepExistingData: false })
  await writable.write('hello world')
  await writable.close()
  const id = await Command.execute('FileSystemHandle.addFileHandle', directoryHandle)
  const welcomeMessage = Locator('.Explorer .WelcomeMessage')

  // act
  await Explorer.handleDrop(5000, 5000, [id], [])

  // assert
  await expect(welcomeMessage).toBeHidden()
  const nestedFile = Locator('.TreeItem[aria-label="inside.txt"]')
  await expect(nestedFile).toBeVisible()
}
