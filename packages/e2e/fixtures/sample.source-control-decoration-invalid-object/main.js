const contents = Object.create(null)

const fileSystemProvider = {
  id: 'xyz',
  writeFile(uri, content) {
    contents[uri] = content
  },
  mkdir(uri) {
    contents[uri] = ''
  },
  rename(oldUri, newUri) {},
  readFile(uri) {},
  exists(uri) {
    return false
  },
  pathSeparator: '/',
  readDirWithFileTypes(uri) {
    const results = []
    for (const [key, value] of Object.entries(contents)) {
      if (key.startsWith(uri)) {
        results.push({
          type: 7,
          name: key.slice(key.lastIndexOf('/') + 1),
        })
      }
    }
    return results
  },
}

const sourceControlProvider = {
  id: 'xyz',
  getChangedFiles() {
    return []
  },
  getBadgeCount() {
    return 0
  },
  getFileDecorations(uris) {
    return {}
  },
  isActive() {
    return true
  },
}

export const activate = () => {
  vscode.registerFileSystemProvider(fileSystemProvider)
  vscode.registerSourceControlProvider(sourceControlProvider)
}
