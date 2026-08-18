import { expect, jest, test } from '@jest/globals'
import { getGitHubRepository } from '../src/parts/GetGitHubRepository/GetGitHubRepository.ts'

// cspell:ignore commondir gitdir worktrees

test('reads the origin remote from the workspace git config', async () => {
  const readFile = jest.fn<(uri: string) => Promise<string>>().mockResolvedValue(`[remote "origin"]
  url = git@github.com:owner/repo.git
`)

  await expect(getGitHubRepository(async () => 'file:///workspace', readFile)).resolves.toEqual({
    name: 'repo',
    owner: 'owner',
  })
  expect(readFile).toHaveBeenCalledWith('file:///workspace/.git/config')
})

test('reads the common config for a linked git worktree', async () => {
  const files = new Map<string, string>([
    [
      'file:///repo/.git/config',
      `[remote "origin"]
  url = https://github.com/owner/repo.git
`,
    ],
    ['file:///repo/.git/worktrees/feature/commondir', '../..\n'],
    ['file:///workspace/.git', 'gitdir: /repo/.git/worktrees/feature\n'],
  ])
  const readFile = jest.fn<(uri: string) => Promise<string>>().mockImplementation(async (uri) => {
    const value = files.get(uri)
    if (value === undefined) {
      throw new Error('Not found')
    }
    return value
  })

  await expect(getGitHubRepository(async () => 'file:///workspace', readFile)).resolves.toEqual({
    name: 'repo',
    owner: 'owner',
  })
})

test('reports a non-GitHub remote', async () => {
  const readFile = jest.fn<(uri: string) => Promise<string>>().mockResolvedValue(`[remote "origin"]
  url = git@gitlab.com:owner/repo.git
`)

  await expect(getGitHubRepository(async () => 'file:///workspace', readFile)).rejects.toThrow(
    'The current repository remote is not hosted on GitHub.',
  )
})

test('reports a workspace without a git repository', async () => {
  const readFile = jest.fn<(uri: string) => Promise<string>>().mockRejectedValue(new Error('Not found'))

  await expect(getGitHubRepository(async () => 'file:///workspace', readFile)).rejects.toThrow(
    'No Git repository was found in the current workspace.',
  )
})

test('reports a workspace without a remote', async () => {
  const readFile = jest.fn<(uri: string) => Promise<string>>().mockResolvedValue('[core]\n  bare = false\n')

  await expect(getGitHubRepository(async () => 'file:///workspace', readFile)).rejects.toThrow('No Git remote was found in the current workspace.')
})

test('reports when no workspace is open', async () => {
  const readFile = jest.fn<(uri: string) => Promise<string>>()

  await expect(getGitHubRepository(async () => '', readFile)).rejects.toThrow('Open a folder containing a GitHub repository to view pull requests.')
  expect(readFile).not.toHaveBeenCalled()
})
