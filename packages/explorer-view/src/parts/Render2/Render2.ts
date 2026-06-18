import * as ApplyRender from '../ApplyRender/ApplyRender.ts'
import * as ExplorerStates from '../ExplorerStates/ExplorerStates.ts'

export const render2 = (uid: number, diffResult: readonly number[]): readonly any[] => {
  const { newState, oldState } = ExplorerStates.get(uid)
  ExplorerStates.set(uid, newState, newState)
  const commands = ApplyRender.applyRender(oldState, newState, diffResult)
  return commands
}
