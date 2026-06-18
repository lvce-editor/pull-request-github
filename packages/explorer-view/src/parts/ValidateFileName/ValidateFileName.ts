// copied from https://github.com/microsoft/vscode/blob/85925efe02b1be4671c5f37af8386a75a8b35ecc/src/vs/workbench/contrib/files/browser/fileActions.ts by Microsoft (License MIT)
// as well as from https://github.com/microsoft/vscode/blob/b012ab96ad1677c00d3061cf7f20953b57b393a5/src/vs/base/common/strings.ts by Microsoft (License MIT)

import type { ValidateFileNameResult } from '../ValidateFileNameResult/ValidateFileNameResult.ts'
import * as ExplorerStrings from '../ExplorerStrings/ExplorerStrings.ts'
import { hasLeadingOrTrailingWhitespace } from '../HasLeadingOrTrailingWhitespace/HasLeadingOrTrailingWhitespace.ts'
import { isValidBasename } from '../IsValidBaseName/IsValidBaseName.ts'
import * as Severity from '../Severity/Severity.ts'

/**
 * @returns New array with all falsy values removed. The original array IS NOT modified.
 */
export function coalesce<T>(array: ReadonlyArray<T | undefined | null>): T[] {
  return array.filter((e): e is T => !!e)
}

/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
export function trim(haystack: string, needle: string = ' '): string {
  const trimmed = ltrim(haystack, needle)
  return rtrim(trimmed, needle)
}

/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function ltrim(haystack: string, needle: string): string {
  if (!haystack || !needle) {
    return haystack
  }

  const needleLen = needle.length
  if (needleLen === 0 || haystack.length === 0) {
    return haystack
  }

  let offset = 0

  while (haystack.indexOf(needle, offset) === offset) {
    offset = offset + needleLen
  }
  return haystack.slice(Math.max(0, offset))
}

/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function rtrim(haystack: string, needle: string): string {
  if (!haystack || !needle) {
    return haystack
  }

  const needleLen = needle.length,
    haystackLen = haystack.length

  if (needleLen === 0 || haystackLen === 0) {
    return haystack
  }

  let offset = haystackLen

  while (true) {
    const idx = haystack.lastIndexOf(needle, offset - 1)
    if (idx === -1 || idx + needleLen !== offset) {
      break
    }
    if (idx === 0) {
      return ''
    }
    offset = idx
  }

  return haystack.slice(0, Math.max(0, offset))
}

function getWellFormedFileName(filename: string): string {
  if (!filename) {
    return filename
  }

  // Trim tabs
  filename = trim(filename, '\t')

  // Remove trailing slashes
  filename = rtrim(filename, '/')
  filename = rtrim(filename, '\\')

  return filename
}

export function validateFileName(name: string, existingName: string, siblingFileNames: readonly string[]): ValidateFileNameResult {
  // Produce a well formed file name
  name = getWellFormedFileName(name)

  // Name not provided
  if (!name || name.length === 0 || /^\s+$/.test(name)) {
    return {
      content: ExplorerStrings.fileOrFolderNameMustBeProvided(),
      severity: Severity.Error,
    }
  }

  // Relative paths only
  if (name[0] === '/' || name[0] === '\\') {
    return {
      content: ExplorerStrings.fileNameCannotStartWithSlash(),
      severity: Severity.Error,
    }
  }

  const names = coalesce(name.split(/[\\/]/))

  if (name !== existingName) {
    // Do not allow to overwrite existing file
    const child = siblingFileNames.find((sibling) => sibling === name)
    if (child) {
      return {
        content: ExplorerStrings.fileOrFolderAlreadyExists(name),
        severity: Severity.Error,
      }
    }
  }

  // Check for invalid file name.
  if (names.some((folderName) => !isValidBasename(folderName, false))) {
    return {
      content: ExplorerStrings.theNameIsNotValid(),
      severity: Severity.Error,
    }
  }

  if (names.some(hasLeadingOrTrailingWhitespace)) {
    return {
      content: ExplorerStrings.leadingOrTrailingWhitespaceDetected(),
      severity: Severity.Warning,
    }
  }

  return {
    content: '',
    severity: 0,
  }
}
