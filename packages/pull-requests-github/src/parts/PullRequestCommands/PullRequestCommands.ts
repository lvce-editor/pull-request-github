import { executeCommand, registerCommand } from '@lvce-editor/api'
import * as GitHubWorkerRpc from '../GitHubWorkerRpc/GitHubWorkerRpc.ts'
import * as PullRequestView from '../PullRequestView/PullRequestView.ts'

export const Show = 'PullRequestsGithub.show'
export const Refresh = 'PullRequestsGithub.refresh'
export const OpenOnGitHub = 'PullRequestsGithub.openOnGitHub'
export const SetPullRequestData = 'PullRequestsGithub.setPullRequestData'
export const SetPullRequestError = 'PullRequestsGithub.setPullRequestError'
export const SetPullRequestListData = 'PullRequestsGithub.setPullRequestListData'
export const SetPullRequestListError = 'PullRequestsGithub.setPullRequestListError'
export const SetPullRequestListResponse = 'PullRequestsGithub.setPullRequestListResponse'
export const SetPullRequestResponse = 'PullRequestsGithub.setPullRequestResponse'
export const ClearPullRequestData = 'PullRequestsGithub.clearPullRequestData'

export const commandIds = [
  Show,
  Refresh,
  OpenOnGitHub,
  SetPullRequestData,
  SetPullRequestError,
  SetPullRequestListData,
  SetPullRequestListError,
  SetPullRequestListResponse,
  SetPullRequestResponse,
  ClearPullRequestData,
]

type ExecuteCommand = (id: string, ...args: readonly unknown[]) => Promise<unknown>
type ValidatePullRequestUrl = (url: string) => Promise<void>

export const show = async (execute: ExecuteCommand = executeCommand): Promise<void> => {
  await execute('SideBar.show', PullRequestView.viewId, true)
}

export const openOnGitHub = async (
  url: string,
  execute: ExecuteCommand = executeCommand,
  validatePullRequestUrl: ValidatePullRequestUrl = GitHubWorkerRpc.validatePullRequestUrl,
): Promise<void> => {
  await validatePullRequestUrl(url)
  await execute('Open.openExternal', url)
}

export const {
  clearPullRequestData,
  setPullRequestData,
  setPullRequestError,
  setPullRequestListData,
  setPullRequestListError,
  setPullRequestListResponse,
  setPullRequestResponse,
} = GitHubWorkerRpc

export const registerCommands = (): void => {
  registerCommand({
    execute: show,
    id: Show,
  })
  registerCommand({
    execute: PullRequestView.refreshActiveInstance,
    id: Refresh,
  })
  registerCommand({
    execute() {
      return PullRequestView.openActiveInstance(openOnGitHub)
    },
    id: OpenOnGitHub,
  })
  registerCommand({
    execute: setPullRequestData,
    id: SetPullRequestData,
  })
  registerCommand({
    execute: setPullRequestError,
    id: SetPullRequestError,
  })
  registerCommand({
    execute: setPullRequestListData,
    id: SetPullRequestListData,
  })
  registerCommand({
    execute: setPullRequestListError,
    id: SetPullRequestListError,
  })
  registerCommand({
    execute: setPullRequestListResponse,
    id: SetPullRequestListResponse,
  })
  registerCommand({
    execute: setPullRequestResponse,
    id: SetPullRequestResponse,
  })
  registerCommand({
    execute: clearPullRequestData,
    id: ClearPullRequestData,
  })
}
