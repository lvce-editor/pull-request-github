import type { Copy, CreateFile, CreateFolder, Remove, Rename } from '../FileOperationType/FileOperationType.ts'

export interface FileOperationBase {
  readonly type: number
}

export interface FileOperationCreateFile extends FileOperationBase {
  readonly path: string
  readonly text: string
  readonly type: typeof CreateFile
}

export interface FileOperationCreateFolder extends FileOperationBase {
  readonly path: string
  readonly type: typeof CreateFolder
}

export interface FileOperationCopy extends FileOperationBase {
  readonly from: string
  readonly path: string
  readonly type: typeof Copy
}

export interface FileOperationRename extends FileOperationBase {
  readonly from: string
  readonly path: string
  readonly type: typeof Rename
}

export interface FileOperationRemove extends FileOperationBase {
  readonly path: string
  readonly type: typeof Remove
}

export type FileOperation = FileOperationCopy | FileOperationCreateFile | FileOperationCreateFolder | FileOperationRename | FileOperationRemove
