import { afterEach, expect, jest, test } from '@jest/globals'
import type { GitHubRepository } from '../src/parts/GitHubRepository/GitHubRepository.ts'
import type { PullRequestFilter } from '../src/parts/PullRequestFilter/PullRequestFilter.ts'
import type { PullRequestListItem } from '../src/parts/PullRequestListItem/PullRequestListItem.ts'
import { create, openActiveInstance, refreshActiveInstance } from '../src/parts/PullRequestView/PullRequestView.ts'

const repository: GitHubRepository = {
  name: 'repo',
  owner: 'owner',
}

const pullRequest: PullRequestListItem = {
  baseBranch: 'main',
  description: 'description',
  headBranch: 'feature',
  number: 42,
  title: 'Add feature',
  url: 'https://github.com/owner/repo/pull/42',
}

interface Dependencies {
  readonly fetchPullRequest: (url: string) => Promise<any>
  readonly fetchPullRequests: (repository: GitHubRepository, filter: PullRequestFilter) => Promise<readonly PullRequestListItem[]>
  readonly getRepository: () => Promise<GitHubRepository>
}

const createDependencies = (overrides: Readonly<Partial<Dependencies>> = {}): Dependencies => {
  return {
    fetchPullRequest: jest.fn<(url: string) => Promise<any>>().mockResolvedValue(pullRequest),
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

test('loads open pull requests from the current repository on create', async () => {
  const dependencies = createDependencies()
  const view = await create(undefined, dependencies)

  expect(dependencies.getRepository).toHaveBeenCalledTimes(1)
  expect(dependencies.fetchPullRequests).toHaveBeenCalledWith(repository, 'open')
  expect(view.render().some((node) => node.text === 'owner/repo')).toBe(true)
  expect(view.render().some((node) => node.text === 'Add feature')).toBe(true)
  expect(view.saveState()).toEqual({ filter: 'open' })
  view.dispose()
})

test('switches between open and closed pull requests', async () => {
  const dependencies = createDependencies()
  const view = await create(undefined, dependencies)
  await view.handleEvent({
    name: 'showClosedPullRequests',
    type: 'click',
  })

  expect(dependencies.fetchPullRequests).toHaveBeenLastCalledWith(repository, 'closed')
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
  expect(view.render().some((node) => node.text === 'description')).toBe(true)

  await view.handleEvent({
    name: 'showPullRequestList',
    type: 'click',
  })

  expect(view.render().some((node) => node.name === 'openPullRequest:42')).toBe(true)
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
  expect(dependencies.fetchPullRequests).toHaveBeenCalledTimes(2)
  expect(requestRerender).toHaveBeenCalled()
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
