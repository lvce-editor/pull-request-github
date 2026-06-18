import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-rename-file-special-characters'

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/original1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/original2.txt`, 'content 2')
  await FileSystem.writeFile(`${tmpDir}/original3.txt`, 'content 3')
  await FileSystem.writeFile(`${tmpDir}/original4.txt`, 'content 4')
  await FileSystem.writeFile(`${tmpDir}/original5.txt`, 'content 5')

  await Workspace.setPath(tmpDir)

  // Test 1: Rename file to include brackets and parentheses
  const explorer1 = Locator('.Explorer')
  await Explorer.focusIndex(0)
  await Explorer.renameDirent()
  const inputBox1 = explorer1.locator('input')
  await expect(inputBox1).toBeVisible()
  await expect(inputBox1).toBeFocused()
  await Explorer.updateEditingValue('renamed[1](test).txt')
  await Explorer.acceptEdit()
  const renamedFile1 = Locator('text=renamed[1](test).txt')
  await expect(renamedFile1).toBeVisible()

  // Test 2: Rename file to include special symbols
  const explorer2 = Locator('.Explorer')
  await Explorer.focusIndex(0)
  await Explorer.renameDirent()
  const inputBox2 = explorer2.locator('input')
  await expect(inputBox2).toBeVisible()
  await expect(inputBox2).toBeFocused()
  await Explorer.updateEditingValue('special@#$%&.txt')
  await Explorer.acceptEdit()
  const renamedFile2 = Locator('text=special@#$%&.txt')
  await expect(renamedFile2).toBeVisible()

  // Test 3: Rename file to include Unicode characters
  const explorer3 = Locator('.Explorer')
  await Explorer.focusIndex(0)
  await Explorer.renameDirent()
  const inputBox3 = explorer3.locator('input')
  await expect(inputBox3).toBeVisible()
  await expect(inputBox3).toBeFocused()
  await Explorer.updateEditingValue('файл.txt')
  await Explorer.acceptEdit()
  const renamedFile3 = Locator('text=файл.txt')
  await expect(renamedFile3).toBeVisible()

  // Test 4: Rename file to include emoji
  const explorer4 = Locator('.Explorer')
  await Explorer.focusIndex(0)
  await Explorer.renameDirent()
  const inputBox4 = explorer4.locator('input')
  await expect(inputBox4).toBeVisible()
  await expect(inputBox4).toBeFocused()
  await Explorer.updateEditingValue('🎉 celebration.txt')
  await Explorer.acceptEdit()
  const renamedFile4 = Locator('text=🎉 celebration.txt')
  await expect(renamedFile4).toBeVisible()

  // Test 5: Rename file to include mixed characters
  const explorer5 = Locator('.Explorer')
  await Explorer.focusIndex(0)
  await Explorer.renameDirent()
  const inputBox5 = explorer5.locator('input')
  await expect(inputBox5).toBeVisible()
  await expect(inputBox5).toBeFocused()
  await Explorer.updateEditingValue('mixéd-🌟-file@123.txt')
  await Explorer.acceptEdit()
  const renamedFile5 = Locator('text=mixéd-🌟-file@123.txt')
  await expect(renamedFile5).toBeVisible()
}
