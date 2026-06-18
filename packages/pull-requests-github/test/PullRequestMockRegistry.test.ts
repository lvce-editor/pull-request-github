import { afterEach, expect, test } from '@jest/globals'
import {
  clearPullRequestData,
  getMockPullRequest,
  getPullRequestApiUrl,
  setPullRequestData,
  setPullRequestError,
} from '../src/parts/PullRequestMockRegistry/PullRequestMockRegistry.ts'

afterEach(() => {
  clearPullRequestData()
})

test('setPullRequestData stores mock data by normalized api url', () => {
  const data = {
    baseBranch: 'main',
    description: 'description',
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
    description: 'description',
    headBranch: 'feature',
    title: 'Add feature',
  }
  setPullRequestData('https://github.com/owner/repo/pull/7?tab=files', data)

  expect(getMockPullRequest('https://github.com/owner/repo/pull/7')).toEqual({
    data,
    type: 'data',
  })
})
