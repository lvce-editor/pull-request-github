import type { ExplorerItem } from '../ExplorerItem/ExplorerItem.ts'
import type { Tree } from '../Tree/Tree.ts'
import type { TreeUpdate } from '../TreeUpdate/TreeUpdate.ts'

export const computeExplorerRenamedDirentUpdate = (
  root: string,
  parentPath: string,
  oldUri: string,
  children: readonly ExplorerItem[],
  tree: Tree,
  newUri: string,
): TreeUpdate => {
  const rootLength = root.length
  const relativeDirname = parentPath.slice(rootLength)
  const relativeOldPath = oldUri.slice(rootLength)
  const relativeNewUri = newUri.slice(rootLength)
  const update: TreeUpdate = Object.create(null)
  update[relativeDirname] = children
  const oldItems = tree[relativeOldPath] || []
  update[relativeNewUri] = oldItems
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith(`${relativeOldPath}/`)) {
      const newKey = `${relativeNewUri}` + key.slice(relativeOldPath.length)
      update[newKey] = value
    }
  }
  return update
}
