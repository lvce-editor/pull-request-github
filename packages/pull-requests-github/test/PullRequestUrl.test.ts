import { expect, test } from '@jest/globals'
import { parsePullRequestUrl } from '../src/parts/PullRequestUrl/PullRequestUrl.ts'

test('parsePullRequestUrl parses github pull request url', () => {
  expect(parsePullRequestUrl('https://github.com/lvce-editor/lvce-editor/pull/123')).toEqual({
    number: 123,
    owner: 'lvce-editor',
    repo: 'lvce-editor',
  })
})

test('parsePullRequestUrl rejects non github urls', () => {
  expect(() => parsePullRequestUrl('https://example.com/lvce-editor/lvce-editor/pull/123')).toThrow(
    'Only https://github.com pull request URLs are supported',
  )
})

test('parsePullRequestUrl rejects invalid pull request number', () => {
  expect(() => parsePullRequestUrl('https://github.com/lvce-editor/lvce-editor/pull/abc')).toThrow('Pull request number must be a positive integer')
})
