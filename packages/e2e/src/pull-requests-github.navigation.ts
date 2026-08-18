import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.navigation'

// The current test editor does not expose Viewlet.setPatches for extension view events.
export const skip = 1

interface ExtensionViewState {
  readonly uid: number
  readonly viewId: string
}

const isPullRequestViewState = (value: unknown): value is ExtensionViewState => {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'uid' in value &&
    typeof value.uid === 'number' &&
    'viewId' in value &&
    value.viewId === 'github.pullRequests',
  )
}

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(
    `${tmpDir}/.git/config`,
    `[remote "origin"]
  url = https://github.com/lvce-editor/pull-request-github.git
`,
  )
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [
    {
      baseBranch: 'main',
      description: 'A completed pull request.',
      headBranch: 'feature/completed',
      number: 122,
      title: 'Completed pull request',
      url: 'https://github.com/lvce-editor/pull-request-github/pull/122',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const viewletStates = (await Command.execute('Viewlet.getAllStates')) as Readonly<Record<string, unknown>>
  const pullRequestViewState = Object.values(viewletStates).find(isPullRequestViewState)
  if (!pullRequestViewState) {
    throw new Error('Pull request view state not found')
  }
  const { uid } = pullRequestViewState
  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', uid, {
    name: 'showClosedPullRequests',
    type: 'click',
  })
  const closedPullRequestTitle = Locator('.PullRequestListItemTitle')
  await expect(closedPullRequestTitle).toContainText('Completed pull request')

  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', uid, {
    name: 'openPullRequest:122',
    type: 'click',
  })
  const detailTitle = Locator('text=Pull request details')
  const detailDescription = Locator('text=A completed pull request.')
  await expect(detailTitle).toBeVisible()
  await expect(detailDescription).toBeVisible()

  await Command.execute('Extensions.dispatchViewEvent', 'github.pullRequests', uid, {
    name: 'showPullRequestList',
    type: 'click',
  })
  await expect(closedPullRequestTitle).toBeVisible()
}
