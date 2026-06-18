export interface PullRequestLocation {
  readonly number: number
  readonly owner: string
  readonly repo: string
}

export const parsePullRequestUrl = (value: string): PullRequestLocation => {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('Enter a valid GitHub pull request URL')
  }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
    throw new Error('Only https://github.com pull request URLs are supported')
  }
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 4 || parts[2] !== 'pull') {
    throw new Error('Enter a GitHub pull request URL like https://github.com/owner/repo/pull/123')
  }
  const number = Number.parseInt(parts[3], 10)
  if (!Number.isInteger(number) || number <= 0 || `${number}` !== parts[3]) {
    throw new Error('Pull request number must be a positive integer')
  }
  return {
    number,
    owner: parts[0],
    repo: parts[1],
  }
}
