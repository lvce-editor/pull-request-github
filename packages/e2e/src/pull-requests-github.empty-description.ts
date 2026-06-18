import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.empty-description'

export const skip = true

export const test: Test = async ({ ActivityBar, Command, expect, Locator }) => {
  const url = 'https://github.com/lvce-editor/lvce-editor/pull/124'
  await ActivityBar.toggleActivityBarItem('github.pullRequests')
  const input = Locator('input[name="pullRequestUrl"]')
  await expect(input).toBeVisible()
  await Command.execute('ExtensionHost.executeCommand', 'PullRequestsGithub.clearPullRequestData')
  await Command.execute('ExtensionHost.executeCommand', 'PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'release/e2e-empty-base',
    description: '',
    headBranch: 'feature/e2e-empty-head',
    title: 'Render empty pull request description',
  })

  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    name: 'pullRequestUrl',
    type: 'input',
    value: url,
  })
  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    type: 'submit',
  })

  const title = Locator('text=Render empty pull request description')
  const headBranch = Locator('text=feature/e2e-empty-head')
  const baseBranch = Locator('text=release/e2e-empty-base')
  const description = Locator('text=No description')
  await expect(title).toBeVisible()
  await expect(headBranch).toBeVisible()
  await expect(baseBranch).toBeVisible()
  await expect(description).toBeVisible()
}
