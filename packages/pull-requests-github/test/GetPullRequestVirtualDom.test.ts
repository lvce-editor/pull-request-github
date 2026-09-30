import { expect, test } from '@jest/globals'
import * as PullRequestFilters from '@lvce-editor/pull-request-shared'
import { AriaRoles, mergeClassNames, text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState, PullRequestViewStatus } from '../src/parts/PullRequestViewState/PullRequestViewState.ts'
import { getPullRequestVirtualDom } from '../src/parts/GetPullRequestVirtualDom/GetPullRequestVirtualDom.ts'
import { createDefaultState, Detail, Error, Loading, Ready, Unavailable } from '../src/parts/PullRequestViewState/PullRequestViewState.ts'

const createState = (overrides: Partial<PullRequestViewState> = {}): PullRequestViewState => {
  return {
    ...createDefaultState(undefined),
    ...overrides,
  }
}

const getPullRequest = (number: number, title = String(number)): PullRequestViewState['pullRequests'][number] => ({
  author: 'alice',
  baseBranch: 'main',
  comments: 0,
  description: '',
  draft: false,
  headBranch: `feature/${number}`,
  labels: [],
  number,
  title,
  updatedAt: '2026-09-28T10:00:00Z',
  url: `https://github.com/owner/repo/pull/${number}`,
})

const getRootNodeCount = (nodes: readonly VirtualDomNode[]): number => {
  const getNodeSize = (index: number, parentIndex = -1): number => {
    if (!nodes[index]) throw new globalThis.Error(`Virtual DOM requested a missing node at index ${index} from ${JSON.stringify(nodes[parentIndex])}`)
    let nextIndex = index + 1
    for (let childIndex = 0; childIndex < (nodes[index].childCount ?? 0); childIndex++) {
      nextIndex += getNodeSize(nextIndex, index)
    }
    return nextIndex - index
  }
  let index = 0
  let rootCount = 0
  while (index < nodes.length) {
    index += getNodeSize(index)
    rootCount++
  }
  return rootCount
}

test('renders repository pull request list with open and closed tabs', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      pullRequests: [
        {
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
        },
      ],
      repository: {
        name: 'repo',
        owner: 'owner',
      },
      status: Ready,
    }),
  )

  expect(getRootNodeCount(dom)).toBe(1)
  expect(dom.some((node) => node.text === 'owner / repo')).toBe(true)
  expect(dom.some((node) => node.text === 'Open')).toBe(true)
  expect(dom.some((node) => node.text === 'Closed')).toBe(true)
  expect(dom.some((node) => node.name === 'openPullRequest:42')).toBe(true)
  expect(dom.some((node) => node.text === 'Add feature')).toBe(true)
})

test('moves the selection count and mark-as menu into the list header', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      actionMenuOpen: true,
      pullRequests: [getPullRequest(42), getPullRequest(43)],
      selectedPullRequestNumbers: [42],
      status: Ready,
    }),
  )

  expect(getRootNodeCount(dom)).toBe(1)
  const selectAll = dom.find((node) => node.name === 'toggleAllPullRequests')
  expect(selectAll).toMatchObject({ ariaChecked: 'mixed', checked: false })
  expect(dom.some((node) => node.className === 'PullRequestSelectionActions')).toBe(true)
  expect(dom.some((node) => node.className === 'PullRequestTabs')).toBe(false)
  expect(dom.some((node) => node.text === '1 selected')).toBe(true)
  expect(dom.some((node) => node.className === 'PullRequestActionMenu')).toBe(true)
  expect(dom.some((node) => node.name === 'bulkPullRequest:close')).toBe(true)
})

test('select-all state follows visible rows when a search hides selected pull requests', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      pullRequests: [getPullRequest(42, 'Visible pull request'), getPullRequest(43, 'Hidden pull request')],
      query: 'Visible',
      selectedPullRequestNumbers: [42, 43],
      status: Ready,
    }),
  )

  expect(dom.find((node) => node.name === 'toggleAllPullRequests')).toMatchObject({ ariaChecked: true, checked: true })
  expect(dom.some((node) => node.text === '2 selected')).toBe(true)
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

  expect(getRootNodeCount(dom)).toBe(1)
  expect(dom.some((node) => node.text === 'No closed pull requests.')).toBe(true)
})

