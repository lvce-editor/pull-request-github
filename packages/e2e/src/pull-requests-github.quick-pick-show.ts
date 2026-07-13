import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.quick-pick-show'

export const skip = true

export const test: Test = async ({ expect, Locator, QuickPick }) => {
  await QuickPick.executeCommand('GitHub Pull Requests: Focus on Pull Requests View')

  const input = Locator('input[name="pullRequestUrl"]')
  await expect(input).toBeVisible()
}
