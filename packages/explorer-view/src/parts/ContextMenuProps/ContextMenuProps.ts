import type { MenuEntryId } from '@lvce-editor/constants'

export interface ContextMenuPropsBase {
  readonly menuId: number
}

export interface ContextMenuPropsExplorer extends ContextMenuPropsBase {
  readonly menuId: typeof MenuEntryId.Explorer
}

export type ContextMenuProps = ContextMenuPropsExplorer
