/* eslint-disable e2e/no-direct-click */
import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.create-missing-git'
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

  const assertRequests = async (expected: unknown): Promise<void> => {
    const actual = await Command.executeExtensionCommand('PullRequestsGithub.getCreateRequests')
    const keys = ['path', 'body', 'repository', 'base', 'head', 'title', 'description', 'number']
    if (JSON.stringify(actual, keys) !== JSON.stringify(expected, keys)) throw new Error(`Unexpected requests: ${JSON.stringify(actual)}`)
  }
  const fixture = { error: 'Git is unavailable', responses: [] }
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
  const element1 = Locator('.PullRequestCreateView [role="alert"]')
  await retry(() => expect(element1).toContainText('Git is unavailable'))
  await assertRequests([])
}