test('renders pull request detail with back navigation', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      descriptionVirtualDom: [text('description')],
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
  expect(dom.some((node) => node.text === 'Back to list')).toBe(true)
  expect(dom.some((node) => node.text === 'Overview')).toBe(true)
  expect(dom.some((node) => node.text === 'Commits')).toBe(true)
  expect(dom.some((node) => node.text === 'Changes')).toBe(true)
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

test('renders a list error message and code', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      error: 'GitHub returned an invalid pull request list.',
      errorCode: 'E_GITHUB_INVALID_LIST_DATA',
      status: Error,
    }),
  )

  expect(dom.some((node) => node.text === 'GitHub returned an invalid pull request list.')).toBe(true)
  expect(dom.some((node) => node.text === 'Error code: E_GITHUB_INVALID_LIST_DATA')).toBe(true)
})

test('renders an unknown error message and code when error details are empty', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      status: Error,
    }),
  )

  expect(dom.some((node) => node.text === 'An unknown error occurred.')).toBe(true)
  expect(dom.some((node) => node.text === 'Error code: E_UNKNOWN')).toBe(true)
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

test('renders a detail error message and code', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      error: 'GitHub returned an invalid pull request file list.',
      errorCode: 'E_GITHUB_INVALID_FILE_DATA',
      screen: Detail,
      status: Error,
    }),
  )

  expect(dom.some((node) => node.text === 'GitHub returned an invalid pull request file list.')).toBe(true)
  expect(dom.some((node) => node.text === 'Error code: E_GITHUB_INVALID_FILE_DATA')).toBe(true)
})

test('renders a fallback title for an untitled pull request', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      pullRequests: [
        {
          author: '',
          baseBranch: '',
          comments: 0,
          description: '',
          draft: false,
          headBranch: '',
          labels: [],
          number: 7,
          title: '',
          updatedAt: '',
          url: 'https://github.com/owner/repo/pull/7',
        },
      ],
      status: Ready,
    }),
  )

  expect(dom.some((node) => node.text === 'Pull request #7')).toBe(true)
})

test('renders only an informational message when no workspace is open', () => {
  const dom = getPullRequestVirtualDom(
    createState({
      error: 'Open a Git repository to view its pull requests.',
      errorCode: PullRequestFilters.ErrorCodes.WorkspaceNotOpen,
      status: Unavailable,
    }),
  )
  expect(dom).toEqual([
    { childCount: 1, className: mergeClassNames('Viewlet', 'PullRequestView'), type: VirtualDomElements.Div },
    { childCount: 1, className: 'PullRequestMessage', role: AriaRoles.Status, type: VirtualDomElements.Div },
    text('Open a Git repository to view its pull requests.'),
  ])
})

test('renders bounded pagination with exact counts and a valid tree', () => {
  const dom = getPullRequestVirtualDom(createState({ closedCount: 243, openCount: 30_000, page: 500, status: Ready }))
  expect(getRootNodeCount(dom)).toBe(1)
  expect(dom.some((node) => node.text === '30000')).toBe(true)
  expect(dom.some((node) => node.text === '243')).toBe(true)
  expect(dom.filter((node) => node.name?.startsWith('pullRequestPage:'))).toHaveLength(7)
  expect(dom.find((node) => node.name === 'pullRequestPage:500')).toMatchObject({ ariaCurrent: 'page', disabled: true })
  expect(dom.filter((node) => node.text === '…')).toHaveLength(2)
})

test('disables previous and next at page boundaries', () => {
  const first = getPullRequestVirtualDom(createState({ openCount: 61, page: 1, status: Ready }))
  const last = getPullRequestVirtualDom(createState({ openCount: 61, page: 3, status: Ready }))
  expect(first.find((node) => node.ariaLabel === 'Previous')).toMatchObject({ disabled: true })
  expect(last.find((node) => node.ariaLabel === 'Next')).toMatchObject({ disabled: true })
  expect(getRootNodeCount(first)).toBe(1)
  expect(getRootNodeCount(last)).toBe(1)
})
