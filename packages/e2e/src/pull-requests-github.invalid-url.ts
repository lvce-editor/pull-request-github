import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.invalid-url'

export const skip = true

export const test: Test = async ({ ActivityBar, Command, expect, Locator }) => {
  await ActivityBar.toggleActivityBarItem('github.pullRequests')
  const input = Locator('input[name="pullRequestUrl"]')
  await expect(input).toBeVisible()
  await Command.execute('ExtensionHost.executeCommand', 'PullRequestsGithub.clearPullRequestData')

  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    name: 'pullRequestUrl',
    type: 'input',
    value: 'not a pull request url',
  })
  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    type: 'submit',
  })

  const error = Locator('text=Enter a valid GitHub pull request URL')
  await expect(error).toBeVisible()
}
