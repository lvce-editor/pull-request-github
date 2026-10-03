/* eslint-disable e2e/no-direct-click */

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'pull-requests-github.detail-tabs'

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
  const url = 'https://github.com/lvce-editor/pull-request-github/pull/482'
  await Command.executeExtensionCommand('PullRequestsGithub.clearPullRequestData')
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'open', [
    {
      author: 'mira.k',
      baseBranch: 'main',
      comments: 12,
      description: 'Adds a comment gutter to the diff editor so reviewers can leave inline comments without leaving the editor.',
      draft: false,
      headBranch: 'feat/inline-review-comments',
      labels: [
        { color: '1d76db', name: 'feature' },
        { color: 'd4a72c', name: 'needs-review' },
      ],
      number: 482,
      title: 'Add inline review comments to the diff editor',
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url,
    },
    {
      author: 'kai.m',
      baseBranch: 'main',
      comments: 0,
      description: '',
      draft: false,
      headBranch: 'docs/empty-description',
      labels: [],
      number: 483,
      title: 'Empty description after formatted description',
      url: 'https://github.com/lvce-editor/pull-request-github/pull/483',
    },
  ])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestListData', 'lvce-editor', 'pull-request-github', 'closed', [])
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', url, {
    baseBranch: 'main',
    checks: [
      {
        conclusion: 'failure',
        detailsUrl: 'https://github.com/lvce-editor/pull-request-github/actions/runs/1',
        name: 'PR / pr (windows-2025)',
        status: 'completed',
      },
      ...['macos-15', 'ubuntu-24.04-arm', 'ubuntu-24.04'].map((name) => ({
        conclusion: 'success',
        detailsUrl: 'https://github.com/lvce-editor/pull-request-github/actions/runs/1',
        name: `PR / pr (${name})`,
        status: 'completed',
      })),
    ],
    checksStatus: 'loaded',
    commits: [
      {
        author: 'mira-k',
        message: 'Add detail tab navigation',
        sha: 'a1b2c3d4e5f67890',
      },
      {
        author: 'mira-k',
        message: 'Render changed files',
        sha: 'b2c3d4e5f67890a1',
      },
      {
        author: 'mira-k',
        message: 'Polish inline comment markers',
        sha: 'c3d4e5f67890a1b2',
      },
    ],
    description:
      '### Details\n\nAdds **formatted** Markdown to the overview.\n\n- Review the changes\n- Check the rendered description\n\n```ts\nconst ready = true\n```\n\n![Screenshot](https://example.com/screenshot.png)',
    files: [
      {
        additions: 5,
        deletions: 1,
        filename: 'src/detailTabs.ts',
        patch: "@@ -1,2 +1,2 @@\n-export const tabs = []\n+export const tabs = ['overview', 'commits', 'changes']",
        status: 'modified',
      },
      {
        additions: 4,
        deletions: 0,
        filename: 'src/inlineComments.ts',
        patch: '@@ -0,0 +1 @@\n+export const inlineComments = true',
        status: 'added',
      },
      {
        additions: 2,
        deletions: 1,
        filename: 'src/comments.css',
        patch: '@@ -1 +1 @@\n-old\n+new',
        status: 'modified',
      },
    ],
    headBranch: 'feat/inline-review-comments',
    title: 'Add inline review comments to the diff editor',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.setPullRequestData', 'https://github.com/lvce-editor/pull-request-github/pull/483', {
    baseBranch: 'main',
    commits: [],
    description: '',
    files: [],
    headBranch: 'docs/empty-description',
    title: 'Empty description after formatted description',
  })
  await Command.executeExtensionCommand('PullRequestsGithub.show')

  const pullRequest = Locator('button[name="openPullRequest:482"]')
  await expect(pullRequest).toBeVisible()
  await pullRequest.click()
  await Command.execute('Timeout.sleep', 200)

  const tabs = Locator('.PullRequestDetailTabs')
  const overviewTab = Locator('button[name="showPullRequestOverview"]')
  const commitsTab = Locator('button[name="showPullRequestCommits"]')
  const changesTab = Locator('button[name="showPullRequestChanges"]')
  const overview = Locator('.PullRequestOverview')
  const title = Locator('.PullRequestDetailTitle')
  const stateBadge = Locator('.PullRequestStateBadge')
  const overviewIcon = overviewTab.locator('.PullRequestOverviewIcon')
  await expect(tabs).toHaveCSS('display', 'flex')
  await expect(title).toContainText('Add inline review comments to the diff editor #482')
  await expect(stateBadge).toContainText('Open')
  await expect(overviewIcon).toHaveCount(1)
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true')
  await expect(overview).toHaveCSS('display', 'grid')
  await expect(overview).toContainText('mira.k opened this pull request')
  const markdown = Locator('.PullRequestOverviewDescription')
  const markdownHeading = markdown.locator('h3')
  const markdownStrong = markdown.locator('strong')
  const markdownListItems = markdown.locator('ul li')
  const markdownCode = markdown.locator('pre code')
  const markdownImage = markdown.locator('img')
  await expect(markdownHeading).toContainText('Details')
  await expect(markdownStrong).toContainText('formatted')
  await expect(markdownListItems).toHaveCount(2)
  await expect(markdownCode).toContainText('const ready = true')
  await expect(markdownImage).toHaveAttribute('src', 'https://example.com/screenshot.png')
  await expect(overview).toContainText('feature')
  await expect(overview).toContainText('needs-review')
  await expect(overview).toContainText('12 comments')
  const checksPanel = Locator('.PullRequestChecksPanel')
  const checkRows = checksPanel.locator('.PullRequestCheck')
  await expect(checksPanel).toContainText('1 failing, 3 successful')
  await expect(checksPanel).toContainText('PR / pr (windows-2025)')
  await expect(checkRows).toHaveCount(4)

  await Command.execute('Layout.setExplicitBounds', 1200, 720)
  await Command.execute('Layout.moveSideBarLeft')
  await Command.execute('Layout.handleSashSideBarPointerDown')
  await Command.execute('Layout.handleSashPointerMove', 800, 300)
  await expect(overview).toHaveCSS('grid-template-areas', '"main sidebar"')

  await Command.execute('Layout.handleSashPointerMove', 430, 300)
  await expect(overview).toHaveCSS('grid-template-areas', '"main" "sidebar"')

  await commitsTab.click()
  await Command.execute('Timeout.sleep', 200)
  const commitList = Locator('.PullRequestCommitList')
  await expect(commitsTab).toHaveAttribute('aria-selected', 'true')
  await expect(commitList).toHaveCSS('display', 'flex')
  await expect(commitList).toContainText('Add detail tab navigation')
  await expect(commitList).toContainText('a1b2c3d')

  await changesTab.click()
  await Command.execute('Timeout.sleep', 200)
  const changedFile = Locator('.PullRequestFile').first()
  const addition = changedFile.locator('.PullRequestDiffLineAddition')
  const deletion = changedFile.locator('.PullRequestDiffLineDeletion')
  await expect(changesTab).toHaveAttribute('aria-selected', 'true')
  await expect(changedFile).toContainText('src/detailTabs.ts')
  await expect(changedFile).toContainText('+5')
  await expect(changedFile).toContainText('−1')
  await expect(addition).toHaveCSS('display', 'block')
  await expect(addition).toContainText("+export const tabs = ['overview', 'commits', 'changes']")
  await expect(deletion).toContainText('-export const tabs = []')

  await overviewTab.click()
  await Command.execute('Timeout.sleep', 200)
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true')
  await expect(overview).toBeVisible()

  await Locator('button[name="showPullRequestList"]').click()
  await Command.execute('Timeout.sleep', 200)
  await Locator('button[name="openPullRequest:483"]').click()
  await Command.execute('Timeout.sleep', 200)
  const emptyDescription = Locator('.PullRequestOverviewDescription')
  const staleHeading = Locator('.PullRequestOverviewDescription h3')
  await expect(emptyDescription).toContainText('No description')
  await expect(staleHeading).toHaveCount(0)
}
