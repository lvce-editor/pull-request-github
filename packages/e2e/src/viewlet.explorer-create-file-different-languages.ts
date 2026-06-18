import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.explorer-create-file-different-languages'

export const skip = 1

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file1.txt`, 'content 1')
  await FileSystem.writeFile(`${tmpDir}/file2.txt`, 'content 2')

  await Workspace.setPath(tmpDir)

  // Test 1: Create file with German characters
  await Explorer.newFile()
  const inputBox1 = Locator('input')
  await expect(inputBox1).toBeVisible()
  await expect(inputBox1).toBeFocused()
  await Explorer.updateEditingValue('Müller.txt')
  await Explorer.acceptEdit()
  const newFile1 = Locator('.Explorer').locator('text=Müller.txt')
  await expect(newFile1).toBeVisible()

  // Test 2: Create file with French characters
  await Explorer.newFile()
  const inputBox2 = Locator('input')
  await expect(inputBox2).toBeVisible()
  await expect(inputBox2).toBeFocused()
  await Explorer.updateEditingValue('Français.txt')
  await Explorer.acceptEdit()
  const newFile2 = Locator('.Explorer').locator('text=Français.txt')
  await expect(newFile2).toBeVisible()

  // Test 3: Create file with Spanish characters
  await Explorer.newFile()
  const inputBox3 = Locator('input')
  await expect(inputBox3).toBeVisible()
  await expect(inputBox3).toBeFocused()
  await Explorer.updateEditingValue('Niño.txt')
  await Explorer.acceptEdit()
  const newFile3 = Locator('.Explorer').locator('text=Niño.txt')
  await expect(newFile3).toBeVisible()

  // Test 4: Create file with Russian characters
  await Explorer.newFile()
  const inputBox4 = Locator('input')
  await expect(inputBox4).toBeVisible()
  await expect(inputBox4).toBeFocused()
  await Explorer.updateEditingValue('Русский.txt')
  await Explorer.acceptEdit()
  const newFile4 = Locator('.Explorer').locator('text=Русский.txt')
  await expect(newFile4).toBeVisible()

  // Test 5: Create file with Chinese characters
  await Explorer.newFile()
  const inputBox5 = Locator('input')
  await expect(inputBox5).toBeVisible()
  await expect(inputBox5).toBeFocused()
  await Explorer.updateEditingValue('中文.txt')
  await Explorer.acceptEdit()
  const newFile5 = Locator('.Explorer').locator('text=中文.txt')
  await expect(newFile5).toBeVisible()

  // Test 6: Create file with Japanese characters
  await Explorer.newFile()
  const inputBox6 = Locator('input')
  await expect(inputBox6).toBeVisible()
  await expect(inputBox6).toBeFocused()
  await Explorer.updateEditingValue('こんにちは.txt')
  await Explorer.acceptEdit()
  const newFile6 = Locator('.Explorer').locator('text=こんにちは.txt')
  await expect(newFile6).toBeVisible()

  // Test 7: Create file with Korean characters
  await Explorer.newFile()
  const inputBox7 = Locator('input')
  await expect(inputBox7).toBeVisible()
  await expect(inputBox7).toBeFocused()
  await Explorer.updateEditingValue('안녕하세요.txt')
  await Explorer.acceptEdit()
  const newFile7 = Locator('.Explorer').locator('text=안녕하세요.txt')
  await expect(newFile7).toBeVisible()

  // Test 8: Create file with Arabic characters
  await Explorer.newFile()
  const inputBox8 = Locator('input')
  await expect(inputBox8).toBeVisible()
  await expect(inputBox8).toBeFocused()
  await Explorer.updateEditingValue('العربية.txt')
  await Explorer.acceptEdit()
  const newFile8 = Locator('.Explorer').locator('text=العربية.txt')
  await expect(newFile8).toBeVisible()

  // Test 9: Create file with Hebrew characters
  await Explorer.newFile()
  const inputBox9 = Locator('input')
  await expect(inputBox9).toBeVisible()
  await expect(inputBox9).toBeFocused()
  await Explorer.updateEditingValue('עברית.txt')
  await Explorer.acceptEdit()
  const newFile9 = Locator('.Explorer').locator('text=עברית.txt')
  await expect(newFile9).toBeVisible()
}
