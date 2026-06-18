import { activate as activateExtensionApi, registerCommand, registerView } from '@lvce-editor/api'
import type { PullRequestData } from '../GitHubPullRequest/GitHubPullRequest.ts'
import * as PullRequestMockRegistry from '../PullRequestMockRegistry/PullRequestMockRegistry.ts'
import * as PullRequestView from '../PullRequestView/PullRequestView.ts'

export const listen = async (): Promise<void> => {
  void activateExtensionApi()
  registerCommand({
    execute(url: string, data: PullRequestData): void {
      PullRequestMockRegistry.setPullRequestData(url, data)
    },
    id: 'PullRequestsGithub.setPullRequestData',
  })
  registerCommand({
    execute(url: string, message: string): void {
      PullRequestMockRegistry.setPullRequestError(url, message)
    },
    id: 'PullRequestsGithub.setPullRequestError',
  })
  registerCommand({
    execute(): void {
      PullRequestMockRegistry.clearPullRequestData()
    },
    id: 'PullRequestsGithub.clearPullRequestData',
  })
  registerView({
    create: PullRequestView.create,
    icon: 'symbol-github',
    id: 'github.pullRequests',
    kind: 'virtualDom',
    title: 'Pull Requests',
  } as any)
}
