import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-open-folder-enoent-error'

export const skip = 1

export const test: Test = async ({ Command, expect, FileSystem, Locator, SideBar, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  const missingFolder = `${tmpDir}/missing-folder`
  await Workspace.setPath(missingFolder)
  await SideBar.hide()

  // act
  await Command.execute('Layout.showSideBar')

  // assert
  const error = Locator('.Explorer .WelcomeMessage')
  await expect(error).toBeVisible()
  await expect(error).toHaveText(`Could not open "${missingFolder}" because the folder does not exist. It may have been moved or deleted.`)

  const openAnotherFolderButton = Locator('.Explorer .Button')
  await expect(openAnotherFolderButton).toBeVisible()
  await expect(openAnotherFolderButton).toHaveText('Open another folder')
}
