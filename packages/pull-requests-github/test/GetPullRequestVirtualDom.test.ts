import { expect, test } from '@jest/globals'
import type { PullRequestViewState, PullRequestViewStatus } from '../src/parts/PullRequestViewState/PullRequestViewState.ts'
import { getPullRequestVirtualDom } from '../src/parts/GetPullRequestVirtualDom/GetPullRequestVirtualDom.ts'
import * as PullRequestFilters from '../src/parts/PullRequestFilter/PullRequestFilter.ts'
import { createDefaultState, Detail, Error, Loading, Ready, Unavailable } from '../src/parts/PullRequestViewState/PullRequestViewState.ts'

const createState = (overrides: Partial<PullRequestViewState> = {}): PullRequestViewState => {
  return {
    ...createDefaultState(undefined),
    ...overrides,
  }
}

test('renders repository pull request list with open and closed tabs', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      pullRequests: [
        {
          baseBranch: 'main',
          description: 'description',
          headBranch: 'feature',
          number: 42,
          title: 'Add feature',
          url: 'https://github.com/owner/repo/pull/42',
        },
      ],
      repository: {
        name: 'repo',
        owner: 'owner',
      },
      status: Ready,
    }),
  )

  expect(dom.some((node) => node.text === 'owner/repo')).toBe(true)
  expect(dom.some((node) => node.text === 'Open')).toBe(true)
  expect(dom.some((node) => node.text === 'Closed')).toBe(true)
  expect(dom.some((node) => node.name === 'openPullRequest:42')).toBe(true)
  expect(dom.some((node) => node.text === 'Add feature')).toBe(true)
})

test('renders empty closed pull request state', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      filter: PullRequestFilters.Closed,
      repository: {
        name: 'repo',
        owner: 'owner',
      },
      status: Ready,
    }),
  )

  expect(dom.some((node) => node.text === 'No closed pull requests.')).toBe(true)
})

test('renders pull request detail with back navigation', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      pullRequest: {
        baseBranch: 'main',
        commits: [
          {
            author: 'test-user',
            message: 'Add feature',
            sha: '1234567890abcdef',
          },
        ],
        description: 'description',
        files: [
          {
            additions: 2,
            deletions: 1,
            filename: 'src/feature.ts',
            patch: '@@ -1 +1 @@',
            status: 'modified',
          },
        ],
        headBranch: 'feature',
        title: 'Add feature',
      },
      repository: {
        name: 'repo',
        owner: 'owner',
      },
      screen: Detail,
      status: Ready,
      url: 'https://github.com/owner/repo/pull/42',
    }),
  )

  expect(dom.some((node) => node.name === 'showPullRequestList')).toBe(true)
  expect(dom.some((node) => node.text === 'Pull request details')).toBe(true)
  expect(dom.some((node) => node.text === 'Overview')).toBe(true)
  expect(dom.some((node) => node.text === 'Commits 1')).toBe(true)
  expect(dom.some((node) => node.text === 'Changes 1')).toBe(true)
  expect(dom.some((node) => node.text === 'Add feature')).toBe(true)
  expect(dom.some((node) => node.text === 'description')).toBe(true)
})

test('renders selected commits detail tab', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      detailTab: 'commits',
      pullRequest: {
        baseBranch: 'main',
        commits: [
          {
            author: 'test-user',
            message: 'Add detail tabs',
            sha: '1234567890abcdef',
          },
        ],
        description: 'description',
        files: [],
        headBranch: 'feature',
        title: 'Add feature',
      },
      screen: Detail,
      status: Ready,
    }),
  )

  expect(dom.some((node) => node.name === 'showPullRequestCommits' && node.ariaSelected === true)).toBe(true)
  expect(dom.some((node) => node.text === 'Add detail tabs')).toBe(true)
  expect(dom.some((node) => node.text === '1234567')).toBe(true)
})

test('renders selected changes detail tab', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      detailTab: 'changes',
      pullRequest: {
        baseBranch: 'main',
        commits: [],
        description: 'description',
        files: [
          {
            additions: 2,
            deletions: 1,
            filename: 'src/detail.ts',
            patch: '@@ -1 +1 @@\n-old\n+new',
            status: 'modified',
          },
        ],
        headBranch: 'feature',
        title: 'Add feature',
      },
      screen: Detail,
      status: Ready,
    }),
  )

  expect(dom.some((node) => node.name === 'showPullRequestChanges' && node.ariaSelected === true)).toBe(true)
  expect(dom.some((node) => node.text === 'src/detail.ts')).toBe(true)
  expect(dom.some((node) => node.text === '+new')).toBe(true)
})

test.each<readonly [PullRequestViewStatus, string, string]>([
  [Loading, '', 'Loading pull requests...'],
  [Error, 'GitHub is unavailable', 'GitHub is unavailable'],
  [Unavailable, 'The current repository remote is not hosted on GitHub.', 'The current repository remote is not hosted on GitHub.'],
])('renders %s list status', (status, error, message) => {
  const dom = getPullRequestVirtualDom(
    createState({
      error,
      status,
    }),
  )

  expect(dom.some((node) => node.text === message)).toBe(true)
})

test.each<readonly [PullRequestViewStatus, string, string]>([
  [Loading, '', 'Loading pull request...'],
  [Error, 'GitHub returned an invalid response.', 'GitHub returned an invalid response.'],
])('renders %s detail status', (status, error, message) => {
  const dom = getPullRequestVirtualDom(
    createState({
      error,
      pullRequest: {
        baseBranch: 'main',
        commits: [],
        description: 'description',
        files: [],
        headBranch: 'feature',
        title: 'Add feature',
      },
      screen: Detail,
      status,
    }),
  )

  expect(dom.some((node) => node.text === message)).toBe(true)
})

test('renders a fallback title for an untitled pull request', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      pullRequests: [
        {
          baseBranch: '',
          description: '',
          headBranch: '',
          number: 7,
          title: '',
          url: 'https://github.com/owner/repo/pull/7',
        },
      ],
      status: Ready,
    }),
  )

  expect(dom.some((node) => node.text === 'Pull request #7')).toBe(true)
})
