import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.empty-description'

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const input = Locator('input[name="pullRequestUrl"]')
  await expect(input).toBeVisible()
}
