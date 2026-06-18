import type { Test } from '@lvce-editor/test-with-playwright'
import {
  clearMockPullRequests,
  dispatchPullRequestUrl,
  openPullRequestsView,
  setMockPullRequest,
  submitPullRequest,
} from './pull-requests-github-helper.ts'

export const name = 'pull-requests-github.load-success'

export const test: Test = async ({ ActivityBar, Command, expect, Locator }) => {
  const url = 'https://github.com/lvce-editor/lvce-editor/pull/123'
  await openPullRequestsView(ActivityBar, expect, Locator)
  await clearMockPullRequests(Command)
  await setMockPullRequest(Command, url, {
    baseBranch: 'release/e2e-base',
    description: 'Plain text description from deterministic e2e data.',
    headBranch: 'feature/e2e-head',
    title: 'Add deterministic pull request e2e coverage',
  })

  await dispatchPullRequestUrl(Command, url)
  await submitPullRequest(Command)

  await expect(Locator('text=Add deterministic pull request e2e coverage')).toBeVisible()
  await expect(Locator('text=feature/e2e-head')).toBeVisible()
  await expect(Locator('text=release/e2e-base')).toBeVisible()
  await expect(Locator('text=Plain text description from deterministic e2e data.')).toBeVisible()
}
