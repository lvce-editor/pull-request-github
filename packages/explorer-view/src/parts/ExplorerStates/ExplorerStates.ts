import * as ViewletRegistry from '@lvce-editor//viewlet-registry'
import type { ExplorerState } from '../ExplorerState/ExplorerState.ts'
import * as GetFileIcons from '../GetFileIcons/GetFileIcons.ts'
import * as GetExplorerMaxLineY from '../GetMaxLineY/GetMaxLineY.ts'
import * as GetVisibleExplorerItems from '../GetVisibleExplorerItems/GetVisibleExplorerItems.ts'

export const { get, getCommandIds, registerCommands, set, wrapGetter } = ViewletRegistry.create<ExplorerState>()

interface Fn<T extends any[]> {
  (state: ExplorerState, ...args: T): ExplorerState | Promise<ExplorerState>
}

export const wrapListItemCommand = <T extends any[]>(fn: Fn<T>): ((id: number, ...args: T) => Promise<void>) => {
  const wrappedCommand = async (id: number, ...args: T): Promise<void> => {
    const { newState } = get(id)
    const updatedState = await fn(newState, ...args)
    if (newState === updatedState) {
      return
    }
    const {
      cutItems,
      decorations,
      dropTargets,
      editingErrorMessage,
      editingIcon,
      editingIndex,
      fileIconCache,
      focusedIndex,
      height,
      itemHeight,
      items,
      minLineY,
      sourceControlIgnoredUris,
      useChevrons,
    } = updatedState
    const intermediate = get(id)
    set(id, intermediate.oldState, updatedState)
    const maxLineY = GetExplorerMaxLineY.getExplorerMaxLineY(minLineY, height, itemHeight, items.length)
    if (
      items === intermediate.newState.items &&
      minLineY === intermediate.newState.minLineY &&
      height === intermediate.newState.height &&
      itemHeight === intermediate.newState.itemHeight &&
      editingIcon === intermediate.newState.editingIcon &&
      cutItems === intermediate.newState.cutItems &&
      editingErrorMessage === intermediate.newState.editingErrorMessage &&
      dropTargets === intermediate.newState.dropTargets &&
      fileIconCache === intermediate.newState.fileIconCache &&
      decorations === intermediate.newState.decorations
    ) {
      return
    }
    const visible = items.slice(minLineY, maxLineY)
    const { icons, newFileIconCache } = await GetFileIcons.getFileIcons(visible, fileIconCache)
    const visibleExplorerItems = GetVisibleExplorerItems.getVisibleExplorerItems(
      items,
      minLineY,
      maxLineY,
      focusedIndex,
      editingIndex,
      editingErrorMessage,
      icons,
      useChevrons,
      dropTargets,
      editingIcon,
      cutItems,
      sourceControlIgnoredUris,
      decorations,
    )
    const finalState: ExplorerState = {
      ...updatedState,
      fileIconCache: newFileIconCache,
      icons,
      maxLineY,
      visibleExplorerItems,
    }
    const intermediate2 = get(id)
    set(id, intermediate2.oldState, finalState)
  }
  return wrappedCommand
}
