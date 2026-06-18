import * as Path from '../Path/Path.ts'

export const validateFolderCopy = (sourcePath: string, targetPath: string): string | null => {
  // Remove trailing separators for comparison
  const normalizedSource = sourcePath.replace(/[/\\]+$/, '')
  const normalizedTarget = targetPath.replace(/[/\\]+$/, '')

  // Check if the target path is a subfolder of the source path
  if (normalizedTarget.startsWith(normalizedSource + '/') || normalizedTarget.startsWith(normalizedSource + '\\')) {
    // Extract folder name using the appropriate path separator
    const pathSeparator = normalizedSource.includes('\\') ? '\\' : '/'
    const folderName = Path.getBaseName(pathSeparator, normalizedSource)
    return `Cannot copy folder ${folderName} into a subfolder of itself`
  }

  return null
}
