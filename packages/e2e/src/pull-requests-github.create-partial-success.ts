/* eslint-disable e2e/no-direct-click */
import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.create-partial-success'
export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const defaults = {
    baseBranch: 'main',
    headBranch: 'feature/create',
    remoteUrl: 'https://github.com/lvce-editor/pull-request-github.git',
    title: 'feature: create pull requests',
  }
  const created = { number: 42, url: 'https://github.com/lvce-editor/pull-request-github/pull/42' }

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
  const fixture = {
    defaults,
    responses: [{ body: created }, { body: { error: 'Auto-merge is disabled' }, status: 422 }, { body: { autoMerge: true } }],
  }
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      author: 'mira.k',
      baseBranch: 'main',
      comments: 0,
      description: '',
      draft: false,
      headBranch: 'feature/create',
      labels: [],
      number: 42,
      title: defaults.title,
      updatedAt: new Date().toISOString(),
      url: created.url,
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [])
  await Command.executeExtensionCommand('PullRequestsGithub.setCreationFixture', fixture)
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  await Locator('button[name="createPullRequest"]').click()
  const titleInput = Locator('input[name="title"]')
  await retry(() => expect(titleInput).toBeVisible())
  await Locator('button[name="submitCreatePullRequest"]').click()
  const element1 = Locator('.PullRequestCreateView [role="alert"]')
  await retry(() => expect(element1).toContainText('Pull request created, but auto-squash failed'))
  const element2 = Locator('.PullRequestCreatedLink')
  await retry(() => expect(element2).toBeVisible())
  const element3 = Locator('button[name="submitCreatePullRequest"]')
  await retry(() => expect(element3).toHaveText('Retry Auto-Squash'))
  await Locator('button[name="submitCreatePullRequest"]').click()
  const overviewTitle = Locator('text=feature: create pull requests')
  const createView = Locator('.PullRequestCreateView')
  await retry(() => expect(overviewTitle).toBeVisible())
  await retry(() => expect(createView).toBeHidden())
  const calls = (await Command.executeExtensionCommand('PullRequestsGithub.getCreateRequests')) as readonly { readonly path: string }[]
  if (calls.map((call) => call.path).join(',') !== ',/auto-merge,/auto-merge') throw new Error('Retried PR creation')
}
