import type { TestApi } from '@lvce-editor/test-with-playwright'

export interface PullRequestData {
  readonly baseBranch: string
  readonly description: string
  readonly headBranch: string
  readonly title: string
}

type ActivityBar = TestApi['ActivityBar']
type Command = TestApi['Command']
type Expect = TestApi['expect']
type Locator = TestApi['Locator']

export const openPullRequestsView = async (ActivityBar: ActivityBar, expect: Expect, Locator: Locator): Promise<void> => {
  const item = Locator('.ActivityBarItem[title="Pull Requests"]')
  await expect(item).toBeVisible()
  await ActivityBar.toggleActivityBarItem('github.pullRequests')
  const input = Locator('input[name="pullRequestUrl"]')
  await expect(input).toBeVisible()
}

export const clearMockPullRequests = async (Command: Command): Promise<void> => {
  await Command.execute('ExtensionHost.executeCommand', 'PullRequestsGithub.clearPullRequestData')
}

export const setMockPullRequest = async (Command: Command, url: string, data: PullRequestData): Promise<void> => {
  await Command.execute('ExtensionHost.executeCommand', 'PullRequestsGithub.setPullRequestData', url, data)
}

export const setMockPullRequestError = async (Command: Command, url: string, message: string): Promise<void> => {
  await Command.execute('ExtensionHost.executeCommand', 'PullRequestsGithub.setPullRequestError', url, message)
}

export const dispatchPullRequestUrl = async (Command: Command, url: string): Promise<void> => {
  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    name: 'pullRequestUrl',
    type: 'input',
    value: url,
  })
}

export const submitPullRequest = async (Command: Command): Promise<void> => {
  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    type: 'submit',
  })
}
