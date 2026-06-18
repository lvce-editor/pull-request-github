const contents = Object.create(null)

class FileNotFoundError extends Error {
  constructor(uri) {
    super(`File not found`)
    this.name = 'FileNotFoundError'
    this.code = 'ENOENT'
  }
}

const fileSystemProvider = {
  id: 'xyz',
  writeFile(uri, content) {
    contents[uri] = content
  },
  rename(oldUri, newUri) {},
  readFile(uri) {
    return contents[uri]
  },
  pathSeparator: '/',
  readDirWithFileTypes(uri) {
    throw new FileNotFoundError(uri)
  },
  remove(uri) {
    throw new Error(`oops`)
  },
}

export const activate = () => {
  vscode.registerFileSystemProvider(fileSystemProvider)
}
