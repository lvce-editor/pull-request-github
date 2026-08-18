import type { Rpc } from '@lvce-editor/rpc'
import { createRpc as createExtensionRpc } from '@lvce-editor/api'
import type { PullRequestData } from '../PullRequestData/PullRequestData.ts'

type GetRpc = () => Promise<Pick<Rpc, 'invoke'>>

export interface GitHubWorkerRpc {
  readonly clearPullRequestData: () => Promise<void>
  readonly fetchPullRequest: (url: string) => Promise<PullRequestData>
  readonly setPullRequestData: (url: string, data: PullRequestData) => Promise<void>
  readonly setPullRequestError: (url: string, message: string) => Promise<void>
  readonly validatePullRequestUrl: (url: string) => Promise<void>
}

export const create = (getRpc: GetRpc): GitHubWorkerRpc => {
  const invoke = async <T>(method: string, ...params: readonly unknown[]): Promise<T> => {
    const rpc = await getRpc()
    return rpc.invoke(method, ...params)
  }

  return {
    clearPullRequestData(): Promise<void> {
      return invoke('GitHub.clearPullRequestData')
    },
    fetchPullRequest(url: string): Promise<PullRequestData> {
      return invoke('GitHub.fetchPullRequest', url)
    },
    setPullRequestData(url: string, data: PullRequestData): Promise<void> {
      return invoke('GitHub.setPullRequestData', url, data)
    },
    setPullRequestError(url: string, message: string): Promise<void> {
      return invoke('GitHub.setPullRequestError', url, message)
    },
    validatePullRequestUrl(url: string): Promise<void> {
      return invoke('GitHub.validatePullRequestUrl', url)
    },
  }
}

const githubWorkerRpcState: { rpcPromise: Promise<Rpc> | undefined } = {
  rpcPromise: undefined,
}

const getRpc = (): Promise<Rpc> => {
  githubWorkerRpcState.rpcPromise ||= createExtensionRpc({
    commandMap: {},
    contentSecurityPolicy: ["default-src 'none'", 'connect-src https://api.github.com', "script-src 'self'"],
    name: 'GitHub Worker',
    url: new URL('githubWorkerMain.js', import.meta.url).href,
  })
  return githubWorkerRpcState.rpcPromise
}

export const { clearPullRequestData, fetchPullRequest, setPullRequestData, setPullRequestError, validatePullRequestUrl } = create(getRpc)
