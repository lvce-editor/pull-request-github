import { expect, jest, test } from '@jest/globals'
import { openOnGitHub, show } from '../src/parts/PullRequestCommands/PullRequestCommands.ts'

test('show focuses the pull requests view', async () => {
  const execute = jest.fn<(...args: readonly unknown[]) => Promise<unknown>>().mockResolvedValue(undefined)

  await show(execute)

  expect(execute).toHaveBeenCalledWith('SideBar.show', 'github.pullRequests', true)
})

test('openOnGitHub opens the pull request externally', async () => {
  const execute = jest.fn<(...args: readonly unknown[]) => Promise<unknown>>().mockResolvedValue(undefined)

  await openOnGitHub('https://github.com/owner/repo/pull/5', execute)

  expect(execute).toHaveBeenCalledWith('Open.openExternal', 'https://github.com/owner/repo/pull/5')
})

test('openOnGitHub rejects a non-GitHub url', async () => {
  const execute = jest.fn<(...args: readonly unknown[]) => Promise<unknown>>().mockResolvedValue(undefined)

  await expect(openOnGitHub('https://example.com/owner/repo/pull/5', execute)).rejects.toThrow(
    'Only https://github.com pull request URLs are supported',
  )

  expect(execute).not.toHaveBeenCalled()
})
