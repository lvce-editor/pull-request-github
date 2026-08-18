import type { GitHubRepository, PullRequestData, PullRequestFilter, PullRequestListItem } from '@lvce-editor/pull-request-shared'
import { afterEach, expect, jest, test } from '@jest/globals'
import { create, openActiveInstance, refreshActiveInstance } from '../src/parts/PullRequestView/PullRequestView.ts'

const repository: GitHubRepository = {
  name: 'repo',
  owner: 'owner',
}

const pullRequest: PullRequestListItem = {
  author: 'mira.k',
  baseBranch: 'main',
  comments: 12,
  description: 'description',
  draft: false,
  headBranch: 'feature',
  labels: [{ color: '1d76db', name: 'feature' }],
  number: 42,
  title: 'Add feature',
  updatedAt: '2026-08-18T10:00:00.000Z',
  url: 'https://github.com/owner/repo/pull/42',
}

const pullRequestDetail: PullRequestData = {
  baseBranch: pullRequest.baseBranch,
  commits: [
    {
      author: 'test-user',
      message: 'Add detail tabs',
      sha: '1234567890abcdef',
    },
  ],
  description: pullRequest.description,
  files: [
    {
      additions: 2,
      deletions: 1,
      filename: 'src/detail.ts',
      patch: '@@ -1 +1 @@\n-old\n+new',
      status: 'modified',
    },
  ],
  headBranch: pullRequest.headBranch,
  title: pullRequest.title,
}

interface Dependencies {
  readonly fetchPullRequest: (url: string) => Promise<any>
  readonly fetchPullRequests: (repository: GitHubRepository, filter: PullRequestFilter) => Promise<readonly PullRequestListItem[]>
  readonly getRepository: () => Promise<GitHubRepository>
}

const createDependencies = (overrides: Readonly<Partial<Dependencies>> = {}): Dependencies => {
  return {
    fetchPullRequest: jest.fn<(url: string) => Promise<any>>().mockResolvedValue(pullRequestDetail),
    fetchPullRequests: jest
      .fn<(repository: GitHubRepository, filter: PullRequestFilter) => Promise<readonly PullRequestListItem[]>>()
      .mockResolvedValue([pullRequest]),
    getRepository: jest.fn<() => Promise<GitHubRepository>>().mockResolvedValue(repository),
    ...overrides,
  }
}

afterEach(() => {
  jest.restoreAllMocks()
})

test('loads open and closed pull requests from the current repository on create', async () => {
  const dependencies = createDependencies()
  const view = await create(undefined, dependencies)

  expect(dependencies.getRepository).toHaveBeenCalledTimes(1)
  expect(dependencies.fetchPullRequests).toHaveBeenCalledWith(repository, 'open')
  expect(dependencies.fetchPullRequests).toHaveBeenCalledWith(repository, 'closed')
  expect(view.render().some((node) => node.text === 'owner / repo')).toBe(true)
  expect(view.render().some((node) => node.text === 'Add feature')).toBe(true)
  expect(view.saveState()).toEqual({ filter: 'open' })
  view.dispose()
})

test('keeps the active pull request list when the background count request fails', async () => {
  const fetchPullRequests = jest
    .fn<(repository: GitHubRepository, filter: PullRequestFilter) => Promise<readonly PullRequestListItem[]>>()
    .mockImplementation(async (currentRepository, filter) => {
      expect(currentRepository).toEqual(repository)
      if (filter === 'closed') {
        throw new Error('Failed to load the closed pull request count')
      }
      return [pullRequest]
    })
  const view = await create(undefined, createDependencies({ fetchPullRequests }))

  expect(view.render().some((node) => node.text === 'Add feature')).toBe(true)
  expect(view.render().some((node) => node.text === 'Failed to load the closed pull request count')).toBe(false)
  view.dispose()
})

