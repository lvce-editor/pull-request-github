import { RendererWorker as Rpc } from '@lvce-editor/rpc-registry'

export const getFolderIcon = async (name: string): Promise<string> => {
  return Rpc.invoke('IconTheme.getFolderIcon', { name })
}
