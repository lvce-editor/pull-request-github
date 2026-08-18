/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.closed-pull-requests'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [
    {
      baseBranch: 'main',
      description: 'A completed pull request.',
      headBranch: 'feature/completed',
      number: 201,
      title: 'Completed pull request',
      url: 'https://github.com/lvce-editor/pull-request-github/pull/201',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const closedTab = Locator('button[name="showClosedPullRequests"]')
  await closedTab.click()
  await Command.execute('Timeout.sleep', 200)

  await expect(closedTab).toHaveAttribute('aria-selected', 'true')
  const title = Locator('text=Completed pull request')
  await expect(title).toBeVisible()
}
