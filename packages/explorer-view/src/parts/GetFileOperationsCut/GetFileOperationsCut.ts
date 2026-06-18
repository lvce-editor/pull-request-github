import type { FileOperation } from '../FileOperation/FileOperation.ts'
import * as FileOperationType from '../FileOperationType/FileOperationType.ts'
import { generateUniqueName } from '../GenerateUniqueName/GenerateUniqueName.ts'
import * as Path from '../Path/Path.ts'

export const getFileOperationsCut = (root: string, existingUris: readonly string[], files: readonly string[]): readonly FileOperation[] => {
  const operations: FileOperation[] = []

  for (const file of files) {
    const baseName = Path.getBaseName('/', file)
    const uniqueName = generateUniqueName(baseName, existingUris, root)
    const newUri = Path.join2(root, uniqueName)
    operations.push({
      from: file, // TODO ensure file is uri
      path: newUri,
      type: FileOperationType.Copy,
    })
  }
  return operations
}