test('switches between open and closed pull requests', async () => {
  const dependencies = createDependencies()
  const view = await create(undefined, dependencies)
  await view.handleEvent({
    name: 'showClosedPullRequests',
    type: 'click',
  })

  expect(dependencies.fetchPullRequests).toHaveBeenCalledTimes(2)
  expect(view.saveState()).toEqual({ filter: 'closed' })
  view.dispose()
})

test('opens a pull request detail and returns to the list', async () => {
  const dependencies = createDependencies()
  const view = await create(undefined, dependencies)
  await view.handleEvent({
    name: 'openPullRequest:42',
    type: 'click',
  })

  expect(view.render().some((node) => node.text === 'Pull request details')).toBe(true)
  expect(dependencies.fetchPullRequest).toHaveBeenCalledWith('https://github.com/owner/repo/pull/42')
  expect(view.render().some((node) => node.text === 'description')).toBe(true)

  await view.handleEvent({
    name: 'showPullRequestList',
    type: 'click',
  })

  expect(view.render().some((node) => node.name === 'openPullRequest:42')).toBe(true)
  view.dispose()
})

test('switches between overview, commits, and changes in pull request detail', async () => {
  const view = await create(undefined, createDependencies())
  await view.handleEvent({
    name: 'openPullRequest:42',
    type: 'click',
  })

  expect(view.render().some((node) => node.name === 'showPullRequestOverview' && node.ariaSelected === true)).toBe(true)
  expect(view.render().some((node) => node.text === 'description')).toBe(true)

  await view.handleEvent({
    name: 'showPullRequestCommits',
    type: 'click',
  })

  expect(view.render().some((node) => node.name === 'showPullRequestCommits' && node.ariaSelected === true)).toBe(true)
  expect(view.render().some((node) => node.text === 'Add detail tabs')).toBe(true)

  await view.handleEvent({
    name: 'showPullRequestChanges',
    type: 'click',
  })

  expect(view.render().some((node) => node.name === 'showPullRequestChanges' && node.ariaSelected === true)).toBe(true)
  expect(view.render().some((node) => node.text === 'src/detail.ts')).toBe(true)
  view.dispose()
})

test('renders a friendly message for a non-GitHub repository', async () => {
  const dependencies = createDependencies({
    getRepository: jest.fn<() => Promise<GitHubRepository>>().mockRejectedValue(new Error('The current repository remote is not hosted on GitHub.')),
  })
  const view = await create(undefined, dependencies)

  expect(view.render().some((node) => node.text === 'The current repository remote is not hosted on GitHub.')).toBe(true)
  view.dispose()
})

test('refresh reloads the current repository list', async () => {
  const requestRerender = jest.fn<() => Promise<void>>().mockResolvedValue()
  const dependencies = createDependencies()
  const view = await create({ requestRerender }, dependencies)
  requestRerender.mockClear()

  await refreshActiveInstance()

  expect(dependencies.getRepository).toHaveBeenCalledTimes(2)
  expect(dependencies.fetchPullRequests).toHaveBeenCalledTimes(4)
  expect(requestRerender).toHaveBeenCalled()
  view.dispose()
})

test('filters pull requests using visible list metadata', async () => {
  const view = await create(undefined, createDependencies())

  view.handlePullRequestFilterInput('mira.k')

  expect(view.render().some((node) => node.text === 'Add feature')).toBe(true)

  view.handlePullRequestFilterInput('not-found')

  expect(view.render().some((node) => node.text === 'No pull requests match “not-found”.')).toBe(true)
  view.dispose()
})

test('openOnGitHub opens the selected pull request url', async () => {
  const open = jest.fn<(url: string) => Promise<void>>().mockResolvedValue()
  const view = await create(undefined, createDependencies())
  await view.handleEvent({
    name: 'openPullRequest:42',
    type: 'click',
  })

  await openActiveInstance(open)

  expect(open).toHaveBeenCalledWith('https://github.com/owner/repo/pull/42')
  view.dispose()
})
