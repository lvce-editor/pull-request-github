// @ts-nocheck
const rootUri = 'extension-host://xyz://'
const folderUri = `${rootUri}stress-folder`
const folderEntry = {
  type: 2,
  name: 'stress-folder',
}
const totalItems = 10_000_000

const fileSystemProvider = {
  id: 'xyz',
  pathSeparator: '/',
  rename() {},
  readFile() {
    return ''
  },
  writeFile() {},
  readDirWithFileTypes(uri) {
    if (uri === rootUri) {
      return [folderEntry]
    }
    if (uri === folderUri) {
      return Array.from({ length: totalItems }, (_, index) => {
        return {
          type: 1,
          name: `item-${index.toString().padStart(8, '0')}.txt`,
        }
      })
    }
    return []
  },
}

export const activate = () => {
  vscode.registerFileSystemProvider(fileSystemProvider)
}
