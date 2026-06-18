import type { Test } from '@lvce-editor/test-with-playwright'
import { clearMockPullRequests, dispatchPullRequestUrl, openPullRequestsView, submitPullRequest } from './pull-requests-github-helper.ts'

export const name = 'pull-requests-github.invalid-url'

export const test: Test = async ({ ActivityBar, Command, expect, Locator }) => {
  await openPullRequestsView(ActivityBar, expect, Locator)
  await clearMockPullRequests(Command)

  await dispatchPullRequestUrl(Command, 'not a pull request url')
  await submitPullRequest(Command)

  await expect(Locator('text=Enter a valid GitHub pull request URL')).toBeVisible()
}
