import type { ExplorerItem } from '../ExplorerItem/ExplorerItem.ts'
import * as DirentType from '../DirentType/DirentType.ts'

const isFolder = (direntType: number): boolean => {
  return direntType === DirentType.Directory || direntType === DirentType.DirectoryExpanded || direntType === DirentType.SymLinkFolder
}

export const getFittingIndex = (dirents: readonly ExplorerItem[], startIndex: number): number => {
  for (let i = startIndex; i >= 0; i--) {
    const dirent = dirents[i]
    if (dirent && isFolder(dirent.type)) {
      return i
    }
  }
  return -1
}
