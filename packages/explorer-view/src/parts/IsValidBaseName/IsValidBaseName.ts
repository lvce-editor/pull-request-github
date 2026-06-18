/* eslint-disable no-useless-escape */

// copied from https://github.com/microsoft/vscode/blob/6b924c51528e663dda5091a1493229a361676aca/src/vs/base/common/extpath.ts by Microsoft (License MIT)

// Reference: https://en.wikipedia.org/wiki/Filename
const WINDOWS_INVALID_FILE_CHARS = /[\\/:\*\?"<>\|]/g
const UNIX_INVALID_FILE_CHARS = /\//g
const WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt\d|com\d)(\.(.*?))?$/i

export function isValidBasename(name: string | null | undefined, isWindowsOS: boolean): boolean {
  const invalidFileChars = isWindowsOS ? WINDOWS_INVALID_FILE_CHARS : UNIX_INVALID_FILE_CHARS

  if (!name || name.length === 0 || /^\s+$/.test(name)) {
    return false // require a name that is not just whitespace
  }

  invalidFileChars.lastIndex = 0 // the holy grail of software development
  if (invalidFileChars.test(name)) {
    return false // check for certain invalid file characters
  }

  if (isWindowsOS && WINDOWS_FORBIDDEN_NAMES.test(name)) {
    return false // check for certain invalid file names
  }

  if (name === '.' || name === '..' || name === '...') {
    return false // check for reserved values
  }

  if (name.startsWith('../')) {
    return false // check for names starting with ../
  }

  if (isWindowsOS && name.at(-1) === '.') {
    return false // Windows: file cannot end with a "."
  }

  if (isWindowsOS && name.length !== name.trim().length) {
    return false // Windows: file cannot end with a whitespace
  }

  if (name.length > 255) {
    return false // most file systems do not allow files > 255 length
  }

  return true
}
