import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.theme-colors'

export const test: Test = async ({ ColorTheme, Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.mkdir(`${tmpDir}/.git`)
  await FileSystem.writeFile(`${tmpDir}/.git/config`, '[remote "origin"]\n  url = https://github.com/lvce-editor/pull-request-github.git\n')
  await Workspace.setPath(tmpDir)
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      author: 'theme-test',
      baseBranch: 'main',
      comments: 0,
      description: 'Theme switching keeps the open pull requests view in sync.',
      draft: false,
      headBranch: 'feature/theme-test',
      labels: [],
      number: 55,
      title: 'Respect the active color theme',
      updatedAt: new Date().toISOString(),
      url: 'https://github.com/lvce-editor/pull-request-github/pull/55',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const view = Locator('.PullRequestView')
  const listCard = Locator('.PullRequestListCard')
  const title = Locator('.PullRequestListItemTitle')

  await ColorTheme.setColorTheme('ayu')
  await expect(view).toHaveCSS('background-color', 'rgb(248, 249, 250)')
  await expect(view).toHaveCSS('color', 'rgb(92, 97, 102)')
  await expect(listCard).toHaveCSS('background-color', 'rgb(243, 244, 245)')
  await expect(title).toContainText('Respect the active color theme')

  await ColorTheme.setColorTheme('atom-one-dark')
  await expect(view).toHaveCSS('background-color', 'rgb(40, 44, 52)')
  await expect(view).toHaveCSS('color', 'rgb(231, 231, 231)')
  await expect(listCard).toHaveCSS('background-color', 'rgb(33, 37, 43)')
}
