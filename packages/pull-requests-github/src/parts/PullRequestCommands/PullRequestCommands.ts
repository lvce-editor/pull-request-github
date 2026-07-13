import { executeCommand, registerCommand } from '@lvce-editor/api'
import type { PullRequestData } from '../GitHubPullRequest/GitHubPullRequest.ts'
import * as PullRequestMockRegistry from '../PullRequestMockRegistry/PullRequestMockRegistry.ts'
import { parsePullRequestUrl } from '../PullRequestUrl/PullRequestUrl.ts'
import * as PullRequestView from '../PullRequestView/PullRequestView.ts'

export const Show = 'PullRequestsGithub.show'
export const Refresh = 'PullRequestsGithub.refresh'
export const OpenOnGitHub = 'PullRequestsGithub.openOnGitHub'
export const SetPullRequestData = 'PullRequestsGithub.setPullRequestData'
export const SetPullRequestError = 'PullRequestsGithub.setPullRequestError'
export const ClearPullRequestData = 'PullRequestsGithub.clearPullRequestData'

export const commandIds = [Show, Refresh, OpenOnGitHub, SetPullRequestData, SetPullRequestError, ClearPullRequestData]

type ExecuteCommand = (id: string, ...args: readonly unknown[]) => Promise<unknown>

export const show = async (execute: ExecuteCommand = executeCommand): Promise<void> => {
  await execute('SideBar.show', PullRequestView.viewId, true)
}

export const openOnGitHub = async (url: string, execute: ExecuteCommand = executeCommand): Promise<void> => {
  parsePullRequestUrl(url)
  await execute('Open.openExternal', url)
}

export const setPullRequestData = (url: string, data: PullRequestData): void => {
  PullRequestMockRegistry.setPullRequestData(url, data)
}

export const setPullRequestError = (url: string, message: string): void => {
  PullRequestMockRegistry.setPullRequestError(url, message)
}

export const clearPullRequestData = (): void => {
  PullRequestMockRegistry.clearPullRequestData()
}

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
    execute: clearPullRequestData,
    id: ClearPullRequestData,
  })
}
