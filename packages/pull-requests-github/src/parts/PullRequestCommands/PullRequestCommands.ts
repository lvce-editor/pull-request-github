import { registerCommand } from '@lvce-editor/api'
import type { PullRequestData } from '../GitHubPullRequest/GitHubPullRequest.ts'
import * as PullRequestMockRegistry from '../PullRequestMockRegistry/PullRequestMockRegistry.ts'

export const SetPullRequestData = 'PullRequestsGithub.setPullRequestData'
export const SetPullRequestError = 'PullRequestsGithub.setPullRequestError'
export const ClearPullRequestData = 'PullRequestsGithub.clearPullRequestData'

export const commandIds = [SetPullRequestData, SetPullRequestError, ClearPullRequestData]

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
