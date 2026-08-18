import { afterEach, expect, test } from '@jest/globals'
import {
  clearPullRequestData,
  getMockPullRequestList,
  getMockPullRequest,
  getPullRequestApiUrl,
  setPullRequestData,
  setPullRequestError,
  setPullRequestListResponse,
  setPullRequestResponse,
} from '../src/parts/PullRequestMockRegistry/PullRequestMockRegistry.ts'

afterEach(() => {
  clearPullRequestData()
})

test('setPullRequestData stores mock data by normalized api url', () => {
  const data = {
    baseBranch: 'main',
    commits: [],
    description: 'description',
    files: [],
    headBranch: 'feature',
    title: 'Add feature',
  }

  setPullRequestData('https://github.com/owner/repo/pull/7', data)

  expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toEqual({
    data,
    type: 'data',
  })
  expect(getPullRequestApiUrl('https://github.com/owner/repo/pull/7')).toBe('https://api.github.com/repos/owner/repo/pulls/7')
})

test('setPullRequestError stores mock error', () => {
  setPullRequestError('https://github.com/owner/repo/pull/7', 'Not Found')

  expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toEqual({
    message: 'Not Found',
    type: 'error',
  })
})

test('clearPullRequestData removes mock data', () => {
  setPullRequestError('https://github.com/owner/repo/pull/7', 'Not Found')

  clearPullRequestData()

  expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toBeUndefined()
})

test('getMockPullRequest normalizes equivalent urls', () => {
  const data = {
    baseBranch: 'main',
    commits: [],
    description: 'description',
    files: [],
    headBranch: 'feature',
    title: 'Add feature',
  }
  setPullRequestData('https://github.com/owner/repo/pull/7?tab=files', data)

  expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toEqual({
    data,
    type: 'data',
  })
})

test('setPullRequestResponse stores raw github responses', () => {
  setPullRequestResponse('https://github.com/owner/repo/pull/7', { title: 'Title' }, [], [])

  expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toEqual({
    commits: [],
    files: [],
    pullRequest: { title: 'Title' },
    type: 'response',
  })
})

test('setPullRequestListResponse stores a raw github list response', () => {
  setPullRequestListResponse('owner', 'repo', 'open', { items: [] })

  expect(getMockPullRequestList('owner', 'repo', 'open')).toEqual({
    data: { items: [] },
    type: 'listResponse',
  })
})
