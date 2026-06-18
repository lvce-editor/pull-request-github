import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.load-success'

export const test: Test = async ({ ActivityBar, Command, expect, Locator }) => {
  const url = 'https://github.com/lvce-editor/lvce-editor/pull/123'
  await ActivityBar.toggleActivityBarItem('github.pullRequests')
  const input = Locator('input[name="pullRequestUrl"]')
  await expect(input).toBeVisible()
  await Command.execute('ExtensionHost.executeCommand', 'PullRequestsGithub.clearPullRequestData')
  await Command.execute('ExtensionHost.executeCommand', 'PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'release/e2e-base',
    description: 'Plain text description from deterministic e2e data.',
    headBranch: 'feature/e2e-head',
    title: 'Add deterministic pull request e2e coverage',
  })

  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    name: 'pullRequestUrl',
    type: 'input',
    value: url,
  })
  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    type: 'submit',
  })

  const title = Locator('text=Add deterministic pull request e2e coverage')
  const headBranch = Locator('text=feature/e2e-head')
  const baseBranch = Locator('text=release/e2e-base')
  const description = Locator('text=Plain text description from deterministic e2e data.')
  await expect(title).toBeVisible()
  await expect(headBranch).toBeVisible()
  await expect(baseBranch).toBeVisible()
  await expect(description).toBeVisible()
}
