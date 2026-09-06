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
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [])
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
  const element4 = Locator('.PullRequestCreateView [role="status"]')
  await retry(() => expect(element4).toHaveText('Pull request created. Auto-squash enabled.'))
  const calls = (await Command.executeExtensionCommand('PullRequestsGithub.getCreateRequests')) as readonly { readonly path: string }[]
  if (calls.map((call) => call.path).join(',') !== ',/auto-merge,/auto-merge') throw new Error('Retried PR creation')
}
