const contents = Object.create(null)

const fileSystemProvider = {
  id: 'xyz',
  writeFile(uri, content) {
    contents[uri] = content
    if (uri === '/file4.txt') {
      throw new Error(`Permission Denied`)
    }
  },
  rename(oldUri, newUri) {
    throw new Error(`Permission Denied`)
  },
  readFile(uri) {},
  pathSeparator: '/',
  readDirWithFileTypes(uri) {
    const results = []
    for (const [key, value] of Object.entries(contents)) {
      if (key.startsWith(uri)) {
        results.push({
          type: 7,
          name: key.slice(key.lastIndexOf('/')),
        })
      }
    }
    return results
  },
}

export const activate = () => {
  vscode.registerFileSystemProvider(fileSystemProvider)
}
