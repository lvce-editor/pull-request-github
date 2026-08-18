import type { Rpc } from '@lvce-editor/rpc'
import { createRpc as createExtensionRpc } from '@lvce-editor/api'
import type { GitHubRepository } from '../GitHubRepository/GitHubRepository.ts'
import type { PullRequestData } from '../PullRequestData/PullRequestData.ts'
import type { PullRequestFilter } from '../PullRequestFilter/PullRequestFilter.ts'
import type { PullRequestListItem } from '../PullRequestListItem/PullRequestListItem.ts'

type GetRpc = () => Promise<Pick<Rpc, 'invoke'>>

export interface GitHubWorkerRpc {
  readonly clearPullRequestData: () => Promise<void>
  readonly fetchPullRequest: (url: string) => Promise<PullRequestData>
  readonly fetchPullRequests: (repository: GitHubRepository, state: PullRequestFilter) => Promise<readonly PullRequestListItem[]>
  readonly setPullRequestData: (url: string, data: PullRequestData) => Promise<void>
  readonly setPullRequestError: (url: string, message: string) => Promise<void>
  readonly setPullRequestListData: (owner: string, repo: string, state: PullRequestFilter, data: readonly PullRequestListItem[]) => Promise<void>
  readonly setPullRequestListError: (owner: string, repo: string, state: PullRequestFilter, message: string) => Promise<void>
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
    fetchPullRequests(repository: GitHubRepository, state: PullRequestFilter): Promise<readonly PullRequestListItem[]> {
      return invoke('GitHub.fetchPullRequests', repository, state)
    },
    setPullRequestData(url: string, data: PullRequestData): Promise<void> {
      return invoke('GitHub.setPullRequestData', url, data)
    },
    setPullRequestError(url: string, message: string): Promise<void> {
      return invoke('GitHub.setPullRequestError', url, message)
    },
    setPullRequestListData(owner: string, repo: string, state: PullRequestFilter, data: readonly PullRequestListItem[]): Promise<void> {
      return invoke('GitHub.setPullRequestListData', owner, repo, state, data)
    },
    setPullRequestListError(owner: string, repo: string, state: PullRequestFilter, message: string): Promise<void> {
      return invoke('GitHub.setPullRequestListError', owner, repo, state, message)
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

export const {
  clearPullRequestData,
  fetchPullRequest,
  fetchPullRequests,
  setPullRequestData,
  setPullRequestError,
  setPullRequestListData,
  setPullRequestListError,
  validatePullRequestUrl,
} = create(getRpc)
