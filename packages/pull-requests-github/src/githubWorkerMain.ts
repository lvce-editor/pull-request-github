import { WebWorkerRpcClient2 } from '@lvce-editor/rpc'
import { commandMap } from './parts/GitHubWorkerCommandMap/GitHubWorkerCommandMap.ts'

await WebWorkerRpcClient2.create({
  commandMap,
})
