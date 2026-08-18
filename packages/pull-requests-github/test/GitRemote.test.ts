import { expect, test } from '@jest/globals'
import { getRemoteUrl, parseGitHubRemoteUrl } from '../src/parts/GitRemote/GitRemote.ts'

test('getRemoteUrl prefers origin', () => {
  const config = `[remote "upstream"]
  url = https://github.com/parent/repo.git
[remote "origin"]
  url = git@github.com:owner/repo.git
`

  expect(getRemoteUrl(config)).toBe('git@github.com:owner/repo.git')
})

test('getRemoteUrl falls back to the first remote', () => {
  const config = `[remote "upstream"]
  url = https://github.com/owner/repo.git
`

  expect(getRemoteUrl(config)).toBe('https://github.com/owner/repo.git')
})

test.each([
  'git@github.com:owner/repo.git',
  'https://github.com/owner/repo.git',
  'ssh://git@github.com/owner/repo.git',
  'git://github.com/owner/repo.git',
])('parseGitHubRemoteUrl parses %s', (remoteUrl) => {
  expect(parseGitHubRemoteUrl(remoteUrl)).toEqual({
    name: 'repo',
    owner: 'owner',
  })
})

test('parseGitHubRemoteUrl rejects non-GitHub remotes', () => {
  expect(parseGitHubRemoteUrl('git@gitlab.com:owner/repo.git')).toBeUndefined()
  expect(parseGitHubRemoteUrl('not a remote')).toBeUndefined()
  expect(parseGitHubRemoteUrl('https://github.com/owner')).toBeUndefined()
})
