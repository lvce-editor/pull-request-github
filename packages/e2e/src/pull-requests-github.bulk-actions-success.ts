/* eslint-disable e2e/no-direct-click */
import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.bulk-actions-success'
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
  const item = {
    author: 'alice',
    baseBranch: 'main',
    comments: 0,
    description: '',
    draft: false,
    headBranch: 'feature',
    labels: [],
    nodeId: 'PR_node_51',
    number: 51,
    title: 'feature: close this PR',
    updatedAt: '2026-09-28T10:00:00Z',
    url: 'https://github.com/lvce-editor/pull-request-github/pull/51',
  }
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [item])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [])
  await Command.executeExtensionCommand('PullRequestsGithub.setCreationFixture', {
    defaults: { baseBranch: 'main', headBranch: 'feature', remoteUrl: 'https://github.com/lvce-editor/pull-request-github.git', title: '' },
    responses: [{ status: 200 }, { status: 200 }],
  })
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const checkbox = Locator('.PullRequestCheckbox[name="togglePullRequest:51"]')
  await retry(() => expect(checkbox).toBeVisible())
  await Locator('.PullRequestCheckbox[name="togglePullRequest:51"]').click()
  await Locator('button[name="togglePullRequestActionMenu"]').click()
  await Locator('button[name="bulkPullRequest:close"]').click()
  const closedPullRequest = Locator('button[name="openPullRequest:51"]')
  const selectionCount = Locator('.PullRequestSelectionCount')
  await retry(() => expect(closedPullRequest).toBeHidden())
  await retry(() => expect(selectionCount).toBeHidden())
  await Locator('button[name="showClosedPullRequests"]').click()
  await retry(() => expect(closedPullRequest).toBeVisible())
  await Locator('.PullRequestCheckbox[name="togglePullRequest:51"]').click()
  await Locator('button[name="togglePullRequestActionMenu"]').click()
  await Locator('button[name="bulkPullRequest:unarchive"]').click()
  await retry(() => expect(closedPullRequest).toBeVisible())
  const requests = (await Command.executeExtensionCommand('PullRequestsGithub.getCreateRequests')) as readonly {
    readonly path: string
    readonly body: { readonly pullRequestId: string }
  }[]
  if (
    requests.length !== 2 ||
    requests[0].path !== '/pull-requests/PR_node_51/close' ||
    requests[1].path !== '/pull-requests/PR_node_51/unarchive' ||
    requests.some((request) => request.body.pullRequestId !== 'PR_node_51')
  ) {
    throw new Error(`Unexpected bulk requests: ${JSON.stringify(requests)}`)
  }
}
