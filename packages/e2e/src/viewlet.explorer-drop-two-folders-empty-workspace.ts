import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-drop-two-folders-empty-workspace'

export const test: Test = async ({ Command, expect, Explorer, Locator, Workspace }) => {
  // arrange
  await Workspace.setPath('')
  const opfsRoot = await navigator.storage.getDirectory()
  const firstDirectoryHandle = await opfsRoot.getDirectoryHandle('first-dropped-workspace-folder', {
    create: true,
  })
  const firstNestedFileHandle = await firstDirectoryHandle.getFileHandle('first-inside.txt', {
    create: true,
  })
  const firstWritable = await firstNestedFileHandle.createWritable({ keepExistingData: false })
  await firstWritable.write('first')
  await firstWritable.close()
  const secondDirectoryHandle = await opfsRoot.getDirectoryHandle('second-dropped-workspace-folder', {
    create: true,
  })
  const secondNestedFileHandle = await secondDirectoryHandle.getFileHandle('second-inside.txt', {
    create: true,
  })
  const secondWritable = await secondNestedFileHandle.createWritable({ keepExistingData: false })
  await secondWritable.write('second')
  await secondWritable.close()
  const firstId = await Command.execute('FileSystemHandle.addFileHandle', firstDirectoryHandle)
  const secondId = await Command.execute('FileSystemHandle.addFileHandle', secondDirectoryHandle)
  const welcomeMessage = Locator('.Explorer .WelcomeMessage')
  const firstNestedFile = Locator('.TreeItem[aria-label="first-inside.txt"]')
  const secondNestedFile = Locator('.TreeItem[aria-label="second-inside.txt"]')

  // act
  await Explorer.handleDrop(5000, 5000, [firstId, secondId], [])

  // assert
  await expect(welcomeMessage).toBeHidden()
  await expect(firstNestedFile).toBeVisible()
  await expect(secondNestedFile).toHaveCount(0)
}
