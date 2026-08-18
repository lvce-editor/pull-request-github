import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.empty-description'

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const icon = Locator('.ActivityBarItem[title="Pull Requests"] .MaskIcon')
  await expect(icon).toBeVisible()
  await expect(icon).toHaveCSS('mask-image', `url("${location.origin}/icons/git-pull-request.svg")`)
  const input = Locator('input[name="pullRequestUrl"]')
  await expect(input).toBeVisible()
}
