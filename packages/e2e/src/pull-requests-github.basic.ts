import type { Test } from '@lvce-editor/test-with-playwright'

const toExtensionBaseUrl = (uri: string): string => {
  const url = new URL(uri, import.meta.url)
  if (url.protocol === 'file:') {
    return `${location.origin}/remote/${url.href.slice('file://'.length)}/`
  }
  return url.href.endsWith('/') ? url.href : `${url.href}/`
}

export const name = 'pull-requests-github.basic'

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
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const extensionUri = import.meta.resolve('../../pull-requests-github')
  const iconUrl = new URL('media/git-pull-request.svg', toExtensionBaseUrl(extensionUri)).href
  const activityBarItem = Locator('.ActivityBarItem[title="Pull Requests"]')
  const view = Locator('.PullRequestView')
  const icon = activityBarItem.locator('.MaskIcon')
  const tabs = Locator('.PullRequestTabs')
  const openTab = Locator('button[name="showOpenPullRequests"]')
  const message = Locator('.PullRequestMessage')
  await expect(icon).toBeVisible()
  await expect(icon).toHaveCSS('mask-image', `url("${iconUrl}")`)
  await expect(view).toBeVisible()
  await expect(view).toHaveCSS('padding-left', '16px')
  await expect(tabs).toHaveCSS('display', 'flex')
  await expect(openTab).toHaveCSS('height', '24px')
  await expect(message).toContainText('No open pull requests.')
}
