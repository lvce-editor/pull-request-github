import type { FileOperation } from '../FileOperation/FileOperation.ts'
import * as FileOperationType from '../FileOperationType/FileOperationType.ts'
import * as Path from '../Path/Path.ts'

const getPathPartUpdate = (operation: FileOperation): string => {
  switch (operation.type) {
    case FileOperationType.CreateFile:
      return Path.dirname2(operation.path)
    case FileOperationType.CreateFolder:
      return Path.dirname2(operation.path)
    case FileOperationType.Rename:
      return Path.dirname2(operation.path)
    default:
      return ''
  }
}

export const getPathPartsFromFileOperations = (operations: readonly FileOperation[]): readonly string[] => {
  return operations.map(getPathPartUpdate).filter(Boolean)
}
