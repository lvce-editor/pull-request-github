/* eslint-disable e2e/no-direct-click */
import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.pagination'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  for (const state of ['open', 'closed']) {
    const items = Array.from({ length: state === 'open' ? 121 : 243 }, (_, index) => ({
      author: 'alice',
      baseBranch: 'main',
      comments: 0,
      description: '',
      draft: false,
      headBranch: `feature/${index + 1}`,
      labels: [],
      number: index + 1,
      title: `${state} pull request ${index + 1}`,
      updatedAt: '2026-09-28T10:00:00Z',
      url: `https://github.com/lvce-editor/pull-request-github/pull/${index + 1}`,
    }))
    await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', state, items)
  }
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const items = Locator('.PullRequestListItem')
  const list = Locator('.PullRequestList')
  const openCount = Locator('[name="showOpenPullRequests"] .PullRequestTabCount')
  const closedCount = Locator('[name="showClosedPullRequests"] .PullRequestTabCount')
  const previous = Locator('button[aria-label="Previous"]')
  const next = Locator('button[aria-label="Next"]')
  await expect(openCount).toHaveText('121')
  await expect(closedCount).toHaveText('243')
  await expect(items).toHaveCount(30)
  await expect(previous).toHaveJSProperty('disabled', true)
  await expect(list).toHaveCSS('overflow-y', 'auto')
  await expect(list).toHaveJSProperty('scrollTop', 0)
  const lastCheckbox = Locator('[name="togglePullRequest:30"]')
  await lastCheckbox.click()
  await expect(list).not.toHaveJSProperty('scrollTop', 0)
  await next.click()
  const firstTitle = Locator('.PullRequestListItemTitle').first()
  await expect(firstTitle).toHaveText('open pull request 31')
  const selected = Locator('.PullRequestSelectionCount')
  await expect(selected).toHaveText('Select pull requests')
  const thirdPage = Locator('button[aria-label="Page 3"]')
  await thirdPage.click()
  await expect(firstTitle).toHaveText('open pull request 61')
  const lastPage = Locator('button[aria-label="Page 5"]')
  await lastPage.click()
  await expect(items).toHaveCount(1)
  await expect(firstTitle).toHaveText('open pull request 121')
  await expect(next).toHaveJSProperty('disabled', true)
  await previous.click()
  await expect(firstTitle).toHaveText('open pull request 91')
  const closedTab = Locator('button[name="showClosedPullRequests"]')
  await closedTab.click()
  await expect(firstTitle).toHaveText('closed pull request 1')
  await expect(previous).toHaveJSProperty('disabled', true)
  await next.click()
  await expect(firstTitle).toHaveText('closed pull request 31')
  const refresh = Locator('button[name="refreshPullRequests"]')
  await refresh.click()
  await expect(firstTitle).toHaveText('closed pull request 1')
}
