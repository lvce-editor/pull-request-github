import type { Test } from '@lvce-editor/test-with-playwright'

// cspell:ignore commondir gitdir

export const name = 'pull-requests-github.worktree-commondir'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/worktree-git`)
  await FileSystem.mkdir(`${tmpDir}/common-git`)
  await FileSystem.setFiles([
    {
      content: 'gitdir: worktree-git\n',
      uri: `${tmpDir}/.git`,
    },
    {
      content: '../common-git\n',
      uri: `${tmpDir}/worktree-git/commondir`,
    },
    {
      content: '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n',
      uri: `${tmpDir}/common-git/config`,
    },
  ])
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const repository = Locator('text=lvce-editor / pull-request-github')
  await expect(repository).toBeVisible()
}
