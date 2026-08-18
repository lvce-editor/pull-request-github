import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.empty-description'

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const view = Locator('.PullRequestView')
  const form = Locator('form[name="pullRequestForm"]')
  const icon = Locator('.ActivityBarItem[title="Pull Requests"] .MaskIcon')
  await expect(icon).toBeVisible()
  await expect(icon).toHaveCSS('mask-image', `url("${location.origin}/icons/git-pull-request.svg")`)
  const input = Locator('input[name="pullRequestUrl"]')
  const button = Locator('button[name="loadPullRequest"]')
  await expect(view).toBeVisible()
  await expect(view).toHaveCSS('padding-left', '12px')
  await expect(form).toHaveCSS('display', 'flex')
  await expect(input).toBeVisible()
  await expect(input).toHaveCSS('height', '30px')
  await expect(button).toHaveCSS('border-radius', '6px')
}
