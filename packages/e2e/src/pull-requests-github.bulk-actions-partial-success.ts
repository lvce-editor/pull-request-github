/* eslint-disable e2e/no-direct-click */
import type { Test } from '@lvce-editor/test-with-playwright'

const getPullRequest = (
  number: number,
  nodeId: string,
): {
  readonly author: string
  readonly baseBranch: string
  readonly comments: number
  readonly description: string
  readonly draft: boolean
  readonly headBranch: string
  readonly labels: readonly { readonly color: string; readonly name: string }[]
  readonly nodeId: string
  readonly number: number
  readonly title: string
  readonly updatedAt: string
  readonly url: string
} => ({
  author: 'alice',
  baseBranch: 'main',
  comments: 0,
  description: '',
  draft: false,
  headBranch: `feature/${number}`,
  labels: [],
  nodeId,
  number,
  title: `feature: ${number}`,
  updatedAt: '2026-09-28T10:00:00Z',
  url: `https://github.com/lvce-editor/pull-request-github/pull/${number}`,
})

export const name = 'pull-requests-github.bulk-actions-partial-success'
export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const retry = async (assertion: () => Promise<void>): Promise<void> => {
    const deadline = Date.now() + 5000
    while (true) {
      try {
        await assertion()
        return
      } catch (error) {
        if (Date.now() >= deadline) throw error
        await Command.execute('Timeout.sleep', 50)
      }
    }
  }
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    getPullRequest(41, 'PR_node_41'),
    getPullRequest(42, 'PR_node_42'),
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [])
  await Command.executeExtensionCommand('PullRequestsGithub.setCreationFixture', {
    defaults: { baseBranch: 'main', headBranch: 'feature', remoteUrl: 'https://github.com/lvce-editor/pull-request-github.git', title: '' },
    responses: [{ status: 200 }, { body: { error: 'Repository admin access required' }, status: 403 }],
  })
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const firstCheckbox = Locator('.PullRequestCheckbox[name="togglePullRequest:41"]')
  await retry(() => expect(firstCheckbox).toBeVisible())
  await Locator('.PullRequestCheckbox[name="togglePullRequest:41"]').click()
  const selectAll = Locator('.PullRequestSelectAllCheckbox')
  await retry(() => expect(selectAll).toHaveAttribute('aria-checked', 'mixed'))
  const selectedRow = Locator('.PullRequestListItemSelected')
  await retry(() => expect(selectedRow).toBeVisible())
  const pullRequestTabs = Locator('.PullRequestTabs')
  await retry(() => expect(pullRequestTabs).toBeHidden())
  await Locator('.PullRequestCheckbox[name="togglePullRequest:42"]').click()
  await retry(() => expect(selectAll).toHaveAttribute('aria-checked', 'true'))
  const selectionCount = Locator('.PullRequestSelectionCount')
  await retry(() => expect(selectionCount).toHaveText('2 selected'))
  const actionMenu = Locator('button[name="togglePullRequestActionMenu"]')
  await retry(() => expect(actionMenu).toBeVisible())
  await actionMenu.click()
  const actionMenuItems = Locator('.PullRequestActionMenu')
  await retry(() => expect(actionMenuItems).toBeVisible())
  const archiveAction = Locator('button[name="bulkPullRequest:archive"]')
  await retry(() => expect(archiveAction).toBeVisible())
  await archiveAction.click()
  const alert = Locator('[role="alert"]')
  const archivedPullRequest = Locator('button[name="openPullRequest:41"]')
  const remainingPullRequest = Locator('button[name="openPullRequest:42"]')
  await retry(() => expect(alert).toContainText('#42: Repository admin access required'))
  await retry(() => expect(archivedPullRequest).toBeHidden())
  await retry(() => expect(remainingPullRequest).toBeVisible())
  const requests = (await Command.executeExtensionCommand('PullRequestsGithub.getCreateRequests')) as readonly {
    readonly path: string
    readonly body: { readonly pullRequestId: string }
  }[]
  if (
    requests.map(({ body, path }) => `${path}:${body.pullRequestId}`).join(',') !==
    '/pull-requests/PR_node_41/archive:PR_node_41,/pull-requests/PR_node_42/archive:PR_node_42'
  ) {
    throw new Error(`Unexpected bulk action requests: ${JSON.stringify(requests)}`)
  }
}
