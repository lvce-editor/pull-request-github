/* eslint-disable e2e/no-direct-click */
import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.create-no-commits'
export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const defaults = {
    baseBranch: 'main',
    headBranch: 'feature/create',
    remoteUrl: 'https://github.com/lvce-editor/pull-request-github.git',
    title: 'feature: create pull requests',
  }

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
  const fixture = { defaults, responses: [{ body: { error: 'No commits between main and feature/create' }, status: 422 }] }
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
  await retry(() => expect(element1).toContainText('No commits between main and feature/create'))
  const element2 = Locator('input[name="title"]')
  await retry(() => expect(element2).toHaveValue(defaults.title))
  const element3 = Locator('.PullRequestCreatedLink')
  await retry(() => expect(element3).toBeHidden())
}
