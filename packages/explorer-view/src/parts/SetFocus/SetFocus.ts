import { RendererWorker } from '@lvce-editor/rpc-registry'

export const setFocus = (key: number): Promise<void> => {
  return RendererWorker.invoke('Focus.setFocus', key)
}
