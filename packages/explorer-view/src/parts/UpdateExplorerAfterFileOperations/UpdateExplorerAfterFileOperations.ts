import type { ExplorerItem } from '../ExplorerItem/ExplorerItem.ts'
import type { ExplorerState } from '../ExplorerState/ExplorerState.ts'
import type { FileIconCache } from '../FileIconCache/FileIconCache.ts'
import type { FileOperation } from '../FileOperation/FileOperation.ts'
import { createTree } from '../CreateTree/CreateTree.ts'
import * as GetFileIcons from '../GetFileIcons/GetFileIcons.ts'
import * as GetIndex from '../GetIndex/GetIndex.ts'
import * as GetExplorerMaxLineY from '../GetMaxLineY/GetMaxLineY.ts'
import { getParentFolder } from '../GetParentFolder/GetParentFolder.ts'
import { getPathParts } from '../GetPathParts/GetPathParts.ts'
import { getPathPartsChildren } from '../GetPathPartsChildren/GetPathPartsChildren.ts'
import { mergeTrees } from '../MergeTrees/MergeTrees.ts'
import { join2 } from '../Path/Path.ts'
import { treeToArray } from '../TreeToArray/TreeToArray.ts'

export interface ExplorerUpdateResult {
  readonly newFileIconCache: FileIconCache
  readonly newFocusedIndex: number
  readonly newIcons: readonly string[]
  readonly newItems: readonly ExplorerItem[]
  readonly newMaxLineY: number
  readonly newMinLineY: number
}

export const updateExplorerAfterFileOperations = async (
  state: ExplorerState,
  operations: readonly FileOperation[],
): Promise<ExplorerUpdateResult> => {
  const { editingValue, fileIconCache, focusedIndex, height, itemHeight, items, minLineY, pathSeparator, root } = state
  const newFileName = editingValue
  const parentFolder = getParentFolder(items, focusedIndex, root, pathSeparator)
  const absolutePath = join2(parentFolder, newFileName)

  // TODO based on operations, find out which paths need to be updated
  // then read the direcories that need to be updated
  // and update the explorer
  const pathPaths = getPathParts(root, absolutePath, pathSeparator)
  const children = await getPathPartsChildren(pathPaths)
  const tree = createTree(items, root)
  const childTree = createTree(children, root)
  const merged = mergeTrees(tree, childTree)
  const newItems = treeToArray(merged, root)
  const dirents = newItems
  const newFocusedIndex = GetIndex.getIndex(newItems, absolutePath)
  const maxLineY = GetExplorerMaxLineY.getExplorerMaxLineY(minLineY, height, itemHeight, dirents.length)
  const visible = dirents.slice(minLineY, maxLineY)
  const { icons, newFileIconCache } = await GetFileIcons.getFileIcons(visible, fileIconCache)

  return {
    newFileIconCache,
    newFocusedIndex,
    newIcons: icons,
    newItems: dirents,
    newMaxLineY: maxLineY,
    newMinLineY: minLineY,
  }
}
