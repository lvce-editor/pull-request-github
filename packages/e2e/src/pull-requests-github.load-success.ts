import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.load-success'

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
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      author: 'mira.k',
      baseBranch: 'main',
      comments: 12,
      description: 'Plain text description from deterministic e2e data.',
      draft: false,
      headBranch: 'feature/e2e-head',
      labels: [
        { color: '1d76db', name: 'feature' },
        { color: 'd4c5f9', name: 'needs-review' },
      ],
      number: 123,
      title: 'Add deterministic pull request list coverage',
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url: 'https://github.com/lvce-editor/pull-request-github/pull/123',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [])
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const repositoryLabel = Locator('text=lvce-editor / pull-request-github')
  const pullRequestTitle = Locator('text=Add deterministic pull request list coverage')
  const metadata = Locator('.PullRequestListItemMetadata')
  const labels = Locator('.PullRequestLabel')
  const featureLabel = labels.first()
  const needsReviewLabel = labels.nth(1)
  const comments = Locator('.PullRequestListItemComments')
  await expect(repositoryLabel).toBeVisible()
  await expect(pullRequestTitle).toBeVisible()
  await expect(metadata).toContainText('#123 · by mira.k · feature/e2e-head → main · updated 2 hours ago')
  await expect(featureLabel).toContainText('feature')
  await expect(needsReviewLabel).toContainText('needs-review')
  await expect(comments).toContainText('12')
}
