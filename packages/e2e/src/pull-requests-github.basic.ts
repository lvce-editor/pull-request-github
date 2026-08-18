import type { Test } from '@lvce-editor/test-with-playwright'

const toExtensionBaseUrl = (uri: string): string => {
  const url = new URL(uri, import.meta.url)
  if (url.protocol === 'file:') {
    return `${location.origin}/remote/${url.href.slice('file://'.length)}/`
  }
  return url.href.endsWith('/') ? url.href : `${url.href}/`
}

export const name = 'pull-requests-github.empty-description'

export const test: Test = async ({ Command, expect, Locator }) => {
  const extensionUri = import.meta.resolve('../../pull-requests-github')
  const iconUrl = new URL('media/git-pull-request.svg', toExtensionBaseUrl(extensionUri)).href
  const activityBarItem = Locator('.ActivityBarItem[title="Pull Requests"]')
  await expect(activityBarItem).toHaveCSS('mask-image', `url("${iconUrl}")`)
  await Command.executeExtensionCommand('PullRequestsGithub.show')
  const view = Locator('.PullRequestView')
  const form = Locator('form[name="pullRequestForm"]')
  const icon = activityBarItem.locator('.MaskIcon')
  await expect(icon).toBeVisible()
  await expect(icon).toHaveCSS('mask-image', `url("${iconUrl}")`)
  const input = Locator('input[name="pullRequestUrl"]')
  const button = Locator('button[name="loadPullRequest"]')
  await expect(view).toBeVisible()
  await expect(view).toHaveCSS('padding-left', '12px')
  await expect(form).toHaveCSS('display', 'flex')
  await expect(input).toBeVisible()
  await expect(input).toHaveCSS('height', '30px')
  await expect(button).toHaveCSS('border-radius', '6px')
}
