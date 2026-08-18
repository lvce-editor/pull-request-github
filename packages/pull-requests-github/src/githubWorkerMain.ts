import { WebWorkerRpcClient } from '@lvce-editor/rpc'
import { commandMap } from './parts/GitHubWorkerCommandMap/GitHubWorkerCommandMap.ts'

await WebWorkerRpcClient.create({
  commandMap,
})
