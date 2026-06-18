import type { Test } from '@lvce-editor/test-with-playwright'
import {
  clearMockPullRequests,
  dispatchPullRequestUrl,
  openPullRequestsView,
  setMockPullRequest,
  submitPullRequest,
} from './pull-requests-github-helper.ts'

export const name = 'pull-requests-github.empty-description'

export const test: Test = async ({ ActivityBar, Command, expect, Locator }) => {
  const url = 'https://github.com/lvce-editor/lvce-editor/pull/124'
  await openPullRequestsView(ActivityBar, expect, Locator)
  await clearMockPullRequests(Command)
  await setMockPullRequest(Command, url, {
    baseBranch: 'release/e2e-empty-base',
    description: '',
    headBranch: 'feature/e2e-empty-head',
    title: 'Render empty pull request description',
  })

  await dispatchPullRequestUrl(Command, url)
  await submitPullRequest(Command)

  await expect(Locator('text=Render empty pull request description')).toBeVisible()
  await expect(Locator('text=feature/e2e-empty-head')).toBeVisible()
  await expect(Locator('text=release/e2e-empty-base')).toBeVisible()
  await expect(Locator('text=No description')).toBeVisible()
}
