import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.not-found'

export const skip = true

export const test: Test = async ({ ActivityBar, Command, expect, Locator }) => {
  const url = 'https://github.com/lvce-editor/lvce-editor/pull/404'
  await ActivityBar.toggleActivityBarItem('github.pullRequests')
  const input = Locator('input[name="pullRequestUrl"]')
  await expect(input).toBeVisible()
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestError', url, 'Not Found')

  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    name: 'pullRequestUrl',
    type: 'input',
    value: url,
  })
  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', 1, {
    type: 'submit',
  })

  const error = Locator('text=Not Found')
  await expect(error).toBeVisible()
}
